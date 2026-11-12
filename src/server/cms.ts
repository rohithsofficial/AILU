// Database logic for the CMS, and getContent(), which every public page uses to read its wording.
import { cache } from "react";
import { draftMode } from "next/headers";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { audit } from "@/lib/audit";
import { cleanContent, fillTokens, mergeContent } from "@/lib/cms";
import { dbConfigured, getPrisma } from "@/lib/db";
import { CMS_DEFAULTS, CMS_SECTIONS, type CmsKey, type SiteContent } from "@/content/defaults";
import { translationFor } from "@/content/translations";
import { DEFAULT_LOCALE, isLocale, overlayTranslation, type Locale } from "@/lib/i18n";

const readPublished = unstable_cache(async () => {
  const rows = await getPrisma().cmsSection.findMany({ select: { key: true, published: true } });
  return Object.fromEntries(rows.map((row) => [row.key, row.published]));
}, ["cms-published"], { tags: ["cms"], revalidate: 300 });

// A translated section is saved as its own row, keyed like "hero:kn". English rows keep their plain key.
const rowKey = (key: string, locale: Locale) => (locale === DEFAULT_LOCALE ? key : `${key}:${locale}`);

/** Reads "hero" or "hero:kn" from the CMS screens. */
export function parseSectionId(id: string): { key: string; locale: Locale } {
  const [key, locale] = id.split(":");
  return { key, locale: isLocale(locale) ? locale : DEFAULT_LOCALE };
}

/**
 * The wording for one language. English: the code defaults with CMS edits on top.
 * Another language: that English, then the translation file, then CMS edits made in that language.
 * Anything not translated stays English.
 */
export function buildContent(published: Record<string, unknown>, locale: Locale = DEFAULT_LOCALE): SiteContent {
  const english = Object.fromEntries(Object.entries(CMS_DEFAULTS).map(([key, value]) => [key, mergeContent(value, published[key])])) as SiteContent;
  const merged = locale === DEFAULT_LOCALE ? english : translateSections(english, published, locale);
  return fillTokens(merged, merged.settings);
}

function translateSections(english: SiteContent, published: Record<string, unknown>, locale: Locale): SiteContent {
  const file = translationFor(locale).content as Record<string, unknown>;
  return Object.fromEntries(Object.entries(english).map(([key, value]) => {
    const fromFile = overlayTranslation(value, file[key]);
    return [key, overlayTranslation(fromFile, published[rowKey(key, locale)])];
  })) as SiteContent;
}

// A slow or blocked database must never hold up a page. After a failure, pages use the last good content
// and skip the database for a short time, instead of every visitor waiting for it again.
const DB_WAIT_MS = 4000;
const RETRY_AFTER_MS = 30000;
// Kept on globalThis because each route has its own copy of this module.
const health = ((globalThis as unknown as { cmsHealth?: { lastGood: Record<string, unknown>; skipUntil: number } }).cmsHealth ??= { lastGood: {}, skipUntil: 0 });

async function readWithLimit() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const limit = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("The database took too long.")), DB_WAIT_MS); });
  try {
    return await Promise.race([readPublished(), limit]);
  } finally {
    clearTimeout(timer);
  }
}

/** True when a signed-in staff member opened "Preview" in the CMS (Next.js draft mode, set by /api/admin/cms/preview). */
export function previewing() {
  try {
    return draftMode().isEnabled;
  } catch {
    return false; // outside a request, for example while building
  }
}

/** For preview only: every section's draft, or its live wording where there is no draft. Never cached. */
async function readDrafts() {
  const rows = await getPrisma().cmsSection.findMany({ select: { key: true, draft: true, published: true } });
  return Object.fromEntries(rows.map((row) => [row.key, row.draft ?? row.published]));
}

/** What visitors see, in their language. If the database cannot be reached, the site falls back to the last good content. */
export const getContent = cache(async (locale: Locale = DEFAULT_LOCALE): Promise<SiteContent> => {
  if (previewing() && dbConfigured()) {
    try {
      return buildContent(await readDrafts(), locale);
    } catch (error) {
      console.error("CMS drafts could not be loaded for preview.", (error as Error).message);
    }
  }
  if (!dbConfigured() || Date.now() < health.skipUntil) return buildContent(health.lastGood, locale);
  try {
    health.lastGood = await readWithLimit();
  } catch (error) {
    health.skipUntil = Date.now() + RETRY_AFTER_MS;
    console.error("CMS content could not be loaded; using the last good content.", (error as Error).message);
  }
  return buildContent(health.lastGood, locale);
});

/** The parts that browser components need, so visitors do not download the whole site's text on each page. */
export function clientContent(content: SiteContent) {
  const { settings, hero, journey, eventsPage, nav, intro, comingSoon, celebrations, ui } = content;
  return { settings, hero, journey, eventsPage, nav, intro, comingSoon, celebrations, ui };
}
export type ClientContent = ReturnType<typeof clientContent>;

// Sections that have no language versions: the AILU World stays English.
export const UNTRANSLATED_SECTIONS: CmsKey[] = ["world"];

/** Finds a section from an id like "hero" or "hero:kn", and the database row key it is saved under. */
function sectionInfo(id: string) {
  const { key, locale } = parseSectionId(id);
  const info = CMS_SECTIONS.find((section) => section.key === key);
  if (!info || (locale !== DEFAULT_LOCALE && UNTRANSLATED_SECTIONS.includes(info.key))) throw new Error("That section does not exist.");
  return { ...info, locale, row: rowKey(info.key, locale) };
}

export async function listSections(locale: Locale = DEFAULT_LOCALE) {
  const rows = await getPrisma().cmsSection.findMany({ select: { key: true, draft: true, published: true, publishedAt: true, updatedAt: true } });
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return CMS_SECTIONS.filter((section) => locale === DEFAULT_LOCALE || !UNTRANSLATED_SECTIONS.includes(section.key)).map((section) => {
    const row = byKey.get(rowKey(section.key, locale));
    return { ...section, hasDraft: row?.draft != null, published: row?.published != null, publishedAt: row?.publishedAt ?? null };
  });
}

/** Where a translation starts from: live English, with the translation file on top. */
async function translationBase(key: CmsKey, locale: Locale) {
  const row = await getPrisma().cmsSection.findUnique({ where: { key }, select: { published: true } });
  const english = mergeContent(CMS_DEFAULTS[key], row?.published);
  if (locale === DEFAULT_LOCALE) return { english, base: english };
  const file = translationFor(locale).content as Record<string, unknown>;
  return { english, base: overlayTranslation(english, file[key]) };
}

/** Checks edited content. A translation keeps only its text; links, images and switches stay English. */
async function cleanFor(info: ReturnType<typeof sectionInfo>, input: unknown) {
  const cleaned = cleanContent(CMS_DEFAULTS[info.key], input);
  if (info.locale === DEFAULT_LOCALE) return cleaned;
  const { base } = await translationBase(info.key, info.locale);
  return overlayTranslation(base, cleaned);
}

/** The working copy for the editor: the draft if there is one, otherwise what is live. */
export async function getSection(id: string) {
  const info = sectionInfo(id);
  const row = await getPrisma().cmsSection.findUnique({ where: { key: info.row } });
  const saved = row?.draft ?? row?.published;
  const common = { hasDraft: row?.draft != null, canUndo: row?.previous != null, publishedAt: row?.publishedAt ?? null };
  if (info.locale === DEFAULT_LOCALE) {
    const defaults = CMS_DEFAULTS[info.key];
    return { info, defaults, english: null, value: mergeContent(defaults, saved), ...common };
  }
  const { english, base } = await translationBase(info.key, info.locale);
  return { info, defaults: english, english, value: overlayTranslation(base, saved), ...common };
}

function refreshSite() {
  revalidateTag("cms");
  revalidatePath("/", "layout");
}

export async function saveDraft(actor: { id: string }, id: string, input: unknown) {
  const info = sectionInfo(id);
  const key = info.row;
  const draft = (await cleanFor(info, input)) as Prisma.InputJsonValue;
  await getPrisma().cmsSection.upsert({ where: { key }, create: { key, draft, updatedById: actor.id }, update: { draft, updatedById: actor.id } });
  await audit(actor, "cms.draft_saved", "CmsSection", key);
}

export async function publishSection(actor: { id: string; role: string }, id: string, input: unknown) {
  const info = sectionInfo(id);
  const key = info.row;
  if (info.ownerPublish && actor.role !== "OWNER") throw new Error("Only the owner can publish this section. Your draft is saved.");
  const published = (await cleanFor(info, input)) as Prisma.InputJsonValue;
  const db = getPrisma();
  const old = await db.cmsSection.findUnique({ where: { key }, select: { published: true } });
  const previous = (old?.published ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull;
  const data = { published, previous, draft: Prisma.DbNull, publishedAt: new Date(), publishedById: actor.id, updatedById: actor.id };
  await db.cmsSection.upsert({ where: { key }, create: { key, ...data }, update: data });
  await audit(actor, "cms.published", "CmsSection", key);
  refreshSite();
}

export async function discardDraft(actor: { id: string }, id: string) {
  const key = sectionInfo(id).row;
  await getPrisma().cmsSection.updateMany({ where: { key }, data: { draft: Prisma.DbNull, updatedById: actor.id } });
  await audit(actor, "cms.draft_discarded", "CmsSection", key);
}

/** Puts back the version from before the last publish. */
export async function undoPublish(actor: { id: string; role: string }, id: string) {
  const info = sectionInfo(id);
  const key = info.row;
  if (info.ownerPublish && actor.role !== "OWNER") throw new Error("Only the owner can publish this section.");
  const db = getPrisma();
  const row = await db.cmsSection.findUnique({ where: { key }, select: { published: true, previous: true } });
  if (row?.previous == null) throw new Error("There is no earlier version to go back to.");
  await db.cmsSection.update({ where: { key }, data: { published: row.previous as Prisma.InputJsonValue, previous: Prisma.DbNull, publishedAt: new Date(), publishedById: actor.id } });
  await audit(actor, "cms.publish_undone", "CmsSection", key);
  refreshSite();
}

/** Goes back to the original wording in the code. */
export async function restoreDefault(actor: { id: string; role: string }, id: string) {
  const info = sectionInfo(id);
  const key = info.row;
  if (info.ownerPublish && actor.role !== "OWNER") throw new Error("Only the owner can publish this section.");
  const db = getPrisma();
  const old = await db.cmsSection.findUnique({ where: { key }, select: { published: true } });
  const previous = (old?.published ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull;
  await db.cmsSection.updateMany({ where: { key }, data: { published: Prisma.DbNull, draft: Prisma.DbNull, previous, publishedAt: new Date(), publishedById: actor.id } });
  await audit(actor, "cms.restored_default", "CmsSection", key);
  refreshSite();
}

export const listMedia = () => getPrisma().cmsMedia.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

export async function addMedia(actor: { id: string }, file: { url: string; pathname: string; alt: string; contentType: string; sizeBytes: number }) {
  const media = await getPrisma().cmsMedia.create({ data: { ...file, uploadedById: actor.id } });
  await audit(actor, "cms.media_added", "CmsMedia", media.id, { pathname: file.pathname });
  return media;
}

export async function updateMediaAlt(actor: { id: string }, id: string, alt: string) {
  const text = alt.trim();
  if (text.length < 3) throw new Error("Describe the image in a few words.");
  await getPrisma().cmsMedia.update({ where: { id }, data: { alt: text.slice(0, 200) } });
  await audit(actor, "cms.media_updated", "CmsMedia", id);
}

/** A photo in use on any draft or published section cannot be deleted. */
export async function deleteMedia(actor: { id: string }, id: string) {
  const db = getPrisma();
  const media = await db.cmsMedia.findUnique({ where: { id } });
  if (!media) throw new Error("That image no longer exists.");
  const rows = await db.cmsSection.findMany({ select: { draft: true, published: true, previous: true } });
  if (rows.some((row) => JSON.stringify(row).includes(media.url))) throw new Error("This image is used on the website. Remove it from the page first.");
  await del(media.url);
  await db.cmsMedia.delete({ where: { id } });
  await audit(actor, "cms.media_deleted", "CmsMedia", id, { pathname: media.pathname });
}

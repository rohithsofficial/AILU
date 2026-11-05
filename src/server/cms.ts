import { cache } from "react";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { audit } from "@/lib/audit";
import { cleanContent, fillTokens, mergeContent } from "@/lib/cms";
import { dbConfigured, getPrisma } from "@/lib/db";
import { CMS_DEFAULTS, CMS_SECTIONS, type CmsKey, type SiteContent } from "@/content/defaults";

const readPublished = unstable_cache(async () => {
  const rows = await getPrisma().cmsSection.findMany({ select: { key: true, published: true } });
  return Object.fromEntries(rows.map((row) => [row.key, row.published]));
}, ["cms-published"], { tags: ["cms"], revalidate: 300 });

export function buildContent(published: Record<string, unknown>): SiteContent {
  const merged = Object.fromEntries(Object.entries(CMS_DEFAULTS).map(([key, value]) => [key, mergeContent(value, published[key])])) as SiteContent;
  return fillTokens(merged, merged.settings);
}

/** What visitors see. If the database cannot be reached, the site falls back to the default wording. */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!dbConfigured()) return buildContent({});
  try {
    return buildContent(await readPublished());
  } catch (error) {
    console.error("CMS content could not be loaded; using defaults.", (error as Error).message);
    return buildContent({});
  }
});

/** The parts that browser components need, so visitors do not download the whole site's text on each page. */
export function clientContent(content: SiteContent) {
  const { settings, hero, journey, eventsPage, nav, intro, comingSoon, celebrations } = content;
  return { settings, hero, journey, eventsPage, nav, intro, comingSoon, celebrations };
}
export type ClientContent = ReturnType<typeof clientContent>;

function sectionInfo(key: string) {
  const info = CMS_SECTIONS.find((section) => section.key === key);
  if (!info) throw new Error("That section does not exist.");
  return info;
}

export async function listSections() {
  const rows = await getPrisma().cmsSection.findMany({ select: { key: true, draft: true, published: true, publishedAt: true, updatedAt: true } });
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return CMS_SECTIONS.map((section) => {
    const row = byKey.get(section.key);
    return { ...section, hasDraft: row?.draft != null, published: row?.published != null, publishedAt: row?.publishedAt ?? null };
  });
}

/** The working copy for the editor: the draft if there is one, otherwise what is live. */
export async function getSection(key: string) {
  const info = sectionInfo(key);
  const row = await getPrisma().cmsSection.findUnique({ where: { key } });
  const defaults = CMS_DEFAULTS[info.key];
  return { info, defaults, value: mergeContent(defaults, row?.draft ?? row?.published), hasDraft: row?.draft != null, canUndo: row?.previous != null, publishedAt: row?.publishedAt ?? null };
}

function refreshSite() {
  revalidateTag("cms");
  revalidatePath("/", "layout");
}

export async function saveDraft(actor: { id: string }, key: string, input: unknown) {
  const info = sectionInfo(key);
  const draft = cleanContent(CMS_DEFAULTS[info.key], input) as Prisma.InputJsonValue;
  await getPrisma().cmsSection.upsert({ where: { key }, create: { key, draft, updatedById: actor.id }, update: { draft, updatedById: actor.id } });
  await audit(actor, "cms.draft_saved", "CmsSection", key);
}

export async function publishSection(actor: { id: string; role: string }, key: string, input: unknown) {
  const info = sectionInfo(key);
  if (info.ownerPublish && actor.role !== "OWNER") throw new Error("Only the owner can publish this section. Your draft is saved.");
  const published = cleanContent(CMS_DEFAULTS[info.key], input) as Prisma.InputJsonValue;
  const db = getPrisma();
  const old = await db.cmsSection.findUnique({ where: { key }, select: { published: true } });
  const previous = (old?.published ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull;
  const data = { published, previous, draft: Prisma.DbNull, publishedAt: new Date(), publishedById: actor.id, updatedById: actor.id };
  await db.cmsSection.upsert({ where: { key }, create: { key, ...data }, update: data });
  await audit(actor, "cms.published", "CmsSection", key);
  refreshSite();
}

export async function discardDraft(actor: { id: string }, key: string) {
  sectionInfo(key);
  await getPrisma().cmsSection.updateMany({ where: { key }, data: { draft: Prisma.DbNull, updatedById: actor.id } });
  await audit(actor, "cms.draft_discarded", "CmsSection", key);
}

/** Puts back the version from before the last publish. */
export async function undoPublish(actor: { id: string; role: string }, key: string) {
  const info = sectionInfo(key);
  if (info.ownerPublish && actor.role !== "OWNER") throw new Error("Only the owner can publish this section.");
  const db = getPrisma();
  const row = await db.cmsSection.findUnique({ where: { key }, select: { published: true, previous: true } });
  if (row?.previous == null) throw new Error("There is no earlier version to go back to.");
  await db.cmsSection.update({ where: { key }, data: { published: row.previous as Prisma.InputJsonValue, previous: Prisma.DbNull, publishedAt: new Date(), publishedById: actor.id } });
  await audit(actor, "cms.publish_undone", "CmsSection", key);
  refreshSite();
}

/** Goes back to the original wording in the code. */
export async function restoreDefault(actor: { id: string; role: string }, key: string) {
  const info = sectionInfo(key);
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

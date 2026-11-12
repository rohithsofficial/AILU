// CMS rules with no database or framework code, so they can be tested directly.

export type Json = string | boolean | Json[] | { [key: string]: Json };

const FIXED_KEYS = new Set(["slug", "path", "kind", "scene"]);
const LINK_KEY = /(href|whatsapp|image|src)$/i;
const SAFE_LINK = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i;
const MAX_TEXT = 8000;

// Templates for lists that start empty.
const EMPTY_LIST_ITEMS: Record<string, Json> = {
  socialLinks: { label: "", href: "" },
  gallery: { src: "", alt: "", caption: "" },
};

export const isFixedKey = (key: string) => FIXED_KEYS.has(key);
export const isImageKey = (key: string) => /(image|src)$/i.test(key);

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** A list with fixed keys keeps its items: they connect to pages and code. */
export function isFixedList(sample: Json[]) {
  const first = sample[0];
  return isObject(first) && Object.keys(first).some(isFixedKey);
}

/** The blank item used when someone adds to a list. */
export function listTemplate(key: string, sample: Json[]): Json {
  const first = sample[0] ?? EMPTY_LIST_ITEMS[key] ?? "";
  const blank = (value: Json): Json => {
    if (typeof value === "string") return "";
    if (typeof value === "boolean") return false;
    if (Array.isArray(value)) return [];
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
  };
  return blank(first);
}

function fit(base: Json, value: unknown, key: string, strict: boolean, label: string): Json {
  if (typeof base === "string") {
    if (isFixedKey(key)) return base;
    if (typeof value !== "string") return base;
    const text = value.trim();
    if (strict && text.length > MAX_TEXT) throw new Error(`${label} is too long.`);
    if (LINK_KEY.test(key) && text && !SAFE_LINK.test(text)) {
      if (strict) throw new Error(`${label} must be a full link, or start with /.`);
      return base;
    }
    return text.slice(0, MAX_TEXT);
  }
  if (typeof base === "boolean") return typeof value === "boolean" ? value : base;
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) return base;
    if (isFixedList(base)) return base.map((item, index) => fit(item, value[index], key, strict, label));
    const template = base[0] ?? listTemplate(key, base);
    return value.slice(0, 200).map((item) => fit(template, item, key, strict, label));
  }
  const source = isObject(value) ? value : {};
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, fit(v, source[k], k, strict, humanise(k))]));
}

/** Combines saved content with the defaults. Missing or broken values fall back, so the site never loses text. */
export function mergeContent<T>(defaults: T, saved: unknown): T {
  return fit(defaults as Json, saved, "", false, "") as T;
}

/** Checks content before saving. Throws a message the editor can read. */
export function cleanContent<T>(defaults: T, input: unknown): T {
  if (!isObject(input)) throw new Error("That content could not be read.");
  return fit(defaults as Json, input, "", true, "This field") as T;
}

/** Fills {phone} and {email} in wording from Contact details. */
export function fillTokens<T>(value: T, tokens: { phone: string; email: string }): T {
  const walk = (item: unknown): unknown => {
    if (typeof item === "string") return item.replaceAll("{phone}", tokens.phone).replaceAll("{email}", tokens.email);
    if (Array.isArray(item)) return item.map(walk);
    if (isObject(item)) return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, walk(v)]));
    return item;
  };
  return walk(value) as T;
}

const WORDS: Record<string, string> = { eyebrow: "small heading", seo: "SEO", cta: "button", href: "link", faq: "FAQ", src: "image", alt: "image description" };

/** Turns a key like servicesTitleLine1 into "Services title line 1". */
export function humanise(key: string) {
  const words = key.replace(/([a-z])([A-Z0-9])/g, "$1 $2").split(" ").map((word) => WORDS[word.toLowerCase()] ?? word.toLowerCase());
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type SeoIssue = { path: string; problem: string };

/** Simple checks shown on the SEO screen. */
export function seoIssues(pages: { path: string; title: string; description: string; hideFromGoogle: boolean }[]): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const titles = new Map<string, string>();
  for (const page of pages) {
    if (page.hideFromGoogle) continue;
    if (!page.title) issues.push({ path: page.path, problem: "Title is missing." });
    if (page.title.length > 60) issues.push({ path: page.path, problem: "Title is over 60 characters, so Google may cut it." });
    if (!page.description) issues.push({ path: page.path, problem: "Description is missing." });
    if (page.description.length > 160) issues.push({ path: page.path, problem: "Description is over 160 characters, so Google may cut it." });
    const twin = titles.get(page.title.toLowerCase());
    if (page.title && twin) issues.push({ path: page.path, problem: `Same title as ${twin}.` });
    titles.set(page.title.toLowerCase(), page.path);
  }
  return issues;
}

/**
 * A soft length limit for a text field, so editors see when a line is getting long.
 * SEO titles and descriptions follow Google's limits; headings and buttons are kept short for phones.
 * Returns 0 when there is no limit. Going over is a warning, not an error.
 */
export function fieldLimit(section: string, name: string) {
  if (section === "seo" || name.startsWith("seo")) return /title/i.test(name) ? 60 : /description/i.test(name) ? 160 : 0;
  if (/(title|heading|label|button|cta|eyebrow|name)$/i.test(name)) return 90;
  return 0;
}

/** Only an address on this website can be previewed: "/about" is fine, "//evil.com" or "https://…" is not. */
export function safePreviewPath(path: unknown, fallback = "/classic") {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\r\n]/.test(path)) return fallback;
  return path;
}

/** Only a CMS editor address may be the "Back to the editor" link. */
export const safeEditorPath = (path: unknown) => (typeof path === "string" && /^\/admin\/cms(\/[\w-]+)?(\?lang=[a-z]{2})?$/.test(path) ? path : "/admin/cms");

/** Readable words for the activity list. */
export const CMS_ACTIONS: Record<string, string> = {
  "cms.draft_saved": "Saved a draft",
  "cms.published": "Published",
  "cms.draft_discarded": "Discarded a draft",
  "cms.publish_undone": "Undid the last publish",
  "cms.restored_default": "Restored the original wording",
  "cms.media_added": "Uploaded a photo",
  "cms.media_updated": "Changed a photo description",
  "cms.media_deleted": "Deleted a photo",
};

/** Cookie that remembers which CMS editor opened a preview, for the "Back to the editor" link. */
export const CMS_BACK_COOKIE = "ailu_cms_back";

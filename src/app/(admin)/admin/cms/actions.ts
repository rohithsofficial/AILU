"use server";

// Form actions for the CMS: save a draft, publish, undo, restore the original wording, and edit or delete photos.
// Staff may save drafts; only roles with cms.publish may publish.
import { actionMessage } from "@/lib/actionMessage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { can, requireRole } from "@/lib/authz";
import { CMS_SECTIONS } from "@/content/defaults";
import { localePath } from "@/lib/i18n";
import { deleteMedia, discardDraft, parseSectionId, publishSection, restoreDefault, saveDraft, undoPublish, updateMediaAlt } from "@/server/cms";

const message = (error: unknown) => actionMessage(error);
const back = (path: string, text: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(text)}`);

export async function cmsSectionAction(fd: FormData) {
  // `key` is a section id: "hero" for English, "hero:kn" for its Kannada wording.
  const key = String(fd.get("key") ?? "");
  const intent = String(fd.get("intent") ?? "save");
  const section = parseSectionId(key);
  const path = `/admin/cms/${section.key}${section.locale === "en" ? "" : `?lang=${section.locale}`}`;
  let done = "Draft saved. Visitors do not see it yet.";
  let preview = "";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const value = () => JSON.parse(String(fd.get("value") ?? "null")) as unknown;
    const publisher = () => { if (!can(staff.role, "cms.publish")) throw new Error("Your role can save drafts but cannot publish."); };
    if (intent === "save") await saveDraft(staff, key, value());
    else if (intent === "preview") {
      // Save the draft, then show the real page with it. Visitors still see the live wording.
      await saveDraft(staff, key, value());
      const page = CMS_SECTIONS.find((item) => item.key === section.key)?.path ?? "/classic";
      preview = `/api/admin/cms/preview?path=${encodeURIComponent(localePath(section.locale, page))}&back=${encodeURIComponent(path)}`;
    }
    else if (intent === "discard") { await discardDraft(staff, key); done = "Draft removed."; }
    else if (intent === "publish") {
      publisher();
      try { await publishSection(staff, key, value()); } catch (error) { await saveDraft(staff, key, value()); throw error; }
      done = "Published. The website is updated.";
    } else if (intent === "undo") { publisher(); await undoPublish(staff, key); done = "Went back to the earlier version."; }
    else if (intent === "restore") { publisher(); await restoreDefault(staff, key); done = "Back to the original wording."; }
    revalidatePath("/admin/cms");
    revalidatePath(`/admin/cms/${section.key}`);
  } catch (error) { done = message(error); preview = ""; }
  if (preview) redirect(preview);
  back(path, done);
}

export async function mediaAltAction(fd: FormData) {
  let done = "Description saved.";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await updateMediaAlt(staff, String(fd.get("id") ?? ""), String(fd.get("alt") ?? ""));
    revalidatePath("/admin/cms/media");
  } catch (error) { done = message(error); }
  back("/admin/cms/media", done);
}

export async function mediaDeleteAction(fd: FormData) {
  let done = "Image deleted.";
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await deleteMedia(staff, String(fd.get("id") ?? ""));
    revalidatePath("/admin/cms/media");
  } catch (error) { done = message(error); }
  back("/admin/cms/media", done);
}

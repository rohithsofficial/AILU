// Shown on the website only while a staff member previews CMS drafts (draft mode). Visitors never see it.
import { cookies } from "next/headers";
import { previewing } from "@/server/cms";
import { CMS_BACK_COOKIE, safeEditorPath } from "@/lib/cms";
import PreviewExitLink from "@/components/PreviewExitLink";

export default function PreviewBanner() {
  if (!previewing()) return null; // cookies() is read only in preview, so normal pages stay static
  const back = safeEditorPath(cookies().get(CMS_BACK_COOKIE)?.value);
  return <div role="status" className="fixed bottom-20 left-3 z-[9999] flex max-w-[calc(100vw-1.5rem)] sm:bottom-3 sm:max-w-[calc(100vw-12rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-ailu-black/20 bg-ailu-yellow px-3 py-2 font-sans text-xs font-semibold text-ailu-black shadow-lg">
    <span>Preview: unpublished changes</span>
    <a href={back} className="underline">Back to editor</a>
    <PreviewExitLink />
  </div>;
}

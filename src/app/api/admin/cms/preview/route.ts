// GET /api/admin/cms/preview?path=/about&back=/admin/cms/about: staff see a page with the CMS drafts, before publishing.
// GET /api/admin/cms/preview?exit=1&path=/about: back to the live wording.
// Uses Next.js draft mode, so visitors never see drafts. While the site is hidden (COMING_SOON), it also
// sets the same unlock cookie as /?preview=SECRET, so staff can see the page.
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { can, currentStaff } from "@/lib/authz";
import { CMS_BACK_COOKIE as BACK_COOKIE, safeEditorPath, safePreviewPath } from "@/lib/cms";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const path = safePreviewPath(params.get("path"));
  if (params.get("exit")) {
    draftMode().disable();
    cookies().delete(BACK_COOKIE);
    redirect(path);
  }
  const staff = await currentStaff();
  if (!staff || !can(staff.role, "cms.edit")) redirect("/admin/login");
  draftMode().enable();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  cookies().set(BACK_COOKIE, safeEditorPath(params.get("back")), { ...options, maxAge: 60 * 60 * 8 });
  const secret = process.env.PREVIEW_SECRET;
  if (process.env.COMING_SOON === "true" && secret) cookies().set("ailu_preview", secret, { ...options, maxAge: 60 * 60 * 24 * 30 });
  redirect(path);
}

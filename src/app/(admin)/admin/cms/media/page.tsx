// CMS: the photo library. Uploads go to Vercel Blob through /api/admin/cms/upload.
import Link from "next/link";
import MediaLibraryUpload from "@/components/admin/MediaLibraryUpload";
import { ConfirmButton } from "@/components/admin/RecordControls";
import { can, requireRolePage } from "@/lib/authz";
import { listMedia } from "@/server/cms";
import { mediaAltAction, mediaDeleteAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: { msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const media = await listMedia();
  const canDelete = can(staff.role, "cms.publish");
  return <div className="mx-auto max-w-5xl">
    <Link href="/admin/cms" className="text-sm text-ailu-cream/60 hover:underline">← Website CMS</Link>
    <h1 className="mt-2 font-display text-2xl font-bold">Photo library</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Upload photos here, then pick them in Celebrations or SEO.</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <MediaLibraryUpload />
    {media.length ? <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{media.map((item) => <li key={item.id} className="rounded-xl border border-white/10 bg-[#111114] p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt={item.alt} className="aspect-[4/3] w-full rounded-lg object-cover" />
      <form action={mediaAltAction} className="mt-2 flex gap-2"><input type="hidden" name="id" value={item.id} /><input name="alt" required minLength={3} maxLength={200} defaultValue={item.alt} aria-label="Photo description" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm text-ailu-cream" /><button className="text-xs text-ailu-yellow underline">Save</button></form>
      {canDelete ? <form action={mediaDeleteAction} className="mt-2"><input type="hidden" name="id" value={item.id} /><ConfirmButton label="Delete" message="Delete this photo? This cannot be undone." /></form> : null}
    </li>)}</ul> : <p className="mt-5 text-sm text-ailu-cream/55">No photos yet.</p>}
  </div>;
}

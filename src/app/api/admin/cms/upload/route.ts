// POST /api/admin/cms/upload: staff upload a CMS photo (JPG, PNG or WebP, up to 4 MB) to Vercel Blob.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { currentStaff, can } from "@/lib/authz";
import { addMedia } from "@/server/cms";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 4 * 1024 * 1024; // Vercel limits a request to about 4.5 MB

export async function POST(req: Request) {
  const staff = await currentStaff();
  if (!staff || !can(staff.role, "cms.edit")) return NextResponse.json({ error: "Please sign in again." }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Photo storage is not connected yet. Create a Blob store in Vercel first." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const alt = String(form?.get("alt") ?? "").trim().slice(0, 200);
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a photo first." }, { status: 400 });
  const extension = TYPES[file.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is over 4 MB. Please make it smaller." }, { status: 400 });
  if (alt.length < 3) return NextResponse.json({ error: "Describe the photo in a few words." }, { status: 400 });

  try {
    const blob = await put(`cms/photo.${extension}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    const media = await addMedia(staff, { url: blob.url, pathname: blob.pathname, alt, contentType: file.type, sizeBytes: file.size });
    return NextResponse.json({ id: media.id, url: media.url, alt: media.alt });
  } catch (error) {
    console.error("CMS upload failed", (error as Error).message);
    return NextResponse.json({ error: "The upload failed. Please try again." }, { status: 500 });
  }
}

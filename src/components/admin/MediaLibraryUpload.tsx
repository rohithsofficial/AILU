"use client";

// CMS: the photo upload form (sends to /api/admin/cms/upload).
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/admin/MediaUpload";

export default function MediaLibraryUpload() {
  const router = useRouter();
  return <MediaUpload onAdded={() => router.refresh()} />;
}

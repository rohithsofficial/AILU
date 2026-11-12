"use client";
// "Exit preview": leaves draft mode and reloads the same page with the live wording.
import { usePathname } from "next/navigation";

export default function PreviewExitLink() {
  const path = usePathname() || "/classic";
  return <a href={`/api/admin/cms/preview?exit=1&path=${encodeURIComponent(path)}`} className="underline">Exit preview</a>;
}

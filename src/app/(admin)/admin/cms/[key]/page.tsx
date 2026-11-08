// CMS: the editor for one section. The form is built from the shape of CMS_DEFAULTS (src/content/defaults.ts).
import Link from "next/link";
import { notFound } from "next/navigation";
import CmsEditor from "@/components/admin/CmsEditor";
import { can, requireRolePage } from "@/lib/authz";
import { formatIN } from "@/lib/format";
import { CMS_SECTIONS } from "@/content/defaults";
import { getSection, listMedia } from "@/server/cms";
import type { Json } from "@/lib/cms";
import { cmsSectionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CmsSectionPage({ params, searchParams }: { params: { key: string }; searchParams: { msg?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  if (!CMS_SECTIONS.some((section) => section.key === params.key)) notFound();
  const [section, media] = await Promise.all([getSection(params.key), listMedia()]);
  const canPublish = can(staff.role, "cms.publish") && (!section.info.ownerPublish || staff.role === "OWNER");
  return <div className="mx-auto max-w-4xl">
    <Link href="/admin/cms" className="text-sm text-ailu-cream/60 hover:underline">← Website CMS</Link>
    <h1 className="mt-2 font-display text-2xl font-bold">{section.info.label}</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">{section.info.help}</p>
    <p className="mt-1 text-xs text-ailu-cream/45">{section.publishedAt ? `Last published ${formatIN(section.publishedAt)}` : "Using the original wording"}{section.hasDraft ? " · You have an unpublished draft" : ""}</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <p className="mt-4 rounded-lg border border-white/10 p-3 text-xs leading-relaxed text-ailu-cream/60">Publish only true information: no made-up prices, reviews, rewards or availability, and never a person&apos;s dream or story. Write {"{phone}"} or {"{email}"} to use your Contact details.</p>
    <CmsEditor
      sectionKey={params.key}
      initial={section.value as Json}
      defaults={section.defaults as Json}
      media={media.map(({ id, url, alt }) => ({ id, url, alt }))}
      action={cmsSectionAction}
      canPublish={canPublish}
      canUndo={section.canUndo}
      hasDraft={section.hasDraft}
    />
  </div>;
}

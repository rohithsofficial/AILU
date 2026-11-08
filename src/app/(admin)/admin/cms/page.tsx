// CMS home (/admin/cms): every section of website wording, with draft and published state. Guide: docs/CMS_GUIDE.md.
import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { formatIN } from "@/lib/format";
import { seoIssues } from "@/lib/cms";
import { getContent, listSections } from "@/server/cms";

export const dynamic = "force-dynamic";

export default async function CmsHome({ searchParams }: { searchParams: { msg?: string } }) {
  await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const [sections, content] = await Promise.all([listSections(), getContent()]);
  const groups = [...new Set(sections.map((section) => section.group))];
  const issues = seoIssues(content.seo.pages);
  return <div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold">Website CMS</h1><p className="mt-1 text-sm text-ailu-cream/60">Change the website wording, SEO and photos. Save a draft, then publish when it is ready.</p></div>
      <Link href="/admin/cms/media" className="rounded-lg border border-ailu-yellow/60 px-4 py-2 text-sm font-semibold text-ailu-yellow">Photo library</Link>
    </div>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}
    <section className="mt-5 rounded-2xl border border-white/10 bg-[#111114] p-5">
      <h2 className="font-semibold">SEO check</h2>
      {issues.length ? <ul className="mt-2 space-y-1 text-sm text-ailu-cream/75">{issues.slice(0, 8).map((issue) => <li key={issue.path + issue.problem}><code className="text-ailu-yellow">{issue.path}</code> {issue.problem}</li>)}</ul> : <p className="mt-2 text-sm text-ailu-cream/70">Every visible page has a title and description of a good length.</p>}
      <Link href="/admin/cms/seo" className="mt-3 inline-block text-sm text-ailu-yellow underline">Edit SEO</Link>
    </section>
    {groups.map((group) => <section key={group} className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-[.2em] text-ailu-yellow">{group}</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{sections.filter((section) => section.group === group).map((section) => <li key={section.key}>
        <Link href={`/admin/cms/${section.key}`} className="block h-full rounded-xl border border-white/10 bg-[#111114] p-4 transition hover:border-ailu-yellow/60">
          <span className="flex flex-wrap items-center gap-2 font-semibold">{section.label}{section.hasDraft ? <span className="rounded-full bg-ailu-yellow px-2 py-0.5 text-xs font-bold text-ailu-black">Draft</span> : null}</span>
          <span className="mt-1 block text-sm text-ailu-cream/60">{section.help}</span>
          <span className="mt-2 block text-xs text-ailu-cream/45">{section.publishedAt ? `Published ${formatIN(section.publishedAt)}` : "Using the original wording"}</span>
        </Link>
      </li>)}</ul>
    </section>)}
  </div>;
}

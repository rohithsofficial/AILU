// CMS home (/admin/cms): quick links, then every part of the website grouped by page, with its status. Guide: docs/CMS_GUIDE.md.
import Link from "next/link";
import { can, requireRolePage } from "@/lib/authz";
import { formatIN } from "@/lib/format";
import { seoIssues } from "@/lib/cms";
import { getContent, listSections } from "@/server/cms";
import CmsLanguagePicker from "@/components/admin/CmsLanguagePicker";
import { LANGUAGES, localePath, toLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function Status({ hasDraft, published }: { hasDraft: boolean; published: boolean }) {
  if (hasDraft) return <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-ailu-black">Unpublished changes</span>;
  if (published) return <span className="rounded-full bg-emerald-400/90 px-2 py-0.5 text-xs font-bold text-ailu-black">Live</span>;
  return <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-ailu-cream/60">Original wording</span>;
}

export default async function CmsHome({ searchParams }: { searchParams: { msg?: string; lang?: string } }) {
  const staff = await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const locale = toLocale(searchParams.lang);
  const query = locale === "en" ? "" : `?lang=${locale}`;
  const [sections, content] = await Promise.all([listSections(locale), getContent(locale)]);
  const groups = [...new Set(sections.map((section) => section.group))];
  const issues = seoIssues(content.seo.pages);
  const drafts = sections.filter((section) => section.hasDraft);
  const quick = [
    { href: "/admin/cms/settings", title: "Business details", text: "Phone, email, WhatsApp and social links" },
    { href: "/admin/cms/media", title: "Photo library", text: "Upload photos and describe them" },
    { href: "/admin/cms/seo", title: "SEO", text: issues.length ? `${issues.length} thing${issues.length === 1 ? "" : "s"} to fix` : "Every page looks good" },
    { href: "/admin/cms/activity", title: "Activity", text: "Who changed what, and when" },
    ...(can(staff.role, "staff.manage") ? [{ href: "/admin/settings/staff", title: "Staff accounts", text: "Who can sign in and their role" }] : []),
  ];
  return <div className="mx-auto max-w-5xl">
    <h1 className="font-display text-2xl font-bold">Website CMS</h1>
    <p className="mt-1 max-w-2xl text-sm text-ailu-cream/60">Change the words and photos on each page. The layout and design stay the same, so nothing can break. Save a draft, preview it, then publish when it is ready.</p>
    {searchParams.msg ? <p role="status" className="mt-4 rounded-lg border border-ailu-yellow/30 bg-ailu-yellow/10 p-3 text-sm">{searchParams.msg}</p> : null}

    <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{quick.map((item) => <li key={item.href}>
      <Link href={item.href} className="block h-full rounded-xl border border-ailu-yellow/30 bg-ailu-yellow/[0.06] p-4 transition hover:border-ailu-yellow">
        <span className="block font-semibold text-ailu-yellow">{item.title}</span>
        <span className="mt-1 block text-xs text-ailu-cream/65">{item.text}</span>
      </Link>
    </li>)}</ul>

    {drafts.length ? <section className="mt-5 rounded-2xl border border-amber-300/40 bg-amber-300/[0.06] p-4 text-sm">
      <h2 className="font-semibold">Waiting to be published</h2>
      <p className="mt-1 text-ailu-cream/70">{drafts.map((section, index) => <span key={section.key}>{index ? ", " : ""}<Link href={`/admin/cms/${section.key}${query}`} className="text-ailu-yellow underline">{section.label}</Link></span>)}</p>
    </section> : null}

    <CmsLanguagePicker locale={locale} basePath="/admin/cms" />
    {locale !== "en" ? <p className="mt-3 rounded-lg border border-white/10 p-3 text-xs leading-relaxed text-ailu-cream/65">You are editing the {LANGUAGES[locale].english} wording. Links, photos and contact details are shared with English, so change those in English. A line you leave as it is uses the draft translation{LANGUAGES[locale].checked ? "" : ", which a native speaker has not checked yet"}.</p> : null}

    {groups.map((group) => <section key={group} className="mt-6">
      <h2 className="text-xs font-bold uppercase tracking-[.2em] text-ailu-yellow">{group}</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{sections.filter((section) => section.group === group).map((section) => <li key={section.key} className="relative">
        <Link href={`/admin/cms/${section.key}${query}`} className="block h-full rounded-xl border border-white/10 bg-[#111114] p-4 pb-9 transition hover:border-ailu-yellow/60">
          <span className="flex flex-wrap items-center gap-2 font-semibold">{section.label}<Status hasDraft={section.hasDraft} published={section.published} /></span>
          <span className="mt-1 block text-sm text-ailu-cream/60">{section.help}</span>
          <span className="mt-2 block text-xs text-ailu-cream/45">{section.publishedAt ? `Published ${formatIN(section.publishedAt)}` : "Not changed in the CMS yet"}</span>
        </Link>
        {section.path ? <a href={localePath(locale, section.path)} target="_blank" rel="noopener" className="absolute bottom-3 right-4 text-xs text-ailu-cream/60 underline hover:text-ailu-yellow">View page ↗<span className="sr-only"> for {section.label}</span></a> : null}
      </li>)}</ul>
    </section>)}
  </div>;
}

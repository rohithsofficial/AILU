// CMS: who changed the website and when, newest first (saved drafts, publishes, photos). Reads the audit log.
import Link from "next/link";
import { requireRolePage } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { CMS_ACTIONS } from "@/lib/cms";
import { CMS_SECTIONS } from "@/content/defaults";
import { LANGUAGES, isLocale } from "@/lib/i18n";
import { pageNumber } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const when = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

/** "hero:kn" → "Home top section (Kannada)". Photos have no section. */
function whatChanged(entity: string, entityId: string) {
  if (entity === "CmsMedia") return { label: "Photo library", href: "/admin/cms/media" };
  const [key, locale] = entityId.split(":");
  const section = CMS_SECTIONS.find((item) => item.key === key);
  const language = isLocale(locale) ? ` (${LANGUAGES[locale].english})` : "";
  return { label: `${section?.label ?? key}${language}`, href: section ? `/admin/cms/${key}${isLocale(locale) ? `?lang=${locale}` : ""}` : null };
}

export default async function CmsActivity({ searchParams }: { searchParams: { page?: string } }) {
  await requireRolePage(["OWNER", "MANAGER", "STAFF"]);
  const page = pageNumber(searchParams.page);
  const db = getPrisma();
  const where = { action: { startsWith: "cms." } };
  const [rows, staff] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { at: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE + 1 }),
    db.staffUser.findMany({ select: { id: true, name: true, email: true } }),
  ]);
  const names = new Map(staff.map((person) => [person.id, person.name || person.email]));
  const more = rows.length > PAGE_SIZE;
  return <div className="mx-auto max-w-4xl">
    <Link href="/admin/cms" className="text-sm text-ailu-cream/60 hover:underline">← Website CMS</Link>
    <h1 className="mt-2 font-display text-2xl font-bold">Activity</h1>
    <p className="mt-1 text-sm text-ailu-cream/60">Every change to the website wording and photos, newest first.</p>
    {rows.length === 0 ? <p className="mt-6 text-sm text-ailu-cream/50">Nothing changed yet.</p> : <ol className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#111114]">
      {rows.slice(0, PAGE_SIZE).map((row) => {
        const target = whatChanged(row.entity, row.entityId);
        return <li key={row.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm">
          <span className="font-semibold">{(row.actorId && names.get(row.actorId)) || "Someone"}</span>
          <span className="text-ailu-cream/80">{(CMS_ACTIONS[row.action] ?? row.action).toLowerCase()}</span>
          {target.href ? <Link href={target.href} className="text-ailu-yellow underline">{target.label}</Link> : <span>{target.label}</span>}
          <time dateTime={row.at.toISOString()} className="ml-auto text-xs text-ailu-cream/50">{when.format(row.at)}</time>
        </li>;
      })}
    </ol>}
    {page > 1 || more ? <nav aria-label="Activity pages" className="mt-4 flex gap-4 text-sm">
      {page > 1 ? <Link href={`/admin/cms/activity?page=${page - 1}`} className="text-ailu-yellow underline">← Newer</Link> : null}
      {more ? <Link href={`/admin/cms/activity?page=${page + 1}`} className="text-ailu-yellow underline">Older →</Link> : null}
    </nav> : null}
  </div>;
}

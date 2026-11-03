import { requireRolePage } from "@/lib/authz";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditPage({ searchParams }: { searchParams: { page?: string } }) {
  await requireRolePage(["OWNER"]);
  const db = getPrisma();
  const page = Math.max(1, Math.min(10000, Number.parseInt(searchParams.page ?? "1", 10) || 1));
  const pageSize = 50;
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ orderBy: { at: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    db.auditLog.count(),
  ]);
  const staffList = await db.staffUser.findMany({ select: { id: true, email: true } });
  const actors = new Map(staffList.map((s) => [s.id, s.email]));
  const emailFor = (actorId: string | null) => (actorId && actors.get(actorId)) || "—";
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold">Audit log</h1>
      <p className="mt-1 text-sm text-ailu-cream/60">Every staff sign-in and change, newest first. {total} entries.</p>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-ailu-cream/50">Nothing recorded yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.06] text-left text-xs uppercase tracking-wider text-ailu-cream/50">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Diff</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-2.5 whitespace-nowrap text-ailu-cream/70">
                    {new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(r.at)}
                  </td>
                  <td className="px-4 py-2.5">{emailFor(r.actorId)}</td>
                  <td className="px-4 py-2.5 font-medium">{r.action}</td>
                  <td className="px-4 py-2.5 text-ailu-cream/70">{r.entity} · {r.entityId}</td>
                  <td className="px-4 py-2.5 text-ailu-cream/50">{r.diff ? JSON.stringify(r.diff) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {page > 1 || rows.length === pageSize ? <nav aria-label="Audit log pages" className="mt-4 flex gap-4 text-sm"><a href={`/admin/settings/audit?page=${Math.max(1, page - 1)}`} className="text-ailu-yellow underline">← Previous</a>{rows.length === pageSize ? <a href={`/admin/settings/audit?page=${page + 1}`} className="text-ailu-yellow underline">Next →</a> : null}</nav> : null}
    </div>
  );
}

import type { Staff } from "@/lib/authz";
import { getPrisma } from "@/lib/db";
import { phoneSearchTerm, allowedSearchGroups, type SearchGroup } from "./search-scope";

export type SearchHit = { id: string; label: string; detail: string; href: string };
export type SearchResults = { query: string; groups: { key: string; title: string; href: string; hits: SearchHit[] }[] };

export async function globalSearch(staff: Staff, rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim().slice(0, 100);
  if (query.length < 2) return { query, groups: [] };
  const db = getPrisma();
  const groups = new Set(allowedSearchGroups(staff.role));
  const phone = phoneSearchTerm(query);
  const phoneDigits = query.replace(/\D/g, "");
  const text = { contains: query, mode: "insensitive" as const };
  const phoneMatch = phone ? { equals: phone } : phoneDigits.length >= 3 ? { contains: phoneDigits } : null;
  const phoneField = phoneMatch ? [{ phone: phoneMatch }] : [];
  const staffOwner = staff.role === "STAFF" ? { ownerId: staff.id } : {};

  const [clients, events, enquiries, vendors, partners, applications, team] = await Promise.all([
    groups.has("clients") ? db.client.findMany({ where: { archivedAt: null, ...staffOwner, OR: [{ id: text }, { name: text }, { companyName: text }, ...phoneField] }, take: 5, orderBy: { name: "asc" }, select: { id: true, name: true, companyName: true, city: true } }) : Promise.resolve([]),
    groups.has("events") ? db.event.findMany({ where: { archivedAt: null, ...staffOwner, OR: [{ id: text }, { title: text }, { client: { name: text } }, ...(phoneMatch ? [{ client: { phone: phoneMatch } }] : [])] }, take: 5, orderBy: [{ startDate: "asc" }, { title: "asc" }], select: { id: true, title: true, status: true } }) : Promise.resolve([]),
    groups.has("enquiries") ? db.eventEnquiry.findMany({ where: { spam: false, AND: [...(staff.role === "STAFF" ? [{ OR: [{ ownerId: staff.id }, { ownerId: null }] }] : []), { OR: [{ id: text }, { name: text }, ...phoneField] }] }, take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, category: true, eventId: true } }) : Promise.resolve([]),
    groups.has("vendors") ? db.vendor.findMany({ where: { archivedAt: null, OR: [{ id: text }, { name: text }, { category: text }, ...phoneField] }, take: 5, orderBy: { name: "asc" }, select: { id: true, name: true, category: true, city: true } }) : Promise.resolve([]),
    groups.has("partners") ? db.salesPartner.findMany({ where: { OR: [{ id: text }, { name: text }, ...phoneField] }, take: 5, orderBy: { name: "asc" }, select: { id: true, name: true, phone: true, status: true } }) : Promise.resolve([]),
    groups.has("applications") ? db.application.findMany({ where: { OR: [{ id: text }, { name: text }, ...phoneField] }, take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, role: true, status: true } }) : Promise.resolve([]),
    groups.has("team") ? db.teamMember.findMany({ where: { OR: [{ id: text }, { name: text }, ...phoneField] }, take: 5, orderBy: { name: "asc" }, select: { id: true, name: true, roles: true, city: true } }) : Promise.resolve([]),
  ]);

  const rows: [string, string, string, SearchHit[]][] = [
    ["clients", "Clients", `/admin/clients?q=${encodeURIComponent(query)}`, clients.map((row) => ({ id: row.id, label: row.name, detail: [row.companyName, row.city].filter(Boolean).join(" · "), href: `/admin/clients/${row.id}` }))],
    ["events", "Events", `/admin/events?q=${encodeURIComponent(query)}`, events.map((row) => ({ id: row.id, label: row.title, detail: `${row.id} · ${row.status}`, href: `/admin/events/${row.id}` }))],
    ["enquiries", "Enquiries", `/admin/inbox?q=${encodeURIComponent(query)}`, enquiries.map((row) => ({ id: row.id, label: row.name, detail: `${row.id} · ${row.category}${row.eventId ? " · converted" : " · unconverted"}`, href: `/admin/inbox/${row.id}` }))],
    ["vendors", "Vendors", `/admin/vendors?q=${encodeURIComponent(query)}`, vendors.map((row) => ({ id: row.id, label: row.name, detail: [row.category, row.city].filter(Boolean).join(" · "), href: `/admin/vendors/${row.id}` }))],
    ["partners", "Partners", `/admin/partners?q=${encodeURIComponent(query)}`, partners.map((row) => ({ id: row.id, label: row.name, detail: `${row.id} · ${row.status}`, href: `/admin/partners/${row.id}` }))],
    ["applications", "Applications", `/admin/applications?q=${encodeURIComponent(query)}`, applications.map((row) => ({ id: row.id, label: row.name, detail: `${row.id} · ${row.role} · ${row.status}`, href: `/admin/applications/${row.id}` }))],
    ["team", "Team", `/admin/team?q=${encodeURIComponent(query)}`, team.map((row) => ({ id: row.id, label: row.name, detail: [row.roles.join(", "), row.city].filter(Boolean).join(" · "), href: `/admin/team/${row.id}` }))],
  ];
  return { query, groups: rows.filter(([key]) => groups.has(key as SearchGroup)).map(([key, title, href, hits]) => ({ key, title, href, hits })) };
}

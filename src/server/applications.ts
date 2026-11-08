// Database logic for team applications: list, update and convert into a team member.
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { phoneFilter } from "@/lib/search";
import { audit } from "@/lib/audit";
import { normalizePhone } from "@/lib/validation";
import { canConvertApplication, teamMemberConversionMode } from "@/lib/a3Rules";
import { z } from "zod";

const applicationStatuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "CONTACTED", "SELECTED", "NOT_SELECTED", "CLOSED"] as const;
const pageSize = 25;

export async function listApplications(params: { q?: string; status?: string; role?: string; beginner?: string; page?: number }) {
  const where: Prisma.ApplicationWhereInput = {};
  if ((applicationStatuses as readonly string[]).includes(params.status ?? "")) where.status = params.status as (typeof applicationStatuses)[number];
  if (params.role?.trim()) where.role = { equals: params.role.trim(), mode: "insensitive" };
  if (params.beginner === "yes") where.beginner = true;
  if (params.beginner === "no") where.beginner = false;
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      ...phoneFilter(q),
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows] = await Promise.all([
    getPrisma().application.count({ where }),
    getPrisma().application.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, phone: true, city: true, role: true, beginner: true, status: true, createdAt: true, teamMemberId: true } }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getApplication(id: string) {
  const [application, auditRows] = await Promise.all([
    getPrisma().application.findUnique({ where: { id }, include: { teamMember: { select: { id: true, name: true } } } }),
    getPrisma().auditLog.findMany({ where: { entity: "Application", entityId: id }, orderBy: { at: "desc" }, take: 100 }),
  ]);
  return application ? { application, auditRows } : null;
}

const updateSchema = z.object({ status: z.enum(applicationStatuses), internalNotes: z.string().trim().max(3000) });
export async function updateApplication(actor: { id: string }, id: string, fd: FormData) {
  const parsed = updateSchema.safeParse({ status: String(fd.get("status") ?? ""), internalNotes: String(fd.get("internalNotes") ?? "") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the application update.");
  const old = await getPrisma().application.findUnique({ where: { id } });
  if (!old) throw new Error("That application does not exist.");
  const decided = ["SELECTED", "NOT_SELECTED", "CLOSED"].includes(parsed.data.status);
  const data = { status: parsed.data.status, internalNotes: parsed.data.internalNotes || null, ...(decided && parsed.data.status !== old.status ? { decidedById: actor.id, decidedAt: new Date() } : {}) };
  const result = await getPrisma().application.update({ where: { id }, data });
  await audit(actor, "application.updated", "Application", id, { fields: ["status", "internalNotes"], statusChanged: old.status !== result.status });
  return result;
}

export async function convertApplicationToTeamMember(actor: { id: string }, id: string) {
  const db = getPrisma();
  return db.$transaction(async (tx) => {
    const application = await tx.application.findUnique({ where: { id } });
    if (!application) throw new Error("That application does not exist.");
    if (!canConvertApplication(application.status)) throw new Error("A rejected or closed application cannot be converted.");

    const linked = application.teamMemberId ? await tx.teamMember.findUnique({ where: { id: application.teamMemberId } }) : null;
    const phone = normalizePhone(application.phone);
    const phoneMatch = linked ?? await tx.teamMember.findUnique({ where: { phone } });
    const mode = teamMemberConversionMode(linked?.id ?? null, phoneMatch?.id ?? null);
    let member = phoneMatch;
    if (!member) {
      const created = await tx.teamMember.create({ data: {
        id: `tmp-${crypto.randomUUID()}`, name: application.name, phone, email: application.email,
        city: application.city, roles: [application.role], applicationId: application.id,
        notes: application.skills, active: true,
      } });
      member = await tx.teamMember.update({ where: { seq: created.seq }, data: { id: `AILU-TM-${String(created.seq).padStart(6, "0")}` } });
    } else if (!member.applicationId) {
      member = await tx.teamMember.update({ where: { id: member.id }, data: { applicationId: application.id, roles: [...new Set([...member.roles, application.role])] } });
    }

    // Converting always means the person was selected.
    const status = "SELECTED" as const;
    const changedStatus = application.status !== status;
    await tx.application.update({ where: { id }, data: {
      teamMemberId: member.id, status,
      ...(changedStatus ? { decidedById: actor.id, decidedAt: new Date() } : {}),
    } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: mode === "create" ? "application.converted_to_team_member" : "application.linked_to_team_member", entity: "Application", entityId: id, diff: { teamMemberId: member.id, status: changedStatus ? { from: application.status, to: status } : status } } });
    return { member, mode };
  });
}

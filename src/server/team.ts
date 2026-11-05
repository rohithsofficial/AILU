import type { Prisma } from "@prisma/client";
import { linkedMoneyError } from "@/lib/recordRules";
import type { StaffRole } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { logActivity } from "@/server/activity";
import { indianPhoneSchema, normalizePhone } from "@/lib/validation";
import { parseINRToPaise } from "@/lib/money";
import { isDuplicateTeamAssignment } from "@/lib/a3Rules";
import { z } from "zod";

const memberId = (seq: number) => `AILU-TM-${String(seq).padStart(6, "0")}`;
const teamRoles = ["HOST", "EMCEE", "PERFORMER", "DANCER", "SINGER", "DJ", "PHOTOGRAPHER", "COORDINATOR", "OTHER"] as const;
const assignmentStatuses = ["ASSIGNED", "CONFIRMED", "DONE", "DROPPED"] as const;

export async function listTeamMembers(params: { q?: string; role?: string; active?: string; city?: string; page?: number }) {
  const where: Prisma.TeamMemberWhereInput = {};
  if (params.active === "yes") where.active = true;
  if (params.active === "no") where.active = false;
  if (params.role?.trim()) where.roles = { has: params.role.trim().toUpperCase() };
  if (params.city?.trim()) where.city = { contains: params.city.trim(), mode: "insensitive" };
  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { id: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") } }, { city: { contains: q, mode: "insensitive" } },
      { roles: { has: q.toUpperCase() } },
    ];
  }
  const page = Math.max(1, Math.min(10000, Math.floor(params.page ?? 1) || 1));
  const [total, rows] = await Promise.all([
    getPrisma().teamMember.count({ where }),
    getPrisma().teamMember.findMany({ where, orderBy: [{ active: "desc" }, { name: "asc" }], skip: (page - 1) * 25, take: 25, select: { id: true, name: true, phone: true, city: true, roles: true, active: true, _count: { select: { assignments: true } } } }),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / 25)) };
}

export async function getTeamMember(id: string, includeFees: boolean) {
  if (includeFees) {
    return getPrisma().teamMember.findUnique({ where: { id }, include: { application: { select: { id: true } }, assignments: { orderBy: { createdAt: "desc" }, include: { event: { select: { id: true, title: true, startDate: true, status: true } } } } } });
  }
  const member = await getPrisma().teamMember.findUnique({ where: { id }, select: {
    id: true, name: true, phone: true, email: true, city: true, roles: true, active: true, notes: true, createdAt: true,
    application: { select: { id: true } },
    assignments: { orderBy: { createdAt: "desc" }, select: { id: true, eventId: true, role: true, status: true, notes: true, createdAt: true, event: { select: { id: true, title: true, startDate: true, status: true } } } },
  } });
  return member ? { ...member, feeNotes: null, assignments: member.assignments.map((assignment) => ({ ...assignment, feePaise: null })) } : null;
}

export async function listActiveTeamMembers() {
  return getPrisma().teamMember.findMany({ where: { active: true }, orderBy: { name: "asc" }, take: 300, select: { id: true, name: true, roles: true } });
}

export async function eventAssignments(eventId: string, includeFees: boolean) {
  if (includeFees) return getPrisma().eventAssignment.findMany({ where: { eventId }, orderBy: { createdAt: "desc" }, include: { teamMember: { select: { id: true, name: true, roles: true } } } });
  const rows = await getPrisma().eventAssignment.findMany({ where: { eventId }, orderBy: { createdAt: "desc" }, select: { id: true, eventId: true, teamMemberId: true, role: true, status: true, notes: true, createdAt: true, teamMember: { select: { id: true, name: true, roles: true } } } });
  return rows.map((assignment) => ({ ...assignment, feePaise: null }));
}

const memberSchema = z.object({
  name: z.string().trim().min(2).max(120), phone: indianPhoneSchema,
  email: z.union([z.literal(""), z.string().trim().email().max(120)]), city: z.string().trim().max(100),
  roles: z.string().trim().min(2).max(500), feeNotes: z.string().trim().max(1000),
  notes: z.string().trim().max(3000), active: z.enum(["yes", "no"]),
});
function memberInput(fd: FormData) {
  const parsed = memberSchema.safeParse({
    name: String(fd.get("name") ?? ""), phone: String(fd.get("phone") ?? ""), email: String(fd.get("email") ?? ""), city: String(fd.get("city") ?? ""),
    roles: String(fd.get("roles") ?? ""), feeNotes: String(fd.get("feeNotes") ?? ""), notes: String(fd.get("notes") ?? ""), active: String(fd.get("active") ?? "yes"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the team member details.");
  const roles = [...new Set(parsed.data.roles.split(",").map((role) => role.trim().toUpperCase()).filter(Boolean))].slice(0, 20);
  if (!roles.length) throw new Error("Add at least one role.");
  return { name: parsed.data.name, phone: normalizePhone(parsed.data.phone), email: parsed.data.email || null, city: parsed.data.city || null, roles, feeNotes: parsed.data.feeNotes || null, notes: parsed.data.notes || null, active: parsed.data.active === "yes" };
}

export async function createTeamMember(actor: { id: string }, fd: FormData) {
  const data = memberInput(fd);
  const result = await getPrisma().$transaction(async (tx) => {
    const created = await tx.teamMember.create({ data: { ...data, id: `tmp-${crypto.randomUUID()}` } });
    return tx.teamMember.update({ where: { seq: created.seq }, data: { id: memberId(created.seq) } });
  });
  await audit(actor, "team_member.created", "TeamMember", result.id, { fields: ["name", "phone", "roles", "active"] });
  return result;
}

export async function updateTeamMember(actor: { id: string }, id: string, fd: FormData) {
  const data = memberInput(fd);
  const existing = await getPrisma().teamMember.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("That team member does not exist.");
  const result = await getPrisma().teamMember.update({ where: { id }, data });
  await audit(actor, "team_member.updated", "TeamMember", id, { fields: Object.keys(data) });
  return result;
}

const assignmentSchema = z.object({ teamMemberId: z.string().min(1), role: z.string().trim().min(2).max(80), fee: z.string().max(30), notes: z.string().trim().max(1000) });
export async function assignTeamMember(actor: { id: string }, eventId: string, fd: FormData) {
  const parsed = assignmentSchema.safeParse({ teamMemberId: String(fd.get("teamMemberId") ?? ""), role: String(fd.get("role") ?? ""), fee: String(fd.get("fee") ?? ""), notes: String(fd.get("notes") ?? "") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the assignment details.");
  const event = await getPrisma().event.findUnique({ where: { id: eventId }, select: { id: true, title: true, startDate: true } });
  if (!event) throw new Error("That event does not exist.");
  const member = await getPrisma().teamMember.findFirst({ where: { id: parsed.data.teamMemberId, active: true } });
  if (!member) throw new Error("Choose an active team member.");
  const feePaise = parsed.data.fee ? parseINRToPaise(parsed.data.fee) : null;
  if (parsed.data.fee && feePaise === null) throw new Error("Enter a valid agreed fee in rupees.");
  const role = parsed.data.role.trim().toUpperCase();
  const existing = await getPrisma().eventAssignment.findMany({ where: { eventId, teamMemberId: member.id }, select: { eventId: true, teamMemberId: true, role: true } });
  const target = { eventId, teamMemberId: member.id, role };
  if (isDuplicateTeamAssignment(existing, target)) throw new Error("This person already has that role on this event.");

  let scheduleWarning: string | null = null;
  if (event.startDate) {
    const start = new Date(Date.UTC(event.startDate.getUTCFullYear(), event.startDate.getUTCMonth(), event.startDate.getUTCDate()));
    const next = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const overlapping = await getPrisma().eventAssignment.findFirst({
      where: { teamMemberId: member.id, status: { not: "DROPPED" }, eventId: { not: eventId }, event: { startDate: { gte: start, lt: next } } },
      select: { event: { select: { title: true } } },
    });
    if (overlapping) scheduleWarning = `Schedule warning: ${member.name} is also assigned to ${overlapping.event.title} on this date.`;
  }
  const assignment = await getPrisma().eventAssignment.create({ data: { eventId, teamMemberId: member.id, role, feePaise, notes: parsed.data.notes || null } });
  await audit(actor, "team_assignment.created", "EventAssignment", assignment.id, { eventId, teamMemberId: member.id, role, hasFee: feePaise !== null });
  await logActivity("NOTE", `${member.name} assigned as ${role}.`, { eventId }, actor.id);
  return { assignment, scheduleWarning };
}

export async function setAssignmentStatus(actor: { id: string }, eventId: string, assignmentId: string, status: string) {
  if (!(assignmentStatuses as readonly string[]).includes(status)) throw new Error("Choose a valid assignment status.");
  const old = await getPrisma().eventAssignment.findUnique({ where: { id: assignmentId }, include: { teamMember: { select: { name: true } } } });
  if (!old || old.eventId !== eventId) throw new Error("That assignment does not belong to this event.");
  const result = await getPrisma().eventAssignment.update({ where: { id: assignmentId }, data: { status: status as (typeof assignmentStatuses)[number] } });
  await audit(actor, status === "DROPPED" ? "team_assignment.dropped" : "team_assignment.status_changed", "EventAssignment", assignmentId, { from: old.status, to: status });
  await logActivity("STATUS", `${old.teamMember.name}'s assignment status changed to ${status}.`, { eventId }, actor.id);
  return result;
}

async function assignmentOnEvent(eventId: string, assignmentId: string) {
  const assignment = await getPrisma().eventAssignment.findUnique({ where: { id: assignmentId }, include: { teamMember: { select: { name: true } }, _count: { select: { payments: true } } } });
  if (!assignment || assignment.eventId !== eventId) throw new Error("That assignment does not belong to this event.");
  return assignment;
}

export async function updateAssignment(actor: { id: string; role: StaffRole }, eventId: string, assignmentId: string, fd: FormData) {
  const old = await assignmentOnEvent(eventId, assignmentId);
  const parsed = z.object({ role: z.string().trim().min(2, "Enter a role.").max(80), fee: z.string().trim().max(30), notes: z.string().trim().max(1000) }).safeParse({ role: String(fd.get("role") ?? ""), fee: String(fd.get("fee") ?? ""), notes: String(fd.get("notes") ?? "") });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the assignment details.");
  const role = parsed.data.role.toUpperCase();
  const clash = await getPrisma().eventAssignment.findFirst({ where: { eventId, teamMemberId: old.teamMemberId, role, id: { not: assignmentId } }, select: { id: true } });
  if (clash) throw new Error("This person already has that role on this event.");
  // STAFF cannot see team fees, so their edits never touch them.
  let fee = {};
  if (actor.role !== "STAFF") {
    const feePaise = parsed.data.fee ? parseINRToPaise(parsed.data.fee) : null;
    if (parsed.data.fee && feePaise === null) throw new Error("Enter a valid agreed fee in rupees.");
    fee = { feePaise };
  }
  await getPrisma().eventAssignment.update({ where: { id: assignmentId }, data: { role, notes: parsed.data.notes || null, ...fee } });
  await audit(actor, "team_assignment.updated", "EventAssignment", assignmentId, { eventId, fields: ["role", "notes", ...Object.keys(fee)] });
}

export async function deleteAssignment(actor: { id: string }, eventId: string, assignmentId: string) {
  const old = await assignmentOnEvent(eventId, assignmentId);
  const blocked = linkedMoneyError("assignment", old._count);
  if (blocked) throw new Error(blocked);
  await getPrisma().eventAssignment.delete({ where: { id: assignmentId } });
  await audit(actor, "team_assignment.deleted", "EventAssignment", assignmentId, { eventId, teamMemberId: old.teamMemberId, role: old.role });
  await logActivity("NOTE", `${old.teamMember.name} removed from this event.`, { eventId }, actor.id);
}

export const TEAM_ROLES = teamRoles;

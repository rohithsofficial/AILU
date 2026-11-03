"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM, canEditClient, type Staff } from "@/lib/authz";
import * as clients from "@/server/clients";
import { z } from "zod";
import { logActivity } from "@/server/activity";
import { audit } from "@/lib/audit";
import { createTask } from "@/server/tasks";
import { indianPhoneSchema, normalizePhone } from "@/lib/validation";

function back(msg: string, clientId?: string): never {
  redirect(clientId ? `/admin/clients/${clientId}?msg=${encodeURIComponent(msg)}` : `/admin/clients?msg=${encodeURIComponent(msg)}`);
}
function realMessage(e: unknown): string {
  const digest = (e as { digest?: string })?.digest ?? "";
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  return String((e as Error)?.message ?? "Something went wrong.");
}

async function assertClientEditable(staff: Staff, clientId: string) {
  const client = await clients.getClient(clientId);
  if (!client) throw new Error("That client does not exist.");
  if (!canEditClient(staff, client)) throw new Error("This client is not assigned to you.");
  return client;
}

export async function createClientAction(fd: FormData) {
  let id = "";
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const client = await clients.createClient(staff, fd);
    id = client.id;
  } catch (e) {
    back(realMessage(e));
  }
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${id}?msg=${encodeURIComponent("Client created.")}`);
}

export async function updateClientAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    await assertClientEditable(staff, id);
    await clients.updateClient(staff, id, fd);
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back("Client updated.", id);
}

export async function archiveClientAction(fd: FormData) {
  const input = z.object({ id: z.string().min(1), archived: z.enum(["yes", "no"]) }).safeParse({ id: String(fd.get("id") ?? ""), archived: String(fd.get("archived") ?? "") });
  if (!input.success) back("That archive request was not valid.");
  const { id, archived } = input.data;
  try {
    const staff = await requireRole(["OWNER"]);
    await clients.setClientArchived(staff, id, archived === "yes");
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back(archived === "yes" ? "Client archived." : "Client restored.", id);
}

export async function addClientContactAction(fd: FormData) {
  const id = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    await assertClientEditable(staff, id);
    const db = (await import("@/lib/db")).getPrisma();
    const parsed = contactSchema.safeParse({ clientId: id, name: String(fd.get("name") ?? ""), role: String(fd.get("role") ?? ""), phone: String(fd.get("phone") ?? ""), email: String(fd.get("email") ?? "") });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the contact details.");
    await db.clientContact.create({
      data: {
        clientId: id,
        name: parsed.data.name,
        role: parsed.data.role || null,
        phone: parsed.data.phone ? normalizePhone(parsed.data.phone) : null,
        email: parsed.data.email || null,
      },
    });
    await (await import("@/lib/audit")).audit({ id: staff.id }, "client.contact_added", "Client", id);
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back("Contact added.", id);
}

const contactSchema = z.object({
  id: z.string().optional(), clientId: z.string().min(1),
  name: z.string().trim().min(2).max(100), role: z.string().trim().max(100),
  phone: z.union([z.literal(""), indianPhoneSchema]),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]),
});

export async function updateClientContactAction(fd: FormData) {
  const clientId = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertClientEditable(staff, clientId);
    const parsed = contactSchema.safeParse({ id: String(fd.get("id") ?? ""), clientId, name: String(fd.get("name") ?? ""), role: String(fd.get("role") ?? ""), phone: String(fd.get("phone") ?? ""), email: String(fd.get("email") ?? "") });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the contact details.");
    const db = (await import("@/lib/db")).getPrisma();
    const existing = await db.clientContact.findFirst({ where: { id: parsed.data.id, clientId } });
    if (!existing) throw new Error("That contact does not exist.");
    await db.clientContact.update({ where: { id: existing.id }, data: { name: parsed.data.name, role: parsed.data.role || null, phone: parsed.data.phone ? normalizePhone(parsed.data.phone) : null, email: parsed.data.email || null } });
    await audit(staff, "client.contact_updated", "Client", clientId, { fields: ["name", "role", "phone", "email"] });
  } catch (e) { back(realMessage(e), clientId); }
  revalidatePath(`/admin/clients/${clientId}`);
  back("Contact updated.", clientId);
}

export async function removeClientContactAction(fd: FormData) {
  const clientId = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertClientEditable(staff, clientId);
    const id = z.string().min(1).parse(String(fd.get("id") ?? ""));
    const db = (await import("@/lib/db")).getPrisma();
    const existing = await db.clientContact.findFirst({ where: { id, clientId } });
    if (!existing) throw new Error("That contact does not exist.");
    await db.clientContact.delete({ where: { id } });
    await audit(staff, "client.contact_removed", "Client", clientId);
  } catch (e) { back(realMessage(e), clientId); }
  revalidatePath(`/admin/clients/${clientId}`);
  back("Contact removed.", clientId);
}

export async function logClientActivityAction(fd: FormData) {
  const clientId = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    const parsed = z.object({
      clientId: z.string().min(1),
      kind: z.enum(["NOTE", "CALL", "WHATSAPP", "MEETING"]),
      body: z.string().trim().min(2, "Write a short note for the timeline.").max(2000),
    }).safeParse({ clientId, kind: String(fd.get("kind") ?? "NOTE"), body: String(fd.get("body") ?? "") });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the activity details.");
    await assertClientEditable(staff, clientId);
    await logActivity(parsed.data.kind, parsed.data.body, { clientId }, staff.id);
    await audit(staff, "client.activity_added", "Client", clientId, { kind: parsed.data.kind });
  } catch (e) {
    back(realMessage(e), clientId);
  }
  revalidatePath(`/admin/clients/${clientId}`);
  back("Timeline updated.", clientId);
}

export async function addClientTaskAction(fd: FormData) {
  const clientId = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    await assertClientEditable(staff, clientId);
    await createTask(staff, fd);
  } catch (e) {
    back(realMessage(e), clientId);
  }
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/tasks");
  back("Task added.", clientId);
}

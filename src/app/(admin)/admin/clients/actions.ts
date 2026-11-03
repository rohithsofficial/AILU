"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, canWriteCRM } from "@/lib/authz";
import * as clients from "@/server/clients";

function back(msg: string, clientId?: string): never {
  redirect(clientId ? `/admin/clients/${clientId}?msg=${encodeURIComponent(msg)}` : `/admin/clients?msg=${encodeURIComponent(msg)}`);
}
function realMessage(e: unknown): string {
  const digest = (e as { digest?: string })?.digest ?? "";
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  return String((e as Error)?.message ?? "Something went wrong.");
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
    await clients.updateClient(staff, id, fd);
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back("Client updated.", id);
}

export async function archiveClientAction(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    await clients.setClientArchived(staff, id, String(fd.get("archived") ?? "") === "yes");
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back(String(fd.get("archived") ?? "") === "yes" ? "Client archived." : "Client restored.", id);
}

export async function addClientContactAction(fd: FormData) {
  const id = String(fd.get("clientId") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER", "STAFF"]);
    if (!canWriteCRM(staff)) throw new Error("Accounts is read-only.");
    const db = (await import("@/lib/db")).getPrisma();
    const name = String(fd.get("name") ?? "").trim();
    if (name.length < 2) throw new Error("Enter the contact's name.");
    await db.clientContact.create({
      data: {
        clientId: id,
        name,
        role: String(fd.get("role") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        email: String(fd.get("email") ?? "").trim() || null,
      },
    });
    await (await import("@/lib/audit")).audit({ id: staff.id }, "client.contact_added", "Client", id);
  } catch (e) {
    back(realMessage(e), id);
  }
  revalidatePath(`/admin/clients/${id}`);
  back("Contact added.", id);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { permanentlyDeleteDream, updateDreamReview } from "@/server/dreams";

function messageFrom(error: unknown) {
  const text = String((error as Error)?.message ?? "");
  const known = [
    "That dream submission does not exist.",
    "That status change is not allowed.",
    "Add a reason for this decision.",
    "Type the dream reference ID exactly to confirm deletion.",
    "Only the owner can permanently delete a dream submission.",
  ];
  return known.includes(text) || text.startsWith("Expected ") ? text : "Could not save this private review. Check the fields and try again.";
}

export async function updateDreamReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER", "MANAGER"]);
    await updateDreamReview(staff, id, formData);
    revalidatePath("/admin/dreams");
    revalidatePath(`/admin/dreams/${id}`);
    revalidatePath("/admin");
    revalidatePath("/admin/attention");
  } catch (error) {
    const digest = (error as { digest?: string })?.digest ?? "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    redirect(`/admin/dreams/${encodeURIComponent(id)}?msg=${encodeURIComponent(messageFrom(error))}`);
  }
  redirect(`/admin/dreams/${encodeURIComponent(id)}?msg=${encodeURIComponent("Private review saved.")}`);
}

export async function deleteDreamAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    const staff = await requireRole(["OWNER"]);
    await permanentlyDeleteDream(staff, formData);
    revalidatePath("/admin/dreams");
    revalidatePath("/admin");
    revalidatePath("/admin/attention");
  } catch (error) {
    const digest = (error as { digest?: string })?.digest ?? "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    redirect(`/admin/dreams/${encodeURIComponent(id)}?msg=${encodeURIComponent(messageFrom(error))}`);
  }
  redirect(`/admin/dreams?msg=${encodeURIComponent("Dream submission permanently deleted.")}`);
}

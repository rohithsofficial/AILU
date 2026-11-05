"use server";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireStaff } from "@/lib/authz";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";

const backWith = (msg: string) => redirect(`/admin/settings/password?msg=${encodeURIComponent(msg)}`);

export async function changeOwnPasswordAction(formData: FormData) {
  const staff = await requireStaff();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next !== String(formData.get("confirm") ?? "")) backWith("The two new passwords do not match.");
  const problem = passwordProblem(next);
  if (problem) backWith(problem);
  const db = getPrisma();
  const record = await db.staffUser.findUnique({ where: { id: staff.id } });
  if (!record?.passwordHash || !(await verifyPassword(current, record.passwordHash))) backWith("Your current password is not right.");
  await db.staffUser.update({ where: { id: staff.id }, data: { passwordHash: await hashPassword(next), passwordChangedAt: new Date() } });
  await audit(staff, "staff.password_changed", "StaffUser", staff.email);
  redirect("/admin/login?changed=1");
}

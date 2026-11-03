import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";

// Every admin write must call audit(...) (CRM_CMS_PLAN.md section 2).
// Never log secrets or full payloads with personal data — pass only the field names that changed.
export async function audit(
  actor: { id?: string | null } | null,
  action: string,
  entity: string,
  entityId: string,
  diff?: Prisma.InputJsonValue,
) {
  await getPrisma().auditLog.create({
    data: { actorId: actor?.id ?? null, action, entity, entityId, diff },
  });
}

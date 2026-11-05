-- Add owner assignment so STAFF access can be limited to assigned client records.
ALTER TABLE "Client" ADD COLUMN "ownerId" TEXT;
CREATE INDEX "Client_ownerId_idx" ON "Client"("ownerId");

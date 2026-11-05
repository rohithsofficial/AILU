-- Staff email and password login. Additive: existing rows keep working with NULL values.
ALTER TABLE "StaffUser" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "StaffUser" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

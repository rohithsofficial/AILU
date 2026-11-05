-- Link activity history to inbox enquiries while preserving all existing entries.
ALTER TABLE "Activity" ADD COLUMN "enquiryId" TEXT;
CREATE INDEX "Activity_enquiryId_at_idx" ON "Activity"("enquiryId", "at");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_enquiryId_fkey"
  FOREIGN KEY ("enquiryId") REFERENCES "EventEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

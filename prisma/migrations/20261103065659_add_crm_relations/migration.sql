-- AddForeignKey
ALTER TABLE "EventEnquiry" ADD CONSTRAINT "EventEnquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "EventEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

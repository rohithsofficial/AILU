-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_PREPARED', 'AWAITING_CUSTOMER', 'PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EventEnquiry" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "eventDate" TEXT,
    "location" TEXT NOT NULL,
    "guests" INTEGER,
    "budget" TEXT,
    "services" TEXT,
    "details" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventEnquiry_seq_key" ON "EventEnquiry"("seq");

-- CreateIndex
CREATE INDEX "EventEnquiry_phone_idx" ON "EventEnquiry"("phone");

-- CreateIndex
CREATE INDEX "EventEnquiry_status_createdAt_idx" ON "EventEnquiry"("status", "createdAt");

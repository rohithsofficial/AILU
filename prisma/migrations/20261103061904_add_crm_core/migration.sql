-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "ClientSource" AS ENUM ('WEBSITE', 'PARTNER', 'REFERRAL', 'WALK_IN', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('LEAD', 'QUOTED', 'NEGOTIATION', 'CONFIRMED', 'PLANNING', 'EXECUTED', 'COMPLETED', 'CANCELLED', 'LOST');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT,
ADD COLUMN     "internalNotes" TEXT;

-- AlterTable
ALTER TABLE "EventEnquiry" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "spam" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SalesPartner" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT,
ADD COLUMN     "internalNotes" TEXT;

-- CreateTable
CREATE TABLE "Client" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'INDIVIDUAL',
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "source" "ClientSource" NOT NULL DEFAULT 'WEBSITE',
    "referredBySpId" TEXT,
    "tags" TEXT[],
    "notes" TEXT,
    "consentToContact" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "enquiryId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tradition" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'LEAD',
    "lostReason" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "venueName" TEXT,
    "venueCity" TEXT,
    "venueAddress" TEXT,
    "guestCount" INTEGER,
    "budgetPaise" INTEGER,
    "requirements" TEXT,
    "internalNotes" TEXT,
    "ownerId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3),
    "discountPaise" INTEGER NOT NULL DEFAULT 0,
    "taxPaise" INTEGER NOT NULL DEFAULT 0,
    "totalPaise" INTEGER NOT NULL DEFAULT 0,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPricePaise" INTEGER NOT NULL,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assigneeId" TEXT,
    "clientId" TEXT,
    "eventId" TEXT,
    "enquiryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "byId" TEXT,
    "clientId" TEXT,
    "eventId" TEXT,
    "vendorId" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_seq_key" ON "Client"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Client_city_idx" ON "Client"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Event_seq_key" ON "Event"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "Event_enquiryId_key" ON "Event"("enquiryId");

-- CreateIndex
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate");

-- CreateIndex
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_eventId_version_key" ON "Quotation"("eventId", "version");

-- CreateIndex
CREATE INDEX "Task_assigneeId_doneAt_dueAt_idx" ON "Task"("assigneeId", "doneAt", "dueAt");

-- CreateIndex
CREATE INDEX "Activity_clientId_at_idx" ON "Activity"("clientId", "at");

-- CreateIndex
CREATE INDEX "Activity_eventId_at_idx" ON "Activity"("eventId", "at");

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

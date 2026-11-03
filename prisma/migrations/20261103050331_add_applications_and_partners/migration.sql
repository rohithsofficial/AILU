-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'CONTACTED', 'SELECTED', 'NOT_SELECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "EventEnquiry" ADD COLUMN     "referredBySpId" TEXT;

-- CreateTable
CREATE TABLE "Application" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT,
    "portfolioUrl" TEXT,
    "availability" TEXT,
    "eventCategories" TEXT,
    "beginner" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPartner" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "clientCategories" TEXT,
    "experience" TEXT,
    "referralSource" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPartner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_seq_key" ON "Application"("seq");

-- CreateIndex
CREATE INDEX "Application_phone_idx" ON "Application"("phone");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SalesPartner_seq_key" ON "SalesPartner"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "SalesPartner_phone_key" ON "SalesPartner"("phone");

-- CreateIndex
CREATE INDEX "SalesPartner_status_createdAt_idx" ON "SalesPartner"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EventEnquiry_referredBySpId_idx" ON "EventEnquiry"("referredBySpId");

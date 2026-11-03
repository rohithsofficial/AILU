-- CreateEnum
CREATE TYPE "EventAssignmentStatus" AS ENUM ('ASSIGNED', 'CONFIRMED', 'DONE', 'DROPPED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'PAID', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "teamMemberId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "assignmentId" TEXT;

-- CreateTable
CREATE TABLE "TeamMember" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "roles" TEXT[],
    "applicationId" TEXT,
    "feeNotes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAssignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "feePaise" INTEGER,
    "status" "EventAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "basis" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "proposedById" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "paidOn" TIMESTAMP(3),
    "paymentMode" "PaymentMode",
    "paymentReference" TEXT,
    "paidById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_seq_key" ON "TeamMember"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_phone_key" ON "TeamMember"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_applicationId_key" ON "TeamMember"("applicationId");

-- CreateIndex
CREATE INDEX "TeamMember_name_idx" ON "TeamMember"("name");

-- CreateIndex
CREATE INDEX "TeamMember_city_active_idx" ON "TeamMember"("city", "active");

-- CreateIndex
CREATE INDEX "EventAssignment_teamMemberId_status_idx" ON "EventAssignment"("teamMemberId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventAssignment_eventId_teamMemberId_role_key" ON "EventAssignment"("eventId", "teamMemberId", "role");

-- CreateIndex
CREATE INDEX "Commission_status_createdAt_idx" ON "Commission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Commission_partnerId_status_idx" ON "Commission"("partnerId", "status");

-- CreateIndex
CREATE INDEX "Commission_eventId_idx" ON "Commission"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_partnerId_eventId_version_key" ON "Commission"("partnerId", "eventId", "version");

-- CreateIndex
CREATE INDEX "Payment_assignmentId_idx" ON "Payment"("assignmentId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "EventAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "SalesPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

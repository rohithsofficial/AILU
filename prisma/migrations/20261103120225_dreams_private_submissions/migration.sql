-- CreateEnum
CREATE TYPE "DreamCategory" AS ENUM ('MY_DREAM', 'FAMILY', 'CELEBRATION', 'HELPING_SOMEONE', 'COMMUNITY', 'CREATIVE_IDEA', 'SOMETHING_SPECIAL');

-- CreateEnum
CREATE TYPE "DreamStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'SHORTLISTED', 'IN_PROGRESS', 'FULFILLED', 'NOT_POSSIBLE', 'CLOSED');

-- CreateTable
CREATE TABLE "Dream" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "displayName" VARCHAR(80),
    "city" VARCHAR(80) NOT NULL,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "guardianName" VARCHAR(80),
    "guardianPhone" VARCHAR(16),
    "guardianConsent" BOOLEAN NOT NULL DEFAULT false,
    "contactPhone" VARCHAR(16),
    "contactEmail" VARCHAR(120),
    "category" "DreamCategory" NOT NULL,
    "dream" VARCHAR(2000) NOT NULL,
    "whyItMatters" VARCHAR(1500),
    "helpNeeded" VARCHAR(1500),
    "consentToContact" BOOLEAN NOT NULL DEFAULT false,
    "status" "DreamStatus" NOT NULL DEFAULT 'SUBMITTED',
    "internalNotes" VARCHAR(4000),
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "statusReason" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamStatusChange" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "fromStatus" "DreamStatus",
    "toStatus" "DreamStatus" NOT NULL,
    "reason" VARCHAR(1000),
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DreamStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dream_seq_key" ON "Dream"("seq");

-- CreateIndex
CREATE INDEX "Dream_status_createdAt_idx" ON "Dream"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Dream_contactPhone_createdAt_idx" ON "Dream"("contactPhone", "createdAt");

-- CreateIndex
CREATE INDEX "Dream_contactEmail_createdAt_idx" ON "Dream"("contactEmail", "createdAt");

-- CreateIndex
CREATE INDEX "Dream_guardianPhone_createdAt_idx" ON "Dream"("guardianPhone", "createdAt");

-- CreateIndex
CREATE INDEX "DreamStatusChange_dreamId_createdAt_idx" ON "DreamStatusChange"("dreamId", "createdAt");

-- AddForeignKey
ALTER TABLE "DreamStatusChange" ADD CONSTRAINT "DreamStatusChange_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

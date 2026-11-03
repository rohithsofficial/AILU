CREATE TYPE "VendorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DO_NOT_USE');
CREATE TYPE "VendorBookingStatus" AS ENUM ('ENQUIRED', 'QUOTED', 'CONFIRMED', 'DONE', 'CANCELLED');
CREATE TYPE "PaymentDirection" AS ENUM ('IN', 'OUT');
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER');

CREATE TABLE "Vendor" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "rateNotes" TEXT,
    "rating" INTEGER,
    "status" "VendorStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] NOT NULL,
    "notes" TEXT,
    "upiId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VendorBooking" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "agreedAmountPaise" INTEGER,
    "status" "VendorBookingStatus" NOT NULL DEFAULT 'ENQUIRED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VendorBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "purpose" TEXT NOT NULL,
    "eventId" TEXT,
    "vendorBookingId" TEXT,
    "amountPaise" INTEGER NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "reference" TEXT,
    "paidOn" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "vendorBookingId" TEXT,
    "category" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "spentOn" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Vendor_seq_key" ON "Vendor"("seq");
CREATE INDEX "Vendor_name_idx" ON "Vendor"("name");
CREATE INDEX "Vendor_category_status_idx" ON "Vendor"("category", "status");
CREATE INDEX "Vendor_city_idx" ON "Vendor"("city");
CREATE INDEX "VendorBooking_eventId_status_idx" ON "VendorBooking"("eventId", "status");
CREATE INDEX "VendorBooking_vendorId_idx" ON "VendorBooking"("vendorId");
CREATE INDEX "Payment_eventId_direction_paidOn_idx" ON "Payment"("eventId", "direction", "paidOn");
CREATE INDEX "Payment_vendorBookingId_idx" ON "Payment"("vendorBookingId");
CREATE INDEX "Expense_eventId_spentOn_idx" ON "Expense"("eventId", "spentOn");

ALTER TABLE "VendorBooking" ADD CONSTRAINT "VendorBooking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VendorBooking" ADD CONSTRAINT "VendorBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_vendorBookingId_fkey" FOREIGN KEY ("vendorBookingId") REFERENCES "VendorBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorBookingId_fkey" FOREIGN KEY ("vendorBookingId") REFERENCES "VendorBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CmsSection" (
    "key" TEXT NOT NULL,
    "draft" JSONB,
    "published" JSONB,
    "previous" JSONB,
    "updatedById" TEXT,
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSection_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "CmsMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsMedia_url_key" ON "CmsMedia"("url");

-- CreateIndex
CREATE INDEX "CmsMedia_createdAt_idx" ON "CmsMedia"("createdAt");

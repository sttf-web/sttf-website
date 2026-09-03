-- CreateTable
CREATE TABLE "Bylaw" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bylaw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BylawDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "bylawId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BylawDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bylaw_slug_key" ON "Bylaw"("slug");

-- CreateIndex
CREATE INDEX "Bylaw_published_idx" ON "Bylaw"("published");

-- CreateIndex
CREATE INDEX "Bylaw_order_idx" ON "Bylaw"("order");

-- CreateIndex
CREATE INDEX "BylawDocument_bylawId_idx" ON "BylawDocument"("bylawId");

-- CreateIndex
CREATE INDEX "BylawDocument_bylawId_order_idx" ON "BylawDocument"("bylawId", "order");

-- CreateIndex
CREATE INDEX "BylawDocument_published_idx" ON "BylawDocument"("published");

-- AddForeignKey
ALTER TABLE "BylawDocument" ADD CONSTRAINT "BylawDocument_bylawId_fkey" FOREIGN KEY ("bylawId") REFERENCES "Bylaw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

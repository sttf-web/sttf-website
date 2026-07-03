-- CreateTable
CREATE TABLE "OrgMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgMember_featured_idx" ON "OrgMember"("featured");

-- CreateIndex
CREATE INDEX "OrgMember_published_idx" ON "OrgMember"("published");

-- CreateIndex
CREATE INDEX "OrgMember_order_idx" ON "OrgMember"("order");

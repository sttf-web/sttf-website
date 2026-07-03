-- CreateTable
CREATE TABLE "NationalTeam" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coach" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NationalTeamPlayer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalTeamPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NationalTeam_category_key" ON "NationalTeam"("category");

-- CreateIndex
CREATE INDEX "NationalTeam_category_idx" ON "NationalTeam"("category");

-- CreateIndex
CREATE INDEX "NationalTeam_published_idx" ON "NationalTeam"("published");

-- CreateIndex
CREATE INDEX "NationalTeam_order_idx" ON "NationalTeam"("order");

-- CreateIndex
CREATE INDEX "NationalTeamPlayer_teamId_idx" ON "NationalTeamPlayer"("teamId");

-- CreateIndex
CREATE INDEX "NationalTeamPlayer_order_idx" ON "NationalTeamPlayer"("order");

-- AddForeignKey
ALTER TABLE "NationalTeamPlayer" ADD CONSTRAINT "NationalTeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "NationalTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

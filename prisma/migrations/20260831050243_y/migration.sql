-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '2025/2026';

-- CreateIndex
CREATE INDEX "Match_season_idx" ON "Match"("season");

-- CreateIndex
CREATE INDEX "Match_season_date_idx" ON "Match"("season", "date");

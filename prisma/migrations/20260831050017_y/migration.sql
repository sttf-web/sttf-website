/*
  Warnings:

  - A unique constraint covering the columns `[clubId,season]` on the table `LeagueStanding` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LeagueStanding_clubId_key";

-- AlterTable
ALTER TABLE "LeagueStanding" ADD COLUMN     "season" TEXT NOT NULL DEFAULT '2025/2026';

-- CreateIndex
CREATE INDEX "LeagueStanding_season_idx" ON "LeagueStanding"("season");

-- CreateIndex
CREATE INDEX "LeagueStanding_season_points_idx" ON "LeagueStanding"("season", "points");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueStanding_clubId_season_key" ON "LeagueStanding"("clubId", "season");

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseScore(score: string) {
  const [scoredRaw, concededRaw] = score.split(":");

  const scored = Number(scoredRaw);
  const conceded = Number(concededRaw);

  const safeScored = Number.isNaN(scored) ? 0 : scored;
  const safeConceded = Number.isNaN(conceded) ? 0 : conceded;

  return {
    scored: safeScored,
    conceded: safeConceded,
    difference: safeScored - safeConceded,
  };
}

function getSeasonStartYear(season: string) {
  const [startYear] = season.split("/");

  const parsedYear = Number.parseInt(startYear, 10);

  return Number.isNaN(parsedYear)
    ? 0
    : parsedYear;
}

function compareSeasons(
  a: string,
  b: string
) {
  return (
    getSeasonStartYear(b) -
    getSeasonStartYear(a)
  );
}

type RankedStanding = {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string | null;
  clubLocation: string | null;

  season: string;

  matchesPlayed: number;
  won: number;
  lost: number;

  score: string;
  scoreDifference: number;

  points: number;
  form: string[];

  position?: number;
};

function sortStandings(
  a: RankedStanding,
  b: RankedStanding
) {
  /*
   * Ranking order:
   *
   * 1. Points
   * 2. Wins
   * 3. Score difference
   */

  if (b.points !== a.points) {
    return b.points - a.points;
  }

  if (b.won !== a.won) {
    return b.won - a.won;
  }

  return (
    b.scoreDifference -
    a.scoreDifference
  );
}

export async function GET() {
  try {
    /*
     * Get every league standing.
     *
     * Different seasons are allowed because the unique
     * constraint is now:
     *
     * clubId + season
     */
    const standings =
      await prisma.leagueStanding.findMany({
        include: {
          club: {
            select: {
              id: true,
              clubName: true,
              location: true,
              logo: true,
            },
          },
        },
      });

    /*
     * Normalize Prisma data into the frontend format.
     */
    const normalizedStandings: RankedStanding[] =
      standings.map((standing) => {
        const scoreData = parseScore(
          standing.score
        );

        return {
          id: standing.id,

          clubId: standing.clubId,
          clubName:
            standing.club.clubName,
          clubLogo:
            standing.club.logo,
          clubLocation:
            standing.club.location,

          season:
            standing.season,

          matchesPlayed:
            standing.matchesPlayed,

          won: standing.won,
          lost: standing.lost,

          score: standing.score,

          scoreDifference:
            scoreData.difference,

          points: standing.points,

          form: standing.form,
        };
      });

    /*
     * Get all available seasons.
     *
     * Newest season appears first.
     *
     * Example:
     *
     * [
     *   "2026/2027",
     *   "2025/2026",
     *   "2024/2025"
     * ]
     */
    const seasons = Array.from(
      new Set(
        normalizedStandings.map(
          (standing) =>
            standing.season
        )
      )
    ).sort(compareSeasons);

    /*
     * Rank every season independently.
     *
     * This prevents 2025/2026 points from affecting
     * the 2026/2027 positions.
     */
    const rankedStandings =
      seasons.flatMap((season) => {
        const seasonStandings =
          normalizedStandings
            .filter(
              (standing) =>
                standing.season === season
            )
            .sort(sortStandings)
            .map(
              (
                standing,
                index
              ) => ({
                ...standing,
                position:
                  index + 1,
              })
            );

        return seasonStandings;
      });

    return NextResponse.json({
      success: true,

      seasons,

      standings:
        rankedStandings,
    });
  } catch (error: unknown) {
    console.error(
      "GET_LEAGUE_STANDINGS_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch league standings",
      },
      {
        status: 500,
      }
    );
  }
}
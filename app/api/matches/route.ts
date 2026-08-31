import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeSeasonFromUrl(value: string) {
  return value.replace("-", "/");
}

function getSeasonStartYear(season: string) {
  const [startYear] = season.split("/");

  const parsed = Number.parseInt(startYear, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareSeasons(a: string, b: string) {
  return getSeasonStartYear(b) - getSeasonStartYear(a);
}

export async function GET(request: NextRequest) {
  try {
    /*
     * Get every season that currently exists in the match table.
     */
    const seasonRecords = await prisma.match.findMany({
      distinct: ["season"],
      select: {
        season: true,
      },
    });

    /*
     * Newest season first.
     *
     * Example:
     *
     * [
     *   "2026/2027",
     *   "2025/2026"
     * ]
     */
    const seasons = seasonRecords
      .map((record) => record.season)
      .filter(
        (season): season is string =>
          typeof season === "string" &&
          season.trim().length > 0
      )
      .sort(compareSeasons);

    /*
     * URL example:
     *
     * /api/matches?season=2025-2026
     *
     * Stored database value:
     *
     * 2025/2026
     */
    const seasonParam =
      request.nextUrl.searchParams.get("season");

    const requestedSeason = seasonParam
      ? normalizeSeasonFromUrl(seasonParam)
      : null;

    /*
     * If no season was supplied, use the newest season.
     */
    const selectedSeason =
      requestedSeason ?? seasons[0] ?? null;

    /*
     * No seasons exist yet.
     */
    if (!selectedSeason) {
      return NextResponse.json({
        success: true,
        seasons: [],
        selectedSeason: null,
        matches: [],
      });
    }

    const matches = await prisma.match.findMany({
      where: {
        season: selectedSeason,
      },

      orderBy: {
        date: "desc",
      },

      select: {
        id: true,

        season: true,

        clubOneScore: true,
        clubTwoScore: true,

        date: true,
        status: true,

        clubOne: {
          select: {
            id: true,
            clubName: true,
            logo: true,
          },
        },

        clubTwo: {
          select: {
            id: true,
            clubName: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,

      seasons,

      selectedSeason,

      matches,
    });
  } catch (error: unknown) {
    console.error(
      "GET_MATCHES_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch matches",
      },
      {
        status: 500,
      }
    );
  }
}
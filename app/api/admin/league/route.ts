import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_SEASON = "2025/2026";

function normalizeSeason(value: string | null) {
  if (!value) {
    return null;
  }

  const season = value.trim();

  if (!/^\d{4}\/\d{4}$/.test(season)) {
    return null;
  }

  return season;
}

function getSeasonStartYear(season: string) {
  const match = season.match(/^(\d{4})\/\d{4}$/);

  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

function sortSeasons(seasons: string[]) {
  return [...new Set(seasons)].sort((a, b) => {
    const difference =
      getSeasonStartYear(b) -
      getSeasonStartYear(a);

    if (difference !== 0) {
      return difference;
    }

    return b.localeCompare(a);
  });
}

function getScoreDifference(score: string) {
  const [forValue, againstValue] = score
    .split(":")
    .map((value) => Number(value.trim()));

  if (
    Number.isNaN(forValue) ||
    Number.isNaN(againstValue)
  ) {
    return 0;
  }

  return forValue - againstValue;
}

export async function GET(
  request: NextRequest
) {
  try {
    const requestedSeason =
      normalizeSeason(
        request.nextUrl.searchParams.get(
          "season"
        )
      );

    /*
     * Fetch seasons from BOTH standings
     * and matches.
     *
     * This means a season can appear in
     * the selector even before standings
     * have been manually configured for it.
     */
    const [
      standingSeasonRows,
      matchSeasonRows,
    ] = await Promise.all([
      prisma.leagueStanding.findMany({
        distinct: ["season"],
        select: {
          season: true,
        },
      }),

      prisma.match.findMany({
        distinct: ["season"],
        select: {
          season: true,
        },
      }),
    ]);

    const availableSeasons =
      sortSeasons([
        ...standingSeasonRows.map(
          (item) => item.season
        ),
        ...matchSeasonRows.map(
          (item) => item.season
        ),
        ...(requestedSeason
          ? [requestedSeason]
          : []),
      ]);

    const selectedSeason =
      requestedSeason ||
      availableSeasons[0] ||
      DEFAULT_SEASON;

    if (
      !availableSeasons.includes(
        selectedSeason
      )
    ) {
      availableSeasons.push(
        selectedSeason
      );
    }

    const rows =
      await prisma.leagueStanding.findMany(
        {
          where: {
            season:
              selectedSeason,
          },

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
        }
      );

    /*
     * Ranking:
     *
     * 1. Points
     * 2. Score difference
     * 3. Wins
     * 4. Club name
     */
    const sortedRows = [...rows].sort(
      (a, b) => {
        if (
          b.points !== a.points
        ) {
          return (
            b.points - a.points
          );
        }

        const scoreDifferenceA =
          getScoreDifference(
            a.score
          );

        const scoreDifferenceB =
          getScoreDifference(
            b.score
          );

        if (
          scoreDifferenceB !==
          scoreDifferenceA
        ) {
          return (
            scoreDifferenceB -
            scoreDifferenceA
          );
        }

        if (
          b.won !== a.won
        ) {
          return b.won - a.won;
        }

        return a.club.clubName.localeCompare(
          b.club.clubName
        );
      }
    );

    const standings =
      sortedRows.map(
        (standing, index) => ({
          id:
            standing.id,

          clubId:
            standing.clubId,

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

          won:
            standing.won,

          lost:
            standing.lost,

          score:
            standing.score,

          scoreDifference:
            getScoreDifference(
              standing.score
            ),

          points:
            standing.points,

          form:
            standing.form,

          position:
            index + 1,
        })
      );

    return NextResponse.json({
      success: true,

      season:
        selectedSeason,

      availableSeasons:
        sortSeasons(
          availableSeasons
        ),

      standings,
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
          error instanceof Error
            ? error.message
            : "Failed to fetch league standings",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  MatchStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const WIN_POINTS = 3;
const DEFAULT_SEASON = "2025/2026";

function parsePositiveInt(
  value: FormDataEntryValue | null,
  fallback = 0
) {
  if (!value) {
    return fallback;
  }

  const numberValue = Number(
    value.toString()
  );

  if (
    Number.isNaN(numberValue) ||
    numberValue < 0
  ) {
    return fallback;
  }

  return numberValue;
}

function parseScore(score: string) {
  const [forScore, againstScore] =
    score
      .split(":")
      .map((value) => {
        const parsed = Number(value);

        return Number.isNaN(parsed)
          ? 0
          : parsed;
      });

  return {
    forScore: forScore || 0,
    againstScore:
      againstScore || 0,
  };
}

function buildScore(
  existingScore: string,
  addedFor: number,
  addedAgainst: number
) {
  const current =
    parseScore(existingScore);

  return `${
    current.forScore + addedFor
  }:${
    current.againstScore +
    addedAgainst
  }`;
}

function buildForm(
  existingForm: string[],
  result: "W" | "L"
) {
  return [
    result,
    ...existingForm,
  ].slice(0, 5);
}

function normalizeSeason(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return DEFAULT_SEASON;
  }

  /*
   * Accept both:
   *
   * 2025/2026
   * 2025-2026
   */
  return value
    .trim()
    .replace("-", "/");
}

function isValidSeason(
  season: string
) {
  return /^\d{4}\/\d{4}$/.test(
    season
  );
}

/* ═════════════════════════════════════
   UPDATE LEAGUE STANDING
═════════════════════════════════════ */

async function updateLeagueStanding({
  tx,
  clubId,
  season,
  scored,
  conceded,
  didWin,
}: {
  tx: Prisma.TransactionClient;
  clubId: string;
  season: string;
  scored: number;
  conceded: number;
  didWin: boolean;
}) {
  /*
   * A standing is now uniquely identified by:
   *
   * clubId + season
   *
   * NOT clubId alone.
   */
  const existingStanding =
    await tx.leagueStanding.findUnique({
      where: {
        clubId_season: {
          clubId,
          season,
        },
      },
    });

  /*
   * First match for this club in this season.
   */
  if (!existingStanding) {
    return tx.leagueStanding.create({
      data: {
        clubId,
        season,

        matchesPlayed: 1,

        won: didWin ? 1 : 0,

        lost: didWin ? 0 : 1,

        score: `${scored}:${conceded}`,

        points: didWin
          ? WIN_POINTS
          : 0,

        form: [
          didWin ? "W" : "L",
        ],
      },
    });
  }

  /*
   * Existing standing for this club
   * in this specific season.
   */
  return tx.leagueStanding.update({
    where: {
      clubId_season: {
        clubId,
        season,
      },
    },

    data: {
      matchesPlayed:
        existingStanding.matchesPlayed +
        1,

      won:
        existingStanding.won +
        (didWin ? 1 : 0),

      lost:
        existingStanding.lost +
        (didWin ? 0 : 1),

      score: buildScore(
        existingStanding.score,
        scored,
        conceded
      ),

      points:
        existingStanding.points +
        (didWin ? WIN_POINTS : 0),

      form: buildForm(
        existingStanding.form,
        didWin ? "W" : "L"
      ),
    },
  });
}

/* ═════════════════════════════════════
   CREATE MATCH
═════════════════════════════════════ */

export async function POST(
  req: Request
) {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await req.formData();

    const clubOneId =
      formData
        .get("clubOneId")
        ?.toString()
        .trim();

    const clubTwoId =
      formData
        .get("clubTwoId")
        ?.toString()
        .trim();

    const clubOneScore =
      parsePositiveInt(
        formData.get(
          "clubOneScore"
        )
      );

    const clubTwoScore =
      parsePositiveInt(
        formData.get(
          "clubTwoScore"
        )
      );

    const dateValue =
      formData
        .get("date")
        ?.toString();

    const statusValue =
      formData
        .get("status")
        ?.toString() as MatchStatus;

    /*
     * New season field.
     *
     * Falls back to 2025/2026 so your
     * existing admin form does not break
     * if it isn't sending season yet.
     */
    const season =
      normalizeSeason(
        formData.get("season")
      );

    if (
      !clubOneId ||
      !clubTwoId
    ) {
      return NextResponse.json(
        {
          error:
            "Both clubs are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      clubOneId === clubTwoId
    ) {
      return NextResponse.json(
        {
          error:
            "A club cannot play against itself",
        },
        {
          status: 400,
        }
      );
    }

    if (!dateValue) {
      return NextResponse.json(
        {
          error:
            "Match date is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Object.values(
        MatchStatus
      ).includes(statusValue)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid match status is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidSeason(season)) {
      return NextResponse.json(
        {
          error:
            "Season must use the format YYYY/YYYY, for example 2025/2026.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      statusValue ===
        "FINISHED" &&
      clubOneScore ===
        clubTwoScore
    ) {
      return NextResponse.json(
        {
          error:
            "Finished matches cannot have equal scores because draws are not supported in the league table",
        },
        {
          status: 400,
        }
      );
    }

    const matchDate =
      new Date(dateValue);

    if (
      Number.isNaN(
        matchDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid match date",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Make sure both clubs exist.
     */
    const clubs =
      await prisma.club.findMany({
        where: {
          id: {
            in: [
              clubOneId,
              clubTwoId,
            ],
          },
        },

        select: {
          id: true,
        },
      });

    if (clubs.length !== 2) {
      return NextResponse.json(
        {
          error:
            "One or both selected clubs do not exist",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Everything happens inside the same
     * database transaction.
     *
     * That means:
     *
     * - match creation
     * - club one standing
     * - club two standing
     *
     * either all succeed or all fail.
     */
    const result =
      await prisma.$transaction(
        async (tx) => {
          const match =
            await tx.match.create({
              data: {
                clubOneId,
                clubTwoId,

                clubOneScore,
                clubTwoScore,

                season,

                date: matchDate,
                status:
                  statusValue,
              },

              include: {
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

          /*
           * Only finished matches affect
           * the league table.
           */
          if (
            statusValue ===
            "FINISHED"
          ) {
            const clubOneWon =
              clubOneScore >
              clubTwoScore;

            const clubTwoWon =
              clubTwoScore >
              clubOneScore;

            await updateLeagueStanding({
              tx,

              clubId:
                clubOneId,

              season,

              scored:
                clubOneScore,

              conceded:
                clubTwoScore,

              didWin:
                clubOneWon,
            });

            await updateLeagueStanding({
              tx,

              clubId:
                clubTwoId,

              season,

              scored:
                clubTwoScore,

              conceded:
                clubOneScore,

              didWin:
                clubTwoWon,
            });
          }

          return match;
        }
      );

    return NextResponse.json(
      {
        success: true,
        match: {
          ...result,
          date:
            result.date.toISOString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "CREATE_MATCH_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create match",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   GET ADMIN MATCHES
═════════════════════════════════════ */

export async function GET() {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const matches =
      await prisma.match.findMany({
        orderBy: {
          date: "desc",
        },

        select: {
          id: true,

          clubOneId: true,
          clubTwoId: true,

          clubOneScore: true,
          clubTwoScore: true,

          /*
           * Return season to the
           * admin frontend.
           */
          season: true,

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

    const clubs =
      await prisma.club.findMany({
        orderBy: {
          clubName: "asc",
        },

        select: {
          id: true,
          clubName: true,
          logo: true,
        },
      });

    /*
     * Available seasons can also be used
     * by the admin UI.
     */
    const seasons =
      Array.from(
        new Set(
          matches.map(
            (match) =>
              match.season
          )
        )
      ).sort((a, b) => {
        const aYear =
          Number.parseInt(
            a.split("/")[0],
            10
          ) || 0;

        const bYear =
          Number.parseInt(
            b.split("/")[0],
            10
          ) || 0;

        return bYear - aYear;
      });

    return NextResponse.json({
      success: true,

      matches:
        matches.map(
          (match) => ({
            ...match,

            date:
              match.date.toISOString(),
          })
        ),

      clubs,

      seasons,
    });
  } catch (error: unknown) {
    console.error(
      "GET_MATCHES_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch matches.",
      },
      {
        status: 500,
      }
    );
  }
}
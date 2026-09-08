import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  MatchStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const WIN_POINTS = 3;

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function parseNonNegativeInteger(
  value: FormDataEntryValue | null
) {
  if (
    value === null ||
    value === undefined ||
    value.toString().trim() === ""
  ) {
    return null;
  }

  const numberValue = Number(
    value.toString()
  );

  if (
    Number.isNaN(numberValue) ||
    !Number.isInteger(numberValue) ||
    numberValue < 0
  ) {
    return null;
  }

  return numberValue;
}

function normalizeSeason(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value
    .trim()
    .replace("-", "/");
}

function isValidSeason(
  season: string
) {
  const match = season.match(
    /^(\d{4})\/(\d{4})$/
  );

  if (!match) {
    return false;
  }

  const startYear =
    Number(match[1]);

  const endYear =
    Number(match[2]);

  return (
    endYear ===
    startYear + 1
  );
}

function getSeasonStartYear(
  season: string
) {
  const match = season.match(
    /^(\d{4})\/\d{4}$/
  );

  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

function sortSeasons(
  seasons: string[]
) {
  return [
    ...new Set(seasons),
  ].sort(
    (a, b) => {
      const difference =
        getSeasonStartYear(b) -
        getSeasonStartYear(a);

      if (
        difference !== 0
      ) {
        return difference;
      }

      return b.localeCompare(a);
    }
  );
}

function parseScore(
  score: string
) {
  const [
    forScore,
    againstScore,
  ] = score
    .split(":")
    .map((value) => {
      const parsed =
        Number(value);

      return Number.isNaN(
        parsed
      )
        ? 0
        : parsed;
    });

  return {
    forScore:
      forScore || 0,

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
    parseScore(
      existingScore
    );

  return `${
    current.forScore +
    addedFor
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
  const existingStanding =
    await tx.leagueStanding.findUnique({
      where: {
        clubId_season: {
          clubId,
          season,
        },
      },
    });

  if (!existingStanding) {
    return tx.leagueStanding.create({
      data: {
        clubId,
        season,

        matchesPlayed: 1,

        won:
          didWin
            ? 1
            : 0,

        lost:
          didWin
            ? 0
            : 1,

        score:
          `${scored}:${conceded}`,

        points:
          didWin
            ? WIN_POINTS
            : 0,

        form: [
          didWin
            ? "W"
            : "L",
        ],
      },
    });
  }

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

      score:
        buildScore(
          existingStanding.score,
          scored,
          conceded
        ),

      points:
        existingStanding.points +
        (
          didWin
            ? WIN_POINTS
            : 0
        ),

      form:
        buildForm(
          existingStanding.form,
          didWin
            ? "W"
            : "L"
        ),
    },
  });
}

/* ═════════════════════════════════════
   CREATE MATCH
═════════════════════════════════════ */

export async function POST(
  request: Request
) {
  try {
    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await request.formData();

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
      parseNonNegativeInteger(
        formData.get(
          "clubOneScore"
        )
      );

    const clubTwoScore =
      parseNonNegativeInteger(
        formData.get(
          "clubTwoScore"
        )
      );

    const dateValue =
      formData
        .get("date")
        ?.toString()
        .trim();

    const statusValue =
      formData
        .get("status")
        ?.toString()
        .trim();

    const season =
      normalizeSeason(
        formData.get(
          "season"
        )
      );

    /* ═════════════════════════════════════
       VALIDATION
    ══════════════════════════════════════ */

    if (
      !clubOneId ||
      !clubTwoId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Both clubs are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      clubOneId ===
      clubTwoId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A club cannot play against itself.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      clubOneScore ===
      null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Club one score must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      clubTwoScore ===
      null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Club two score must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (!dateValue) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Match date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !statusValue ||
      !Object.values(
        MatchStatus
      ).includes(
        statusValue as MatchStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid match status is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!season) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Season is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidSeason(
        season
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Season must use the format 2026/2027.",
        },
        {
          status: 400,
        }
      );
    }

    const status =
      statusValue as MatchStatus;

    if (
      status ===
        MatchStatus.FINISHED &&
      clubOneScore ===
        clubTwoScore
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Finished matches cannot have equal scores because draws are not supported.",
        },
        {
          status: 400,
        }
      );
    }

    const matchDate =
      new Date(
        dateValue
      );

    if (
      Number.isNaN(
        matchDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid match date.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (
      clubs.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or both selected clubs do not exist.",
        },
        {
          status: 400,
        }
      );
    }

    /* ═════════════════════════════════════
       TRANSACTION
    ══════════════════════════════════════ */

    const createdMatch =
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

                date:
                  matchDate,

                status,
              },

              select: {
                id: true,

                clubOneId: true,
                clubTwoId: true,

                clubOneScore: true,
                clubTwoScore: true,

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

          /*
           * Only finished matches affect
           * this match's season table.
           */
          if (
            status ===
            MatchStatus.FINISHED
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
          ...createdMatch,

          date:
            createdMatch.date.toISOString(),
        },
      },
      {
        status: 201,
      }
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "CREATE_MATCH_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to create match.",
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

export async function GET(
  request: NextRequest
) {
  try {
    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const requestedSeason =
      request.nextUrl.searchParams.get(
        "season"
      );

    if (
      requestedSeason &&
      !isValidSeason(
        requestedSeason
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid season.",
        },
        {
          status: 400,
        }
      );
    }

    const metadataOnly =
      request.nextUrl.searchParams.get(
        "metadata"
      ) === "1";

    /*
     * Find seasons from both matches
     * and league standings.
     */
    const [
      matchSeasonRows,
      standingSeasonRows,
    ] =
      await Promise.all([
        prisma.match.findMany({
          distinct: [
            "season",
          ],

          select: {
            season: true,
          },
        }),

        prisma.leagueStanding.findMany({
          distinct: [
            "season",
          ],

          select: {
            season: true,
          },
        }),
      ]);

    const seasons =
      sortSeasons([
        ...matchSeasonRows.map(
          (item) =>
            item.season
        ),

        ...standingSeasonRows.map(
          (item) =>
            item.season
        ),
      ]);

    /*
     * Lightweight endpoint used by
     * CreateMatchForm to populate
     * existing season suggestions.
     */
    if (
      metadataOnly
    ) {
      return NextResponse.json({
        success: true,
        seasons,
      });
    }

    const matches =
      await prisma.match.findMany({
        where:
          requestedSeason
            ? {
                season:
                  requestedSeason,
              }
            : undefined,

        orderBy: [
          {
            date:
              "desc",
          },

          {
            createdAt:
              "desc",
          },
        ],

        select: {
          id: true,

          clubOneId: true,
          clubTwoId: true,

          clubOneScore: true,
          clubTwoScore: true,

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
          clubName:
            "asc",
        },

        select: {
          id: true,
          clubName: true,
          logo: true,
        },
      });

    return NextResponse.json({
      success: true,

      season:
        requestedSeason ||
        seasons[0] ||
        null,

      seasons,

      matches:
        matches.map(
          (match) => ({
            ...match,

            date:
              match.date.toISOString(),
          })
        ),

      clubs,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "GET_MATCHES_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch matches.",
      },
      {
        status: 500,
      }
    );
  }
}
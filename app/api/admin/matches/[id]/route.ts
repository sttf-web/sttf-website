import { headers } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  MatchStatus,
  Prisma,
} from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WIN_POINTS = 3;

type UpdateMatchBody = {
  clubOneId?: unknown;
  clubTwoId?: unknown;
  clubOneScore?: unknown;
  clubTwoScore?: unknown;
  season?: unknown;
  date?: unknown;
  status?: unknown;
};

type StandingTarget = {
  clubId: string;
  season: string;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function parseScore(
  value: unknown,
  fieldName: string
) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} must be a valid non-negative whole number.`
    );
  }

  return value;
}

function normalizeSeason(
  value: unknown
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
  const match =
    season.match(
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

function uniqueTargets(
  targets: StandingTarget[]
) {
  const map =
    new Map<
      string,
      StandingTarget
    >();

  for (
    const target of
    targets
  ) {
    const key =
      `${target.clubId}:${target.season}`;

    map.set(
      key,
      target
    );
  }

  return Array.from(
    map.values()
  );
}

/* ═════════════════════════════════════
   REBUILD ONE CLUB'S STANDING
═════════════════════════════════════ */

/**
 * Rebuilds one club's standing for one season
 * from the FINISHED match history.
 *
 * This is used after editing/deleting matches
 * because simply changing Match.season would
 * otherwise leave the old league table wrong.
 */
async function rebuildLeagueStanding({
  tx,
  clubId,
  season,
}: {
  tx: Prisma.TransactionClient;
  clubId: string;
  season: string;
}) {
  const matches =
    await tx.match.findMany({
      where: {
        season,

        status:
          MatchStatus.FINISHED,

        OR: [
          {
            clubOneId:
              clubId,
          },

          {
            clubTwoId:
              clubId,
          },
        ],
      },

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
        clubOneId: true,
        clubTwoId: true,

        clubOneScore: true,
        clubTwoScore: true,
      },
    });

  /*
   * No finished matches remain for this
   * club in this season.
   *
   * Remove the auto-created standing.
   */
  if (
    matches.length === 0
  ) {
    await tx.leagueStanding.deleteMany({
      where: {
        clubId,
        season,
      },
    });

    return;
  }

  let won = 0;
  let lost = 0;

  let scored = 0;
  let conceded = 0;

  const form:
    string[] = [];

  for (
    const match of
    matches
  ) {
    const isClubOne =
      match.clubOneId ===
      clubId;

    const clubScore =
      isClubOne
        ? match.clubOneScore
        : match.clubTwoScore;

    const opponentScore =
      isClubOne
        ? match.clubTwoScore
        : match.clubOneScore;

    scored +=
      clubScore;

    conceded +=
      opponentScore;

    if (
      clubScore >
      opponentScore
    ) {
      won += 1;

      if (
        form.length < 5
      ) {
        form.push(
          "W"
        );
      }
    } else if (
      clubScore <
      opponentScore
    ) {
      lost += 1;

      if (
        form.length < 5
      ) {
        form.push(
          "L"
        );
      }
    }
  }

  await tx.leagueStanding.upsert({
    where: {
      clubId_season: {
        clubId,
        season,
      },
    },

    create: {
      clubId,
      season,

      matchesPlayed:
        matches.length,

      won,
      lost,

      score:
        `${scored}:${conceded}`,

      points:
        won *
        WIN_POINTS,

      form,
    },

    update: {
      matchesPlayed:
        matches.length,

      won,
      lost,

      score:
        `${scored}:${conceded}`,

      points:
        won *
        WIN_POINTS,

      form,
    },
  });
}

/* ═════════════════════════════════════
   PATCH MATCH
═════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const {
      id,
    } =
      await context.params;

    const existingMatch =
      await prisma.match.findUnique({
        where: {
          id,
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
        },
      });

    if (
      !existingMatch
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Match not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      (await request.json()) as UpdateMatchBody;

    /* ═════════════════════════════════════
       CLUBS
    ══════════════════════════════════════ */

    if (
      typeof body.clubOneId !==
        "string" ||
      body.clubOneId
        .trim()
        .length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Club one is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.clubTwoId !==
        "string" ||
      body.clubTwoId
        .trim()
        .length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Club two is required.",
        },
        {
          status: 400,
        }
      );
    }

    const clubOneId =
      body.clubOneId.trim();

    const clubTwoId =
      body.clubTwoId.trim();

    if (
      clubOneId ===
      clubTwoId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The two clubs must be different.",
        },
        {
          status: 400,
        }
      );
    }

    /* ═════════════════════════════════════
       DATE
    ══════════════════════════════════════ */

    if (
      typeof body.date !==
        "string" ||
      body.date
        .trim()
        .length === 0
    ) {
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

    const parsedDate =
      new Date(
        body.date
      );

    if (
      Number.isNaN(
        parsedDate.getTime()
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

    /* ═════════════════════════════════════
       STATUS
    ══════════════════════════════════════ */

    if (
      typeof body.status !==
        "string" ||
      !Object.values(
        MatchStatus
      ).includes(
        body.status as MatchStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid match status.",
        },
        {
          status: 400,
        }
      );
    }

    const status =
      body.status as MatchStatus;

    /* ═════════════════════════════════════
       SEASON
    ══════════════════════════════════════ */

    const season =
      body.season ===
      undefined
        ? existingMatch.season
        : normalizeSeason(
            body.season
          );

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

    /* ═════════════════════════════════════
       SCORES
    ══════════════════════════════════════ */

    let clubOneScore:
      number;

    let clubTwoScore:
      number;

    try {
      clubOneScore =
        parseScore(
          body.clubOneScore,
          "Club one score"
        );

      clubTwoScore =
        parseScore(
          body.clubTwoScore,
          "Club two score"
        );
    } catch (
      error: unknown
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Invalid scores.",
        },
        {
          status: 400,
        }
      );
    }

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

    /* ═════════════════════════════════════
       VERIFY CLUBS
    ══════════════════════════════════════ */

    const clubCount =
      await prisma.club.count({
        where: {
          id: {
            in: [
              clubOneId,
              clubTwoId,
            ],
          },
        },
      });

    if (
      clubCount !== 2
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
       UPDATE + REBUILD STANDINGS
    ══════════════════════════════════════ */

    const updatedMatch =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.match.update({
              where: {
                id,
              },

              data: {
                clubOneId,
                clubTwoId,

                clubOneScore,
                clubTwoScore,

                season,

                date:
                  parsedDate,

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
           * If either the old match or
           * updated match is FINISHED,
           * its table contribution may
           * have changed.
           */
          if (
            existingMatch.status ===
              MatchStatus.FINISHED ||
            status ===
              MatchStatus.FINISHED
          ) {
            const targets =
              uniqueTargets([
                {
                  clubId:
                    existingMatch.clubOneId,

                  season:
                    existingMatch.season,
                },

                {
                  clubId:
                    existingMatch.clubTwoId,

                  season:
                    existingMatch.season,
                },

                {
                  clubId:
                    clubOneId,

                  season,
                },

                {
                  clubId:
                    clubTwoId,

                  season,
                },
              ]);

            for (
              const target of
              targets
            ) {
              await rebuildLeagueStanding({
                tx,

                clubId:
                  target.clubId,

                season:
                  target.season,
              });
            }
          }

          return updated;
        }
      );

    return NextResponse.json({
      success: true,

      match: {
        ...updatedMatch,

        date:
          updatedMatch.date.toISOString(),
      },
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "UPDATE_MATCH_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to update match.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   DELETE MATCH
═════════════════════════════════════ */

export async function DELETE(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const {
      id,
    } =
      await context.params;

    const existingMatch =
      await prisma.match.findUnique({
        where: {
          id,
        },

        select: {
          id: true,

          clubOneId: true,
          clubTwoId: true,

          season: true,
          status: true,
        },
      });

    if (
      !existingMatch
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Match not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.match.delete({
          where: {
            id,
          },
        });

        /*
         * If a finished match is deleted,
         * its contribution must disappear
         * from the correct season.
         */
        if (
          existingMatch.status ===
          MatchStatus.FINISHED
        ) {
          const targets =
            uniqueTargets([
              {
                clubId:
                  existingMatch.clubOneId,

                season:
                  existingMatch.season,
              },

              {
                clubId:
                  existingMatch.clubTwoId,

                season:
                  existingMatch.season,
              },
            ]);

          for (
            const target of
            targets
          ) {
            await rebuildLeagueStanding({
              tx,

              clubId:
                target.clubId,

              season:
                target.season,
            });
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "DELETE_MATCH_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to delete match.",
      },
      {
        status: 500,
      }
    );
  }
}
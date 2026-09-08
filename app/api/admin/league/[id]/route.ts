import {
  NextResponse,
} from "next/server";

import {
  headers,
} from "next/headers";

import {
  prisma,
} from "@/lib/prisma";

import {
  auth,
} from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseOptionalNumber(
  value: unknown
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const numberValue =
    Number(value);

  if (
    Number.isNaN(numberValue) ||
    !Number.isInteger(
      numberValue
    ) ||
    numberValue < 0
  ) {
    return null;
  }

  return numberValue;
}

function normalizeScore(
  value: unknown
) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const score =
    value.trim();

  if (
    !/^\d+\s*:\s*\d+$/.test(
      score
    )
  ) {
    return null;
  }

  return score.replace(
    /\s+/g,
    ""
  );
}

function normalizeForm(
  value: unknown
) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    !Array.isArray(value)
  ) {
    return null;
  }

  return value
    .map((item) =>
      item
        ?.toString()
        .toUpperCase()
    )
    .filter(
      (item) =>
        item === "W" ||
        item === "L"
    )
    .slice(0, 5);
}

function normalizeSeason(
  value: unknown
) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const season =
    value.trim();

  const match =
    season.match(
      /^(\d{4})\/(\d{4})$/
    );

  if (!match) {
    return null;
  }

  const startYear =
    Number(match[1]);

  const endYear =
    Number(match[2]);

  if (
    endYear !==
    startYear + 1
  ) {
    return null;
  }

  return season;
}

export async function PATCH(
  req: Request,
  context: RouteContext
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
    } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Standing ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    const matchesPlayed =
      parseOptionalNumber(
        body.matchesPlayed
      );

    const won =
      parseOptionalNumber(
        body.won
      );

    const lost =
      parseOptionalNumber(
        body.lost
      );

    const points =
      parseOptionalNumber(
        body.points
      );

    const score =
      normalizeScore(
        body.score
      );

    const form =
      normalizeForm(
        body.form
      );

    const season =
      normalizeSeason(
        body.season
      );

    if (
      matchesPlayed === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Matches played must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      won === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Wins must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      lost === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Losses must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      points === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Points must be a non-negative whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      score === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Score must be in the format 31:20",
        },
        {
          status: 400,
        }
      );
    }

    if (
      form === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Form must contain only W or L values.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      season === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Season must be in the format 2026/2027.",
        },
        {
          status: 400,
        }
      );
    }

    const existingStanding =
      await prisma.leagueStanding.findUnique(
        {
          where: {
            id,
          },

          select: {
            id: true,
            clubId: true,
            season: true,
          },
        }
      );

    if (
      !existingStanding
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "League standing not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Your schema has:
     *
     * @@unique([clubId, season])
     *
     * Therefore make sure moving this
     * standing to another season will
     * not create a duplicate.
     */
    if (
      season !== undefined &&
      season !==
        existingStanding.season
    ) {
      const conflictingStanding =
        await prisma.leagueStanding.findUnique(
          {
            where: {
              clubId_season: {
                clubId:
                  existingStanding.clubId,

                season,
              },
            },

            select: {
              id: true,
            },
          }
        );

      if (
        conflictingStanding &&
        conflictingStanding.id !==
          id
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This club already has a league standing for that season.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const updatedStanding =
      await prisma.leagueStanding.update(
        {
          where: {
            id,
          },

          data: {
            ...(season !==
            undefined
              ? {
                  season,
                }
              : {}),

            ...(matchesPlayed !==
            undefined
              ? {
                  matchesPlayed,
                }
              : {}),

            ...(won !== undefined
              ? {
                  won,
                }
              : {}),

            ...(lost !== undefined
              ? {
                  lost,
                }
              : {}),

            ...(points !==
            undefined
              ? {
                  points,
                }
              : {}),

            ...(score !==
            undefined
              ? {
                  score,
                }
              : {}),

            ...(form !==
            undefined
              ? {
                  form,
                }
              : {}),
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

    return NextResponse.json({
      success: true,
      standing:
        updatedStanding,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "UPDATE_LEAGUE_STANDING_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update league standing",
      },
      {
        status: 500,
      }
    );
  }
}
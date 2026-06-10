import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchStatus } from "@prisma/client";

const WIN_POINTS = 3;

function parsePositiveInt(value: FormDataEntryValue | null, fallback = 0) {
  if (!value) return fallback;

  const numberValue = Number(value.toString());

  if (Number.isNaN(numberValue) || numberValue < 0) {
    return fallback;
  }

  return numberValue;
}

function parseScore(score: string) {
  const [forScore, againstScore] = score.split(":").map((value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  });

  return {
    forScore: forScore || 0,
    againstScore: againstScore || 0,
  };
}

function buildScore(existingScore: string, addedFor: number, addedAgainst: number) {
  const current = parseScore(existingScore);

  return `${current.forScore + addedFor}:${current.againstScore + addedAgainst}`;
}

function buildForm(existingForm: string[], result: "W" | "L") {
  return [result, ...existingForm].slice(0, 5);
}

async function updateLeagueStanding({
  clubId,
  scored,
  conceded,
  didWin,
}: {
  clubId: string;
  scored: number;
  conceded: number;
  didWin: boolean;
}) {
  const existingStanding = await prisma.leagueStanding.findUnique({
    where: {
      clubId,
    },
  });

  if (!existingStanding) {
    return prisma.leagueStanding.create({
      data: {
        clubId,
        matchesPlayed: 1,
        won: didWin ? 1 : 0,
        lost: didWin ? 0 : 1,
        score: `${scored}:${conceded}`,
        points: didWin ? WIN_POINTS : 0,
        form: [didWin ? "W" : "L"],
      },
    });
  }

  return prisma.leagueStanding.update({
    where: {
      clubId,
    },
    data: {
      matchesPlayed: existingStanding.matchesPlayed + 1,
      won: existingStanding.won + (didWin ? 1 : 0),
      lost: existingStanding.lost + (didWin ? 0 : 1),
      score: buildScore(existingStanding.score, scored, conceded),
      points: existingStanding.points + (didWin ? WIN_POINTS : 0),
      form: buildForm(existingStanding.form, didWin ? "W" : "L"),
    },
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const clubOneId = formData.get("clubOneId")?.toString().trim();
    const clubTwoId = formData.get("clubTwoId")?.toString().trim();

    const clubOneScore = parsePositiveInt(formData.get("clubOneScore"));
    const clubTwoScore = parsePositiveInt(formData.get("clubTwoScore"));

    const dateValue = formData.get("date")?.toString();
    const statusValue = formData.get("status")?.toString() as MatchStatus;

    if (!clubOneId || !clubTwoId) {
      return NextResponse.json(
        { error: "Both clubs are required" },
        { status: 400 }
      );
    }

    if (clubOneId === clubTwoId) {
      return NextResponse.json(
        { error: "A club cannot play against itself" },
        { status: 400 }
      );
    }

    if (!dateValue) {
      return NextResponse.json(
        { error: "Match date is required" },
        { status: 400 }
      );
    }

    if (!Object.values(MatchStatus).includes(statusValue)) {
      return NextResponse.json(
        { error: "Valid match status is required" },
        { status: 400 }
      );
    }

    if (statusValue === "FINISHED" && clubOneScore === clubTwoScore) {
      return NextResponse.json(
        { error: "Finished matches cannot have equal scores because draws are not supported in the league table" },
        { status: 400 }
      );
    }

    const matchDate = new Date(dateValue);

    if (Number.isNaN(matchDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid match date" },
        { status: 400 }
      );
    }

    const clubs = await prisma.club.findMany({
      where: {
        id: {
          in: [clubOneId, clubTwoId],
        },
      },
      select: {
        id: true,
      },
    });

    if (clubs.length !== 2) {
      return NextResponse.json(
        { error: "One or both selected clubs do not exist" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async () => {
      const match = await prisma.match.create({
        data: {
          clubOneId,
          clubTwoId,
          clubOneScore,
          clubTwoScore,
          date: matchDate,
          status: statusValue,
        },
        include: {
          clubOne: {
            select: {
              id: true,
              clubName: true,
            },
          },
          clubTwo: {
            select: {
              id: true,
              clubName: true,
            },
          },
        },
      });

      if (statusValue === "FINISHED") {
        const clubOneWon = clubOneScore > clubTwoScore;
        const clubTwoWon = clubTwoScore > clubOneScore;

        await updateLeagueStanding({
          clubId: clubOneId,
          scored: clubOneScore,
          conceded: clubTwoScore,
          didWin: clubOneWon,
        });

        await updateLeagueStanding({
          clubId: clubTwoId,
          scored: clubTwoScore,
          conceded: clubOneScore,
          didWin: clubTwoWon,
        });
      }

      return match;
    });

    return NextResponse.json(
      {
        success: true,
        match: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_MATCH_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
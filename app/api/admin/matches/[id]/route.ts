import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MATCH_STATUS_VALUES = [
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "POSTPONED",
  "CANCELLED",
] as const;

type MatchStatusValue = (typeof MATCH_STATUS_VALUES)[number];

type UpdateMatchBody = {
  clubOneId?: unknown;
  clubTwoId?: unknown;
  clubOneScore?: unknown;
  clubTwoScore?: unknown;
  date?: unknown;
  status?: unknown;
};

function isMatchStatus(value: string): value is MatchStatusValue {
  return MATCH_STATUS_VALUES.includes(value as MatchStatusValue);
}

function parseScore(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a valid positive number.`);
  }

  return value;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingMatch = await prisma.match.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingMatch) {
      return NextResponse.json({ error: "Match not found." }, { status: 404 });
    }

    const body = (await request.json()) as UpdateMatchBody;

    if (typeof body.clubOneId !== "string" || body.clubOneId.trim() === "") {
      return NextResponse.json(
        { error: "Club one is required." },
        { status: 400 }
      );
    }

    if (typeof body.clubTwoId !== "string" || body.clubTwoId.trim() === "") {
      return NextResponse.json(
        { error: "Club two is required." },
        { status: 400 }
      );
    }

    if (body.clubOneId === body.clubTwoId) {
      return NextResponse.json(
        { error: "The two clubs must be different." },
        { status: 400 }
      );
    }

    if (typeof body.date !== "string" || body.date.trim() === "") {
      return NextResponse.json(
        { error: "Match date is required." },
        { status: 400 }
      );
    }

    if (typeof body.status !== "string" || !isMatchStatus(body.status)) {
      return NextResponse.json(
        { error: "Invalid match status." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(body.date);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid match date." },
        { status: 400 }
      );
    }

    const clubOneScore = parseScore(body.clubOneScore, "Club one score");
    const clubTwoScore = parseScore(body.clubTwoScore, "Club two score");

    const clubCount = await prisma.club.count({
      where: {
        id: {
          in: [body.clubOneId, body.clubTwoId],
        },
      },
    });

    if (clubCount !== 2) {
      return NextResponse.json(
        { error: "One or both selected clubs do not exist." },
        { status: 400 }
      );
    }

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: {
        clubOneId: body.clubOneId,
        clubTwoId: body.clubTwoId,
        clubOneScore,
        clubTwoScore,
        date: parsedDate,
        status: body.status,
      },
      select: {
        id: true,
        clubOneId: true,
        clubTwoId: true,
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
      match: {
        ...updatedMatch,
        date: updatedMatch.date.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("UPDATE_MATCH_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update match.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingMatch = await prisma.match.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingMatch) {
      return NextResponse.json({ error: "Match not found." }, { status: 404 });
    }

    await prisma.match.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("DELETE_MATCH_ERROR", error);

    return NextResponse.json(
      { error: "Failed to delete match." },
      { status: 500 }
    );
  }
}
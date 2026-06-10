import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) return undefined;

  return numberValue;
}

function normalizeScore(value: unknown) {
  if (typeof value !== "string") return undefined;

  const score = value.trim();

  if (!/^\d+\s*:\s*\d+$/.test(score)) {
    return null;
  }

  return score.replace(/\s+/g, "");
}

function normalizeForm(value: unknown) {
  if (!Array.isArray(value)) return undefined;

  const safeForm = value
    .map((item) => item?.toString().toUpperCase())
    .filter((item) => item === "W" || item === "L")
    .slice(0, 5);

  return safeForm;
}

export async function PATCH(req: Request, context: RouteContext) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Standing ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const matchesPlayed = parseOptionalNumber(body.matchesPlayed);
    const won = parseOptionalNumber(body.won);
    const lost = parseOptionalNumber(body.lost);
    const points = parseOptionalNumber(body.points);
    const score = normalizeScore(body.score);
    const form = normalizeForm(body.form);

    if (score === null) {
      return NextResponse.json(
        { error: "Score must be in the format 31:20" },
        { status: 400 }
      );
    }

    const existingStanding = await prisma.leagueStanding.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingStanding) {
      return NextResponse.json(
        { error: "League standing not found" },
        { status: 404 }
      );
    }

    const updatedStanding = await prisma.leagueStanding.update({
      where: {
        id,
      },
      data: {
        ...(matchesPlayed !== undefined ? { matchesPlayed } : {}),
        ...(won !== undefined ? { won } : {}),
        ...(lost !== undefined ? { lost } : {}),
        ...(points !== undefined ? { points } : {}),
        ...(score !== undefined ? { score } : {}),
        ...(form !== undefined ? { form } : {}),
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
    });

    return NextResponse.json({
      success: true,
      standing: updatedStanding,
    });
  } catch (error) {
    console.error("UPDATE_LEAGUE_STANDING_ERROR", error);

    return NextResponse.json(
      { error: "Failed to update league standing" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const teams = await prisma.nationalTeam.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          order: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        id: true,
        category: true,
        title: true,
        coach: true,
        description: true,
        players: {
          orderBy: [
            {
              order: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
          select: {
            id: true,
            name: true,
            number: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error: unknown) {
    console.error("GET_TEAMS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch teams." },
      { status: 500 }
    );
  }
}
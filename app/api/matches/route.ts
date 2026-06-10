import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
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
      matches,
    });
  } catch (error) {
    console.error("GET_MATCHES_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
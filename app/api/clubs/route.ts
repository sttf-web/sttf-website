import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: {
        clubName: "asc",
      },
      select: {
        id: true,
        clubName: true,
        location: true,
        logo: true,
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      clubs,
    });
  } catch (error) {
    console.error("GET_PUBLIC_CLUBS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}
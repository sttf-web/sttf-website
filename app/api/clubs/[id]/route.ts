import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        clubName: true,
        location: true,
        coach: true,
        manager: true,
        phoneNumber: true,
        logo: true,
        createdAt: true,
        updatedAt: true,

        players: {
          orderBy: [
            {
              ranking: "asc",
            },
            {
              name: "asc",
            },
          ],
          select: {
            id: true,
            name: true,
            age: true,
            picture: true,
            country: true,
            ranking: true,
            number: true,
            division: true,
          },
        },

        homeMatches: {
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
        },

        awayMatches: {
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
        },

        leagueStanding: {
          select: {
            matchesPlayed: true,
            won: true,
            lost: true,
            score: true,
            points: true,
            form: true,
          },
        },

        _count: {
          select: {
            players: true,
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    const matches = [...club.homeMatches, ...club.awayMatches].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      club: {
        id: club.id,
        clubName: club.clubName,
        location: club.location,
        coach: club.coach,
        manager: club.manager,
        phoneNumber: club.phoneNumber,
        logo: club.logo,
        players: club.players,
        matches,
        leagueStanding: club.leagueStanding,
        playersCount: club._count.players,
        matchesCount: club._count.homeMatches + club._count.awayMatches,
      },
    });
  } catch (error) {
    console.error("GET_CLUB_DETAILS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch club details" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseScore(score: string) {
  const [scoredRaw, concededRaw] = score.split(":");

  const scored = Number(scoredRaw);
  const conceded = Number(concededRaw);

  return {
    scored: Number.isNaN(scored) ? 0 : scored,
    conceded: Number.isNaN(conceded) ? 0 : conceded,
    difference:
      (Number.isNaN(scored) ? 0 : scored) -
      (Number.isNaN(conceded) ? 0 : conceded),
  };
}

export async function GET() {
  try {
    const standings = await prisma.leagueStanding.findMany({
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

    const sortedStandings = standings
      .map((standing) => {
        const scoreData = parseScore(standing.score);

        return {
          id: standing.id,
          clubId: standing.clubId,
          clubName: standing.club.clubName,
          clubLogo: standing.club.logo,
          clubLocation: standing.club.location,
          matchesPlayed: standing.matchesPlayed,
          won: standing.won,
          lost: standing.lost,
          score: standing.score,
          scoreDifference: scoreData.difference,
          points: standing.points,
          form: standing.form,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.won !== a.won) return b.won - a.won;
        return b.scoreDifference - a.scoreDifference;
      })
      .map((standing, index) => ({
        ...standing,
        position: index + 1,
      }));

    return NextResponse.json({
      success: true,
      standings: sortedStandings,
    });
  } catch (error) {
    console.error("GET_LEAGUE_STANDINGS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch league standings" },
      { status: 500 }
    );
  }
}
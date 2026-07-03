import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
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
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      partners,
    });
  } catch (error: unknown) {
    console.error("GET_PARTNERS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch partners." },
      { status: 500 }
    );
  }
}
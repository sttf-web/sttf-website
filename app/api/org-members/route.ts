import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.orgMember.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          featured: "desc",
        },
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
        role: true,
        image: true,
        featured: true,
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error: unknown) {
    console.error("GET_ORG_MEMBERS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch org members." },
      { status: 500 }
    );
  }
}
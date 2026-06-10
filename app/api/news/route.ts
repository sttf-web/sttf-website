import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: {
        published: true,
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        text: true,
        picture: true,
        date: true,
        tag: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("GET_PUBLIC_NEWS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
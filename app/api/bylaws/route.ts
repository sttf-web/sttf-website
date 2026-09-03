import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bylaws = await prisma.bylaw.findMany({
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
        title: true,
        slug: true,
        description: true,
        order: true,
        documents: {
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
            fileUrl: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      bylaws,
    });
  } catch (error) {
    console.error("GET_BYLAWS_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to load bylaws",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const selectedSlug =
      request.nextUrl.searchParams.get("category");

    /*
     * If a category is passed:
     *
     * /api/committees?category=appeals
     *
     * return only that committee.
     */
    if (selectedSlug) {
      const committee = await prisma.committee.findFirst({
        where: {
          slug: selectedSlug,
          published: true,
        },

        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          order: true,

          members: {
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
              title: true,
              image: true,
              order: true,
            },
          },
        },
      });

      if (!committee) {
        return NextResponse.json(
          {
            success: false,
            error: "Committee not found.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        success: true,
        committee,
      });
    }

    /*
     * Otherwise return all committees.
     *
     * The frontend uses this to build the top navigation
     * and switch between categories without another page.
     */
    const committees = await prisma.committee.findMany({
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
        slug: true,
        name: true,
        description: true,
        order: true,

        members: {
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
            title: true,
            image: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      committees,
    });
  } catch (error: unknown) {
    console.error("GET_COMMITTEES_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch committees.",
      },
      {
        status: 500,
      }
    );
  }
}
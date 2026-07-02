import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LatestNewsArticle = {
  id: string;
  tag: string;
  title: string;
  image: string;
  date: string;
  href: string;
};

type SelectedNewsArticle = {
  id: string;
  title: string;
  slug: string;
  picture: string | null;
  date: Date;
  tag: string;
  createdAt: Date;
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await prisma.news.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        picture: true,
        date: true,
        tag: true,
        createdAt: true,
      },
    });

    const latestArticles: LatestNewsArticle[] = articles.map(
      (article: SelectedNewsArticle) => ({
        id: article.id,
        tag: article.tag,
        title: article.title,
        image: article.picture ?? "/homePage/news-1.png",
        date: article.date.toISOString(),
        href: `/news/${article.slug}`,
      })
    );

    return NextResponse.json({ articles: latestArticles });
  } catch (error: unknown) {
    console.error("Failed to fetch latest news:", error);

    return NextResponse.json(
      { message: "Failed to fetch latest news." },
      { status: 500 }
    );
  }
}
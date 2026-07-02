import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NewsTag } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NEWS_IMAGES_BUCKET = process.env.SUPABASE_CLUB_LOGOS_BUCKET || "images";

function createSlug(value: string) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || `news-${randomUUID()}`;

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingNews = await prisma.news.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingNews) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString().trim();
    const text = formData.get("text")?.toString().trim();
    const tag = formData.get("tag")?.toString().trim();
    const dateValue = formData.get("date")?.toString();
    const publishedValue = formData.get("published")?.toString();
    const pictureFile = formData.get("picture");

    if (!title) {
      return NextResponse.json(
        { error: "News title is required" },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "News text is required" },
        { status: 400 }
      );
    }

    if (!tag || !Object.values(NewsTag).includes(tag as NewsTag)) {
      return NextResponse.json(
        { error: "Valid news tag is required" },
        { status: 400 }
      );
    }

    let date = new Date();

    if (dateValue) {
      const parsedDate = new Date(dateValue);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid news date" },
          { status: 400 }
        );
      }

      date = parsedDate;
    }

    const published = publishedValue === "false" ? false : true;

    let picturePath: string | null = null;

    if (pictureFile instanceof File && pictureFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(pictureFile.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, or WEBP images are allowed" },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;

      if (pictureFile.size > maxSize) {
        return NextResponse.json(
          { error: "News image must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const extension =
        pictureFile.name.split(".").pop()?.toLowerCase() || "png";

      const fileName = `${randomUUID()}.${extension}`;
      const filePath = `news/${fileName}`;

      const arrayBuffer = await pictureFile.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(NEWS_IMAGES_BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: pictureFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("SUPABASE_NEWS_UPLOAD_ERROR", uploadError);

        return NextResponse.json(
          {
            error: "Failed to upload news image",
            details: uploadError.message,
          },
          { status: 500 }
        );
      }

      const { data } = supabase.storage
        .from(NEWS_IMAGES_BUCKET)
        .getPublicUrl(uploadData.path);

      picturePath = data.publicUrl;
    }

    const slug = await createUniqueSlug(title);

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        text,
        picture: picturePath,
        date,
        tag: tag as NewsTag,
        published,
      },
    });

    return NextResponse.json(
      {
        success: true,
        news,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_NEWS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");

    const articles = await prisma.news.findMany({
      where: publishedParam === "true" ? { published: true } : undefined,
      orderBy: [
        {
          date: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        text: true,
        tag: true,
        date: true,
        picture: true,
        published: true,
        slug: true,
      },
    });

    return NextResponse.json({
      articles: articles.map((article) => ({
        ...article,
        date: article.date.toISOString(),
      })),
    });
  } catch (error: unknown) {
    console.error("Failed to fetch admin news:", error);

    return NextResponse.json(
      { error: "Failed to fetch admin news." },
      { status: 500 }
    );
  }
}
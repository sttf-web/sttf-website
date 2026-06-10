import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NewsTag } from "@prisma/client";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || randomUUID();

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

    if (!existingNews) return slug;

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString().trim();
    const text = formData.get("text")?.toString().trim();
    const tag = formData.get("tag")?.toString().trim();
    const dateValue = formData.get("date")?.toString();
    const publishedValue = formData.get("published")?.toString();

    const pictureFile = formData.get("picture") as File | null;

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

    if (pictureFile && pictureFile.size > 0) {
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

      const bytes = await pictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension =
        pictureFile.name.split(".").pop()?.toLowerCase() || "png";

      const fileName = `${randomUUID()}.${extension}`;

      const uploadDir = path.join(process.cwd(), "public", "images", "news");

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      picturePath = `/images/news/${fileName}`;
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
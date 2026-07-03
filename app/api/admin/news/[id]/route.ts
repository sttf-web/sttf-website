import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NEWS_TAG_VALUES = [
  "GENERAL",
  "PARTNERSHIPS",
  "TRAINING",
  "TECH",
  "EVENT",
  "FEDERATION",
  "TOURNAMENT",
  "LEAGUE",
  "CLUB",
  "PLAYER",
  "MEDIA",
] as const;

type NewsTag = (typeof NEWS_TAG_VALUES)[number];

type UpdateNewsData = {
  title: string;
  text: string;
  tag: NewsTag;
  published: boolean;
  date?: Date;
  picture?: string;
};

function isNewsTag(value: string): value is NewsTag {
  return NEWS_TAG_VALUES.includes(value as NewsTag);
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function saveNewsImage(file: File) {
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }

  if (file.size > maxSize) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const extension = getImageExtension(file);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadDirectory = join(process.cwd(), "public", "uploads", "news");
  const filePath = join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/news/${fileName}`;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existingArticle = await prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const titleValue = formData.get("title");
    const textValue = formData.get("text");
    const tagValue = formData.get("tag");
    const dateValue = formData.get("date");
    const publishedValue = formData.get("published");
    const pictureValue = formData.get("picture");

    if (typeof titleValue !== "string" || titleValue.trim().length === 0) {
      return NextResponse.json(
        { error: "News title is required." },
        { status: 400 }
      );
    }

    if (typeof textValue !== "string" || textValue.trim().length === 0) {
      return NextResponse.json(
        { error: "News text is required." },
        { status: 400 }
      );
    }

    if (typeof tagValue !== "string" || !isNewsTag(tagValue)) {
      return NextResponse.json(
        { error: "Invalid news tag." },
        { status: 400 }
      );
    }

    const updateData: UpdateNewsData = {
      title: titleValue.trim(),
      text: textValue.trim(),
      tag: tagValue,
      published: publishedValue === "true",
    };

    if (typeof dateValue === "string" && dateValue.trim().length > 0) {
      const parsedDate = new Date(dateValue);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid news date." },
          { status: 400 }
        );
      }

      updateData.date = parsedDate;
    }

    if (pictureValue instanceof File && pictureValue.size > 0) {
      updateData.picture = await saveNewsImage(pictureValue);
    }

    const updatedArticle = await prisma.news.update({
      where: { id },
      data: updateData,
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
      article: {
        ...updatedArticle,
        date: updatedArticle.date.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to update news article:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update news article.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existingArticle = await prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "News article not found." },
        { status: 404 }
      );
    }

    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("Failed to delete news article:", error);

    return NextResponse.json(
      { error: "Failed to delete news article." },
      { status: 500 }
    );
  }
}
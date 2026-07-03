import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getPublishedValue(formData: FormData) {
  const value = formData.get("published");
  return value === "true";
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function savePartnerImage(file: File) {
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
  const uploadDirectory = join(process.cwd(), "public", "uploads", "partners");
  const filePath = join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/partners/${fileName}`;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const partners = await prisma.partner.findMany({
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
        published: true,
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      partners,
    });
  } catch (error: unknown) {
    console.error("GET_ADMIN_PARTNERS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch partners." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = getRequiredString(formData, "name");
    const imageValue = formData.get("image");

    if (!(imageValue instanceof File) || imageValue.size === 0) {
      return NextResponse.json(
        { error: "Partner image is required." },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        image: await savePartnerImage(imageValue),
        published: getPublishedValue(formData),
        order: getOptionalNumber(formData.get("order")),
      },
      select: {
        id: true,
        name: true,
        image: true,
        published: true,
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      partner,
    });
  } catch (error: unknown) {
    console.error("CREATE_PARTNER_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create partner.",
      },
      { status: 500 }
    );
  }
}
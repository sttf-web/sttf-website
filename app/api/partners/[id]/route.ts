import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PartnerUpdateData = {
  name: string;
  published: boolean;
  order: number;
  image?: string;
};

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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingPartner = await prisma.partner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner not found." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const imageValue = formData.get("image");

    const updateData: PartnerUpdateData = {
      name: getRequiredString(formData, "name"),
      published: getPublishedValue(formData),
      order: getOptionalNumber(formData.get("order")),
    };

    if (imageValue instanceof File && imageValue.size > 0) {
      updateData.image = await savePartnerImage(imageValue);
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: updateData,
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
    console.error("UPDATE_PARTNER_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update partner.",
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingPartner = await prisma.partner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { error: "Partner not found." },
        { status: 404 }
      );
    }

    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("DELETE_PARTNER_ERROR", error);

    return NextResponse.json(
      { error: "Failed to delete partner." },
      { status: 500 }
    );
  }
}
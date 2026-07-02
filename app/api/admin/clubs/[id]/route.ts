import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ClubUpdateData = {
  clubName: string;
  location: string | null;
  coach: string | null;
  manager: string | null;
  phoneNumber: string | null;
  logo?: string;
};

function getOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function saveClubLogo(file: File) {
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
  const uploadDirectory = join(process.cwd(), "public", "uploads", "clubs");
  const filePath = join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/clubs/${fileName}`;
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

    const existingClub = await prisma.club.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingClub) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    const formData = await request.formData();

    const clubNameValue = formData.get("clubName");
    const locationValue = formData.get("location");
    const coachValue = formData.get("coach");
    const managerValue = formData.get("manager");
    const phoneNumberValue = formData.get("phoneNumber");
    const logoValue = formData.get("logo");

    if (
      typeof clubNameValue !== "string" ||
      clubNameValue.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Club name is required." },
        { status: 400 }
      );
    }

    const updateData: ClubUpdateData = {
      clubName: clubNameValue.trim(),
      location: getOptionalString(locationValue),
      coach: getOptionalString(coachValue),
      manager: getOptionalString(managerValue),
      phoneNumber: getOptionalString(phoneNumberValue),
    };

    if (logoValue instanceof File && logoValue.size > 0) {
      updateData.logo = await saveClubLogo(logoValue);
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        clubName: true,
        location: true,
        coach: true,
        manager: true,
        phoneNumber: true,
        logo: true,
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      club: updatedClub,
    });
  } catch (error: unknown) {
    console.error("UPDATE_CLUB_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update club.",
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

    const existingClub = await prisma.club.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingClub) {
      return NextResponse.json({ error: "Club not found." }, { status: 404 });
    }

    await prisma.club.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("DELETE_CLUB_ERROR", error);

    return NextResponse.json(
      { error: "Failed to delete club." },
      { status: 500 }
    );
  }
}
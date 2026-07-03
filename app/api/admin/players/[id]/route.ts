import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PLAYER_DIVISION_VALUES = ["MEN", "YOUTH", "WOMEN", "PARALYMPIC"] as const;

type PlayerDivisionValue = (typeof PLAYER_DIVISION_VALUES)[number];

type PlayerUpdateData = {
  name: string;
  age: number | null;
  picture?: string;
  country: string | null;
  ranking: number | null;
  number: number | null;
  division: PlayerDivisionValue;
  clubId: string | null;
};

function isPlayerDivision(value: string): value is PlayerDivisionValue {
  return PLAYER_DIVISION_VALUES.includes(value as PlayerDivisionValue);
}

function getOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getOptionalNumber(value: FormDataEntryValue | null, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new Error(`${fieldName} must be a valid positive number.`);
  }

  return parsedValue;
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function savePlayerPicture(file: File) {
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
  const uploadDirectory = join(process.cwd(), "public", "uploads", "players");
  const filePath = join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/players/${fileName}`;
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

    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const formData = await request.formData();

    const nameValue = formData.get("name");
    const ageValue = formData.get("age");
    const countryValue = formData.get("country");
    const rankingValue = formData.get("ranking");
    const numberValue = formData.get("number");
    const divisionValue = formData.get("division");
    const clubIdValue = formData.get("clubId");
    const pictureValue = formData.get("picture");

    if (typeof nameValue !== "string" || nameValue.trim().length === 0) {
      return NextResponse.json(
        { error: "Player name is required." },
        { status: 400 }
      );
    }

    if (typeof divisionValue !== "string" || !isPlayerDivision(divisionValue)) {
      return NextResponse.json(
        { error: "Invalid player division." },
        { status: 400 }
      );
    }

    const clubId = getOptionalString(clubIdValue);

    if (clubId) {
      const existingClub = await prisma.club.findUnique({
        where: { id: clubId },
        select: { id: true },
      });

      if (!existingClub) {
        return NextResponse.json(
          { error: "Selected club does not exist." },
          { status: 400 }
        );
      }
    }

    const updateData: PlayerUpdateData = {
      name: nameValue.trim(),
      age: getOptionalNumber(ageValue, "Age"),
      country: getOptionalString(countryValue),
      ranking: getOptionalNumber(rankingValue, "Ranking"),
      number: getOptionalNumber(numberValue, "Player number"),
      division: divisionValue,
      clubId,
    };

    if (pictureValue instanceof File && pictureValue.size > 0) {
      updateData.picture = await savePlayerPicture(pictureValue);
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        age: true,
        picture: true,
        country: true,
        ranking: true,
        number: true,
        division: true,
        clubId: true,
        club: {
          select: {
            id: true,
            clubName: true,
            logo: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
    });
  } catch (error: unknown) {
    console.error("UPDATE_PLAYER_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update player.",
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

    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    await prisma.player.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("DELETE_PLAYER_ERROR", error);

    return NextResponse.json(
      { error: "Failed to delete player." },
      { status: 500 }
    );
  }
}
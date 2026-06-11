import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PlayerDivision } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAYER_IMAGES_BUCKET =
  process.env.SUPABASE_PLAYER_IMAGES_BUCKET || "player-images";

function toOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;

  const stringValue = value.toString().trim();

  if (!stringValue) return null;

  const numberValue = Number(stringValue);

  return Number.isNaN(numberValue) ? null : numberValue;
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

    const clubId = formData.get("clubId")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    const country = formData.get("country")?.toString().trim() || null;
    const division = formData.get("division")?.toString().trim();

    const age = toOptionalNumber(formData.get("age"));
    const ranking = toOptionalNumber(formData.get("ranking"));
    const number = toOptionalNumber(formData.get("number"));

    const pictureFile = formData.get("picture") as File | null;

    if (!clubId) {
      return NextResponse.json(
        { error: "Club is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    if (
      !division ||
      !Object.values(PlayerDivision).includes(division as PlayerDivision)
    ) {
      return NextResponse.json(
        { error: "Valid player division is required" },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: {
        id: clubId,
      },
      select: {
        id: true,
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Selected club does not exist" },
        { status: 404 }
      );
    }

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
          { error: "Player image must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const extension =
        pictureFile.name.split(".").pop()?.toLowerCase() || "png";

      const fileName = `${randomUUID()}.${extension}`;
      const filePath = `players/${fileName}`;

      const bytes = await pictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from(PLAYER_IMAGES_BUCKET)
        .upload(filePath, buffer, {
          contentType: pictureFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("SUPABASE_PLAYER_UPLOAD_ERROR", uploadError);

        return NextResponse.json(
          { error: "Failed to upload player image" },
          { status: 500 }
        );
      }

      const { data } = supabase.storage
        .from(PLAYER_IMAGES_BUCKET)
        .getPublicUrl(filePath);

      picturePath = data.publicUrl;
    }

    const player = await prisma.player.create({
      data: {
        name,
        age,
        country,
        ranking,
        number,
        division: division as PlayerDivision,
        picture: picturePath,
        clubId,
      },
      include: {
        club: {
          select: {
            id: true,
            clubName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        player,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_PLAYER_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
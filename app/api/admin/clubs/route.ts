import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
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

    const clubs = await prisma.club.findMany({
      orderBy: {
        clubName: "asc",
      },
      select: {
        id: true,
        clubName: true,
        location: true,
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
      clubs,
    });
  } catch (error) {
    console.error("GET_CLUBS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

/**
 * Keep your existing POST create-club function below.
 */
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

    const clubName = formData.get("clubName")?.toString().trim();
    const location = formData.get("location")?.toString().trim() || null;
    const coach = formData.get("coach")?.toString().trim() || null;
    const manager = formData.get("manager")?.toString().trim() || null;
    const phoneNumber = formData.get("phoneNumber")?.toString().trim() || null;
    const logoFile = formData.get("logo") as File | null;

    if (!clubName) {
      return NextResponse.json(
        { error: "Club name is required" },
        { status: 400 }
      );
    }

    let logoPath: string | null = null;

    if (logoFile && logoFile.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];

      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, WEBP, or SVG images are allowed" },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;

      if (logoFile.size > maxSize) {
        return NextResponse.json(
          { error: "Logo must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = logoFile.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `${randomUUID()}.${extension}`;

      const uploadDir = path.join(process.cwd(), "public", "club", "logo");

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      logoPath = `/club/logo/${fileName}`;
    }

    const club = await prisma.club.create({
      data: {
        clubName,
        location,
        coach,
        manager,
        phoneNumber,
        logo: logoPath,
      },
    });

    return NextResponse.json(
      {
        success: true,
        club,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_CLUB_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    );
  }
}
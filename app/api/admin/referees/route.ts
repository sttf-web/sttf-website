import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const name = formData.get("name")?.toString().trim();
    const pictureFile = formData.get("picture") as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "Referee name is required" },
        { status: 400 }
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
          { error: "Referee image must be smaller than 5MB" },
          { status: 400 }
        );
      }

      const bytes = await pictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension =
        pictureFile.name.split(".").pop()?.toLowerCase() || "png";

      const fileName = `${randomUUID()}.${extension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "images",
        "referees"
      );

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      picturePath = `/images/referees/${fileName}`;
    }

    const referee = await prisma.referee.create({
      data: {
        name,
        picture: picturePath,
      },
    });

    return NextResponse.json(
      {
        success: true,
        referee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_REFEREE_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create referee" },
      { status: 500 }
    );
  }
}
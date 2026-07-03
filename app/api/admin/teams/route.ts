import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TeamPlayerInput = {
  name: string;
  number: string;
  image: string;
};

type ParsedTeamPayload = {
  category: string;
  title: string;
  coach: string;
  description: string;
  published: boolean;
  players: TeamPlayerInput[];
};

function getRequiredFormString(formData: FormData, key: string) {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function saveTeamPlayerImage(file: File) {
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
  const uploadDirectory = join(process.cwd(), "public", "uploads", "teams");
  const filePath = join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/teams/${fileName}`;
}

function parsePlayersMetadata(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    throw new Error("Players must be an array.");
  }

  return parsedValue.map((item: unknown, index: number): TeamPlayerInput => {
    if (!isRecord(item)) {
      throw new Error(`Player ${index + 1} is invalid.`);
    }

    return {
      name: getRequiredString(item.name, `Player ${index + 1} name`),
      number: getRequiredString(item.number, `Player ${index + 1} number`),
      image:
        typeof item.image === "string" && item.image.trim().length > 0
          ? item.image.trim()
          : "",
    };
  });
}

async function parseTeamFormData(formData: FormData): Promise<ParsedTeamPayload> {
  const players = parsePlayersMetadata(formData.get("players"));

  const playersWithImages = await Promise.all(
    players.map(async (player: TeamPlayerInput, index: number) => {
      const imageValue = formData.get(`playerImage_${index}`);

      if (imageValue instanceof File && imageValue.size > 0) {
        return {
          ...player,
          image: await saveTeamPlayerImage(imageValue),
        };
      }

      if (player.image.length === 0) {
        throw new Error(`Player ${index + 1} image is required.`);
      }

      return player;
    })
  );

  return {
    category: getRequiredFormString(formData, "category"),
    title: getRequiredFormString(formData, "title"),
    coach: getRequiredFormString(formData, "coach"),
    description: getRequiredFormString(formData, "description"),
    published: getPublishedValue(formData),
    players: playersWithImages,
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await prisma.nationalTeam.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        category: true,
        title: true,
        coach: true,
        description: true,
        published: true,
        players: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            number: true,
            image: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (error: unknown) {
    console.error("GET_ADMIN_TEAMS_ERROR", error);

    return NextResponse.json(
      { error: "Failed to fetch teams." },
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

    const payload = await parseTeamFormData(await request.formData());

    const createdTeam = await prisma.nationalTeam.create({
      data: {
        category: payload.category,
        title: payload.title,
        coach: payload.coach,
        description: payload.description,
        published: payload.published,
        players: {
          create: payload.players.map(
            (player: TeamPlayerInput, index: number) => ({
              name: player.name,
              number: player.number,
              image: player.image,
              order: index,
            })
          ),
        },
      },
      select: {
        id: true,
        category: true,
        title: true,
        coach: true,
        description: true,
        published: true,
        players: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            number: true,
            image: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      team: createdTeam,
    });
  } catch (error: unknown) {
    console.error("CREATE_TEAM_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create team.",
      },
      { status: 500 }
    );
  }
}
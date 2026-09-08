import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const IMAGES_BUCKET =
  process.env.SUPABASE_CLUB_LOGOS_BUCKET || "images";

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

/* ═════════════════════════════════════
   SUPABASE
═════════════════════════════════════ */

function getSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/* ═════════════════════════════════════
   FORM HELPERS
═════════════════════════════════════ */

function getRequiredFormString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `${key} is required.`
    );
  }

  return value.trim();
}

function getPublishedValue(
  formData: FormData
) {
  return (
    formData.get("published") === "true"
  );
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function getRequiredString(
  value: unknown,
  fieldName: string
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  return value.trim();
}

/* ═════════════════════════════════════
   IMAGE HELPERS
═════════════════════════════════════ */

function getImageExtension(
  file: File
) {
  if (
    file.type === "image/png"
  ) {
    return "png";
  }

  if (
    file.type === "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
}

async function saveTeamPlayerImage(
  file: File
): Promise<{
  publicUrl: string;
  objectPath: string;
}> {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
  ];

  const maxSize =
    5 * 1024 * 1024;

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Only JPG, PNG, and WEBP images are allowed."
    );
  }

  if (
    file.size > maxSize
  ) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  const supabase =
    getSupabaseClient();

  const extension =
    getImageExtension(file);

  const objectPath =
    `teams/${Date.now()}-${randomUUID()}.${extension}`;

  const bytes =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(bytes);

  const {
    error: uploadError,
  } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(
      objectPath,
      buffer,
      {
        contentType:
          file.type,

        cacheControl:
          "3600",

        upsert:
          false,
      }
    );

  if (uploadError) {
    console.error(
      "TEAM_IMAGE_UPLOAD_ERROR",
      uploadError
    );

    throw new Error(
      `Failed to upload player image: ${uploadError.message}`
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(
      objectPath
    );

  const publicUrl =
    publicUrlData.publicUrl;

  if (!publicUrl) {
    /*
     * Upload succeeded but URL
     * generation unexpectedly failed.
     * Clean the object back up.
     */
    await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([
        objectPath,
      ]);

    throw new Error(
      "Failed to generate player image URL."
    );
  }

  return {
    publicUrl,
    objectPath,
  };
}

async function removeSupabasePaths(
  paths: string[]
) {
  const uniquePaths =
    Array.from(
      new Set(
        paths.filter(
          (
            path
          ): path is string =>
            typeof path ===
              "string" &&
            path.length > 0
        )
      )
    );

  if (
    uniquePaths.length === 0
  ) {
    return;
  }

  try {
    const supabase =
      getSupabaseClient();

    const {
      error,
    } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove(
        uniquePaths
      );

    if (error) {
      console.error(
        "TEAM_IMAGE_CLEANUP_ERROR",
        error
      );
    }
  } catch (error) {
    console.error(
      "TEAM_IMAGE_CLEANUP_ERROR",
      error
    );
  }
}

/* ═════════════════════════════════════
   PLAYER PARSING
═════════════════════════════════════ */

function parsePlayersMetadata(
  value:
    FormDataEntryValue |
    null
) {
  if (
    typeof value !== "string"
  ) {
    return [];
  }

  let parsedValue: unknown;

  try {
    parsedValue =
      JSON.parse(value);
  } catch {
    throw new Error(
      "Players data is invalid JSON."
    );
  }

  if (
    !Array.isArray(
      parsedValue
    )
  ) {
    throw new Error(
      "Players must be an array."
    );
  }

  return parsedValue.map(
    (
      item: unknown,
      index: number
    ): TeamPlayerInput => {
      if (
        !isRecord(item)
      ) {
        throw new Error(
          `Player ${index + 1} is invalid.`
        );
      }

      return {
        name:
          getRequiredString(
            item.name,
            `Player ${index + 1} name`
          ),

        number:
          getRequiredString(
            item.number,
            `Player ${index + 1} number`
          ),

        image:
          typeof item.image ===
            "string" &&
          item.image
            .trim()
            .length > 0
            ? item.image.trim()
            : "",
      };
    }
  );
}

async function parseTeamFormData(
  formData: FormData,
  uploadedPaths: string[]
): Promise<ParsedTeamPayload> {
  const players =
    parsePlayersMetadata(
      formData.get(
        "players"
      )
    );

  if (
    players.length === 0
  ) {
    throw new Error(
      "At least one player is required."
    );
  }

  /*
   * Sequential upload rather than Promise.all.
   *
   * This makes cleanup more predictable:
   * every successful upload is registered
   * immediately in uploadedPaths.
   */
  const playersWithImages:
    TeamPlayerInput[] = [];

  for (
    let index = 0;
    index < players.length;
    index += 1
  ) {
    const player =
      players[index];

    const imageValue =
      formData.get(
        `playerImage_${index}`
      );

    if (
      imageValue instanceof
        File &&
      imageValue.size > 0
    ) {
      const uploaded =
        await saveTeamPlayerImage(
          imageValue
        );

      uploadedPaths.push(
        uploaded.objectPath
      );

      playersWithImages.push({
        ...player,
        image:
          uploaded.publicUrl,
      });

      continue;
    }

    if (
      player.image.length === 0
    ) {
      throw new Error(
        `Player ${index + 1} image is required.`
      );
    }

    playersWithImages.push(
      player
    );
  }

  return {
    category:
      getRequiredFormString(
        formData,
        "category"
      ),

    title:
      getRequiredFormString(
        formData,
        "title"
      ),

    coach:
      getRequiredFormString(
        formData,
        "coach"
      ),

    description:
      getRequiredFormString(
        formData,
        "description"
      ),

    published:
      getPublishedValue(
        formData
      ),

    players:
      playersWithImages,
  };
}

/* ═════════════════════════════════════
   GET TEAMS
═════════════════════════════════════ */

export async function GET() {
  try {
    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const teams =
      await prisma.nationalTeam.findMany(
        {
          orderBy: [
            {
              order:
                "asc",
            },
            {
              createdAt:
                "asc",
            },
          ],

          select: {
            id: true,
            category: true,
            title: true,
            coach: true,
            description: true,
            published: true,

            players: {
              orderBy: [
                {
                  order:
                    "asc",
                },
                {
                  createdAt:
                    "asc",
                },
              ],

              select: {
                id: true,
                name: true,
                number: true,
                image: true,
                order: true,
              },
            },
          },
        }
      );

    return NextResponse.json({
      success: true,
      teams,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "GET_ADMIN_TEAMS_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch teams.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   CREATE TEAM
═════════════════════════════════════ */

export async function POST(
  request: NextRequest
) {
  /*
   * Every successful upload is
   * recorded here.
   *
   * If anything after uploading fails,
   * these objects are deleted from
   * Supabase automatically.
   */
  const uploadedPaths:
    string[] = [];

  try {
    const session =
      await auth.api.getSession({
        headers:
          await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await request.formData();

    const payload =
      await parseTeamFormData(
        formData,
        uploadedPaths
      );

    const createdTeam =
      await prisma.nationalTeam.create(
        {
          data: {
            category:
              payload.category,

            title:
              payload.title,

            coach:
              payload.coach,

            description:
              payload.description,

            published:
              payload.published,

            players: {
              create:
                payload.players.map(
                  (
                    player:
                      TeamPlayerInput,
                    index:
                      number
                  ) => ({
                    name:
                      player.name,

                    number:
                      player.number,

                    image:
                      player.image,

                    order:
                      index,
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
              orderBy: {
                order:
                  "asc",
              },

              select: {
                id: true,
                name: true,
                number: true,
                image: true,
                order: true,
              },
            },
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        team:
          createdTeam,
      },
      {
        status: 201,
      }
    );
  } catch (
    error: unknown
  ) {
    /*
     * If images were uploaded but
     * Prisma failed afterwards,
     * remove those uploads so they
     * don't remain as orphaned files.
     */
    if (
      uploadedPaths.length >
      0
    ) {
      await removeSupabasePaths(
        uploadedPaths
      );
    }

    console.error(
      "CREATE_TEAM_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to create team.",
      },
      {
        status: 500,
      }
    );
  }
}
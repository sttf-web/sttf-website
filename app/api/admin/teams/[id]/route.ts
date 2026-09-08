import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const IMAGES_BUCKET =
  process.env.SUPABASE_IMAGES_BUCKET ||
  process.env.SUPABASE_CLUB_LOGOS_BUCKET ||
  "images";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getPublishedValue(formData: FormData) {
  const value = formData.get("published");

  return value === "true";
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRequiredString(
  value: unknown,
  fieldName: string
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

/* ═════════════════════════════════════
   IMAGE HELPERS
═════════════════════════════════════ */

function getImageExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
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

  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG, and WEBP images are allowed."
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  const supabase = getSupabaseClient();

  const extension = getImageExtension(file);

  const objectPath =
    `teams/${Date.now()}-${randomUUID()}.${extension}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: uploadError } =
    await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

  if (uploadError) {
    console.error(
      "TEAM_IMAGE_UPLOAD_ERROR",
      uploadError
    );

    throw new Error(
      `Failed to upload player image: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(objectPath);

  if (!data.publicUrl) {
    await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([objectPath]);

    throw new Error(
      "Failed to generate player image URL."
    );
  }

  return {
    publicUrl: data.publicUrl,
    objectPath,
  };
}

/**
 * Only returns paths that:
 * 1. Belong to our configured Supabase bucket
 * 2. Are inside the teams/ directory
 *
 * This prevents accidentally deleting unrelated images.
 */
function getSupabaseTeamObjectPath(
  imageUrl: string
): string | null {
  if (!imageUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);

    const marker =
      `/storage/v1/object/public/${IMAGES_BUCKET}/`;

    const markerIndex =
      parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath =
      parsedUrl.pathname.slice(
        markerIndex + marker.length
      );

    const objectPath =
      decodeURIComponent(encodedPath);

    if (!objectPath.startsWith("teams/")) {
      return null;
    }

    return objectPath;
  } catch {
    return null;
  }
}

async function removeSupabasePaths(
  paths: string[]
) {
  const uniquePaths = Array.from(
    new Set(paths.filter(Boolean))
  );

  if (uniquePaths.length === 0) {
    return;
  }

  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove(uniquePaths);

    if (error) {
      console.error(
        "TEAM_IMAGE_DELETE_ERROR",
        error
      );
    }
  } catch (error) {
    console.error(
      "TEAM_IMAGE_DELETE_ERROR",
      error
    );
  }
}

async function removeSupabaseImages(
  imageUrls: string[]
) {
  const objectPaths = imageUrls
    .map(getSupabaseTeamObjectPath)
    .filter(
      (path): path is string =>
        typeof path === "string"
    );

  await removeSupabasePaths(objectPaths);
}

/* ═════════════════════════════════════
   PLAYER PARSING
═════════════════════════════════════ */

function parsePlayersMetadata(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string") {
    return [];
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(value);
  } catch {
    throw new Error(
      "Players data is invalid JSON."
    );
  }

  if (!Array.isArray(parsedValue)) {
    throw new Error(
      "Players must be an array."
    );
  }

  return parsedValue.map(
    (
      item: unknown,
      index: number
    ): TeamPlayerInput => {
      if (!isRecord(item)) {
        throw new Error(
          `Player ${index + 1} is invalid.`
        );
      }

      return {
        name: getRequiredString(
          item.name,
          `Player ${index + 1} name`
        ),

        number: getRequiredString(
          item.number,
          `Player ${index + 1} number`
        ),

        image:
          typeof item.image === "string" &&
          item.image.trim().length > 0
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
  const players = parsePlayersMetadata(
    formData.get("players")
  );

  const playersWithImages =
    await Promise.all(
      players.map(
        async (
          player: TeamPlayerInput,
          index: number
        ) => {
          const imageValue =
            formData.get(
              `playerImage_${index}`
            );

          if (
            imageValue instanceof File &&
            imageValue.size > 0
          ) {
            const uploadedImage =
              await saveTeamPlayerImage(
                imageValue
              );

            uploadedPaths.push(
              uploadedImage.objectPath
            );

            return {
              ...player,
              image:
                uploadedImage.publicUrl,
            };
          }

          if (player.image.length === 0) {
            throw new Error(
              `Player ${index + 1} image is required.`
            );
          }

          return player;
        }
      )
    );

  return {
    category: getRequiredFormString(
      formData,
      "category"
    ),

    title: getRequiredFormString(
      formData,
      "title"
    ),

    coach: getRequiredFormString(
      formData,
      "coach"
    ),

    description: getRequiredFormString(
      formData,
      "description"
    ),

    published:
      getPublishedValue(formData),

    players: playersWithImages,
  };
}

/* ═════════════════════════════════════
   PATCH TEAM
═════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const uploadedPaths: string[] = [];

  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const existingTeam =
      await prisma.nationalTeam.findUnique({
        where: {
          id,
        },

        select: {
          id: true,

          players: {
            select: {
              id: true,
              image: true,
            },
          },
        },
      });

    if (!existingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: "Team not found.",
        },
        {
          status: 404,
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

    const updatedTeam =
      await prisma.$transaction(
        async (tx) => {
          await tx.nationalTeamPlayer.deleteMany(
            {
              where: {
                teamId: id,
              },
            }
          );

          return tx.nationalTeam.update({
            where: {
              id,
            },

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
                      index: number
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
                  order: "asc",
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
          });
        }
      );

    /*
     * Delete old Supabase images that are
     * no longer referenced after this edit.
     *
     * This happens AFTER the database update
     * succeeds so we never delete an image
     * before knowing the update worked.
     */

    const currentImageUrls = new Set(
      payload.players.map(
        (player) => player.image
      )
    );

    const obsoleteImageUrls =
      existingTeam.players
        .map((player) => player.image)
        .filter(
          (imageUrl) =>
            !currentImageUrls.has(imageUrl)
        );

    await removeSupabaseImages(
      obsoleteImageUrls
    );

    return NextResponse.json({
      success: true,
      team: updatedTeam,
    });
  } catch (error: unknown) {
    /*
     * If we uploaded new images but something
     * later failed, clean those new files out
     * of Supabase so they don't become orphans.
     */

    if (uploadedPaths.length > 0) {
      await removeSupabasePaths(
        uploadedPaths
      );
    }

    console.error(
      "UPDATE_TEAM_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to update team.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   DELETE TEAM
═════════════════════════════════════ */

export async function DELETE(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    const existingTeam =
      await prisma.nationalTeam.findUnique({
        where: {
          id,
        },

        select: {
          id: true,

          players: {
            select: {
              image: true,
            },
          },
        },
      });

    if (!existingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: "Team not found.",
        },
        {
          status: 404,
        }
      );
    }

    const imageUrls =
      existingTeam.players.map(
        (player) => player.image
      );

    await prisma.$transaction(
      async (tx) => {
        await tx.nationalTeamPlayer.deleteMany(
          {
            where: {
              teamId: id,
            },
          }
        );

        await tx.nationalTeam.delete({
          where: {
            id,
          },
        });
      }
    );

    /*
     * Database deletion succeeded,
     * so now remove the team images
     * from Supabase.
     */

    await removeSupabaseImages(
      imageUrls
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error(
      "DELETE_TEAM_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to delete team.",
      },
      {
        status: 500,
      }
    );
  }
}
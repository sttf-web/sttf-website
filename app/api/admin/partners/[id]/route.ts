import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGES_BUCKET =
  process.env.SUPABASE_CLUB_LOGOS_BUCKET || "images";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function getOptionalString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0
    ? trimmedValue
    : null;
}

function getRequiredString(
  formData: FormData,
  key: string
) {
  const value = getOptionalString(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return 0;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function getPublished(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string") {
    return true;
  }

  return value === "true";
}

function getFileExtension(file: File) {
  switch (file.type) {
    case "image/png":
      return "png";

    case "image/jpeg":
      return "jpg";

    case "image/webp":
      return "webp";

    default:
      return null;
  }
}

function getStoragePathFromPublicUrl(
  imageUrl: string | null
) {
  if (!imageUrl) {
    return null;
  }

  /*
   * Expected Supabase URL:
   *
   * https://project.supabase.co/storage/v1/object/public/images/partners/file.png
   */

  const marker = `/storage/v1/object/public/${IMAGES_BUCKET}/`;

  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const storagePath = imageUrl.slice(
    markerIndex + marker.length
  );

  return storagePath || null;
}

async function deleteStorageImage(
  imageUrl: string | null
) {
  const storagePath =
    getStoragePathFromPublicUrl(imageUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.error(
      "DELETE_PARTNER_STORAGE_IMAGE_ERROR",
      {
        storagePath,
        error,
      }
    );
  }
}

async function uploadPartnerImage(file: File) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    throw new Error(
      "Partner logo must be a PNG, JPG, or WEBP image."
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      "Partner logo must be smaller than 5 MB."
    );
  }

  const extension = getFileExtension(file);

  if (!extension) {
    throw new Error(
      "Unsupported partner logo format."
    );
  }

  const storagePath =
    `partners/${randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } =
    await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

  if (uploadError) {
    console.error(
      "UPLOAD_PARTNER_IMAGE_ERROR",
      uploadError
    );

    throw new Error(
      `Failed to upload partner logo: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    /*
     * Clean up the uploaded file if we somehow
     * cannot generate its URL.
     */
    await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([storagePath]);

    throw new Error(
      "Failed to generate partner logo URL."
    );
  }

  return {
    publicUrl: data.publicUrl,
    storagePath,
  };
}

/* ═════════════════════════════════════
   PATCH
═════════════════════════════════════ */

/**
 * PATCH /api/admin/partners/:id
 *
 * Updates:
 * - name
 * - order
 * - published
 * - image, if a new image is provided
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  let newlyUploadedStoragePath: string | null =
    null;

  try {
    const session = await auth.api.getSession({
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

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingPartner =
      await prisma.partner.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          image: true,
          published: true,
          order: true,
        },
      });

    if (!existingPartner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found.",
        },
        {
          status: 404,
        }
      );
    }

    const formData = await request.formData();

    const name = getRequiredString(
      formData,
      "name"
    );

    const order = getOrder(
      formData.get("order")
    );

    const published = getPublished(
      formData.get("published")
    );

    const imageEntry = formData.get("image");

    let imageUrl = existingPartner.image;

    /*
     * Upload replacement logo first.
     *
     * Do NOT delete the old image until the
     * database update succeeds.
     */
    if (
      imageEntry instanceof File &&
      imageEntry.size > 0
    ) {
      const uploaded =
        await uploadPartnerImage(imageEntry);

      imageUrl = uploaded.publicUrl;

      newlyUploadedStoragePath =
        uploaded.storagePath;
    }

    let updatedPartner;

    try {
      updatedPartner =
        await prisma.partner.update({
          where: {
            id: existingPartner.id,
          },
          data: {
            name,
            order,
            published,
            image: imageUrl,
          },
          select: {
            id: true,
            name: true,
            image: true,
            published: true,
            order: true,
          },
        });
    } catch (databaseError) {
      /*
       * If the new image uploaded successfully
       * but the DB update failed, remove the new
       * image so we don't leave orphaned files.
       */
      if (newlyUploadedStoragePath) {
        const { error: cleanupError } =
          await supabase.storage
            .from(IMAGES_BUCKET)
            .remove([
              newlyUploadedStoragePath,
            ]);

        if (cleanupError) {
          console.error(
            "PARTNER_IMAGE_ROLLBACK_ERROR",
            cleanupError
          );
        }
      }

      throw databaseError;
    }

    /*
     * Database update succeeded.
     *
     * Now it is safe to remove the previous image.
     */
    if (
      newlyUploadedStoragePath &&
      existingPartner.image &&
      existingPartner.image !== imageUrl
    ) {
      await deleteStorageImage(
        existingPartner.image
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Partner updated successfully.",
        partner: updatedPartner,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "PATCH_PARTNER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update partner.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   DELETE
═════════════════════════════════════ */

/**
 * DELETE /api/admin/partners/:id
 *
 * Deletes:
 * 1. The partner database record
 * 2. The Supabase Storage image, if applicable
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({
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

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const partner =
      await prisma.partner.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Delete DB record first.
     *
     * We do not want a storage deletion failure
     * to leave the API in a weird partially
     * deleted database state.
     */
    await prisma.partner.delete({
      where: {
        id: partner.id,
      },
    });

    /*
     * Delete Supabase image afterwards.
     *
     * Storage cleanup failure does NOT make
     * the database deletion fail.
     */
    await deleteStorageImage(
      partner.image
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Partner deleted successfully.",
        deletedPartner: {
          id: partner.id,
          name: partner.name,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "DELETE_PARTNER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete partner.",
      },
      {
        status: 500,
      }
    );
  }
}
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  createClient,
} from "@supabase/supabase-js";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DEFAULT_PERSON_IMAGE =
  "/images/defaultPerson.png";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGES_BUCKET =
  process.env.SUPABASE_CLUB_LOGOS_BUCKET ||
  "images";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function getRequiredString(
  formData: FormData,
  key: string
) {
  const value =
    formData.get(key);

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

function getOrder(
  value:
    | FormDataEntryValue
    | null
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return 0;
  }

  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    Number.isNaN(parsed) ||
    parsed < 0
  ) {
    return 0;
  }

  return parsed;
}

function getPublished(
  formData: FormData
) {
  return (
    formData.get(
      "published"
    ) !== "false"
  );
}

function getImageExtension(
  file: File
) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  ) {
    return extension;
  }

  if (
    file.type === "image/jpeg"
  ) {
    return "jpg";
  }

  if (
    file.type === "image/webp"
  ) {
    return "webp";
  }

  return "png";
}

/* ═════════════════════════════════════
   UPLOAD IMAGE
═════════════════════════════════════ */

async function uploadCommitteeImage(
  file: File
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Only JPG, PNG, or WEBP images are allowed."
    );
  }

  const maxSize =
    5 * 1024 * 1024;

  if (
    file.size > maxSize
  ) {
    throw new Error(
      "Committee member image must be smaller than 5MB."
    );
  }

  const extension =
    getImageExtension(file);

  const fileName =
    `${randomUUID()}.${extension}`;

  const filePath =
    `committee-members/${fileName}`;

  const arrayBuffer =
    await file.arrayBuffer();

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(
      filePath,
      arrayBuffer,
      {
        contentType:
          file.type,
        cacheControl:
          "3600",
        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "SUPABASE_COMMITTEE_UPLOAD_ERROR",
      uploadError
    );

    throw new Error(
      `Failed to upload committee image: ${uploadError.message}`
    );
  }

  const { data } =
    supabase.storage
      .from(IMAGES_BUCKET)
      .getPublicUrl(
        uploadData.path
      );

  return data.publicUrl;
}

/* ═════════════════════════════════════
   EXTRACT SUPABASE STORAGE PATH
═════════════════════════════════════ */

function getSupabaseStoragePath(
  imageUrl: string
) {
  /*
   * Local fallback:
   *
   * /images/defaultPerson.png
   *
   * should never be deleted from
   * Supabase.
   */
  if (
    imageUrl.startsWith("/")
  ) {
    return null;
  }

  try {
    const url =
      new URL(imageUrl);

    const marker =
      `/storage/v1/object/public/${IMAGES_BUCKET}/`;

    const markerIndex =
      url.pathname.indexOf(
        marker
      );

    if (
      markerIndex === -1
    ) {
      return null;
    }

    const storagePath =
      url.pathname.slice(
        markerIndex +
          marker.length
      );

    return decodeURIComponent(
      storagePath
    );
  } catch {
    return null;
  }
}

/* ═════════════════════════════════════
   DELETE SUPABASE IMAGE
═════════════════════════════════════ */

async function deleteCommitteeImage(
  imageUrl: string
) {
  if (
    !imageUrl ||
    imageUrl ===
      DEFAULT_PERSON_IMAGE
  ) {
    return;
  }

  const storagePath =
    getSupabaseStoragePath(
      imageUrl
    );

  if (!storagePath) {
    return;
  }

  /*
   * Safety:
   *
   * Only delete images belonging to
   * committee members.
   */
  if (
    !storagePath.startsWith(
      "committee-members/"
    )
  ) {
    return;
  }

  const {
    error: deleteError,
  } = await supabase.storage
    .from(IMAGES_BUCKET)
    .remove([
      storagePath,
    ]);

  if (deleteError) {
    console.error(
      "SUPABASE_COMMITTEE_DELETE_ERROR",
      deleteError
    );

    /*
     * We don't throw here because the
     * database operation may already
     * have succeeded.
     */
  }
}

/* ═════════════════════════════════════
   UPDATE MEMBER
═════════════════════════════════════ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } =
      await context.params;

    const existingMember =
      await prisma.committeeMember.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          image: true,
        },
      });

    if (
      !existingMember
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Committee member not found.",
        },
        {
          status: 404,
        }
      );
    }

    const formData =
      await request.formData();

    const name =
      getRequiredString(
        formData,
        "name"
      );

    const title =
      getRequiredString(
        formData,
        "title"
      );

    /*
     * Keep existing image unless
     * a new file is uploaded.
     *
     * If somehow the DB image is blank,
     * fall back to defaultPerson.
     */
    let image =
      existingMember.image?.trim()
        ? existingMember.image
        : DEFAULT_PERSON_IMAGE;

    const imageValue =
      formData.get("image");

    let imageWasReplaced =
      false;

    if (
      imageValue instanceof File &&
      imageValue.size > 0
    ) {
      image =
        await uploadCommitteeImage(
          imageValue
        );

      imageWasReplaced =
        true;
    }

    const member =
      await prisma.committeeMember.update({
        where: {
          id,
        },

        data: {
          name,
          title,
          image,

          order: getOrder(
            formData.get(
              "order"
            )
          ),

          published:
            getPublished(
              formData
            ),
        },

        select: {
          id: true,
          name: true,
          title: true,
          image: true,
          published: true,
          order: true,
          committeeId: true,
        },
      });

    /*
     * Database update succeeded.
     *
     * We can now remove the old
     * Supabase image.
     */
    if (
      imageWasReplaced &&
      existingMember.image &&
      existingMember.image !==
        image
    ) {
      await deleteCommitteeImage(
        existingMember.image
      );
    }

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "UPDATE_COMMITTEE_MEMBER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof
          Error
            ? error.message
            : "Failed to update committee member.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   DELETE MEMBER
═════════════════════════════════════ */

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
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

    const { id } =
      await context.params;

    const member =
      await prisma.committeeMember.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          name: true,
          image: true,
        },
      });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Committee member not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Delete database record first.
     */
    await prisma.committeeMember.delete({
      where: {
        id,
      },
    });

    /*
     * Then clean up Supabase image.
     *
     * This automatically ignores:
     *
     * /images/defaultPerson.png
     */
    if (member.image) {
      await deleteCommitteeImage(
        member.image
      );
    }

    return NextResponse.json({
      success: true,

      deletedMember: {
        id: member.id,
        name: member.name,
      },
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "DELETE_COMMITTEE_MEMBER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to delete committee member.",
      },
      {
        status: 500,
      }
    );
  }
}
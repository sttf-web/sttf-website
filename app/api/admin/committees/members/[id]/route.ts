import { randomUUID } from "crypto";
import {
  mkdir,
  unlink,
  writeFile,
} from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DEFAULT_PERSON_IMAGE = "/images/defaultPerson.png";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getRequiredString(
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

function getOrder(
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number.parseInt(
    value,
    10
  );

  return Number.isNaN(parsed) ||
    parsed < 0
    ? 0
    : parsed;
}

function getPublished(
  formData: FormData
) {
  return (
    formData.get("published") !==
    "false"
  );
}

function getImageExtension(
  file: File
) {
  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

async function saveCommitteeImage(
  file: File
) {
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

  if (file.size > maxSize) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  const extension =
    getImageExtension(file);

  const fileName =
    `${Date.now()}-${randomUUID()}.${extension}`;

  const uploadDirectory = join(
    process.cwd(),
    "public",
    "uploads",
    "committees"
  );

  await mkdir(
    uploadDirectory,
    {
      recursive: true,
    }
  );

  const filePath = join(
    uploadDirectory,
    fileName
  );

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await writeFile(
    filePath,
    buffer
  );

  return `/uploads/committees/${fileName}`;
}

async function deleteLocalImage(
  image: string
) {
  /*
   * Only delete uploaded committee images.
   *
   * This means:
   *
   * /images/defaultPerson.png
   *
   * can NEVER accidentally be deleted.
   */
  if (
    !image.startsWith(
      "/uploads/committees/"
    )
  ) {
    return;
  }

  try {
    const relativePath =
      image.replace(/^\/+/, "");

    const filePath = join(
      process.cwd(),
      "public",
      relativePath
    );

    await unlink(filePath);
  } catch (error: unknown) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(error.code)
        : null;

    if (code !== "ENOENT") {
      console.error(
        "DELETE_COMMITTEE_IMAGE_ERROR",
        error
      );
    }
  }
}

/* ═════════════════════════════════════
   UPDATE MEMBER
═════════════════════════════════════ */

export async function PATCH(
  request: Request,
  context: RouteContext
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

    if (!existingMember) {
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

    const imageValue =
      formData.get("image");

    /*
     * Existing image is used first.
     *
     * If for any reason it is empty,
     * use the default person image.
     */
    let image =
      existingMember.image?.trim()
        ? existingMember.image
        : DEFAULT_PERSON_IMAGE;

    let newImageUploaded =
      false;

    /*
     * If the user uploaded a new image,
     * replace the current/default image.
     */
    if (
      imageValue instanceof File &&
      imageValue.size > 0
    ) {
      image =
        await saveCommitteeImage(
          imageValue
        );

      newImageUploaded = true;
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
            formData.get("order")
          ),

          published:
            getPublished(formData),
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
     * If a new image was uploaded,
     * remove the previous uploaded image.
     *
     * The defaultPerson image will never
     * be deleted because deleteLocalImage()
     * only handles /uploads/committees/.
     */
    if (
      newImageUploaded &&
      existingMember.image &&
      existingMember.image !== image
    ) {
      await deleteLocalImage(
        existingMember.image
      );
    }

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error: unknown) {
    console.error(
      "UPDATE_COMMITTEE_MEMBER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
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
  _request: Request,
  context: RouteContext
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

    await prisma.committeeMember.delete({
      where: {
        id,
      },
    });

    /*
     * This only deletes uploaded files.
     *
     * /images/defaultPerson.png
     * remains untouched.
     */
    if (member.image) {
      await deleteLocalImage(
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
  } catch (error: unknown) {
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
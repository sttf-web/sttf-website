import { randomUUID } from "crypto";
import { headers } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@supabase/supabase-js";

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

/* ═════════════════════════════════════
   HELPERS
═════════════════════════════════════ */

function getRequiredString(
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

function getOptionalString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue.length > 0
    ? trimmedValue
    : null;
}

function getOrder(
  value: FormDataEntryValue | null
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return 0;
  }

  const parsed =
    Number.parseInt(value, 10);

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
    formData.get("published") !==
    "false"
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
   SUPABASE IMAGE UPLOAD
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
        cacheControl: "3600",
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
   GET COMMITTEES
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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const committees =
      await prisma.committee.findMany({
        orderBy: [
          {
            order: "asc",
          },
          {
            createdAt: "asc",
          },
        ],

        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          published: true,
          order: true,

          members: {
            orderBy: [
              {
                order: "asc",
              },
              {
                createdAt: "asc",
              },
            ],

            select: {
              id: true,
              name: true,
              title: true,
              image: true,
              published: true,
              order: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      committees,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "GET_ADMIN_COMMITTEES_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch committees.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   UPDATE COMMITTEE DESCRIPTION
═════════════════════════════════════ */

export async function PATCH(
  request: NextRequest
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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await request.formData();

    const committeeId =
      getRequiredString(
        formData,
        "committeeId"
      );

    const description =
      getOptionalString(
        formData,
        "description"
      );

    const existingCommittee =
      await prisma.committee.findUnique({
        where: {
          id: committeeId,
        },

        select: {
          id: true,
        },
      });

    if (!existingCommittee) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Committee not found.",
        },
        {
          status: 404,
        }
      );
    }

    const committee =
      await prisma.committee.update({
        where: {
          id: committeeId,
        },

        data: {
          description,
        },

        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          published: true,
          order: true,
        },
      });

    return NextResponse.json({
      success: true,
      committee,
    });
  } catch (
    error: unknown
  ) {
    console.error(
      "UPDATE_COMMITTEE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to update committee.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   CREATE COMMITTEE MEMBER
═════════════════════════════════════ */

export async function POST(
  request: NextRequest
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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await request.formData();

    const committeeId =
      getRequiredString(
        formData,
        "committeeId"
      );

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

    const committee =
      await prisma.committee.findUnique({
        where: {
          id: committeeId,
        },

        select: {
          id: true,
        },
      });

    if (!committee) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Committee not found.",
        },
        {
          status: 404,
        }
      );
    }

    let image =
      DEFAULT_PERSON_IMAGE;

    const imageValue =
      formData.get("image");

    if (
      imageValue instanceof File &&
      imageValue.size > 0
    ) {
      image =
        await uploadCommitteeImage(
          imageValue
        );
    }

    const member =
      await prisma.committeeMember.create({
        data: {
          committeeId,
          name,
          title,
          image,

          order: getOrder(
            formData.get("order")
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

    return NextResponse.json(
      {
        success: true,
        member,
      },
      {
        status: 201,
      }
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "CREATE_COMMITTEE_MEMBER_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to create committee member.",
      },
      {
        status: 500,
      }
    );
  }
}
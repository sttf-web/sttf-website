import { randomUUID } from "crypto";
import { extname } from "path";
import { createClient } from "@supabase/supabase-js";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
 * Use the same existing bucket that is already
 * working for player images and other uploads.
 */
const STORAGE_BUCKET =
  process.env.SUPABASE_CLUB_LOGOS_BUCKET ||
  "images";

const BYLAWS_FOLDER = "bylaws";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function getSafeExtension(file: File) {
  const originalExtension = extname(
    file.name
  );

  if (originalExtension) {
    return originalExtension.toLowerCase();
  }

  switch (file.type) {
    case "application/pdf":
      return ".pdf";

    case "application/msword":
      return ".doc";

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";

    default:
      return "";
  }
}

async function uploadBylawFile(
  file: File
) {
  const extension =
    getSafeExtension(file);

  const storedFileName =
    `${randomUUID()}${extension}`;

  const filePath =
    `${BYLAWS_FOLDER}/${storedFileName}`;

  const arrayBuffer =
    await file.arrayBuffer();

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(
      filePath,
      arrayBuffer,
      {
        contentType:
          file.type ||
          "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "SUPABASE_BYLAW_UPLOAD_ERROR",
      uploadError
    );

    throw new Error(
      `Failed to upload ${file.name}: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(uploadData.path);

  return {
    storagePath: uploadData.path,

    /*
     * This is the actual Supabase URL
     * saved to Prisma.
     */
    fileUrl: data.publicUrl,

    /*
     * Preserve the original filename.
     */
    fileName: file.name,

    mimeType: file.type || null,
    fileSize: file.size,
  };
}

async function removeUploadedFiles(
  storagePaths: string[]
) {
  if (storagePaths.length === 0) {
    return;
  }

  const { error } =
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths);

  if (error) {
    console.error(
      "ROLLBACK_BYLAW_UPLOAD_ERROR",
      error
    );
  }
}

async function createUniqueSlug(
  title: string
) {
  const baseSlug =
    createSlug(title) ||
    `bylaw-${randomUUID()}`;

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing =
      await prisma.bylaw.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function GET() {
  try {
    const bylaws =
      await prisma.bylaw.findMany({
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
          title: true,
          slug: true,
          description: true,
          published: true,
          order: true,

          documents: {
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
              fileUrl: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              order: true,
              published: true,
            },
          },
        },
      });

    return NextResponse.json({
      bylaws,
    });
  } catch (error) {
    console.error(
      "GET_ADMIN_BYLAWS_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load bylaws.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  const uploadedStoragePaths: string[] =
    [];

  try {
    const formData =
      await request.formData();

    const titleValue =
      formData.get("title");

    const descriptionValue =
      formData.get("description");

    const title =
      typeof titleValue === "string"
        ? titleValue.trim()
        : "";

    const description =
      typeof descriptionValue ===
      "string"
        ? descriptionValue.trim()
        : "";

    const files = formData
      .getAll("files")
      .filter(
        (value): value is File =>
          value instanceof File &&
          value.size > 0
      );

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Bylaw title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one document is required.",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      await createUniqueSlug(title);

    const highestOrder =
      await prisma.bylaw.aggregate({
        _max: {
          order: true,
        },
      });

    const bylawOrder =
      (highestOrder._max.order ??
        -1) + 1;

    /*
     * Upload each actual document
     * to Supabase Storage.
     */
    const uploadedFiles = [];

    for (const file of files) {
      const uploadedFile =
        await uploadBylawFile(file);

      uploadedStoragePaths.push(
        uploadedFile.storagePath
      );

      uploadedFiles.push(
        uploadedFile
      );
    }

    /*
     * Then store the Supabase URLs and
     * metadata in PostgreSQL through Prisma.
     */
    const bylaw =
      await prisma.bylaw.create({
        data: {
          title,
          slug,

          description:
            description || null,

          order: bylawOrder,
          published: true,

          documents: {
            create:
              uploadedFiles.map(
                (
                  uploadedFile,
                  index
                ) => ({
                  name:
                    uploadedFile.fileName ||
                    `Document ${
                      index + 1
                    }`,

                  fileUrl:
                    uploadedFile.fileUrl,

                  fileName:
                    uploadedFile.fileName,

                  mimeType:
                    uploadedFile.mimeType,

                  fileSize:
                    uploadedFile.fileSize,

                  published: true,
                  order: index,
                })
              ),
          },
        },

        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          published: true,
          order: true,

          documents: {
            orderBy: {
              order: "asc",
            },

            select: {
              id: true,
              name: true,
              fileUrl: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              order: true,
              published: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        bylaw,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE_BYLAW_ERROR",
      error
    );

    /*
     * If Supabase upload worked but
     * Prisma failed, remove the orphaned
     * files from Storage.
     */
    await removeUploadedFiles(
      uploadedStoragePaths
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create bylaw.",
      },
      {
        status: 500,
      }
    );
  }
}
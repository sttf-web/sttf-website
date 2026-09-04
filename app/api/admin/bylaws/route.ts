import { randomUUID } from "crypto";
import { extname } from "path";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const BYLAWS_BUCKET = "bylaws";
const BYLAWS_FOLDER = "documents";

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

async function uploadFileToSupabase(
  file: File
) {
  const extension =
    getSafeExtension(file);

  const storedFileName =
    `${randomUUID()}${extension}`;

  const storagePath =
    `${BYLAWS_FOLDER}/${storedFileName}`;

  const bytes =
    await file.arrayBuffer();

  const { error: uploadError } =
    await supabaseAdmin.storage
      .from(BYLAWS_BUCKET)
      .upload(
        storagePath,
        Buffer.from(bytes),
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            file.type ||
            "application/octet-stream",
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

  const { data } =
    supabaseAdmin.storage
      .from(BYLAWS_BUCKET)
      .getPublicUrl(storagePath);

  if (!data.publicUrl) {
    /*
     * If something very unusual happens after upload,
     * remove the uploaded object so we don't leave an
     * orphaned file.
     */
    await supabaseAdmin.storage
      .from(BYLAWS_BUCKET)
      .remove([storagePath]);

    throw new Error(
      `Unable to generate public URL for ${file.name}.`
    );
  }

  return {
    storagePath,
    fileUrl: data.publicUrl,
    fileName: file.name,
    mimeType: file.type || null,
    fileSize: file.size,
  };
}

async function removeUploadedFiles(
  paths: string[]
) {
  if (paths.length === 0) {
    return;
  }

  const { error } =
    await supabaseAdmin.storage
      .from(BYLAWS_BUCKET)
      .remove(paths);

  if (error) {
    console.error(
      "ROLLBACK_BYLAW_FILES_ERROR",
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
     * Upload actual files to Supabase
     * Storage.
     */
    const uploadedFiles = [];

    for (const file of files) {
      const uploadedFile =
        await uploadFileToSupabase(
          file
        );

      uploadedStoragePaths.push(
        uploadedFile.storagePath
      );

      uploadedFiles.push(
        uploadedFile
      );
    }

    /*
     * Only after all uploads succeed do we
     * create the database records.
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

                  /*
                   * This is now a real
                   * Supabase Storage URL.
                   */
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
     * If Supabase uploads succeeded but
     * Prisma failed, clean the files up.
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
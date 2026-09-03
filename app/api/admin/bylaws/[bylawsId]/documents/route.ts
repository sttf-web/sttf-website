import { randomUUID } from "crypto";
import {
  mkdir,
  writeFile,
} from "fs/promises";
import { extname, join } from "path";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const UPLOAD_DIRECTORY = join(
  process.cwd(),
  "public",
  "uploads",
  "bylaws"
);

type RouteContext = {
  params: Promise<{
    bylawId: string;
  }>;
};

function getSafeExtension(file: File) {
  const extension = extname(file.name);

  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "application/pdf") {
    return ".pdf";
  }

  return "";
}

async function saveUploadedFile(file: File) {
  await mkdir(UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const storedFileName = `${randomUUID()}${getSafeExtension(
    file
  )}`;

  await writeFile(
    join(UPLOAD_DIRECTORY, storedFileName),
    Buffer.from(await file.arrayBuffer())
  );

  return {
    name: file.name,
    fileName: file.name,
    fileUrl: `/uploads/bylaws/${storedFileName}`,
    mimeType: file.type || null,
    fileSize: file.size,
  };
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bylawId } = await context.params;

    const bylaw =
      await prisma.bylaw.findUnique({
        where: {
          id: bylawId,
        },
        select: {
          id: true,
        },
      });

    if (!bylaw) {
      return NextResponse.json(
        {
          error: "Bylaw not found.",
        },
        {
          status: 404,
        }
      );
    }

    const formData =
      await request.formData();

    const files = formData
      .getAll("files")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0
      );

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

    const existingMaxOrder =
      await prisma.bylawDocument.aggregate({
        where: {
          bylawId,
        },
        _max: {
          order: true,
        },
      });

    const startingOrder =
      (existingMaxOrder._max.order ?? -1) + 1;

    const uploads = await Promise.all(
      files.map((file) =>
        saveUploadedFile(file)
      )
    );

    const documents =
      await prisma.$transaction(
        uploads.map((upload, index) =>
          prisma.bylawDocument.create({
            data: {
              bylawId,
              name: upload.name,
              fileName: upload.fileName,
              fileUrl: upload.fileUrl,
              mimeType: upload.mimeType,
              fileSize: upload.fileSize,
              order: startingOrder + index,
              published: true,
            },
          })
        )
      );

    return NextResponse.json(
      {
        documents,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "UPLOAD_BYLAW_DOCUMENTS_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to upload bylaw documents.",
      },
      {
        status: 500,
      }
    );
  }
}
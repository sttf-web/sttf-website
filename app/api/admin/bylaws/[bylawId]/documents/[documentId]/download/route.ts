import { readFile } from "fs/promises";
import { basename, join } from "path";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function createContentDisposition(
  fileName: string,
  inline: boolean
) {
  const disposition = inline
    ? "inline"
    : "attachment";

  // ASCII fallback in case the original filename contains Arabic
  // or characters which cannot safely be placed in filename=""
  const fallbackName = "bylaw-document";

  return `${disposition}; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(
    fileName
  )}`;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { documentId } =
      await context.params;

    const document =
      await prisma.bylawDocument.findUnique({
        where: {
          id: documentId,
        },
        select: {
          id: true,
          name: true,
          fileUrl: true,
          fileName: true,
          mimeType: true,
          published: true,
          bylaw: {
            select: {
              published: true,
            },
          },
        },
      });

    if (
      !document ||
      !document.published ||
      !document.bylaw.published
    ) {
      return NextResponse.json(
        {
          error: "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !document.fileUrl.startsWith(
        "/uploads/bylaws/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid document file location.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * basename prevents a stored URL from escaping
     * the bylaws upload directory.
     */
    const storedFileName = basename(
      document.fileUrl
    );

    const filePath = join(
      process.cwd(),
      "public",
      "uploads",
      "bylaws",
      storedFileName
    );

    let fileBuffer: Buffer;

    try {
      fileBuffer = await readFile(filePath);
    } catch (error) {
      console.error(
        "READ_BYLAW_FILE_ERROR",
        filePath,
        error
      );

      return NextResponse.json(
        {
          error:
            "The document file could not be found on the server.",
        },
        {
          status: 404,
        }
      );
    }

    const requestedFileName =
      document.fileName ||
      document.name ||
      storedFileName;

    const inline =
      request.nextUrl.searchParams.get(
        "inline"
      ) === "1";

    return new NextResponse(
      new Uint8Array(fileBuffer),
      {
        status: 200,
        headers: {
          "Content-Type":
            document.mimeType ||
            "application/octet-stream",

          "Content-Length":
            fileBuffer.length.toString(),

          "Content-Disposition":
            createContentDisposition(
              requestedFileName,
              inline
            ),

          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "DOWNLOAD_BYLAW_DOCUMENT_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to download document.",
      },
      {
        status: 500,
      }
    );
  }
}
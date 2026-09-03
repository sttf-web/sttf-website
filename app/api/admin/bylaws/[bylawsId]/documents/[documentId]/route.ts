import { unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    bylawId: string;
    documentId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const {
      bylawId,
      documentId,
    } = await context.params;

    const document =
      await prisma.bylawDocument.findFirst({
        where: {
          id: documentId,
          bylawId,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.bylawDocument.delete({
      where: {
        id: document.id,
      },
    });

    if (
      document.fileUrl.startsWith(
        "/uploads/"
      )
    ) {
      const filePath = join(
        process.cwd(),
        "public",
        document.fileUrl
      );

      try {
        await unlink(filePath);
      } catch (error) {
        console.warn(
          "Unable to delete bylaw file:",
          filePath,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE_BYLAW_DOCUMENT_ERROR",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete bylaw document.",
      },
      {
        status: 500,
      }
    );
  }
}
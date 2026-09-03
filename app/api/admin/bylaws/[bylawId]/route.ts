import {
  unlink,
} from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    bylawId: string;
  }>;
};

function getLocalFilePath(
  fileUrl: string
) {
  if (!fileUrl.startsWith("/uploads/")) {
    return null;
  }

  return join(
    process.cwd(),
    "public",
    fileUrl
  );
}

export async function DELETE(
  _request: Request,
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
          documents: {
            select: {
              fileUrl: true,
            },
          },
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

    await prisma.bylaw.delete({
      where: {
        id: bylawId,
      },
    });

    await Promise.allSettled(
      bylaw.documents.map(
        async (document) => {
          const filePath = getLocalFilePath(
            document.fileUrl
          );

          if (!filePath) return;

          await unlink(filePath);
        }
      )
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE_BYLAW_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete bylaw.",
      },
      {
        status: 500,
      }
    );
  }
}
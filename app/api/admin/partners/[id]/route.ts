import { unlink } from "fs/promises";
import { join } from "path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * DELETE /api/admin/partners/:id
 *
 * Deletes:
 * 1. The partner database record
 * 2. The locally stored partner image, if applicable
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

    /*
     * Fetch first so that:
     * - we can return a proper JSON 404
     * - we know which image should be removed
     */
    const partner = await prisma.partner.findUnique({
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
     * Delete the database record first.
     */
    await prisma.partner.delete({
      where: {
        id: partner.id,
      },
    });

    /*
     * Remove the image from /public/uploads/partners
     *
     * Only delete files that belong to our local partner upload folder.
     * This prevents accidentally trying to delete external image URLs
     * or unrelated files.
     */
    if (
      partner.image &&
      partner.image.startsWith("/uploads/partners/")
    ) {
      try {
        const relativePath = partner.image.replace(/^\/+/, "");

        const filePath = join(
          process.cwd(),
          "public",
          relativePath
        );

        await unlink(filePath);
      } catch (fileError: unknown) {
        /*
         * The database deletion has already succeeded.
         *
         * A missing/stale image should therefore not cause the API
         * request itself to fail.
         */
        const errorCode =
          typeof fileError === "object" &&
          fileError !== null &&
          "code" in fileError
            ? String(fileError.code)
            : null;

        if (errorCode !== "ENOENT") {
          console.error(
            "DELETE_PARTNER_IMAGE_ERROR",
            fileError
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Partner deleted successfully.",
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
    console.error("DELETE_PARTNER_ERROR", error);

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
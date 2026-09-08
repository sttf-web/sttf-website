import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type UpdateMessageBody = {
  id?: unknown;
  isRead?: unknown;
};

/* ═════════════════════════════════════
   GET MESSAGES
═════════════════════════════════════ */

export async function GET() {
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

    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        title: true,
        email: true,
        message: true,
        isRead: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: unknown) {
    console.error(
      "GET_MESSAGES_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch messages",
      },
      {
        status: 500,
      }
    );
  }
}

/* ═════════════════════════════════════
   UPDATE MESSAGE READ STATUS
═════════════════════════════════════ */

export async function PATCH(
  request: Request
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

    const body =
      (await request.json()) as UpdateMessageBody;

    if (
      typeof body.id !== "string" ||
      body.id.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Message ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.isRead !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "isRead must be a boolean.",
        },
        {
          status: 400,
        }
      );
    }

    const existingMessage =
      await prisma.message.findUnique({
        where: {
          id: body.id,
        },

        select: {
          id: true,
        },
      });

    if (!existingMessage) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedMessage =
      await prisma.message.update({
        where: {
          id: body.id,
        },

        data: {
          isRead: body.isRead,
        },

        select: {
          id: true,
          name: true,
          title: true,
          email: true,
          message: true,
          isRead: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error: unknown) {
    console.error(
      "UPDATE_MESSAGE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update message.",
      },
      {
        status: 500,
      }
    );
  }
}
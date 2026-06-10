import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = body.name?.toString().trim();
    const title = body.title?.toString().trim();
    const email = body.email?.toString().trim();
    const phone = body.phone?.toString().trim();
    const message = body.message?.toString().trim();

    if (!name || !title || !email || !message) {
      return NextResponse.json(
        { error: "Name, title, email, and message are required" },
        { status: 400 }
      );
    }

    const finalMessage = phone
      ? `رقم الهاتف: ${phone}\n\n${message}`
      : message;

    const createdMessage = await prisma.message.create({
      data: {
        name,
        title,
        email,
        message: finalMessage,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: createdMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_CONTACT_MESSAGE_ERROR", error);

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
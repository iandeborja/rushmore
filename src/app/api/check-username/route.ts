import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ available: false, error: "Username must be 3-20 characters" });
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, error: "Username can only contain letters, numbers, and underscores" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 });
  }
} 
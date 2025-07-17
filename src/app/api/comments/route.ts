import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { validateComment } from "@/utils/automod";

const prisma = new PrismaClient();

// POST - Add a comment to a rushmore
export async function POST(request: NextRequest) {
  try {
    let userEmail: string | undefined;
    const session = await getServerSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const { searchParams } = new URL(request.url);
      userEmail = searchParams.get("email") || undefined;
    }
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rushmoreId, content } = await request.json();
    if (!rushmoreId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Rushmore ID and comment content are required" },
        { status: 400 }
      );
    }

    // Automod validation
    const validation = validateComment(content);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Your comment contains inappropriate language. Please revise your comment.",
          bannedWords: validation.bannedWordsFound
        },
        { status: 400 }
      );
    }

    // Get or create current user
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      let userName = session?.user?.name || "mt. testmore";
      user = await prisma.user.create({ data: { email: userEmail, name: userName } });
    }

    // Verify rushmore exists
    const rushmore = await prisma.rushmore.findUnique({
      where: { id: rushmoreId },
    });
    if (!rushmore) {
      return NextResponse.json({ error: "Rushmore not found" }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        rushmoreId,
        content: validation.filteredContent.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

// GET - Get comments for a rushmore
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rushmoreId = searchParams.get("rushmoreId");
    if (!rushmoreId) {
      return NextResponse.json(
        { error: "Rushmore ID is required" },
        { status: 400 }
      );
    }

    // Verify rushmore exists
    const rushmore = await prisma.rushmore.findUnique({
      where: { id: rushmoreId },
    });
    if (!rushmore) {
      return NextResponse.json({ error: "Rushmore not found" }, { status: 404 });
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: { rushmoreId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error getting comments:", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
} 
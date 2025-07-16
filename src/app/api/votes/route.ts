import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rushmoreId, value } = await request.json();

    if (!rushmoreId || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: "Invalid rushmoreId or vote value" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already voted on this Rushmore
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_rushmoreId: {
          userId: user.id,
          rushmoreId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: {
          userId_rushmoreId: {
            userId: user.id,
            rushmoreId,
          },
        },
        data: {
          value,
        },
      });

      return NextResponse.json(updatedVote);
    } else {
      // Create new vote
      const newVote = await prisma.vote.create({
        data: {
          userId: user.id,
          rushmoreId,
          value,
        },
      });

      return NextResponse.json(newVote, { status: 201 });
    }
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Failed to vote" },
      { status: 500 }
    );
  }
} 
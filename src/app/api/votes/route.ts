import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    let userEmail: string | undefined;
    
    // Try to get session from NextAuth first
    const session = await getServerSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      // Fallback for mock sessions - get email from query params
      const { searchParams } = new URL(request.url);
      userEmail = searchParams.get("email") || undefined;
    }
    
    if (!userEmail) {
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
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If user doesn't exist, create one with name from session or 'idb'
    if (!user) {
      // Try to get name from session or query param
      let userName = session?.user?.name;
      if (!userName) {
        const { searchParams } = new URL(request.url);
        userName = searchParams.get("name") || "idb";
      }
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
        },
      });
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
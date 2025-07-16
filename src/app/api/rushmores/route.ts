import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// POST - Submit a new Rushmore
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { item1, item2, item3, item4, anonymousName } = await request.json();

    if (!item1 || !item2 || !item3 || !item4) {
      return NextResponse.json(
        { error: "All 4 items are required" },
        { status: 400 }
      );
    }

    // Get today's question
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "No question found for today" },
        { status: 404 }
      );
    }

    let user;
    let userId;

    if (session?.user?.email) {
      // Logged in user
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user already submitted for today
      const existingRushmore = await prisma.rushmore.findFirst({
        where: {
          userId: user.id,
          questionId: question.id,
        },
      });

      if (existingRushmore) {
        return NextResponse.json(
          { error: "You already submitted a Rushmore for today" },
          { status: 400 }
        );
      }

      userId = user.id;
    } else {
      // Anonymous user
      if (!anonymousName || anonymousName.trim().length < 2) {
        return NextResponse.json(
          { error: "Please provide a name (at least 2 characters)" },
          { status: 400 }
        );
      }

      // Create a temporary anonymous user
      user = await prisma.user.create({
        data: {
          name: anonymousName.trim(),
          email: `anonymous-${Date.now()}@rushmore.local`,
          hashedPassword: "anonymous",
        } as any,
      });

      userId = user.id;
    }

    // Create Rushmore
    const rushmore = await prisma.rushmore.create({
      data: {
        userId,
        questionId: question.id,
        item1,
        item2,
        item3,
        item4,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rushmore, { status: 201 });
  } catch (error) {
    console.error("Error creating Rushmore:", error);
    return NextResponse.json(
      { error: "Failed to create Rushmore" },
      { status: 500 }
    );
  }
}

// GET - Get all Rushmores for today
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!question) {
      return NextResponse.json([]);
    }

    const rushmores = await prisma.rushmore.findMany({
      where: {
        questionId: question.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate vote counts
    const rushmoresWithVotes = rushmores.map(rushmore => {
      const upvotes = rushmore.votes.filter(vote => vote.value === 1).length;
      const downvotes = rushmore.votes.filter(vote => vote.value === -1).length;
      const totalVotes = upvotes - downvotes;
      
      return {
        ...rushmore,
        voteCount: totalVotes,
        upvotes,
        downvotes,
      };
    });

    return NextResponse.json(rushmoresWithVotes);
  } catch (error) {
    console.error("Error getting Rushmores:", error);
    return NextResponse.json(
      { error: "Failed to get Rushmores" },
      { status: 500 }
    );
  }
} 
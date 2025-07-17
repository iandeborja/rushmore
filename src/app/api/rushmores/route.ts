import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { validateRushmoreSubmission } from "@/utils/automod";
import { updateUserStreak } from "@/utils/streaks";

const prisma = new PrismaClient();

// POST - Submit a new Rushmore
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { item1, item2, item3, item4, anonymousName } = await request.json();
    
    // Get user email from query params for mock sessions
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('email');

    console.log("API Debug - Session:", session);
    console.log("API Debug - User email from query:", userEmail);
    console.log("API Debug - Request body:", { item1, item2, item3, item4, anonymousName });

    if (!item1 || !item2 || !item3 || !item4) {
      return NextResponse.json(
        { error: "All 4 items are required" },
        { status: 400 }
      );
    }

    // Automod validation
    const validation = validateRushmoreSubmission([item1, item2, item3, item4]);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Your rushmore contains inappropriate language. Please revise your answers.",
          bannedWords: validation.bannedWordsFound
        },
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

    if (session?.user?.email || userEmail) {
      const email = session?.user?.email || userEmail!;
      console.log("API Debug - Processing logged in user:", email);
      // Logged in user
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If user doesn't exist, create one with name from session or 'idb'
      if (!user) {
        let userName = session?.user?.name || "mt. testmore";
        console.log("API Debug - Creating new user with name:", userName);
        user = await prisma.user.create({
          data: {
            email,
            name: userName,
          },
        });
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
      console.log("API Debug - Processing anonymous user");
      // Anonymous user
      if (!anonymousName || anonymousName.trim().length < 2) {
        console.log("API Debug - Anonymous name validation failed:", anonymousName);
        return NextResponse.json(
          { error: "Please provide a name (at least 2 characters)" },
          { status: 400 }
        );
      }

      // Create a temporary anonymous user
      try {
        user = await prisma.user.create({
          data: {
            name: anonymousName.trim(),
            email: `anonymous-${Date.now()}-${Math.random().toString(36).substring(2)}@rushmore.local`,
          },
        });
        console.log("API Debug - Created anonymous user:", user.id);
      } catch (createUserError) {
        console.error("API Debug - Error creating anonymous user:", createUserError);
        return NextResponse.json(
          { error: "Failed to create anonymous user" },
          { status: 500 }
        );
      }

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
        votes: true,
      },
    });

    // Update user streak and check for achievements
    let streakUpdate = null;
    let newAchievements: string[] = [];
    
    try {
      streakUpdate = await updateUserStreak(userId);
      newAchievements = streakUpdate.newAchievements;
    } catch (error) {
      console.error("Error updating streak:", error);
    }

    return NextResponse.json({
      ...rushmore,
      streakUpdate,
      newAchievements,
    }, { status: 201 });
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
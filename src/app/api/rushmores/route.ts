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

    // Create everything in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      let user;
      let userId;

      if (userEmail) {
        console.log("API Debug - Processing logged in user:", userEmail);
        // Logged in user
        // Find or create user
        console.log("API Debug - Looking for user with email:", userEmail);
        user = await tx.user.findUnique({
          where: { email: userEmail },
        });
        console.log("API Debug - User lookup result:", user ? `Found user ${user.id}` : "No user found");

        // If user doesn't exist, create one with name from session or 'idb'
        if (!user) {
          let userName = session?.user?.name || "mt. testmore";
          console.log("API Debug - Creating new user with name:", userName);
          try {
            user = await tx.user.create({
              data: {
                email: userEmail,
                name: userName,
              },
            });
            console.log("API Debug - Successfully created user:", user.id, user.email);
          } catch (userCreateError) {
            console.error("API Debug - Error creating user:", userCreateError);
            throw userCreateError;
          }
        } else {
          console.log("API Debug - Found existing user:", user.id, user.email);
        }

        // Check if user already submitted for today
        console.log("API Debug - Checking for existing rushmore for user:", user.id, "and question:", question.id);
        
        // Debug: Check all rushmores for this user
        const allUserRushmores = await tx.rushmore.findMany({
          where: { userId: user.id },
        });
        console.log("API Debug - All rushmores for user:", allUserRushmores.length, allUserRushmores.map(r => r.id));
        
        const existingRushmore = await tx.rushmore.findFirst({
          where: {
            userId: user.id,
            questionId: question.id,
          },
        });
        console.log("API Debug - Existing rushmore check result:", existingRushmore ? `Found rushmore ${existingRushmore.id}` : "No existing rushmore");

        if (existingRushmore) {
          console.log("API Debug - User already submitted for today");
          throw new Error("You already submitted a Rushmore for today");
        }

        userId = user.id;
      } else {
        console.log("API Debug - Processing anonymous user");
        // Anonymous user
        if (!anonymousName || anonymousName.trim().length < 2) {
          console.log("API Debug - Anonymous name validation failed:", anonymousName);
          throw new Error("Please provide a name (at least 2 characters)");
        }

        // Create a temporary anonymous user
        try {
          user = await tx.user.create({
            data: {
              name: anonymousName.trim(),
              email: `anonymous-${Date.now()}-${Math.random().toString(36).substring(2)}@rushmore.local`,
            },
          });
          console.log("API Debug - Created anonymous user:", user.id);
        } catch (createUserError) {
          console.error("API Debug - Error creating anonymous user:", createUserError);
          throw createUserError;
        }

        userId = user.id;
      }

      // Update user streak
      console.log("API Debug - Updating user streak for:", userId);
      await updateUserStreak(userId, tx);
      console.log("API Debug - User streak updated successfully");

      // Create Rushmore
      console.log("API Debug - Creating rushmore for user:", userId, "question:", question.id);
      const rushmore = await tx.rushmore.create({
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
              username: true,
            },
          },
          votes: true,
        },
      });
      console.log("API Debug - Successfully created rushmore:", rushmore.id);

      return rushmore;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API Debug - Transaction failed:", error);
    if (error instanceof Error) {
      if (error.message === "You already submitted a Rushmore for today") {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message === "Please provide a name (at least 2 characters)") {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create rushmore", details: error instanceof Error ? error.message : String(error) },
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
            username: true,
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
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { validateRushmoreSubmission } from "@/utils/automod";
import { updateUserStreak } from "@/utils/streaks";
import { prisma } from "@/lib/prisma";

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

    // Get today's question with timeout and retry
    let question;
    try {
      question = await Promise.race([
        prisma.question.findFirst({
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
            },
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]);
    } catch (dbError) {
      console.error("Error fetching question:", dbError);
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 500 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "No question found for today" },
        { status: 404 }
      );
    }

    // Create everything in a single transaction with retry
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        let user: any;
        let userId: string;

        if (userEmail) {
          console.log("API Debug - Processing logged in user:", userEmail);
          // Logged in user
          // Find or create user
          console.log("API Debug - Looking for user with email:", userEmail);
          user = await tx.user.findFirst({
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
          console.log("API Debug - All rushmores for user:", allUserRushmores.length, allUserRushmores.map((r: any) => r.id));
          
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
          if (!anonymousName || anonymousName.trim().length < 1) {
            console.log("API Debug - Anonymous name validation failed:", anonymousName);
            throw new Error("Please provide a name");
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
              },
            },
            votes: true,
          },
        });
        console.log("API Debug - Successfully created rushmore:", rushmore.id);

        return rushmore;
      });
    } catch (transactionError) {
      console.error("API Debug - Transaction failed:", transactionError);
      
      // Handle specific errors
      if (transactionError instanceof Error) {
        if (transactionError.message === "You already submitted a Rushmore for today") {
          return NextResponse.json(
            { error: transactionError.message },
            { status: 400 }
          );
        }
        if (transactionError.message === "Please provide a name") {
          return NextResponse.json(
            { error: transactionError.message },
            { status: 400 }
          );
        }
      }
      
      // Handle database connection errors
      if (transactionError instanceof Error && 
          (transactionError.message.includes('prepared statement') || 
           transactionError.message.includes('connection') ||
           transactionError.message.includes('timeout'))) {
        return NextResponse.json(
          { error: "Database connection error. Please try again." },
          { status: 500 }
        );
      }
      
      throw transactionError;
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API Debug - Request failed:", error);
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

    let question;
    try {
      question = await Promise.race([
        prisma.question.findFirst({
          where: {
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]);
    } catch (questionError) {
      console.error("Error fetching question:", questionError);
      // Return empty array if question fetch fails
      return NextResponse.json([]);
    }

    if (!question) {
      return NextResponse.json([]);
    }

    let rushmores: any[];
    try {
      rushmores = await Promise.race([
        prisma.rushmore.findMany({
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
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any[];
    } catch (rushmoreFetchError) {
      console.error("Error fetching rushmores:", rushmoreFetchError);
      // Return empty array if rushmore fetch fails
      return NextResponse.json([]);
    }

    // Calculate vote counts
    const rushmoresWithVotes = rushmores.map((rushmore: any) => {
      const upvotes = rushmore.votes?.filter((vote: any) => vote.value === 1).length || 0;
      const downvotes = rushmore.votes?.filter((vote: any) => vote.value === -1).length || 0;
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
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json([]);
  }
} 
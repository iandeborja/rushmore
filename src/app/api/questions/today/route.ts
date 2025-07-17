import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fallbackQuestions = [
  "best fast food menu items",
  "The worst buzzwords heard at an office",
  "Movies you have never seen",
  "Sports mascots",
  "Stadium Food", 
  "Places to pull over on a road trip",
  "Things you'd find in a teenager's room",
  "Worst first date stories",
  "Things that are overrated",
  "Best comfort foods",
  "Things that make you feel old",
  "Worst fashion trends",
  "Things you'd bring to a desert island",
  "Best pizza toppings",
  "Things that are underrated",
  "Things that make you say \"hell yea, it's summer\"",
  "Best movie sequels",
  "Worst superhero movies",
  "Things you'd find in a college dorm",
  "Best breakfast foods",
  "Things that are surprisingly expensive",
  "Worst airplane experiences",
  "Things you'd do if you won the lottery",
  "Best childhood snacks",
  "Things that make you instantly angry"
];

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's question from the database with timeout
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
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      // Return fallback question if database is unavailable
      return NextResponse.json({
        id: 'fallback',
        prompt: "best fast food menu items",
        date: today,
        createdAt: today,
        updatedAt: today
      });
    }

    if (!question) {
      // Create a fallback question if none exists
      console.log("No question found for today, creating fallback question");
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      
      try {
        const newQuestion = await prisma.question.create({
          data: {
            prompt: randomQuestion,
            date: today,
          },
        });

        console.log("✅ Created new question for today:", newQuestion.prompt);
        return NextResponse.json(newQuestion);
      } catch (createError) {
        console.error("Error creating fallback question:", createError);
        // Return a hardcoded question if database creation fails
        return NextResponse.json({
          id: 'fallback',
          prompt: "best fast food menu items",
          date: today,
          createdAt: today,
          updatedAt: today
        });
      }
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error getting today's question:", error);
    
    // Return fallback question instead of error
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return NextResponse.json({
      id: 'fallback',
      prompt: "best fast food menu items",
      date: today,
      createdAt: today,
      updatedAt: today
    });
  }
} 
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fallbackQuestions = [
  "best fast food menu items",
  "Things that make you feel old",
  "Best comfort foods",
  "Things that are overrated",
  "Best pizza toppings"
];

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's question from the database
    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!question) {
      // Create a fallback question if none exists
      console.log("No question found for today, creating fallback question");
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      
      const newQuestion = await prisma.question.create({
        data: {
          prompt: randomQuestion,
          date: today,
        },
      });

      return NextResponse.json(newQuestion);
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error getting today's question:", error);
    return NextResponse.json(
      { error: "Failed to get today's question" },
      { status: 500 }
    );
  }
} 
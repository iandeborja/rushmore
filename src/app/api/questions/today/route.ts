import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample questions for the MVP
const sampleQuestions = [
  "best fast food restaurant items",
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
  "Things that are underrated"
];

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find today's question
    let question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // If no question exists for today, create one
    if (!question) {
      const questionIndex = Math.floor(today.getTime() / (24 * 60 * 60 * 1000)) % sampleQuestions.length;
      const prompt = sampleQuestions[questionIndex];
      
      question = await prisma.question.create({
        data: {
          prompt,
          date: today,
        },
      });
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
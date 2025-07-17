import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample questions for the MVP
const sampleQuestions = [
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
  "Things that are underrated"
];

export async function GET() {
  try {
    // For now, just return a hardcoded question to get the app working
    const question = {
      id: "temp-id",
      prompt: "best fast food menu items",
      date: new Date(),
      createdAt: new Date()
    };

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error getting today's question:", error);
    return NextResponse.json(
      { error: "Failed to get today's question" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";

// Temporarily disabled to fix internal server error
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Moderation API temporarily disabled" }, { status: 503 });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Moderation API temporarily disabled" }, { status: 503 });
}
 
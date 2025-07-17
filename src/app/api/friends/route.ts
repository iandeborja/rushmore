import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// POST - Follow a user
export async function POST(request: NextRequest) {
  try {
    let userEmail: string | undefined;
    const session = await getServerSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const { searchParams } = new URL(request.url);
      userEmail = searchParams.get("email") || undefined;
    }
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { friendEmail } = await request.json();
    if (!friendEmail) {
      return NextResponse.json({ error: "Friend email is required" }, { status: 400 });
    }
    // Get or create current user
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      let userName = session?.user?.name || "mt. testmore";
      user = await prisma.user.create({ data: { email: userEmail, name: userName } });
    }
    // Get friend user
    const friend = await prisma.user.findUnique({ where: { email: friendEmail } });
    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Check if already following
    const existing = await prisma.friend.findUnique({
      where: { userId_friendId: { userId: user.id, friendId: friend.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already following this user" }, { status: 400 });
    }
    // Create friendship
    const friendship = await prisma.friend.create({
      data: { userId: user.id, friendId: friend.id },
      include: { friend: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });
  }
}

// DELETE - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    let userEmail: string | undefined;
    const session = await getServerSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const { searchParams } = new URL(request.url);
      userEmail = searchParams.get("email") || undefined;
    }
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const friendEmail = searchParams.get("friendEmail");
    if (!friendEmail) {
      return NextResponse.json({ error: "Friend email is required" }, { status: 400 });
    }
    // Get current user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Get friend user
    const friend = await prisma.user.findUnique({ where: { email: friendEmail } });
    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }
    // Delete friendship
    await prisma.friend.deleteMany({ where: { userId: user.id, friendId: friend.id } });
    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
  }
}

// GET - Get user's friends
export async function GET(request: NextRequest) {
  try {
    let userEmail: string | undefined;
    const session = await getServerSession();
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const { searchParams } = new URL(request.url);
      userEmail = searchParams.get("email") || undefined;
    }
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get current user
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Get user's friends
    const friendships = await prisma.friend.findMany({
      where: { userId: user.id },
      include: { friend: { select: { id: true, name: true, email: true } } },
    });
    const friends = friendships.map(f => f.friend);
    return NextResponse.json(friends);
  } catch (error) {
    console.error("Error getting friends:", error);
    return NextResponse.json({ error: "Failed to get friends" }, { status: 500 });
  }
} 
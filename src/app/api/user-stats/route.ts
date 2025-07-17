import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserStats } from "@/utils/streaks";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const stats = await getUserStats(user.id);
    
    // Find best rushmore
    const rushmores = await prisma.rushmore.findMany({
      where: { userId: user.id },
      include: { votes: true },
      orderBy: { createdAt: "desc" },
    });

    let bestRushmore = null;
    let maxUpvotes = -1;
    for (const r of rushmores) {
      const upvotes = r.votes.filter(v => v.value === 1).length;
      if (upvotes > maxUpvotes) {
        maxUpvotes = upvotes;
        bestRushmore = {
          id: r.id,
          item1: r.item1,
          item2: r.item2,
          item3: r.item3,
          item4: r.item4,
          upvotes,
        };
      }
    }

    return NextResponse.json({
      ...stats,
      bestRushmore,
      lastPlayed: stats.lastPlayedDate?.toISOString().slice(0, 10) || null,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    return NextResponse.json({ error: "Failed to get user stats" }, { status: 500 });
  }
} 
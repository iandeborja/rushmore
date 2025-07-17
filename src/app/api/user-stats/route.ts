import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      rushmores: {
        include: { votes: true },
        orderBy: { createdAt: "desc" },
      },
      votes: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalRushmores = user.rushmores.length;
  const totalVotes = user.votes.length;
  const totalUpvotes = user.rushmores.reduce((sum, r) => sum + r.votes.filter(v => v.value === 1).length, 0);
  const daysPlayed = new Set(user.rushmores.map(r => r.createdAt.toISOString().slice(0, 10))).size;
  const lastPlayed = user.rushmores[0]?.createdAt.toISOString().slice(0, 10) || null;
  let bestRushmore = null;
  let maxUpvotes = -1;
  for (const r of user.rushmores) {
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
    totalRushmores,
    totalVotes,
    totalUpvotes,
    daysPlayed,
    lastPlayed,
    bestRushmore,
  });
} 
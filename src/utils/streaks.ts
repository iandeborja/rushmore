import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date;
  totalDaysPlayed: number;
  newAchievements: string[];
}

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function updateUserStreak(userId: string, tx?: TransactionClient): Promise<StreakUpdate> {
  const db = tx || prisma;
  
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: {
          achievement: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastPlayed = user.lastPlayedDate;
  const lastPlayedDate = lastPlayed ? new Date(lastPlayed) : null;
  lastPlayedDate?.setHours(0, 0, 0, 0);

  let newCurrentStreak = user.currentStreak;
  let newTotalDaysPlayed = user.totalDaysPlayed;

  // If this is the first time playing or a new day
  if (!lastPlayedDate || lastPlayedDate.getTime() !== today.getTime()) {
    // Check if it's consecutive (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastPlayedDate || lastPlayedDate.getTime() !== yesterday.getTime()) {
      // Streak broken, reset to 1
      newCurrentStreak = 1;
    } else {
      // Consecutive day, increment streak
      newCurrentStreak = user.currentStreak + 1;
    }

    newTotalDaysPlayed = user.totalDaysPlayed + 1;
  }

  const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

  // Update user
  await db.user.update({
    where: { id: userId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastPlayedDate: today,
      totalDaysPlayed: newTotalDaysPlayed,
    }
  });

  // Check for new achievements
  const newAchievements = await checkAndAwardAchievements(userId, {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    totalDaysPlayed: newTotalDaysPlayed,
  });

  return {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastPlayedDate: today,
    totalDaysPlayed: newTotalDaysPlayed,
    newAchievements,
  };
}

async function checkAndAwardAchievements(userId: string, stats: {
  currentStreak: number;
  longestStreak: number;
  totalDaysPlayed: number;
}): Promise<string[]> {
  const newAchievements: string[] = [];

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();
  
  // Get user's current achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true }
  });

  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

  for (const achievement of allAchievements) {
    if (unlockedAchievementIds.has(achievement.id)) {
      continue; // Already unlocked
    }

    let shouldAward = false;

    switch (achievement.name) {
      case "First Steps":
        shouldAward = stats.totalDaysPlayed >= 1;
        break;
      case "Week Warrior":
        shouldAward = stats.currentStreak >= 7;
        break;
      case "Fortnight Fighter":
        shouldAward = stats.currentStreak >= 14;
        break;
      case "Monthly Master":
        shouldAward = stats.currentStreak >= 30;
        break;
      case "Century Club":
        shouldAward = stats.totalDaysPlayed >= 100;
        break;
      // Add more achievement checks as needed
    }

    if (shouldAward) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: achievement.requirement,
        }
      });
      newAchievements.push(achievement.name);
    }
  }

  return newAchievements;
}

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: {
          achievement: true
        }
      },
      rushmores: {
        include: {
          votes: true
        }
      },
      votes: true,
      friends: true,
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate total upvotes received
  const totalUpvotes = user.rushmores.reduce((total, rushmore) => {
    return total + rushmore.votes.filter(vote => vote.value === 1).length;
  }, 0);

  // Calculate total votes cast
  const totalVotesCast = user.votes.length;

  // Calculate total friends
  const totalFriends = user.friends.length;

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalDaysPlayed: user.totalDaysPlayed,
    lastPlayedDate: user.lastPlayedDate,
    totalRushmores: user.rushmores.length,
    totalUpvotes,
    totalVotesCast,
    totalFriends,
    achievements: user.achievements.map(ua => ({
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      unlockedAt: ua.unlockedAt,
    })),
  };
} 
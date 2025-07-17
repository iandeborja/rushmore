import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // Streak achievements
  {
    name: "First Steps",
    description: "Submit your first rushmore",
    icon: "◆",
    category: "milestone",
    requirement: 1
  },
  {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streak",
    requirement: 7
  },
  {
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    icon: "⚡",
    category: "streak",
    requirement: 14
  },
  {
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "👑",
    category: "streak",
    requirement: 30
  },
  {
    name: "Century Club",
    description: "Submit 100 rushmores",
    icon: "💎",
    category: "milestone",
    requirement: 100
  },
  
  // Social achievements
  {
    name: "Social Butterfly",
    description: "Follow 10 friends",
    icon: "🦋",
    category: "social",
    requirement: 10
  },
  {
    name: "Popular",
    description: "Receive 50 total upvotes",
    icon: "⭐",
    category: "social",
    requirement: 50
  },
  {
    name: "Viral",
    description: "Receive 100 total upvotes",
    icon: "🌟",
    category: "social",
    requirement: 100
  },
  {
    name: "Influencer",
    description: "Receive 500 total upvotes",
    icon: "🏆",
    category: "social",
    requirement: 500
  },
  
  // Voting achievements
  {
    name: "Active Voter",
    description: "Cast 50 votes",
    icon: "🗳️",
    category: "voting",
    requirement: 50
  },
  {
    name: "Democracy Defender",
    description: "Cast 100 votes",
    icon: "🏛️",
    category: "voting",
    requirement: 100
  },
  
  // Special achievements
  {
    name: "Early Bird",
    description: "Submit a rushmore before 9 AM",
    icon: "🌅",
    category: "special",
    requirement: 1
  },
  {
    name: "Night Owl",
    description: "Submit a rushmore after 11 PM",
    icon: "🦉",
    category: "special",
    requirement: 1
  },
  {
    name: "Weekend Warrior",
    description: "Submit rushmores on 5 consecutive weekends",
    icon: "🎉",
    category: "special",
    requirement: 5
  }
];

async function seedAchievements() {
  try {
    console.log('Seeding achievements...');
    
    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement,
      });
    }
    
    console.log('✅ Achievements seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAchievements(); 
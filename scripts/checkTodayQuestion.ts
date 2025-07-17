import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTodayQuestion() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (question) {
      console.log(`✅ Today's question: "${question.prompt}"`);
      console.log(`   Date: ${question.date.toDateString()}`);
      console.log(`   ID: ${question.id}`);
    } else {
      console.log('❌ No question found for today');
    }
  } catch (error) {
    console.error('❌ Error checking today\'s question:', error);
  }
}

checkTodayQuestion();

// Close database connection
prisma.$disconnect(); 
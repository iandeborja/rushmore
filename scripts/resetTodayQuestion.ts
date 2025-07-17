import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetTodayQuestion() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update today's question to the new prompt
    const updatedQuestion = await prisma.question.updateMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      data: {
        prompt: 'best fast food restaurant items',
      },
    });

    console.log(`Updated ${updatedQuestion.count} question(s) for today`);
    console.log('Today\'s question is now "best fast food restaurant items"');
  } catch (error) {
    console.error('Error updating today\'s question:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTodayQuestion(); 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetTodayRushmores() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const question = await prisma.question.findFirst({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (!question) {
    console.log("No question found for today.");
    return;
  }

  // Delete votes for today's rushmores
  await prisma.vote.deleteMany({
    where: {
      rushmore: {
        questionId: question.id,
      },
    },
  });

  // Delete today's rushmores
  await prisma.rushmore.deleteMany({
    where: {
      questionId: question.id,
    },
  });

  console.log("Today's rushmores and votes have been reset.");
}

resetTodayRushmores().then(() => prisma.$disconnect()); 
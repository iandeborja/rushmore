import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetTodayRushmores() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's question
    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!question) {
      console.log('No question found for today.');
      return;
    }

    // Find all rushmore IDs for today's question
    const rushmores = await prisma.rushmore.findMany({
      where: { questionId: question.id },
      select: { id: true },
    });
    const rushmoreIds = rushmores.map(r => r.id);

    if (rushmoreIds.length === 0) {
      console.log('No rushmores to delete for today.');
      return;
    }

    // Delete votes, comments, and reports for these rushmores
    await prisma.vote.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });
    await prisma.comment.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });
    await prisma.report.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });

    // Now delete the rushmores
    const deleted = await prisma.rushmore.deleteMany({
      where: { id: { in: rushmoreIds } },
    });

    console.log(`Deleted ${deleted.count} rushmores (and related votes/comments/reports) for today's question.`);
  } catch (error) {
    console.error('Error resetting today\'s rushmores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTodayRushmores(); 
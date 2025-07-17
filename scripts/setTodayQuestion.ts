import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setTodayQuestion() {
  const question = process.argv[2];
  
  if (!question) {
    console.error('Please provide a question!');
    console.log('Usage: npx tsx scripts/setTodayQuestion.ts "your question here"');
    process.exit(1);
  }
  
  console.log(`Setting today's question to: "${question}"`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Delete any existing questions for today
  await prisma.question.deleteMany({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Create today's question
  const newQuestion = await prisma.question.create({
    data: {
      prompt: question,
      date: today,
    },
  });
  
  console.log('✅ Question set successfully!');
  console.log('Question:', newQuestion);
}

setTodayQuestion()
  .catch((e) => {
    console.error('Error setting question:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
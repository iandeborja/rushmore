import { PrismaClient } from '@prisma/client';

// Production DATABASE_URL
const PRODUCTION_DATABASE_URL = "postgres://43e31216aa91f43072028dab3ed09c6f12f7a9e634da4ae782566a45003770b9:sk_9EArbQv3eGqLE9rLHvrTA@db.prisma.io:5432/?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL,
    },
  },
});

async function setQuestionForDate(question: string, targetDate: Date) {
  targetDate.setHours(0, 0, 0, 0);
  
  try {
    // Check if question already exists for this date
    const existingQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (existingQuestion) {
      // Update existing question
      const updatedQuestion = await prisma.question.update({
        where: { id: existingQuestion.id },
        data: { prompt: question },
      });
      console.log(`✅ Updated question for ${targetDate.toDateString()}: "${updatedQuestion.prompt}"`);
    } else {
      // Create new question
      const newQuestion = await prisma.question.create({
        data: {
          prompt: question,
          date: targetDate,
        },
      });
      console.log(`✅ Set question for ${targetDate.toDateString()}: "${newQuestion.prompt}"`);
    }
  } catch (error) {
    console.error(`❌ Error setting question for ${targetDate.toDateString()}:`, error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx tsx scripts/setSpecificQuestions.ts "YYYY-MM-DD" "Question" [date2] [question2] ...');
  console.error('Examples:');
  console.error('  npx tsx scripts/setSpecificQuestions.ts "2025-01-20" "Best holiday traditions"');
  console.error('  npx tsx scripts/setSpecificQuestions.ts "2025-01-20" "Best holiday traditions" "2025-01-21" "Worst winter activities"');
  process.exit(1);
}

async function main() {
  // Process arguments in pairs (date, question)
  for (let i = 0; i < args.length; i += 2) {
    if (i + 1 >= args.length) {
      console.error('❌ Odd number of arguments. Each date needs a corresponding question.');
      process.exit(1);
    }
    
    const dateStr = args[i];
    const question = args[i + 1];
    
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      console.error(`❌ Invalid date format: ${dateStr}. Use YYYY-MM-DD format.`);
      process.exit(1);
    }
    
    await setQuestionForDate(question, targetDate);
  }
  
  console.log('🎉 Finished setting all questions!');
  
  // Close database connection
  await prisma.$disconnect();
}

main().catch(console.error); 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setTodayQuestion(question: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Check if question already exists for today
    const existingQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (existingQuestion) {
      // Update existing question
      const updatedQuestion = await prisma.question.update({
        where: { id: existingQuestion.id },
        data: { prompt: question },
      });
      console.log(`✅ Updated today's question: "${updatedQuestion.prompt}"`);
    } else {
      // Create new question
      const newQuestion = await prisma.question.create({
        data: {
          prompt: question,
          date: today,
        },
      });
      console.log(`✅ Set today's question: "${newQuestion.prompt}"`);
    }
  } catch (error) {
    console.error('❌ Error setting today\'s question:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run set-today-question "Your question here"');
  console.error('Example: npm run set-today-question "Best ice cream flavors"');
  process.exit(1);
}

const question = args.join(' '); // Join all arguments in case question has spaces
setTodayQuestion(question);

// Close database connection
prisma.$disconnect(); 
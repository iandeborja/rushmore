import { PrismaClient } from '@prisma/client';
import { questions } from './questions';

const prisma = new PrismaClient();

async function setMultipleQuestions(startDate: Date, numDays: number) {
  console.log(`Setting questions for ${numDays} days starting from ${startDate.toDateString()}`);
  
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);
    
    const questionIndex = i % questions.length;
    const question = questions[questionIndex];
    
    try {
      // Check if question already exists for this date
      const existingQuestion = await prisma.question.findFirst({
        where: {
          date: {
            gte: currentDate,
            lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });
      
      if (existingQuestion) {
        console.log(`✅ Question already exists for ${currentDate.toDateString()}: "${existingQuestion.prompt}"`);
        continue;
      }
      
      // Create new question
      const newQuestion = await prisma.question.create({
        data: {
          prompt: question,
          date: currentDate,
        },
      });
      
      console.log(`✅ Set question for ${currentDate.toDateString()}: "${newQuestion.prompt}"`);
    } catch (error) {
      console.error(`❌ Error setting question for ${currentDate.toDateString()}:`, error);
    }
  }
  
  console.log('🎉 Finished setting questions!');
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // Default: Set questions for the next 30 days starting from tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  setMultipleQuestions(tomorrow, 30);
} else if (args.length === 1) {
  // Set questions for specified number of days starting from tomorrow
  const numDays = parseInt(args[0]);
  if (isNaN(numDays)) {
    console.error('Please provide a valid number of days');
    process.exit(1);
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  setMultipleQuestions(tomorrow, numDays);
} else if (args.length === 2) {
  // Set questions for specified number of days starting from specified date
  const startDate = new Date(args[0]);
  const numDays = parseInt(args[1]);
  
  if (isNaN(startDate.getTime()) || isNaN(numDays)) {
    console.error('Usage: npm run set-multiple-questions [startDate] [numDays]');
    console.error('Example: npm run set-multiple-questions "2025-07-18" 30');
    process.exit(1);
  }
  
  setMultipleQuestions(startDate, numDays);
} else {
  console.error('Usage: npm run set-multiple-questions [startDate] [numDays]');
  console.error('Examples:');
  console.error('  npm run set-multiple-questions                    # Set next 30 days');
  console.error('  npm run set-multiple-questions 14                 # Set next 14 days');
  console.error('  npm run set-multiple-questions "2025-07-18" 30   # Set 30 days from July 18');
  process.exit(1);
}

// Close database connection
prisma.$disconnect(); 
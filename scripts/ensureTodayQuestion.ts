import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleQuestions = [
  "best fast food menu items",
  "The worst buzzwords heard at an office",
  "Movies you have never seen",
  "Sports mascots",
  "Stadium Food", 
  "Places to pull over on a road trip",
  "Things you'd find in a teenager's room",
  "Worst first date stories",
  "Things that are overrated",
  "Best comfort foods",
  "Things that make you feel old",
  "Worst fashion trends",
  "Things you'd bring to a desert island",
  "Best pizza toppings",
  "Things that are underrated",
  "Things that make you say \"hell yea, it's summer\"",
  "Best movie sequels",
  "Worst superhero movies",
  "Things you'd find in a college dorm",
  "Best breakfast foods",
  "Things that are surprisingly expensive",
  "Worst airplane experiences",
  "Things you'd do if you won the lottery",
  "Best childhood snacks",
  "Things that make you instantly angry"
];

async function ensureTodayQuestion() {
  try {
    console.log('Checking for today\'s question...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a question for today
    const existingQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingQuestion) {
      console.log('✅ Today\'s question already exists:', existingQuestion.prompt);
      return {
        success: true,
        question: existingQuestion.prompt,
        created: false
      };
    }

    // Create a new question for today
    const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    
    const newQuestion = await prisma.question.create({
      data: {
        prompt: randomQuestion,
        date: today,
      },
    });

    console.log('✅ Created new question for today:', newQuestion.prompt);
    
    return {
      success: true,
      question: newQuestion.prompt,
      created: true
    };
  } catch (error) {
    console.error('❌ Error ensuring today\'s question:', error);
    
    // Check if this is a database connection error
    if (error instanceof Error && (
      error.message.includes('Can\'t reach database server') ||
      error.message.includes('database server is running') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    )) {
      console.log('⚠️  Database connection failed during build - this is expected during deployment');
      console.log('⚠️  The question will be created at runtime when the application starts');
      return {
        success: false,
        question: null,
        created: false,
        reason: 'database_connection_failed'
      };
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  ensureTodayQuestion()
    .then((result) => {
      console.log('Result:', result);
      // Don't exit with error code if database connection failed during build
      if (result.reason === 'database_connection_failed') {
        process.exit(0);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to ensure today\'s question:', error);
      process.exit(1);
    });
}

export { ensureTodayQuestion }; 
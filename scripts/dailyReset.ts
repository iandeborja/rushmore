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
  "Best road trip snacks",
  "Things that make you feel nostalgic",
  "Best late night foods",
  "Things that are overpriced"
];

async function dailyReset() {
  try {
    console.log('Starting daily reset...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let deletedCount = 0;

    // Find today's question
    const currentQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (currentQuestion) {
      console.log('Found current question:', currentQuestion.prompt);
      
      // Find all rushmore IDs for today's question
      const rushmores = await prisma.rushmore.findMany({
        where: { questionId: currentQuestion.id },
        select: { id: true },
      });
      const rushmoreIds = rushmores.map(r => r.id);
      deletedCount = rushmores.length;

      if (rushmoreIds.length > 0) {
        console.log(`Deleting ${rushmoreIds.length} rushmores and related data...`);
        
        // Delete votes, comments, and reports for these rushmores
        await prisma.vote.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });
        // Note: Uncomment these lines when comment and report models are implemented
        // await prisma.comment.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });
        // await prisma.report.deleteMany({ where: { rushmoreId: { in: rushmoreIds } } });

        // Delete the rushmores
        await prisma.rushmore.deleteMany({
          where: { id: { in: rushmoreIds } },
        });
        
        console.log('✅ Successfully deleted all rushmores and related data');
      } else {
        console.log('No rushmores to delete');
      }

      // Delete the old question
      await prisma.question.delete({
        where: { id: currentQuestion.id }
      });
      console.log('✅ Deleted old question');
    }

    // Create new question for today
    const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    
    const newQuestion = await prisma.question.create({
      data: {
        prompt: randomQuestion,
        date: today,
      },
    });

    console.log('✅ Created new question:', newQuestion.prompt);
    console.log('Daily reset completed successfully!');
    
    return {
      success: true,
      newQuestion: newQuestion.prompt,
      rushmoresDeleted: deletedCount
    };
    
  } catch (error) {
    console.error('Error during daily reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly
if (require.main === module) {
  dailyReset()
    .then((result) => {
      console.log('Reset result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reset failed:', error);
      process.exit(1);
    });
}

export { dailyReset }; 
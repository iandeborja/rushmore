import { PrismaClient } from '@prisma/client'

// Production DATABASE_URL
const PRODUCTION_DATABASE_URL = "postgres://43e31216aa91f43072028dab3ed09c6f12f7a9e634da4ae782566a45003770b9:sk_9EArbQv3eGqLE9rLHvrTA@db.prisma.io:5432/?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL,
    },
  },
})

async function cleanupProductionQuestions() {
  try {
    console.log('Cleaning up production questions...')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Delete all questions for today
    const deletedQuestions = await prisma.question.deleteMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log(`Deleted ${deletedQuestions.count} questions for today`)
    
    // Create the correct question for today
    const newQuestion = await prisma.question.create({
      data: {
        prompt: "things that make you say 'hell yea, it's summer'",
        date: today
      }
    })
    
    console.log('Created correct question for today:', newQuestion.prompt)
    
    // Verify
    const todayQuestions = await prisma.question.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log(`\n✅ Cleanup complete! Found ${todayQuestions.length} questions for today:`)
    todayQuestions.forEach((q, i) => {
      console.log(`${i + 1}. "${q.prompt}"`)
    })
    
    console.log('\nThe production site should now show the correct question.')
    console.log('If it still shows the wrong question, try:')
    console.log('1. Wait 2-3 minutes for Vercel deployment to complete')
    console.log('2. Hard refresh your browser (Ctrl+F5)')
    console.log('3. Clear browser cache')
    
  } catch (error) {
    console.error('Error cleaning up production questions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupProductionQuestions() 
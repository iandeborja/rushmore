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

async function forceUpdateQuestion() {
  try {
    console.log('Force updating question for production...')
    
    // Delete ALL questions to start fresh
    const deletedCount = await prisma.question.deleteMany({})
    console.log(`Deleted ${deletedCount.count} questions from database`)
    
    // Create the correct question with a very specific date
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
    
    const newQuestion = await prisma.question.create({
      data: {
        prompt: "things that make you say 'hell yea, it's summer'",
        date: today
      }
    })
    
    console.log('Created new question:', newQuestion.prompt)
    console.log('Question date:', newQuestion.date.toISOString())
    
    // Verify the question exists
    const verifyQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log('\n✅ Verification:')
    console.log('Question found:', verifyQuestion ? `"${verifyQuestion.prompt}"` : 'No question found')
    
    if (verifyQuestion) {
      console.log('Question date:', verifyQuestion.date.toISOString())
    }
    
    console.log('\nThe production site should now show the correct question.')
    console.log('If it still shows the wrong question, the production environment')
    console.log('is using a different database or has different environment variables.')
    
  } catch (error) {
    console.error('Error force updating question:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceUpdateQuestion() 
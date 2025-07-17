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

async function forceProductionDeploy() {
  try {
    console.log('Forcing production deployment refresh...')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get today's question
    const question = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    if (question) {
      console.log(`Found existing question: "${question.prompt}"`)
      
      // Delete the existing question to force a complete refresh
      await prisma.question.delete({
        where: { id: question.id }
      })
      console.log('Deleted existing question')
    }
    
    // Create a new question with the correct prompt
    const newQuestion = await prisma.question.create({
      data: {
        prompt: "things that make you say 'hell yea, it's summer'",
        date: today
      }
    })
    console.log('Created new question with correct prompt')
    
    // Verify the update
    const updatedQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log('\n✅ Production deployment refresh completed!')
    console.log(`- Today's question: "${updatedQuestion?.prompt}"`)
    console.log('\nThe production site should now show the updated question.')
    console.log('If it still shows the old question, the issue might be:')
    console.log('1. Vercel deployment cache - try redeploying')
    console.log('2. CDN cache - wait 5-10 minutes')
    console.log('3. Browser cache - hard refresh (Ctrl+F5)')
    
  } catch (error) {
    console.error('Error forcing production deployment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceProductionDeploy() 
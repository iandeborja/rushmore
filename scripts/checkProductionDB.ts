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

async function checkProductionDB() {
  try {
    console.log('Checking production database connection...')
    
    // Test basic connection
    const testResult = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful:', testResult)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    console.log('\nChecking questions for today:', today.toISOString())
    
    // Get all questions for today
    const questions = await prisma.question.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${questions.length} questions for today:`)
    questions.forEach((q, i) => {
      console.log(`${i + 1}. "${q.prompt}" (created: ${q.createdAt.toISOString()})`)
    })
    
    // Check if there are any questions at all
    const totalQuestions = await prisma.question.count()
    console.log(`\nTotal questions in database: ${totalQuestions}`)
    
    // Get the most recent questions
    const recentQuestions = await prisma.question.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log('\nMost recent questions:')
    recentQuestions.forEach((q, i) => {
      console.log(`${i + 1}. "${q.prompt}" (${q.date.toISOString()})`)
    })
    
  } catch (error) {
    console.error('❌ Error checking production database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionDB() 
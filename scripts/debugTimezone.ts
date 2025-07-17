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

async function debugTimezone() {
  try {
    console.log('Debugging timezone issues...')
    
    // Show current time in different formats
    const now = new Date()
    console.log('\nCurrent time (local):', now.toString())
    console.log('Current time (ISO):', now.toISOString())
    console.log('Current time (UTC):', now.toUTCString())
    
    // Show today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('\nToday range (local):', today.toString(), 'to', tomorrow.toString())
    console.log('Today range (ISO):', today.toISOString(), 'to', tomorrow.toISOString())
    
    // Get all questions and their dates
    const allQuestions = await prisma.question.findMany({
      orderBy: {
        date: 'desc'
      }
    })
    
    console.log('\nAll questions in database:')
    allQuestions.forEach((q, i) => {
      const isToday = q.date >= today && q.date < tomorrow
      console.log(`${i + 1}. "${q.prompt}"`)
      console.log(`   Date: ${q.date.toString()} (ISO: ${q.date.toISOString()})`)
      console.log(`   Is today: ${isToday}`)
      console.log('')
    })
    
    // Test the exact query that the API uses
    console.log('\nTesting API query...')
    const apiQueryResult = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })
    
    console.log('API query result:', apiQueryResult ? `"${apiQueryResult.prompt}"` : 'No question found')
    
    // Test with a broader range to see if there are timezone issues
    console.log('\nTesting with broader date range...')
    const broaderStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const broaderEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
    
    const broaderResults = await prisma.question.findMany({
      where: {
        date: {
          gte: broaderStart,
          lt: broaderEnd,
        },
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    console.log(`Found ${broaderResults.length} questions in broader range:`)
    broaderResults.forEach((q, i) => {
      console.log(`${i + 1}. "${q.prompt}" (${q.date.toISOString()})`)
    })
    
  } catch (error) {
    console.error('Error debugging timezone:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugTimezone() 
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

async function fixProduction() {
  try {
    console.log('Starting production database fix...')
    
    // First, let's see what we have
    const rushmoreCount = await prisma.rushmore.count()
    console.log(`Found ${rushmoreCount} rushmores`)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log(`Current question: "${existingQuestion?.prompt}"`)
    
    // Clear all rushmores, votes, and comments
    if (rushmoreCount > 0) {
      console.log('\nClearing rushmores...')
      
      // Delete votes first
      const voteCount = await prisma.vote.count()
      if (voteCount > 0) {
        await prisma.vote.deleteMany()
        console.log(`Deleted ${voteCount} votes`)
      }
      
      // Delete comments first
      const commentCount = await prisma.comment.count()
      if (commentCount > 0) {
        await prisma.comment.deleteMany()
        console.log(`Deleted ${commentCount} comments`)
      }
      
      // Delete rushmores
      await prisma.rushmore.deleteMany()
      console.log(`Deleted ${rushmoreCount} rushmores`)
    }
    
    // Update today's question
    console.log('\nUpdating today\'s question...')
    
    if (existingQuestion) {
      await prisma.question.update({
        where: { id: existingQuestion.id },
        data: {
          prompt: "things that make you say 'hell yea, it's summer'"
        }
      })
      console.log('Updated existing question')
    } else {
      await prisma.question.create({
        data: {
          prompt: "things that make you say 'hell yea, it's summer'",
          date: today
        }
      })
      console.log('Created new question')
    }
    
    // Verify the fix
    const finalRushmoreCount = await prisma.rushmore.count()
    const finalVoteCount = await prisma.vote.count()
    const finalCommentCount = await prisma.comment.count()
    
    const updatedQuestion = await prisma.question.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })
    
    console.log('\n✅ Production database fixed!')
    console.log(`- Rushmores: ${finalRushmoreCount}`)
    console.log(`- Votes: ${finalVoteCount}`)
    console.log(`- Comments: ${finalCommentCount}`)
    console.log(`- Today's question: "${updatedQuestion?.prompt}"`)
    
  } catch (error) {
    console.error('Error fixing production:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProduction() 
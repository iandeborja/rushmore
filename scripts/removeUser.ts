import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeUser(email: string) {
  try {
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`User with email ${email} not found`)
      return
    }

    console.log(`Found user: ${user.username || user.name || 'No name'} (${user.email})`)

    // Remove user's related data first (to avoid foreign key constraints)
    // Remove user achievements
    await prisma.userAchievement.deleteMany({
      where: { userId: user.id }
    })

    // Remove votes
    await prisma.vote.deleteMany({
      where: { userId: user.id }
    })

    // Remove comments
    await prisma.comment.deleteMany({
      where: { userId: user.id }
    })

    // Remove reports (both made by and against the user)
    await prisma.report.deleteMany({
      where: {
        OR: [
          { reporterId: user.id },
          { reviewerId: user.id }
        ]
      }
    })

    // Remove rushmores (this will cascade to votes, comments, and reports on rushmores)
    await prisma.rushmore.deleteMany({
      where: { userId: user.id }
    })

    // Remove friend relationships
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id }
        ]
      }
    })

    // Finally, remove the user
    await prisma.user.delete({
      where: { email }
    })

    console.log(`Successfully removed user ${email} and all related data`)
  } catch (error) {
    console.error('Error removing user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('Please provide an email address')
  console.error('Usage: npx tsx scripts/removeUser.ts <email>')
  process.exit(1)
}

removeUser(email) 
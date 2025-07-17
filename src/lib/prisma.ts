import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Validate DATABASE_URL in production
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production')
  }

  // Add connection string parameters for pooled connections
  let databaseUrl = process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'production' && databaseUrl) {
    // Add connection pooling parameters
    const url = new URL(databaseUrl);
    url.searchParams.set('connection_limit', '1');
    url.searchParams.set('pool_timeout', '20');
    databaseUrl = url.toString();
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  // Add error handling for connection issues
  client.$connect().catch((error) => {
    console.error('Failed to connect to database:', error)
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add connection cleanup for production
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
} 
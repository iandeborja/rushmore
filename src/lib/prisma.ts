import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // Validate DATABASE_URL in production
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production')
  }

  // For development, use a simple connection without pooling
  let databaseUrl = process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'development' && databaseUrl) {
    const url = new URL(databaseUrl);
    // Remove any existing pooling parameters
    url.searchParams.delete('connection_limit');
    url.searchParams.delete('pool_timeout');
    url.searchParams.delete('pgBouncer');
    // Add direct connection parameters
    url.searchParams.set('direct', 'true');
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
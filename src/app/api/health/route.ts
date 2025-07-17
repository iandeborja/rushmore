import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection with timeout
    const dbTest = await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ]);
    
    // Get environment info (without sensitive data)
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      environment: envInfo,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    // Provide more specific error information
    let errorMessage = "Unknown error";
    let errorType = "unknown";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("prepared statement")) {
        errorType = "connection_pooling";
      } else if (error.message.includes("timeout")) {
        errorType = "connection_timeout";
      } else if (error.message.includes("DATABASE_URL")) {
        errorType = "missing_env";
      }
    }
    
    return NextResponse.json(
      {
        status: "unhealthy",
        error: errorMessage,
        errorType,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 
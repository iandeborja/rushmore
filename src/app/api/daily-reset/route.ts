import { NextResponse } from "next/server";
import { dailyReset } from "../../../../scripts/dailyReset";

export async function POST() {
  try {
    console.log('Daily reset triggered via API');
    const result = await dailyReset();
    
    return NextResponse.json({
      success: true,
      message: 'Daily reset completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Daily reset failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Daily reset failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
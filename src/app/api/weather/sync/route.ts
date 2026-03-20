import { NextResponse } from 'next/server';
import { syncWeatherData } from '@/lib/weather-service';

export async function GET() {
  try {
    const result = await syncWeatherData();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Support POST as well if needed
export async function POST() {
  return GET();
}

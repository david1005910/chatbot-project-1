import { NextRequest, NextResponse } from 'next/server';
import { trendRequestSchema } from '@/lib/validation';
import { fetchNaverTrend } from '@/lib/naver-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = trendRequestSchema.parse(body);
    const result = await fetchNaverTrend(validated);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

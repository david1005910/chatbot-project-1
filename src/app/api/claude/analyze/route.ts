import { NextRequest, NextResponse } from 'next/server';
import { claudeAnalyzeSchema } from '@/lib/validation';
import { analyzeWithClaude } from '@/lib/claude-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = claudeAnalyzeSchema.parse(body);
    const result = await analyzeWithClaude(validated);

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

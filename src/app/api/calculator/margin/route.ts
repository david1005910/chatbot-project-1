import { NextRequest, NextResponse } from 'next/server';
import { marginCalculatorSchema } from '@/lib/validation';
import { calculateMargin } from '@/lib/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = marginCalculatorSchema.parse(body);
    const result = calculateMargin(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
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

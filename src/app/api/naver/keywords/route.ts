import { NextRequest, NextResponse } from 'next/server';
import { fetchKeywordTrend, type KeywordTrendRequest } from '@/lib/naver-api';
import { getCategoryName } from '@/lib/naver-categories';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as KeywordTrendRequest;

    const result = await fetchKeywordTrend(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 카테고리명 변환 추가
    const transformedData = result.data.map((item) => ({
      ...item,
      categoryName: getCategoryName(body.category),
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Keyword trend API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch keyword trend' },
      { status: 500 }
    );
  }
}

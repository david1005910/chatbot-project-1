import { NextRequest, NextResponse } from 'next/server';
import { coupangCompetitionSchema } from '@/lib/validation';
import {
  analyzeCoupangCompetition,
  isCoupangApiConfigured,
} from '@/lib/coupang-partners-api';

// 캐시
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 시뮬레이션 경쟁 분석 데이터
function generateMockCompetitionAnalysis(keyword: string) {
  const avgReviewCount = Math.floor(Math.random() * 2000) + 500;
  const avgPrice = Math.floor(Math.random() * 40000) + 15000;
  const rocketDeliveryRatio = Math.floor(Math.random() * 40) + 40;

  const reviewFactor = Math.min(100, (avgReviewCount / 1000) * 100);
  const priceFactor = Math.floor(Math.random() * 50) + 20;
  const topSellerFactor = Math.min(100, (avgReviewCount / 5000) * 100);

  const competitionScore = Math.round(
    reviewFactor * 0.3 +
    priceFactor * 0.15 +
    rocketDeliveryRatio * 0.25 +
    topSellerFactor * 0.3
  );

  let competitionLevel: '낮음' | '중' | '높음' | '매우 높음';
  if (competitionScore < 25) competitionLevel = '낮음';
  else if (competitionScore < 50) competitionLevel = '중';
  else if (competitionScore < 75) competitionLevel = '높음';
  else competitionLevel = '매우 높음';

  const mockProducts = Array.from({ length: 10 }, (_, i) => {
    const price = Math.floor(Math.random() * 50000) + 10000;
    return {
      id: `mock-${i}`,
      name: `${keyword} 인기상품 ${i + 1}`,
      price,
      originalPrice: Math.round(price * 1.2),
      discountRate: 20,
      rating: Math.round((Math.random() * 1 + 4) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 10000) + 500,
      isRocketDelivery: Math.random() > 0.3,
      isRocketWow: Math.random() > 0.7,
      isFreeShipping: true,
      imageUrl: '',
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
      seller: '쿠팡',
      categoryName: '생활용품',
    };
  });

  return {
    keyword,
    totalProducts: Math.floor(Math.random() * 5000) + 1000,
    avgReviewCount,
    avgPrice,
    priceRange: {
      min: avgPrice - Math.floor(Math.random() * 10000),
      max: avgPrice + Math.floor(Math.random() * 20000),
    },
    top10Products: mockProducts,
    rocketDeliveryRatio,
    competitionScore,
    competitionLevel,
    insights: generateInsights(competitionLevel, avgReviewCount, rocketDeliveryRatio, avgPrice),
    factors: {
      reviewFactor: Math.round(reviewFactor),
      priceFactor: Math.round(priceFactor),
      rocketFactor: rocketDeliveryRatio,
      topSellerFactor: Math.round(topSellerFactor),
    },
    apiSource: 'simulation',
    notice: 'Coupang Partners API가 설정되지 않아 시뮬레이션 데이터가 표시됩니다.',
  };
}

function generateInsights(
  level: string,
  avgReview: number,
  rocketRatio: number,
  avgPrice: number
): string {
  let insight = '';

  if (level === '낮음') {
    insight = '이 키워드는 경쟁이 낮은 블루오션 시장입니다. 신규 진입에 적합합니다.';
  } else if (level === '중') {
    insight = '중간 수준의 경쟁이 있는 시장입니다. 차별화 전략이 필요합니다.';
  } else if (level === '높음') {
    insight = '경쟁이 치열한 레드오션 시장입니다. 강력한 마케팅이 필수입니다.';
  } else {
    insight = '매우 치열한 경쟁 시장입니다. 대형 셀러들이 장악한 시장입니다.';
  }

  insight += ` 평균 리뷰 ${avgReview.toLocaleString()}개, 로켓배송 비율 ${rocketRatio}%, 평균가 ${avgPrice.toLocaleString()}원`;

  return insight;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = coupangCompetitionSchema.parse(body);
    const { keyword } = validated;

    // 캐시 확인
    const cacheKey = `competition:${keyword}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    let analysisData;

    // Coupang Partners API 사용 가능 여부 확인
    if (isCoupangApiConfigured()) {
      try {
        analysisData = await analyzeCoupangCompetition(keyword);
        (analysisData as unknown as Record<string, unknown>).apiSource = 'coupang_partners';
      } catch (apiError) {
        console.error('Coupang Partners API error:', apiError);
        analysisData = generateMockCompetitionAnalysis(keyword);
        (analysisData as unknown as Record<string, unknown>).notice = 'Coupang API 오류로 시뮬레이션 데이터가 표시됩니다.';
      }
    } else {
      // API 미설정 시 시뮬레이션 데이터
      analysisData = generateMockCompetitionAnalysis(keyword);
    }

    // 캐시 저장
    cache.set(cacheKey, { data: analysisData, timestamp: Date.now() });

    // 캐시 정리
    if (cache.size > 100) {
      const now = Date.now();
      Array.from(cache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: analysisData,
      cached: false,
    });
  } catch (error) {
    console.error('Coupang competition analysis error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          suggestion: '잠시 후 다시 시도해주세요.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

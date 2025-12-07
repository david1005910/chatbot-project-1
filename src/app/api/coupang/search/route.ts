import { NextRequest, NextResponse } from 'next/server';
import {
  searchCoupangProducts,
  isCoupangApiConfigured,
  CoupangProduct,
} from '@/lib/coupang-partners-api';

// 캐시 (메모리 기반)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 시뮬레이션 데이터 생성 (API 미설정 시 사용)
function generateMockProducts(keyword: string): CoupangProduct[] {
  const mockProducts: CoupangProduct[] = [];
  const baseNames = [
    '프리미엄', '베스트셀러', '가성비', '인기상품', '고급형',
    '실속형', '대용량', '미니', '세트', '특가'
  ];
  const sellers = ['쿠팡', '공식스토어', '브랜드몰', '프리미엄스토어', '판매자A'];

  for (let i = 0; i < 20; i++) {
    const basePrice = Math.floor(Math.random() * 50000) + 10000;
    const discountRate = Math.floor(Math.random() * 30) + 5;
    const originalPrice = Math.round(basePrice / (1 - discountRate / 100));

    mockProducts.push({
      id: `mock-${Date.now()}-${i}`,
      name: `${keyword} ${baseNames[i % baseNames.length]} ${String.fromCharCode(65 + i)}`,
      price: basePrice,
      originalPrice,
      discountRate,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 15000) + 100,
      isRocketDelivery: Math.random() > 0.3,
      isRocketWow: Math.random() > 0.7,
      isFreeShipping: Math.random() > 0.2,
      imageUrl: '',
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`,
      seller: sellers[Math.floor(Math.random() * sellers.length)],
      categoryName: '생활용품',
    });
  }

  return mockProducts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, sortBy = 'popular' } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '검색어를 입력해주세요' },
        { status: 400 }
      );
    }

    // 캐시 확인
    const cacheKey = `search:${keyword}:${sortBy}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    let responseData;

    // Coupang Partners API 사용 가능 여부 확인
    if (isCoupangApiConfigured()) {
      try {
        const result = await searchCoupangProducts(keyword, 30);

        // 정렬 적용
        let sortedProducts = [...result.products];
        switch (sortBy) {
          case 'price_low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
          case 'review':
            sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          default:
            // popular - 기본 순서 유지
            break;
        }

        responseData = {
          keyword: result.keyword,
          totalCount: result.totalCount,
          products: sortedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            discountRate: p.discountRate,
            rating: p.rating,
            reviewCount: p.reviewCount,
            isRocketDelivery: p.isRocketDelivery,
            isRocketWow: p.isRocketWow,
            isFreeShipping: p.isFreeShipping,
            imageUrl: p.imageUrl,
            productUrl: p.productUrl,
            seller: p.seller,
            category: p.categoryName,
          })),
          priceStats: result.priceStats,
          rocketDeliveryRatio: result.rocketDeliveryRatio,
          apiSource: 'coupang_partners',
        };
      } catch (apiError) {
        console.error('Coupang Partners API error:', apiError);
        // API 실패 시 시뮬레이션 데이터 사용
        const mockProducts = generateMockProducts(keyword);
        responseData = createResponseFromProducts(keyword, mockProducts, sortBy);
        responseData.apiSource = 'simulation';
        responseData.notice = 'Coupang API 오류로 시뮬레이션 데이터가 표시됩니다.';
      }
    } else {
      // API 미설정 시 시뮬레이션 데이터
      const mockProducts = generateMockProducts(keyword);
      responseData = createResponseFromProducts(keyword, mockProducts, sortBy);
      responseData.apiSource = 'simulation';
      responseData.notice = 'Coupang Partners API가 설정되지 않아 시뮬레이션 데이터가 표시됩니다. 실제 데이터를 위해 API 키를 설정해주세요.';
    }

    // 캐시 저장
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    // 오래된 캐시 정리
    if (cache.size > 200) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      cached: false,
    });
  } catch (error) {
    console.error('Coupang search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search Coupang products' },
      { status: 500 }
    );
  }
}

// 상품 배열에서 응답 데이터 생성
function createResponseFromProducts(
  keyword: string,
  products: CoupangProduct[],
  sortBy: string
): Record<string, unknown> {
  // 정렬
  let sortedProducts = [...products];
  switch (sortBy) {
    case 'price_low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price_high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'review':
      sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      break;
  }

  const prices = sortedProducts.map(p => p.price);
  const rocketCount = sortedProducts.filter(p => p.isRocketDelivery).length;

  return {
    keyword,
    totalCount: sortedProducts.length * 50, // 예상 총 개수
    products: sortedProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      discountRate: p.discountRate,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isRocketDelivery: p.isRocketDelivery,
      isRocketWow: p.isRocketWow,
      isFreeShipping: p.isFreeShipping,
      imageUrl: p.imageUrl,
      productUrl: p.productUrl,
      seller: p.seller,
      category: p.categoryName || '',
    })),
    priceStats: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    },
    rocketDeliveryRatio: Math.round((rocketCount / sortedProducts.length) * 100),
  };
}

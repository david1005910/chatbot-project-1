import { NextRequest, NextResponse } from 'next/server';
import { sourcingSearchSchema } from '@/lib/validation';

// 환율 (실제 서비스에서는 API로 가져와야 함)
const EXCHANGE_RATES = {
  CNY: 190, // 위안화 → 원화
  USD: 1350, // 달러 → 원화
};

// 플랫폼별 시뮬레이션 상품 생성
function generateMockProducts(
  keyword: string,
  platform: '1688' | 'taobao' | 'aliexpress',
  maxResults: number,
  sortBy: 'price' | 'sales' | 'rating'
) {
  const products = [];
  const isAliexpress = platform === 'aliexpress';
  const currency = isAliexpress ? 'USD' : 'CNY';
  const exchangeRate = isAliexpress ? EXCHANGE_RATES.USD : EXCHANGE_RATES.CNY;

  // 플랫폼별 특성
  const platformConfig = {
    '1688': {
      priceRange: [5, 50], // CNY
      moqRange: [10, 500],
      salesMultiplier: 100,
      supplierRatings: ['金牌', '银牌', '实力', '一般'],
      shippingDays: [7, 15],
    },
    taobao: {
      priceRange: [10, 100], // CNY
      moqRange: [1, 10],
      salesMultiplier: 50,
      supplierRatings: ['皇冠', '钻石', '心', '一般'],
      shippingDays: [5, 12],
    },
    aliexpress: {
      priceRange: [2, 30], // USD
      moqRange: [1, 5],
      salesMultiplier: 30,
      supplierRatings: ['Top Brand', 'Trusted', 'New', 'Standard'],
      shippingDays: [10, 25],
    },
  };

  const config = platformConfig[platform];

  // 상품명 템플릿
  const prefixes = ['프리미엄', '고품질', '베스트셀러', '신제품', '할인', '대용량', '미니', '세트', '특가', '인기'];
  const suffixes = ['정품', '공장직송', '무료배송', '당일발송', '품질보증', '1+1', '할인가', '특별할인'];

  // 재질/스펙 옵션
  const materials = ['플라스틱', '스테인레스', '실리콘', '나무', '면', '폴리에스터', 'ABS', 'PP', 'PVC'];
  const sizes = ['소형', '중형', '대형', '특대형', 'S', 'M', 'L', 'XL'];
  const weights = ['50g', '100g', '200g', '300g', '500g', '1kg', '2kg'];

  for (let i = 0; i < maxResults; i++) {
    const basePrice = config.priceRange[0] + Math.random() * (config.priceRange[1] - config.priceRange[0]);
    const originalPrice = Math.round(basePrice * 100) / 100;
    const priceKRW = Math.round(originalPrice * exchangeRate);
    const moq = config.moqRange[0] + Math.floor(Math.random() * (config.moqRange[1] - config.moqRange[0]));
    const salesCount = Math.floor(Math.random() * 10000 * config.salesMultiplier / 100) + 50;
    const rating = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const weight = weights[Math.floor(Math.random() * weights.length)];

    const shippingDays = config.shippingDays[0] + Math.floor(Math.random() * (config.shippingDays[1] - config.shippingDays[0]));
    const supplierRating = config.supplierRatings[Math.floor(Math.random() * config.supplierRatings.length)];

    products.push({
      id: `${platform}-${Date.now()}-${i}`,
      title: `${prefix} ${keyword} ${suffix} ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
      titleKo: `${prefix} ${keyword} ${suffix}`,
      price: priceKRW,
      originalPrice,
      currency,
      moq,
      salesCount,
      rating,
      supplierRating,
      shippingEstimate: `${shippingDays}~${shippingDays + 5}일`,
      imageUrl: '', // 실제 이미지 없음
      productUrl: getPlatformSearchUrl(platform, keyword),
      specifications: {
        weight,
        size,
        material,
      },
    });
  }

  // 정렬 적용
  switch (sortBy) {
    case 'price':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'sales':
      products.sort((a, b) => b.salesCount - a.salesCount);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
  }

  return products;
}

function getPlatformSearchUrl(platform: string, keyword: string): string {
  const encodedKeyword = encodeURIComponent(keyword);
  switch (platform) {
    case '1688':
      return `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodedKeyword}`;
    case 'taobao':
      return `https://s.taobao.com/search?q=${encodedKeyword}`;
    case 'aliexpress':
      return `https://www.aliexpress.com/wholesale?SearchText=${encodedKeyword}`;
    default:
      return '#';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sourcingSearchSchema.parse(body);
    const { keyword, platform, maxResults = 20, sortBy = 'sales' } = validated;

    const isAliexpress = platform === 'aliexpress';
    const exchangeRate = isAliexpress ? EXCHANGE_RATES.USD : EXCHANGE_RATES.CNY;

    // 시뮬레이션 데이터 생성
    const products = generateMockProducts(keyword, platform, maxResults, sortBy);

    // 총 상품 수 (시뮬레이션)
    const totalResults = Math.floor(Math.random() * 5000) + 500;

    return NextResponse.json({
      success: true,
      data: {
        platform,
        keyword,
        totalResults,
        products,
        exchangeRate,
        apiSource: 'simulation',
        notice: `${getPlatformName(platform)} API가 설정되지 않아 시뮬레이션 데이터가 표시됩니다. 실제 소싱을 위해서는 '직접 검색하기' 버튼을 이용해주세요.`,
      },
    });
  } catch (error) {
    console.error('Sourcing search error:', error);

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

function getPlatformName(platform: string): string {
  switch (platform) {
    case '1688':
      return '1688';
    case 'taobao':
      return '타오바오';
    case 'aliexpress':
      return '알리익스프레스';
    default:
      return platform;
  }
}

import crypto from 'crypto';

// Coupang Partners API 설정
const COUPANG_API_BASE = 'https://api-gateway.coupang.com';

interface CoupangApiConfig {
  accessKey: string;
  secretKey: string;
}

// 환경 변수에서 API 키 가져오기
function getConfig(): CoupangApiConfig {
  const accessKey = process.env.COUPANG_ACCESS_KEY || '';
  const secretKey = process.env.COUPANG_SECRET_KEY || '';

  if (!accessKey || !secretKey) {
    throw new Error('Coupang Partners API 키가 설정되지 않았습니다. COUPANG_ACCESS_KEY와 COUPANG_SECRET_KEY를 설정해주세요.');
  }

  return { accessKey, secretKey };
}

// HMAC 서명 생성
function generateHmacSignature(
  method: string,
  path: string,
  secretKey: string,
  datetime: string
): string {
  const message = `${datetime}${method}${path}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');
  return signature;
}

// Authorization 헤더 생성
function generateAuthorizationHeader(
  method: string,
  path: string,
  accessKey: string,
  secretKey: string
): string {
  const datetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', 'T');
  const signature = generateHmacSignature(method, path, secretKey, datetime);
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

// 상품 검색 결과 타입
export interface CoupangProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  isRocketDelivery: boolean;
  isRocketWow: boolean;
  isFreeShipping: boolean;
  imageUrl: string;
  productUrl: string;
  seller: string;
  categoryName: string;
}

export interface CoupangSearchResult {
  keyword: string;
  totalCount: number;
  products: CoupangProduct[];
  priceStats: {
    min: number;
    max: number;
    avg: number;
  };
  rocketDeliveryRatio: number;
}

// Coupang Partners API - 상품 검색
export async function searchCoupangProducts(
  keyword: string,
  limit: number = 20
): Promise<CoupangSearchResult> {
  const config = getConfig();

  // Coupang Partners API의 상품 검색 엔드포인트
  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;

  const authorization = generateAuthorizationHeader('GET', path, config.accessKey, config.secretKey);

  const response = await fetch(`${COUPANG_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Coupang API error:', response.status, errorText);
    throw new Error(`Coupang API 오류: ${response.status}`);
  }

  const data = await response.json();

  if (data.rCode !== '0') {
    throw new Error(data.rMessage || 'Coupang API 요청 실패');
  }

  // API 응답 파싱
  const products: CoupangProduct[] = (data.data || []).map((item: Record<string, unknown>) => ({
    id: String(item.productId || ''),
    name: String(item.productName || ''),
    price: Number(item.productPrice) || 0,
    originalPrice: Number(item.originalPrice) || Number(item.productPrice) || 0,
    discountRate: item.originalPrice
      ? Math.round((1 - Number(item.productPrice) / Number(item.originalPrice)) * 100)
      : 0,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.reviewCount) || 0,
    isRocketDelivery: item.isRocket === true || item.rocket === true,
    isRocketWow: item.isRocketWow === true,
    isFreeShipping: item.isFreeShipping === true || item.isRocket === true,
    imageUrl: String(item.productImage || ''),
    productUrl: String(item.productUrl || ''),
    seller: String(item.sellerName || '쿠팡'),
    categoryName: String(item.categoryName || ''),
  }));

  // 가격 통계
  const prices = products.map(p => p.price).filter(p => p > 0);
  const priceStats = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
    avg: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
  };

  // 로켓배송 비율
  const rocketCount = products.filter(p => p.isRocketDelivery).length;
  const rocketDeliveryRatio = products.length > 0 ? Math.round((rocketCount / products.length) * 100) : 0;

  return {
    keyword,
    totalCount: data.totalCount || products.length,
    products,
    priceStats,
    rocketDeliveryRatio,
  };
}

// 베스트 카테고리 상품 조회
export async function getCoupangBestProducts(
  categoryId: string = '0', // 0 = 전체
  limit: number = 20
): Promise<CoupangProduct[]> {
  const config = getConfig();

  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/${categoryId}?limit=${limit}`;
  const authorization = generateAuthorizationHeader('GET', path, config.accessKey, config.secretKey);

  const response = await fetch(`${COUPANG_API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Coupang API 오류: ${response.status}`);
  }

  const data = await response.json();

  if (data.rCode !== '0') {
    throw new Error(data.rMessage || 'Coupang API 요청 실패');
  }

  return (data.data || []).map((item: Record<string, unknown>) => ({
    id: String(item.productId || ''),
    name: String(item.productName || ''),
    price: Number(item.productPrice) || 0,
    originalPrice: Number(item.originalPrice) || Number(item.productPrice) || 0,
    discountRate: 0,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.reviewCount) || 0,
    isRocketDelivery: item.isRocket === true,
    isRocketWow: item.isRocketWow === true,
    isFreeShipping: item.isFreeShipping === true,
    imageUrl: String(item.productImage || ''),
    productUrl: String(item.productUrl || ''),
    seller: String(item.sellerName || '쿠팡'),
    categoryName: String(item.categoryName || ''),
  }));
}

// 딥링크 생성 (Affiliate Link)
export async function generateDeeplink(
  originalUrls: string[]
): Promise<string[]> {
  const config = getConfig();

  const path = '/v2/providers/affiliate_open_api/apis/openapi/deeplink';
  const authorization = generateAuthorizationHeader('POST', path, config.accessKey, config.secretKey);

  const response = await fetch(`${COUPANG_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coupangUrls: originalUrls,
    }),
  });

  if (!response.ok) {
    throw new Error(`Coupang API 오류: ${response.status}`);
  }

  const data = await response.json();

  if (data.rCode !== '0') {
    throw new Error(data.rMessage || 'Coupang API 요청 실패');
  }

  return (data.data || []).map((item: { shortenUrl?: string }) => item.shortenUrl || '');
}

// Coupang Partners API 사용 가능 여부 확인
export function isCoupangApiConfigured(): boolean {
  return !!(process.env.COUPANG_ACCESS_KEY && process.env.COUPANG_SECRET_KEY);
}

// 경쟁 분석 (API 기반)
export interface CompetitionAnalysis {
  keyword: string;
  totalProducts: number;
  avgReviewCount: number;
  avgPrice: number;
  priceRange: { min: number; max: number };
  top10Products: CoupangProduct[];
  rocketDeliveryRatio: number;
  competitionScore: number;
  competitionLevel: '낮음' | '중' | '높음' | '매우 높음';
  insights: string;
  factors: {
    reviewFactor: number;
    priceFactor: number;
    rocketFactor: number;
    topSellerFactor: number;
  };
}

export async function analyzeCoupangCompetition(keyword: string): Promise<CompetitionAnalysis> {
  const result = await searchCoupangProducts(keyword, 50);

  if (result.products.length === 0) {
    return {
      keyword,
      totalProducts: 0,
      avgReviewCount: 0,
      avgPrice: 0,
      priceRange: { min: 0, max: 0 },
      top10Products: [],
      rocketDeliveryRatio: 0,
      competitionScore: 0,
      competitionLevel: '낮음',
      insights: '검색 결과가 없습니다. 다른 키워드를 시도해보세요.',
      factors: {
        reviewFactor: 0,
        priceFactor: 0,
        rocketFactor: 0,
        topSellerFactor: 0,
      },
    };
  }

  const products = result.products;
  const top10Products = products.slice(0, 10);

  // 통계 계산
  const reviews = products.map(p => p.reviewCount);
  const avgReviewCount = Math.round(reviews.reduce((a, b) => a + b, 0) / reviews.length);

  // 경쟁 강도 점수 계산
  const reviewFactor = Math.min(100, (avgReviewCount / 1000) * 100);
  const priceVariance = result.priceStats.max > 0
    ? ((result.priceStats.max - result.priceStats.min) / result.priceStats.max) * 100
    : 0;
  const priceFactor = Math.min(100, priceVariance);
  const rocketFactor = result.rocketDeliveryRatio;

  const top10AvgReview = top10Products.length > 0
    ? top10Products.reduce((a, b) => a + b.reviewCount, 0) / top10Products.length
    : 0;
  const topSellerFactor = Math.min(100, (top10AvgReview / 5000) * 100);

  const competitionScore = Math.round(
    reviewFactor * 0.3 +
    priceFactor * 0.15 +
    rocketFactor * 0.25 +
    topSellerFactor * 0.3
  );

  let competitionLevel: '낮음' | '중' | '높음' | '매우 높음';
  if (competitionScore < 25) competitionLevel = '낮음';
  else if (competitionScore < 50) competitionLevel = '중';
  else if (competitionScore < 75) competitionLevel = '높음';
  else competitionLevel = '매우 높음';

  const insights = generateInsights({
    competitionLevel,
    avgReviewCount,
    rocketDeliveryRatio: result.rocketDeliveryRatio,
    avgPrice: result.priceStats.avg,
  });

  return {
    keyword,
    totalProducts: result.totalCount,
    avgReviewCount,
    avgPrice: result.priceStats.avg,
    priceRange: { min: result.priceStats.min, max: result.priceStats.max },
    top10Products,
    rocketDeliveryRatio: result.rocketDeliveryRatio,
    competitionScore,
    competitionLevel,
    insights,
    factors: {
      reviewFactor: Math.round(reviewFactor),
      priceFactor: Math.round(priceFactor),
      rocketFactor: result.rocketDeliveryRatio,
      topSellerFactor: Math.round(topSellerFactor),
    },
  };
}

function generateInsights(data: {
  competitionLevel: string;
  avgReviewCount: number;
  rocketDeliveryRatio: number;
  avgPrice: number;
}): string {
  const lines: string[] = [];

  if (data.competitionLevel === '낮음') {
    lines.push('이 키워드는 경쟁이 낮은 블루오션 시장입니다. 신규 진입에 적합합니다.');
  } else if (data.competitionLevel === '중') {
    lines.push('중간 수준의 경쟁이 있는 시장입니다. 차별화 전략이 필요합니다.');
  } else if (data.competitionLevel === '높음') {
    lines.push('경쟁이 치열한 레드오션 시장입니다. 강력한 마케팅이 필수입니다.');
  } else {
    lines.push('매우 치열한 경쟁 시장입니다. 대형 셀러들이 장악한 시장입니다.');
  }

  lines.push(`평균 리뷰 ${data.avgReviewCount.toLocaleString()}개, 로켓배송 비율 ${data.rocketDeliveryRatio}%, 평균가 ${data.avgPrice.toLocaleString()}원`);

  return lines.join(' ');
}

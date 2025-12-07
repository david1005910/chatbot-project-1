import { createClient } from './client';
import type { InsertTables } from './types';

// Supabase 설정 확인
function checkSupabaseConfig(): { configured: boolean; error?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === 'your_supabase_url') {
    return { configured: false, error: 'Supabase URL이 설정되지 않았습니다.' };
  }
  if (!key || key === 'your_supabase_anon_key') {
    return { configured: false, error: 'Supabase API Key가 설정되지 않았습니다.' };
  }

  // URL과 key의 프로젝트 ref 일치 확인
  try {
    const urlMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    const keyPayload = JSON.parse(atob(key.split('.')[1]));

    if (urlMatch && keyPayload.ref && urlMatch[1] !== keyPayload.ref) {
      return {
        configured: false,
        error: 'Supabase URL과 API Key가 다른 프로젝트입니다. .env.local 파일을 확인해주세요.'
      };
    }
  } catch {
    // 파싱 실패는 무시 - 실제 API 호출에서 오류 발생
  }

  return { configured: true };
}

// 소싱 상품 내보내기
export async function exportSourcingProducts(
  products: Array<{
    id: string;
    title: string;
    titleKo?: string;
    price: number;
    originalPrice: number;
    currency: string;
    moq?: number;
    salesCount?: number;
    rating?: number;
    supplierRating?: string;
    shippingEstimate?: string;
    imageUrl?: string;
    productUrl: string;
    specifications?: {
      weight?: string;
      size?: string;
      material?: string;
    };
  }>[],
  platform: '1688' | 'taobao' | 'aliexpress' | 'coupang',
  keyword: string
): Promise<{ success: boolean; count: number; error?: string }> {
  // 설정 확인
  const config = checkSupabaseConfig();
  if (!config.configured) {
    return { success: false, count: 0, error: config.error };
  }

  const supabase = createClient();

  const insertData: InsertTables<'sourcing_products'>[] = products.map((product: any) => ({
    platform,
    keyword,
    product_id: product.id,
    title: product.title,
    title_ko: product.titleKo || null,
    price: product.price,
    original_price: product.originalPrice,
    currency: product.currency,
    moq: product.moq || null,
    sales_count: product.salesCount || null,
    rating: product.rating || null,
    supplier_rating: product.supplierRating || null,
    shipping_estimate: product.shippingEstimate || null,
    image_url: product.imageUrl || null,
    product_url: product.productUrl,
    specifications: product.specifications || null,
  }));

  const { error } = await (supabase as any)
    .from('sourcing_products')
    .insert(insertData);

  if (error) {
    console.error('Export sourcing products error:', error);
    return { success: false, count: 0, error: error.message };
  }

  return { success: true, count: products.length };
}

// 틈새 키워드 내보내기
export async function exportNicheKeywords(
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    competition: string;
    cpc: number;
    relevanceScore: number;
    recommendedTitle?: string;
    reasoning?: string;
  }>,
  mainKeyword: string
): Promise<{ success: boolean; count: number; error?: string }> {
  // 설정 확인
  const config = checkSupabaseConfig();
  if (!config.configured) {
    return { success: false, count: 0, error: config.error };
  }

  const supabase = createClient();

  const insertData: InsertTables<'niche_keywords'>[] = keywords.map((kw) => ({
    main_keyword: mainKeyword,
    keyword: kw.keyword,
    search_volume: kw.searchVolume,
    competition: kw.competition,
    cpc: kw.cpc,
    relevance_score: kw.relevanceScore,
    recommended_title: kw.recommendedTitle || null,
    reasoning: kw.reasoning || null,
  }));

  const { error } = await (supabase as any)
    .from('niche_keywords')
    .insert(insertData);

  if (error) {
    console.error('Export niche keywords error:', error);
    return { success: false, count: 0, error: error.message };
  }

  return { success: true, count: keywords.length };
}

// 경쟁 분석 내보내기
export async function exportCompetitionAnalysis(
  analysis: {
    keyword: string;
    totalProducts: number;
    avgReviewCount: number;
    avgPrice: number;
    priceRange: { min: number; max: number };
    rocketDeliveryRatio: number;
    competitionScore: number;
    competitionLevel: string;
    insights?: string;
    top10Products: Array<unknown>;
  },
  platform: string = 'coupang'
): Promise<{ success: boolean; error?: string }> {
  // 설정 확인
  const config = checkSupabaseConfig();
  if (!config.configured) {
    return { success: false, error: config.error };
  }

  const supabase = createClient();

  const insertData: InsertTables<'competition_analyses'> = {
    keyword: analysis.keyword,
    platform,
    total_products: analysis.totalProducts,
    avg_review_count: analysis.avgReviewCount,
    avg_price: analysis.avgPrice,
    price_min: analysis.priceRange.min,
    price_max: analysis.priceRange.max,
    rocket_delivery_ratio: analysis.rocketDeliveryRatio,
    competition_score: analysis.competitionScore,
    competition_level: analysis.competitionLevel,
    insights: analysis.insights || null,
    top_products: analysis.top10Products as any,
  };

  const { error } = await (supabase as any)
    .from('competition_analyses')
    .insert(insertData);

  if (error) {
    console.error('Export competition analysis error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 쿠팡 검색 결과 내보내기
export async function exportCoupangProducts(
  products: Array<{
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
    category?: string;
  }>,
  keyword: string
): Promise<{ success: boolean; count: number; error?: string }> {
  // 설정 확인
  const config = checkSupabaseConfig();
  if (!config.configured) {
    return { success: false, count: 0, error: config.error };
  }

  const supabase = createClient();

  const insertData: InsertTables<'sourcing_products'>[] = products.map((product) => ({
    platform: 'coupang' as const,
    keyword,
    product_id: product.id,
    title: product.name,
    title_ko: product.name,
    price: product.price,
    original_price: product.originalPrice,
    currency: 'KRW',
    moq: 1,
    sales_count: product.reviewCount, // 리뷰 수로 대체
    rating: product.rating,
    supplier_rating: product.seller,
    shipping_estimate: product.isRocketDelivery ? '로켓배송' : '일반배송',
    image_url: product.imageUrl || null,
    product_url: product.productUrl,
    specifications: {
      discountRate: product.discountRate,
      isRocketWow: product.isRocketWow,
      isFreeShipping: product.isFreeShipping,
      category: product.category,
    },
  }));

  const { error } = await (supabase as any)
    .from('sourcing_products')
    .insert(insertData);

  if (error) {
    console.error('Export Coupang products error:', error);
    return { success: false, count: 0, error: error.message };
  }

  return { success: true, count: products.length };
}

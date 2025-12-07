// ============================================
// 네이버 데이터랩 API 타입
// ============================================

export interface NaverTrendRequest {
  startDate: string;
  endDate: string;
  timeUnit: 'date' | 'week' | 'month';
  category: string[];
  device?: 'pc' | 'mo' | '';
  gender?: 'm' | 'f' | '';
  ages?: string[];
}

export interface NaverTrendResponse {
  success: boolean;
  data: {
    title: string;
    keywords: string[];
    data: {
      period: string;
      ratio: number;
    }[];
  }[];
  error?: string;
}

// ============================================
// LSTM 예측 API 타입
// ============================================

export interface LSTMPredictRequest {
  historicalData: {
    date: string;
    value: number;
  }[];
  predictionMonths: number;
  keyword: string;
}

export interface LSTMPredictResponse {
  success: boolean;
  data: {
    keyword: string;
    predictions: {
      date: string;
      predicted_value: number;
      confidence_lower: number;
      confidence_upper: number;
    }[];
    growth_rate: number;
    seasonality: {
      pattern: string;
      peak_months: number[];
      low_months: number[];
    };
    model_confidence: number;
  };
}

// ============================================
// Claude AI 분석 API 타입
// ============================================

export interface ClaudeAnalyzeRequest {
  trendData: {
    keyword: string;
    historicalTrend: { date: string; value: number }[];
    lstmPrediction: { date: string; value: number }[];
    growthRate: number;
  }[];
  userCriteria: {
    excludeClothing: boolean;
    maxVolume: string;
    targetPlatform: string;
  };
  analysisType: 'ranking' | 'niche_keyword' | 'product_name';
}

export type CompetitionLevel = '상' | '중' | '하';

export interface ClaudeAnalyzeResponse {
  success: boolean;
  data: {
    top10Keywords: {
      rank: number;
      keyword: string;
      growthPotential: CompetitionLevel;
      competitionLevel: CompetitionLevel;
      reason: string;
      recommendedTiming: string;
      seasonalPattern: string;
      nicheKeywords: string[];
    }[];
    analysisInsights: string;
  };
}

// ============================================
// 쿠팡 경쟁강도 분석 API 타입
// ============================================

export interface CoupangCompetitionRequest {
  keyword: string;
}

export interface CoupangCompetitionResponse {
  success: boolean;
  data: {
    keyword: string;
    totalProducts: number;
    avgReviewCount: number;
    avgPrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    top10Products: {
      name: string;
      price: number;
      reviewCount: number;
      rating: number;
      isRocketDelivery: boolean;
    }[];
    rocketDeliveryRatio: number;
    competitionScore: number;
    competitionLevel: CompetitionLevel;
    insights: string;
  };
}

// ============================================
// 틈새 키워드 추천 API 타입
// ============================================

export interface NicheKeywordRequest {
  mainKeyword: string;
  maxResults?: number;
}

export interface NicheKeywordResponse {
  success: boolean;
  data: {
    mainKeyword: string;
    nicheKeywords: {
      keyword: string;
      searchVolume: number;
      competition: CompetitionLevel;
      cpc: number;
      relevanceScore: number;
      recommendedTitle: string;
      reasoning: string;
    }[];
    titleSuggestions: {
      keyword: string;
      titles: string[];
    }[];
  };
}

// ============================================
// 마진 계산기 API 타입
// ============================================

export interface MarginCalculatorRequest {
  purchasePrice: number;
  sellingPrice: number;
  shippingCost: number;
  coupangFeeRate: number;
  adCostPerUnit?: number;
  returnRate?: number;
  quantity?: number;
}

export interface MarginCalculatorResponse {
  success: boolean;
  data: {
    perUnit: {
      revenue: number;
      coupangFee: number;
      shippingCost: number;
      adCost: number;
      returnCost: number;
      totalCost: number;
      grossProfit: number;
      netProfit: number;
      marginRate: number;
    };
    total: {
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
    };
    breakEven: {
      quantity: number;
      revenue: number;
    };
    recommendedPrices: {
      margin20: number;
      margin30: number;
      margin40: number;
    };
  };
}

// ============================================
// 소싱처 연동 API 타입
// ============================================

export interface SourcingSearchRequest {
  keyword: string;
  platform: '1688' | 'taobao' | 'aliexpress';
  maxResults?: number;
  sortBy?: 'price' | 'sales' | 'rating';
}

export interface SourcingSearchResponse {
  success: boolean;
  data: {
    platform: string;
    keyword: string;
    totalResults: number;
    products: {
      id: string;
      title: string;
      titleKo: string;
      price: number;
      originalPrice: number;
      currency: string;
      moq: number;
      salesCount: number;
      rating: number;
      supplierRating: string;
      shippingEstimate: string;
      imageUrl: string;
      productUrl: string;
      specifications: {
        weight: string;
        size: string;
        material: string;
      };
    }[];
    exchangeRate: number;
    apiSource?: string;
    notice?: string;
  };
}

// ============================================
// 내부 데이터 모델
// ============================================

export interface TrendData {
  id: string;
  keyword: string;
  category: string;
  period: {
    start: string;
    end: string;
  };
  dataPoints: {
    date: string;
    value: number;
  }[];
  metadata: {
    device: string;
    gender: string;
    ages: string[];
  };
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  type: 'trend' | 'competition' | 'niche';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  createdAt: string;
}

export interface AnalysisHistory {
  id: string;
  name: string;
  analyses: AnalysisResult[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  defaultCategory: string[];
  defaultPeriod: {
    months: number;
  };
  excludeClothing: boolean;
  maxVolume: string;
  targetPlatform: string;
}

// ============================================
// 카테고리 코드 매핑
// ============================================

// 카테고리 유틸리티는 @/lib/naver-categories 에서 import 하세요
export {
  getCategoryName,
  getCategoryCode,
  ALL_CATEGORIES,
  MAIN_CATEGORIES,
  DETAIL_CATEGORIES,
  CATEGORY_GROUPS,
  RECOMMENDED_SOURCING_CATEGORIES,
} from '@/lib/naver-categories';

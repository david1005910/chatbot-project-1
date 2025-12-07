import { z } from 'zod';

export const trendRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식: YYYY-MM-DD'),
  timeUnit: z.enum(['date', 'week', 'month']).default('month'),
  category: z.array(z.string()).min(1, '최소 1개 카테고리 선택').max(5, '최대 5개 카테고리'),
  device: z.enum(['pc', 'mo', '']).optional(),
  gender: z.enum(['m', 'f', '']).optional(),
  ages: z.array(z.string()).optional(),
});

export const lstmPredictSchema = z.object({
  historicalData: z.array(
    z.object({
      date: z.string(),
      value: z.number(),
    })
  ).min(60, '최소 60일 데이터 필요'),
  predictionMonths: z.number().min(1).max(6),
  keyword: z.string().min(1),
});

export const claudeAnalyzeSchema = z.object({
  trendData: z.array(
    z.object({
      keyword: z.string(),
      historicalTrend: z.array(z.object({ date: z.string(), value: z.number() })),
      lstmPrediction: z.array(z.object({ date: z.string(), value: z.number() })),
      growthRate: z.number(),
    })
  ),
  userCriteria: z.object({
    excludeClothing: z.boolean().default(true),
    maxVolume: z.string().default('택배 가능 크기'),
    targetPlatform: z.string().default('쿠팡'),
  }),
  analysisType: z.enum(['ranking', 'niche_keyword', 'product_name']),
});

export const coupangCompetitionSchema = z.object({
  keyword: z.string().min(1, '키워드를 입력해주세요'),
});

export const nicheKeywordSchema = z.object({
  mainKeyword: z.string().min(1, '메인 키워드를 입력해주세요'),
  maxResults: z.number().min(1).max(20).default(10),
});

export const marginCalculatorSchema = z.object({
  purchasePrice: z.number().positive('원가는 0보다 커야 합니다'),
  sellingPrice: z.number().positive('판매가는 0보다 커야 합니다'),
  shippingCost: z.number().nonnegative('배송비는 0 이상이어야 합니다'),
  coupangFeeRate: z.number().min(0).max(100).default(10.8),
  adCostPerUnit: z.number().nonnegative().optional(),
  returnRate: z.number().min(0).max(100).default(3),
  quantity: z.number().positive().default(1),
});

export const sourcingSearchSchema = z.object({
  keyword: z.string().min(1, '검색 키워드를 입력해주세요'),
  platform: z.enum(['1688', 'taobao', 'aliexpress']),
  maxResults: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['price', 'sales', 'rating']).default('sales'),
});

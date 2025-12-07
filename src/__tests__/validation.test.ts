import {
  naverTrendRequestSchema,
  marginCalculatorSchema,
  claudeAnalyzeRequestSchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('naverTrendRequestSchema', () => {
    it('should validate correct request', () => {
      const validRequest = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        timeUnit: 'month',
        category: ['50000000'],
      };

      const result = naverTrendRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidRequest = {
        startDate: '01-01-2024',
        endDate: '2024-12-31',
        timeUnit: 'month',
        category: ['50000000'],
      };

      const result = naverTrendRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid timeUnit', () => {
      const invalidRequest = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        timeUnit: 'invalid',
        category: ['50000000'],
      };

      const result = naverTrendRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('marginCalculatorSchema', () => {
    it('should validate correct input', () => {
      const validInput = {
        purchasePrice: 10000,
        sellingPrice: 20000,
        shippingCost: 2500,
        exchangeRate: 180,
      };

      const result = marginCalculatorSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject negative values', () => {
      const invalidInput = {
        purchasePrice: -10000,
        sellingPrice: 20000,
        shippingCost: 2500,
        exchangeRate: 180,
      };

      const result = marginCalculatorSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should set default values', () => {
      const partialInput = {
        purchasePrice: 10000,
        sellingPrice: 20000,
      };

      const result = marginCalculatorSchema.safeParse(partialInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shippingCost).toBeDefined();
        expect(result.data.exchangeRate).toBeDefined();
      }
    });
  });

  describe('claudeAnalyzeRequestSchema', () => {
    it('should validate correct request', () => {
      const validRequest = {
        trendData: [
          {
            keyword: 'test',
            historicalTrend: [{ date: '2024-01', value: 100 }],
            lstmPrediction: [],
            growthRate: 10,
          },
        ],
        userCriteria: {
          excludeClothing: true,
          maxVolume: 'small',
          targetPlatform: 'coupang',
        },
        analysisType: 'ranking',
      };

      const result = claudeAnalyzeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty trendData', () => {
      const invalidRequest = {
        trendData: [],
        userCriteria: {
          excludeClothing: true,
          maxVolume: 'small',
          targetPlatform: 'coupang',
        },
        analysisType: 'ranking',
      };

      const result = claudeAnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});

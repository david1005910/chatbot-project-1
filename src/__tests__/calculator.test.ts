import { calculateMargin, calculateBreakEvenPrice, calculateROI } from '@/lib/calculator';

describe('Calculator Functions', () => {
  describe('calculateMargin', () => {
    it('should calculate margin correctly with basic inputs', () => {
      const result = calculateMargin({
        purchasePrice: 10000,
        sellingPrice: 20000,
        shippingCost: 2500,
        exchangeRate: 180,
      });

      expect(result.sellingPrice).toBe(20000);
      expect(result.purchasePrice).toBe(10000);
      expect(result.profit).toBeGreaterThan(0);
      expect(result.marginRate).toBeGreaterThan(0);
    });

    it('should include Coupang fees in calculation', () => {
      const result = calculateMargin({
        purchasePrice: 10000,
        sellingPrice: 30000,
        shippingCost: 3000,
        exchangeRate: 180,
      });

      expect(result.coupangFee).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(result.purchasePrice);
    });

    it('should handle zero values', () => {
      const result = calculateMargin({
        purchasePrice: 0,
        sellingPrice: 10000,
        shippingCost: 0,
        exchangeRate: 180,
      });

      expect(result.purchasePrice).toBe(0);
    });
  });

  describe('calculateBreakEvenPrice', () => {
    it('should calculate break-even price correctly', () => {
      const breakEven = calculateBreakEvenPrice({
        purchasePrice: 10000,
        shippingCost: 2500,
        exchangeRate: 180,
      });

      expect(breakEven).toBeGreaterThan(10000 + 2500);
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      const roi = calculateROI({
        purchasePrice: 10000,
        sellingPrice: 20000,
        shippingCost: 2500,
        exchangeRate: 180,
      });

      expect(roi).toBeGreaterThan(0);
    });

    it('should return negative ROI when selling at loss', () => {
      const roi = calculateROI({
        purchasePrice: 20000,
        sellingPrice: 10000,
        shippingCost: 2500,
        exchangeRate: 180,
      });

      expect(roi).toBeLessThan(0);
    });
  });
});

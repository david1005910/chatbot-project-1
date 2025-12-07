import type { MarginCalculatorRequest, MarginCalculatorResponse } from '@/types';

export function calculateMargin(
  request: MarginCalculatorRequest
): MarginCalculatorResponse['data'] {
  const {
    purchasePrice,
    sellingPrice,
    shippingCost,
    coupangFeeRate = 10.8,
    adCostPerUnit = 0,
    returnRate = 3,
    quantity = 1,
  } = request;

  // 단위당 계산
  const revenue = sellingPrice;
  const coupangFee = Math.round(sellingPrice * (coupangFeeRate / 100));
  const returnCost = Math.round(purchasePrice * (returnRate / 100));
  const totalCost = purchasePrice + shippingCost + coupangFee + adCostPerUnit + returnCost;
  const grossProfit = revenue - purchasePrice - shippingCost;
  const netProfit = revenue - totalCost;
  const marginRate = Number(((netProfit / revenue) * 100).toFixed(2));

  // 총계 계산
  const totalRevenue = revenue * quantity;
  const totalCostAll = totalCost * quantity;
  const totalProfit = netProfit * quantity;

  // 손익분기점 계산
  const fixedCostPerUnit = coupangFee + adCostPerUnit + returnCost;
  const profitPerUnit = sellingPrice - purchasePrice - shippingCost - fixedCostPerUnit;
  const breakEvenQuantity = profitPerUnit > 0 ? Math.ceil(1) : Infinity;
  const breakEvenRevenue = breakEvenQuantity * sellingPrice;

  // 목표 마진율별 권장 판매가 계산
  const calculateRecommendedPrice = (targetMargin: number): number => {
    // sellingPrice = totalCost / (1 - targetMargin/100)
    const baseCost = purchasePrice + shippingCost + adCostPerUnit;
    const marginFactor = 1 - targetMargin / 100;
    const feeFactor = 1 - coupangFeeRate / 100;
    // price * marginFactor = baseCost + returnCost + price * feeRate
    // price * (marginFactor - feeRate) = baseCost + returnCost
    const effectiveFactor = marginFactor - coupangFeeRate / 100;
    if (effectiveFactor <= 0) return Infinity;
    return Math.ceil((baseCost + returnCost) / effectiveFactor);
  };

  return {
    perUnit: {
      revenue,
      coupangFee,
      shippingCost,
      adCost: adCostPerUnit,
      returnCost,
      totalCost,
      grossProfit,
      netProfit,
      marginRate,
    },
    total: {
      totalRevenue,
      totalCost: totalCostAll,
      totalProfit,
    },
    breakEven: {
      quantity: breakEvenQuantity,
      revenue: breakEvenRevenue,
    },
    recommendedPrices: {
      margin20: calculateRecommendedPrice(20),
      margin30: calculateRecommendedPrice(30),
      margin40: calculateRecommendedPrice(40),
    },
  };
}

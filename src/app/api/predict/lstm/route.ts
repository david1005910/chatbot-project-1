import { NextRequest, NextResponse } from 'next/server';
import { lstmPredictSchema } from '@/lib/validation';
import { forecastTrend } from '@/lib/ensemble-forecast-model';

// Note: This endpoint uses ensemble forecasting (SARIMA + ETS + Theta + Damped Trend)
// Based on latest research for optimal accuracy

interface DataPoint {
  date: string;
  value: number;
}

/**
 * Server-side trend prediction using Ensemble Model
 *
 * Models included:
 * - SARIMA (Seasonal ARIMA) - 계절성 시계열에 최적
 * - ETS (Error-Trend-Seasonality) - 상태공간 모델
 * - Theta Method - M3 Competition 우승 모델
 * - Damped Trend - 장기 예측 안정성
 *
 * Cross-validation으로 각 모델의 가중치를 동적으로 결정
 */
function predictWithEnsembleModel(
  data: DataPoint[],
  months: number
): {
  predictions: { date: string; predicted_value: number; confidence_lower: number; confidence_upper: number }[];
  growth_rate: number;
  seasonality: { pattern: string; peak_months: number[]; low_months: number[]; strength: number };
  model_confidence: number;
  trend_direction: 'up' | 'down' | 'stable';
  model_weights: { sarima: number; ets: number; theta: number; dampedTrend: number };
  accuracy: { mape: number; rmse: number; mae: number };
} {
  const values = data.map(d => d.value);
  const days = months * 30;

  // 앙상블 예측 실행
  const result = forecastTrend(values, days);

  // 날짜 생성
  const lastDate = new Date(data[data.length - 1].date);
  const predictions = result.predictions.map((value, i) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i + 1);

    return {
      date: date.toISOString().split('T')[0],
      predicted_value: Math.round(value * 100) / 100,
      confidence_lower: Math.round(result.confidenceLower[i] * 100) / 100,
      confidence_upper: Math.round(result.confidenceUpper[i] * 100) / 100,
    };
  });

  // 성장률 계산
  const firstMonth = values.slice(0, Math.min(30, values.length));
  const lastMonth = values.slice(-Math.min(30, values.length));
  const firstAvg = firstMonth.reduce((a, b) => a + b, 0) / firstMonth.length;
  const lastAvg = lastMonth.reduce((a, b) => a + b, 0) / lastMonth.length;
  const growth_rate = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

  return {
    predictions,
    growth_rate: Math.round(growth_rate * 10) / 10,
    seasonality: {
      pattern: result.seasonality.pattern,
      peak_months: result.seasonality.peakMonths,
      low_months: result.seasonality.lowMonths,
      strength: Math.round(result.seasonality.strength),
    },
    model_confidence: Math.round(result.confidence),
    trend_direction: result.trendDirection,
    model_weights: {
      sarima: Math.round(result.modelWeights.sarima * 100) / 100,
      ets: Math.round(result.modelWeights.ets * 100) / 100,
      theta: Math.round(result.modelWeights.theta * 100) / 100,
      dampedTrend: Math.round(result.modelWeights.dampedTrend * 100) / 100,
    },
    accuracy: result.accuracy,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = lstmPredictSchema.parse(body);

    const { historicalData, predictionMonths, keyword } = validated;

    if (historicalData.length < 14) {
      return NextResponse.json(
        { success: false, error: '최소 14일 이상의 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // Use ensemble model for prediction
    const result = predictWithEnsembleModel(historicalData, predictionMonths);

    return NextResponse.json({
      success: true,
      data: {
        keyword,
        predictions: result.predictions,
        growth_rate: result.growth_rate,
        seasonality: result.seasonality,
        model_confidence: result.model_confidence,
        trend_direction: result.trend_direction,
        model_type: 'ensemble_sarima_ets_theta_damped',
        model_weights: result.model_weights,
        accuracy: result.accuracy,
      },
    });
  } catch (error) {
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

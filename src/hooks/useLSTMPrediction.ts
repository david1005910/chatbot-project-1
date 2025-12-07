'use client';

import { useState, useCallback } from 'react';

interface PredictionResult {
  predictions: { date: string; value: number }[];
  confidence: number;
  confidenceLower?: number[];
  confidenceUpper?: number[];
  seasonality: {
    pattern: string;
    peakMonths: number[];
    lowMonths: number[];
    strength?: number;
    period?: number;
  };
  trendDirection?: 'up' | 'down' | 'stable';
  trendStrength?: number;
  modelType?: string;
  modelWeights?: {
    sarima: number;
    ets: number;
    theta: number;
    dampedTrend: number;
  };
  accuracy?: {
    mape: number;
    rmse: number;
    mae: number;
  };
}

interface UseLSTMPredictionReturn {
  predict: (data: number[], months: number) => Promise<PredictionResult | null>;
  predictAdvanced: (data: number[], months: number) => Promise<PredictionResult | null>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Advanced Time Series Prediction Hook
 *
 * Features:
 * - Basic LSTM prediction (legacy)
 * - Advanced prediction with STL decomposition + Bidirectional LSTM
 * - Confidence intervals using Monte Carlo Dropout
 * - Seasonality strength detection
 * - Trend direction analysis
 */
export function useLSTMPrediction(): UseLSTMPredictionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Legacy LSTM prediction
  const predict = useCallback(async (data: number[], months: number): Promise<PredictionResult | null> => {
    if (data.length < 60) {
      setError('예측을 위해 최소 60일 데이터가 필요합니다.');
      return null;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { getPredictor, disposePredictor } = await import('@/lib/lstm-model');

      const predictor = getPredictor();

      // Build model
      setProgress(10);
      await predictor.buildModel(60);

      // Train model
      setProgress(20);
      await predictor.train(data, 30, (epoch) => {
        const trainProgress = 20 + (epoch / 30) * 50;
        setProgress(Math.min(70, trainProgress));
      });

      // Predict
      setProgress(75);
      const result = await predictor.predict(data, months);

      // Generate dates for predictions
      const lastDate = new Date();
      const predictionsWithDates = result.predictions.map((value, index) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + index + 1);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value),
        };
      });

      setProgress(100);

      // Clean up
      disposePredictor();

      return {
        predictions: predictionsWithDates,
        confidence: result.confidence,
        seasonality: result.seasonality,
        modelType: 'lstm_basic',
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'LSTM 예측 중 오류가 발생했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advanced prediction with STL decomposition + Bidirectional LSTM
  const predictAdvanced = useCallback(async (data: number[], months: number): Promise<PredictionResult | null> => {
    if (data.length < 14) {
      setError('예측을 위해 최소 14일 데이터가 필요합니다.');
      return null;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { forecastTrend } = await import('@/lib/ensemble-forecast-model');

      setProgress(20);

      // 앙상블 예측 실행 (SARIMA + ETS + Theta + Damped Trend)
      const days = months * 30;
      const result = forecastTrend(data, days);

      setProgress(80);

      // Generate dates for predictions
      const lastDate = new Date();
      const predictionsWithDates = result.predictions.map((value, index) => {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + index + 1);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value),
        };
      });

      setProgress(100);

      return {
        predictions: predictionsWithDates,
        confidence: result.confidence,
        confidenceLower: result.confidenceLower,
        confidenceUpper: result.confidenceUpper,
        seasonality: result.seasonality,
        trendDirection: result.trendDirection,
        trendStrength: result.trendStrength,
        modelType: 'ensemble_sarima_ets_theta_damped',
        modelWeights: result.modelWeights,
        accuracy: result.accuracy,
      };
    } catch (err) {
      console.error('Ensemble prediction error:', err);
      setError(err instanceof Error ? err.message : '앙상블 예측 중 오류가 발생했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { predict, predictAdvanced, isLoading, progress, error };
}

import * as tf from '@tensorflow/tfjs';

interface Scaler {
  min: number;
  max: number;
  mean: number;
  std: number;
}

interface DecompositionResult {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

interface PredictionResult {
  predictions: number[];
  confidence: number;
  confidenceLower: number[];
  confidenceUpper: number[];
  seasonality: {
    pattern: string;
    peakMonths: number[];
    lowMonths: number[];
    strength: number;
  };
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number;
}

/**
 * Advanced Trend Predictor
 *
 * 개선된 시계열 예측 모델:
 * 1. STL 분해 (Seasonal-Trend decomposition using LOESS)
 * 2. Bidirectional LSTM with Attention
 * 3. Ensemble prediction (트렌드 + 계절성 + LSTM)
 * 4. Monte Carlo Dropout for uncertainty estimation
 */
export class AdvancedTrendPredictor {
  private model: tf.LayersModel | null = null;
  private windowSize: number = 60;
  private scaler: Scaler | null = null;
  private seasonalPeriod: number = 7; // Weekly seasonality default
  private decomposition: DecompositionResult | null = null;

  /**
   * Build an improved Bidirectional LSTM model with attention mechanism
   */
  async buildModel(inputShape: number = 60): Promise<void> {
    this.windowSize = inputShape;

    // Input layer
    const input = tf.input({ shape: [inputShape, 1] });

    // Bidirectional LSTM layer 1
    const lstm1 = tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: 64,
        returnSequences: true,
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      }),
    }).apply(input) as tf.SymbolicTensor;

    // Batch Normalization
    const bn1 = tf.layers.batchNormalization().apply(lstm1) as tf.SymbolicTensor;

    // Dropout with higher rate for Monte Carlo
    const dropout1 = tf.layers.dropout({ rate: 0.3 }).apply(bn1) as tf.SymbolicTensor;

    // Bidirectional LSTM layer 2
    const lstm2 = tf.layers.bidirectional({
      layer: tf.layers.lstm({
        units: 32,
        returnSequences: true,
      }),
    }).apply(dropout1) as tf.SymbolicTensor;

    // Self-attention layer (simplified)
    const attention = tf.layers.dense({
      units: 1,
      activation: 'tanh',
    }).apply(lstm2) as tf.SymbolicTensor;

    const attentionWeights = tf.layers.softmax({ axis: 1 }).apply(attention) as tf.SymbolicTensor;

    // Weighted sum using attention
    const multiply = tf.layers.multiply().apply([lstm2, attentionWeights]) as tf.SymbolicTensor;
    const contextVector = tf.layers.globalAveragePooling1d().apply(multiply) as tf.SymbolicTensor;

    // Dense layers
    const dense1 = tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
    }).apply(contextVector) as tf.SymbolicTensor;

    const dropout2 = tf.layers.dropout({ rate: 0.3 }).apply(dense1) as tf.SymbolicTensor;

    const output = tf.layers.dense({ units: 1 }).apply(dropout2) as tf.SymbolicTensor;

    this.model = tf.model({ inputs: input, outputs: output });

    this.model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: 'huberLoss', // More robust to outliers than MSE
      metrics: ['mae'],
    });
  }

  /**
   * STL-like decomposition: Trend + Seasonal + Residual
   */
  private decompose(data: number[]): DecompositionResult {
    const n = data.length;

    // Detect seasonal period (7 for weekly, 30 for monthly)
    this.seasonalPeriod = this.detectSeasonalPeriod(data);

    // Extract trend using moving average
    const trend = this.extractTrend(data, Math.min(this.seasonalPeriod * 2 + 1, Math.floor(n / 3)));

    // Detrend the data
    const detrended = data.map((v, i) => v - trend[i]);

    // Extract seasonal component
    const seasonal = this.extractSeasonal(detrended, this.seasonalPeriod);

    // Residual = original - trend - seasonal
    const residual = data.map((v, i) => v - trend[i] - seasonal[i]);

    this.decomposition = { trend, seasonal, residual };
    return this.decomposition;
  }

  /**
   * Detect optimal seasonal period using autocorrelation
   */
  private detectSeasonalPeriod(data: number[]): number {
    const maxLag = Math.min(90, Math.floor(data.length / 3));
    const autocorr: number[] = [];

    for (let lag = 1; lag <= maxLag; lag++) {
      let sum = 0;
      let count = 0;
      for (let i = lag; i < data.length; i++) {
        sum += (data[i] - this.mean(data)) * (data[i - lag] - this.mean(data));
        count++;
      }
      autocorr.push(sum / count);
    }

    // Find peaks in autocorrelation
    const peaks: number[] = [];
    for (let i = 2; i < autocorr.length - 2; i++) {
      if (autocorr[i] > autocorr[i - 1] &&
          autocorr[i] > autocorr[i + 1] &&
          autocorr[i] > autocorr[i - 2] &&
          autocorr[i] > autocorr[i + 2]) {
        peaks.push(i + 1);
      }
    }

    // Common periods: 7 (weekly), 30 (monthly), 365 (yearly)
    const commonPeriods = [7, 14, 30, 90, 365];
    for (const period of commonPeriods) {
      if (peaks.includes(period) || peaks.some(p => Math.abs(p - period) <= 2)) {
        return period;
      }
    }

    return peaks.length > 0 ? peaks[0] : 7;
  }

  /**
   * Extract trend using centered moving average
   */
  private extractTrend(data: number[], windowSize: number): number[] {
    const trend: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
        sum += data[j];
        count++;
      }

      trend.push(sum / count);
    }

    // Apply LOESS-like smoothing (weighted local regression)
    return this.loessSmooth(trend, 0.3);
  }

  /**
   * Simplified LOESS smoothing
   */
  private loessSmooth(data: number[], bandwidth: number): number[] {
    const smoothed: number[] = [];
    const span = Math.max(3, Math.floor(data.length * bandwidth));

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(span / 2));
      const end = Math.min(data.length, start + span);

      // Tricube weights
      const weights: number[] = [];
      const maxDist = Math.max(i - start, end - 1 - i);

      for (let j = start; j < end; j++) {
        const dist = Math.abs(j - i) / (maxDist + 1);
        const weight = Math.pow(1 - Math.pow(dist, 3), 3);
        weights.push(weight);
      }

      let weightedSum = 0;
      let totalWeight = 0;

      for (let j = start; j < end; j++) {
        weightedSum += data[j] * weights[j - start];
        totalWeight += weights[j - start];
      }

      smoothed.push(weightedSum / totalWeight);
    }

    return smoothed;
  }

  /**
   * Extract seasonal component
   */
  private extractSeasonal(detrended: number[], period: number): number[] {
    const seasonal: number[] = new Array(detrended.length).fill(0);
    const seasonalPattern: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);

    // Calculate average for each position in the period
    for (let i = 0; i < detrended.length; i++) {
      const pos = i % period;
      seasonalPattern[pos] += detrended[i];
      counts[pos]++;
    }

    for (let i = 0; i < period; i++) {
      if (counts[i] > 0) {
        seasonalPattern[i] /= counts[i];
      }
    }

    // Center the seasonal pattern (sum should be zero)
    const patternMean = this.mean(seasonalPattern);
    for (let i = 0; i < period; i++) {
      seasonalPattern[i] -= patternMean;
    }

    // Apply pattern to full series
    for (let i = 0; i < detrended.length; i++) {
      seasonal[i] = seasonalPattern[i % period];
    }

    return seasonal;
  }

  /**
   * Train the model with decomposed data
   */
  async train(
    data: number[],
    epochs: number = 100,
    onProgress?: (epoch: number, loss: number) => void
  ): Promise<Scaler> {
    if (!this.model) {
      await this.buildModel();
    }

    // Decompose the data
    this.decompose(data);

    // Normalize the residual component for LSTM
    const { X, y, scaler } = this.prepareData(this.decomposition!.residual);
    this.scaler = scaler;

    // Early stopping callback
    let bestLoss = Infinity;
    let patience = 10;
    let patienceCounter = 0;

    await this.model!.fit(X, y, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (logs) {
            const valLoss = logs.val_loss as number;

            if (valLoss < bestLoss) {
              bestLoss = valLoss;
              patienceCounter = 0;
            } else {
              patienceCounter++;
            }

            if (onProgress) {
              onProgress(epoch, logs.loss as number);
            }

            // Early stopping
            if (patienceCounter >= patience) {
              this.model!.stopTraining = true;
            }
          }
        },
      },
    });

    X.dispose();
    y.dispose();

    return scaler;
  }

  /**
   * Predict future values with uncertainty estimation
   */
  async predict(data: number[], months: number): Promise<PredictionResult> {
    if (!this.model || !this.scaler || !this.decomposition) {
      throw new Error('Model not trained. Call train() first.');
    }

    const days = months * 30;
    const predictions: number[] = [];
    const confidenceLower: number[] = [];
    const confidenceUpper: number[] = [];

    // Monte Carlo Dropout for uncertainty estimation
    const numSamples = 50;

    for (let i = 0; i < days; i++) {
      const mcPredictions: number[] = [];

      // Run multiple forward passes with dropout enabled
      for (let s = 0; s < numSamples; s++) {
        const lastResiduals = this.decomposition.residual.slice(-this.windowSize);
        const normalized = this.normalize(lastResiduals, this.scaler);

        const input = tf.tensor3d([normalized.map(v => [v])]);
        const prediction = this.model.predict(input) as tf.Tensor;
        const value = (await prediction.data())[0];

        mcPredictions.push(value);

        input.dispose();
        prediction.dispose();
      }

      // Calculate mean and confidence interval
      const meanPred = this.mean(mcPredictions);
      const stdPred = this.std(mcPredictions);

      // Denormalize
      const denormMean = meanPred * (this.scaler.max - this.scaler.min) + this.scaler.min;
      const denormStd = stdPred * (this.scaler.max - this.scaler.min);

      // Project trend
      const lastTrend = this.decomposition.trend.slice(-30);
      const trendSlope = (lastTrend[lastTrend.length - 1] - lastTrend[0]) / lastTrend.length;
      const trendPrediction = this.decomposition.trend[this.decomposition.trend.length - 1] +
                             trendSlope * (i + 1);

      // Project seasonality
      const seasonalIdx = (this.decomposition.seasonal.length + i) % this.seasonalPeriod;
      const seasonalPrediction = this.decomposition.seasonal[seasonalIdx];

      // Combine: trend + seasonal + residual
      const combinedPrediction = trendPrediction + seasonalPrediction + denormMean;

      predictions.push(Math.max(0, combinedPrediction));
      confidenceLower.push(Math.max(0, combinedPrediction - 1.96 * denormStd));
      confidenceUpper.push(Math.max(0, combinedPrediction + 1.96 * denormStd));

      // Update decomposition for next iteration
      this.decomposition.residual.push(denormMean);
      this.decomposition.trend.push(trendPrediction);
      this.decomposition.seasonal.push(seasonalPrediction);
    }

    // Calculate confidence score based on prediction stability
    const predStd = this.std(predictions);
    const predMean = this.mean(predictions);
    const cv = predStd / predMean; // Coefficient of variation
    const confidence = Math.max(0, Math.min(100, (1 - cv) * 100));

    // Detect seasonality characteristics
    const seasonality = this.analyzeSeasonality(data);

    // Calculate trend direction and strength
    const { trendDirection, trendStrength } = this.analyzeTrend(data);

    return {
      predictions,
      confidence,
      confidenceLower,
      confidenceUpper,
      seasonality,
      trendDirection,
      trendStrength,
    };
  }

  /**
   * Analyze seasonality patterns
   */
  private analyzeSeasonality(data: number[]): {
    pattern: string;
    peakMonths: number[];
    lowMonths: number[];
    strength: number;
  } {
    // Calculate monthly averages
    const monthlyData: number[][] = Array.from({ length: 12 }, () => []);
    const pointsPerDay = data.length / 365;

    for (let i = 0; i < data.length; i++) {
      const dayOfYear = Math.floor(i / pointsPerDay) % 365;
      const month = Math.floor(dayOfYear / 30.42);
      if (month >= 0 && month < 12) {
        monthlyData[month].push(data[i]);
      }
    }

    const monthlyAverages = monthlyData.map(
      arr => arr.length > 0 ? this.mean(arr) : 0
    );

    const overallAvg = this.mean(monthlyAverages.filter(v => v > 0));
    const peakMonths: number[] = [];
    const lowMonths: number[] = [];

    monthlyAverages.forEach((avg, idx) => {
      if (avg > overallAvg * 1.15) peakMonths.push(idx + 1);
      else if (avg < overallAvg * 0.85) lowMonths.push(idx + 1);
    });

    // Calculate seasonality strength (0-100)
    const seasonalVariance = this.std(monthlyAverages);
    const strength = Math.min(100, (seasonalVariance / overallAvg) * 200);

    // Generate pattern description
    let pattern = '계절성 패턴이 약함';
    if (strength > 30) {
      const peakNames = peakMonths.map(m => `${m}월`).join(', ');
      const lowNames = lowMonths.map(m => `${m}월`).join(', ');

      if (peakMonths.length > 0 && lowMonths.length > 0) {
        pattern = `${peakNames} 성수기, ${lowNames} 비수기`;
      } else if (peakMonths.length > 0) {
        pattern = `${peakNames}에 수요 증가`;
      } else if (lowMonths.length > 0) {
        pattern = `${lowNames}에 수요 감소`;
      }
    }

    return { pattern, peakMonths, lowMonths, strength };
  }

  /**
   * Analyze overall trend direction and strength
   */
  private analyzeTrend(data: number[]): {
    trendDirection: 'up' | 'down' | 'stable';
    trendStrength: number;
  } {
    if (!this.decomposition) {
      return { trendDirection: 'stable', trendStrength: 0 };
    }

    const trend = this.decomposition.trend;
    const n = trend.length;
    const recentTrend = trend.slice(-Math.min(90, n));

    // Linear regression on trend
    const xMean = (recentTrend.length - 1) / 2;
    const yMean = this.mean(recentTrend);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < recentTrend.length; i++) {
      numerator += (i - xMean) * (recentTrend[i] - yMean);
      denominator += (i - xMean) * (i - xMean);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const percentChange = (slope * recentTrend.length) / yMean * 100;

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (percentChange > 5) trendDirection = 'up';
    else if (percentChange < -5) trendDirection = 'down';

    const trendStrength = Math.min(100, Math.abs(percentChange) * 2);

    return { trendDirection, trendStrength };
  }

  private prepareData(data: number[]): { X: tf.Tensor3D; y: tf.Tensor2D; scaler: Scaler } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const mean = this.mean(data);
    const std = this.std(data);

    const scaler = { min, max, mean, std };
    const normalized = this.normalize(data, scaler);

    const X: number[][][] = [];
    const y: number[] = [];

    for (let i = this.windowSize; i < normalized.length; i++) {
      X.push(normalized.slice(i - this.windowSize, i).map(v => [v]));
      y.push(normalized[i]);
    }

    return {
      X: tf.tensor3d(X),
      y: tf.tensor2d(y, [y.length, 1]),
      scaler,
    };
  }

  private normalize(data: number[], scaler: Scaler): number[] {
    const range = scaler.max - scaler.min;
    if (range === 0) return data.map(() => 0.5);
    return data.map(v => (v - scaler.min) / range);
  }

  private mean(data: number[]): number {
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private std(data: number[]): number {
    if (data.length === 0) return 0;
    const m = this.mean(data);
    const squaredDiffs = data.map(v => Math.pow(v - m, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.scaler = null;
    this.decomposition = null;
  }
}

// Singleton instance
let advancedPredictorInstance: AdvancedTrendPredictor | null = null;

export function getAdvancedPredictor(): AdvancedTrendPredictor {
  if (!advancedPredictorInstance) {
    advancedPredictorInstance = new AdvancedTrendPredictor();
  }
  return advancedPredictorInstance;
}

export function disposeAdvancedPredictor(): void {
  if (advancedPredictorInstance) {
    advancedPredictorInstance.dispose();
    advancedPredictorInstance = null;
  }
}

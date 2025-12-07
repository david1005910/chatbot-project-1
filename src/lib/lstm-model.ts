import * as tf from '@tensorflow/tfjs';

interface Scaler {
  min: number;
  max: number;
}

interface PredictionResult {
  predictions: number[];
  confidence: number;
  seasonality: {
    pattern: string;
    peakMonths: number[];
    lowMonths: number[];
  };
}

export class TrendPredictor {
  private model: tf.LayersModel | null = null;
  private windowSize: number = 60;
  private scaler: Scaler | null = null;

  async buildModel(inputShape: number = 60): Promise<void> {
    this.windowSize = inputShape;

    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [inputShape, 1],
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false,
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25, activation: 'relu' }),
        tf.layers.dense({ units: 1 }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });
  }

  async train(
    data: number[],
    epochs: number = 50,
    onProgress?: (epoch: number, loss: number) => void
  ): Promise<Scaler> {
    if (!this.model) {
      await this.buildModel();
    }

    const { X, y, scaler } = this.prepareData(data);
    this.scaler = scaler;

    await this.model!.fit(X, y, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onProgress && logs) {
            onProgress(epoch, logs.loss as number);
          }
        },
      },
    });

    // Clean up tensors
    X.dispose();
    y.dispose();

    return scaler;
  }

  async predict(data: number[], months: number): Promise<PredictionResult> {
    if (!this.model || !this.scaler) {
      throw new Error('Model not trained. Call train() first.');
    }

    const normalized = this.normalize(data, this.scaler);
    const predictions: number[] = [];
    let currentSequence = normalized.slice(-this.windowSize);

    for (let i = 0; i < months * 30; i++) {
      const input = tf.tensor3d([currentSequence.map((v) => [v])]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const value = (await prediction.data())[0];

      predictions.push(value);
      currentSequence = [...currentSequence.slice(1), value];

      // Clean up tensors
      input.dispose();
      prediction.dispose();
    }

    // Denormalize predictions
    const denormalized = predictions.map(
      (v) => v * (this.scaler!.max - this.scaler!.min) + this.scaler!.min
    );

    // Calculate confidence based on prediction variance
    const variance = this.calculateVariance(denormalized);
    const confidence = Math.max(0, Math.min(100, 100 - variance * 10));

    // Detect seasonality
    const seasonality = this.detectSeasonality(data);

    return {
      predictions: denormalized,
      confidence,
      seasonality,
    };
  }

  private prepareData(data: number[]): { X: tf.Tensor3D; y: tf.Tensor2D; scaler: Scaler } {
    // Min-Max normalization
    const min = Math.min(...data);
    const max = Math.max(...data);
    const scaler = { min, max };
    const normalized = this.normalize(data, scaler);

    // Create sequences
    const X: number[][][] = [];
    const y: number[] = [];

    for (let i = this.windowSize; i < normalized.length; i++) {
      X.push(normalized.slice(i - this.windowSize, i).map((v) => [v]));
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
    return data.map((v) => (v - scaler.min) / range);
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / data.length) / mean;
  }

  private detectSeasonality(data: number[]): {
    pattern: string;
    peakMonths: number[];
    lowMonths: number[];
  } {
    // Group data by month (assuming daily data)
    const monthlyAverages: number[] = Array(12).fill(0);
    const monthlyCounts: number[] = Array(12).fill(0);

    // Simple monthly aggregation
    const pointsPerMonth = Math.floor(data.length / 12);
    for (let i = 0; i < data.length; i++) {
      const monthIndex = Math.floor(i / pointsPerMonth) % 12;
      monthlyAverages[monthIndex] += data[i];
      monthlyCounts[monthIndex]++;
    }

    for (let i = 0; i < 12; i++) {
      if (monthlyCounts[i] > 0) {
        monthlyAverages[i] /= monthlyCounts[i];
      }
    }

    // Find peak and low months
    const overallAverage = monthlyAverages.reduce((a, b) => a + b, 0) / 12;
    const peakMonths: number[] = [];
    const lowMonths: number[] = [];

    monthlyAverages.forEach((avg, index) => {
      if (avg > overallAverage * 1.2) {
        peakMonths.push(index + 1);
      } else if (avg < overallAverage * 0.8) {
        lowMonths.push(index + 1);
      }
    });

    // Generate pattern description
    let pattern = '뚜렷한 계절성 패턴 없음';
    if (peakMonths.length > 0) {
      const peakMonthNames = peakMonths.map((m) => `${m}월`).join(', ');
      pattern = `${peakMonthNames}에 검색량 급상승`;
      if (lowMonths.length > 0) {
        const lowMonthNames = lowMonths.map((m) => `${m}월`).join(', ');
        pattern += `, ${lowMonthNames}에 검색량 감소`;
      }
    }

    return { pattern, peakMonths, lowMonths };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.scaler = null;
  }
}

// Singleton instance for reuse
let predictorInstance: TrendPredictor | null = null;

export function getPredictor(): TrendPredictor {
  if (!predictorInstance) {
    predictorInstance = new TrendPredictor();
  }
  return predictorInstance;
}

export function disposePredictor(): void {
  if (predictorInstance) {
    predictorInstance.dispose();
    predictorInstance = null;
  }
}

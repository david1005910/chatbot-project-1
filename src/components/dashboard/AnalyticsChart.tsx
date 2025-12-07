'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// 차트 색상 팔레트
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface TrendChartProps {
  data: { period: string; ratio: number }[];
  title?: string;
  color?: string;
  showPrediction?: boolean;
  predictionData?: { period: string; predicted: number }[];
}

export function TrendLineChart({
  data,
  title = '트렌드',
  color = '#3B82F6',
  showPrediction = false,
  predictionData = [],
}: TrendChartProps) {
  const chartData = useMemo(() => {
    const historicalData = data.map(d => ({
      date: d.period,
      actual: d.ratio,
      predicted: null as number | null,
    }));

    if (showPrediction && predictionData.length > 0) {
      predictionData.forEach(p => {
        historicalData.push({
          date: p.period,
          actual: null as unknown as number,
          predicted: p.predicted,
        });
      });
    }

    return historicalData;
  }, [data, showPrediction, predictionData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            name="실제"
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          {showPrediction && (
            <Line
              type="monotone"
              dataKey="predicted"
              name="예측"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ComparisonChartProps {
  data: { name: string; values: number[] }[];
  labels: string[];
  title?: string;
}

export function ComparisonBarChart({ data, labels, title = '비교' }: ComparisonChartProps) {
  const chartData = useMemo(() => {
    return labels.map((label, i) => {
      const point: Record<string, string | number> = { name: label };
      data.forEach(d => {
        point[d.name] = d.values[i] || 0;
      });
      return point;
    });
  }, [data, labels]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Legend />
          {data.map((d, i) => (
            <Bar key={d.name} dataKey={d.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DistributionChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function DistributionPieChart({ data, title = '분포' }: DistributionChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartProps {
  data: { period: string; value: number }[];
  title?: string;
  color?: string;
  gradient?: boolean;
}

export function TrendAreaChart({
  data,
  title = '추이',
  color = '#3B82F6',
  gradient = true,
}: AreaChartProps) {
  const gradientId = `colorGradient-${color.replace('#', '')}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={gradient ? `url(#${gradientId})` : color}
            fillOpacity={gradient ? 1 : 0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 스탯 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, changeLabel = '전월 대비', icon }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {isNegative && (
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className={`text-sm ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  keyword: string;
  data: { date: string; value: number }[];
  color?: string;
}

interface TrendComparisonChartProps {
  trends: TrendData[];
  title?: string;
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export function TrendComparisonChart({ trends, title = '트렌드 비교' }: TrendComparisonChartProps) {
  const chartData = useMemo(() => {
    if (trends.length === 0) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    trends.forEach((trend) => {
      trend.data.forEach((d) => allDates.add(d.date));
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Create chart data with all keywords
    return sortedDates.map((date) => {
      const dataPoint: Record<string, string | number> = { date };

      trends.forEach((trend) => {
        const point = trend.data.find((d) => d.date === date);
        dataPoint[trend.keyword] = point?.value ?? 0;
      });

      return dataPoint;
    });
  }, [trends]);

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          비교할 키워드를 선택해주세요
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            {trends.map((trend, index) => (
              <Line
                key={trend.keyword}
                type="monotone"
                dataKey={trend.keyword}
                stroke={trend.color || COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

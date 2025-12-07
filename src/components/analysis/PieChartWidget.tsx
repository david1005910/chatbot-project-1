'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartWidgetProps {
  data: DataItem[];
  title?: string;
  showLegend?: boolean;
  innerRadius?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function PieChartWidget({
  data,
  title,
  showLegend = true,
  innerRadius = 0,
}: PieChartWidgetProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-600">
            {item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

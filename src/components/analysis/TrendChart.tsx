'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  predicted?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  isFuture?: boolean;
}

interface TrendChartProps {
  data: DataPoint[];
  title?: string;
}

// 기간 프리셋 타입
type PeriodPreset = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | 'ALL';

export function TrendChart({ data, title = '트렌드 그래프' }: TrendChartProps) {
  // 선택된 기간 상태 (기본 2년)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('2Y');

  // 드래그 선택을 위한 상태
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // 줌 상태 (커스텀 범위)
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);

  // 기간에 따른 데이터 필터링
  const filteredData = useMemo(() => {
    if (zoomRange) {
      return data.slice(zoomRange.start, zoomRange.end + 1);
    }

    if (selectedPeriod === 'ALL') {
      return data;
    }

    const now = new Date();
    let daysToShow = 730;

    switch (selectedPeriod) {
      case '1W':
        daysToShow = 7;
        break;
      case '1M':
        daysToShow = 30;
        break;
      case '3M':
        daysToShow = 90;
        break;
      case '6M':
        daysToShow = 180;
        break;
      case '1Y':
        daysToShow = 365;
        break;
      case '2Y':
        daysToShow = 730;
        break;
    }

    return data.slice(-daysToShow);
  }, [data, selectedPeriod, zoomRange]);

  // 드래그 시작
  const handleMouseDown = useCallback((e: { activeLabel?: string }) => {
    if (e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
      setIsSelecting(true);
    }
  }, []);

  // 드래그 중
  const handleMouseMove = useCallback((e: { activeLabel?: string }) => {
    if (isSelecting && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  }, [isSelecting]);

  // 드래그 종료 - 줌 적용
  const handleMouseUp = useCallback(() => {
    if (refAreaLeft && refAreaRight) {
      const leftIndex = data.findIndex(d => d.date === refAreaLeft);
      const rightIndex = data.findIndex(d => d.date === refAreaRight);

      if (leftIndex !== -1 && rightIndex !== -1) {
        const start = Math.min(leftIndex, rightIndex);
        const end = Math.max(leftIndex, rightIndex);

        // 최소 7일 이상 선택해야 줌
        if (end - start >= 7) {
          setZoomRange({ start, end });
          setSelectedPeriod('ALL'); // 커스텀 범위이므로 프리셋 해제
        }
      }
    }

    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelecting(false);
  }, [data, refAreaLeft, refAreaRight]);

  // 줌 리셋
  const handleZoomReset = useCallback(() => {
    setZoomRange(null);
    setSelectedPeriod('2Y');
  }, []);

  // 기간 버튼 클릭
  const handlePeriodChange = useCallback((period: PeriodPreset) => {
    setSelectedPeriod(period);
    setZoomRange(null);
  }, []);

  // 통계 계산 (유효한 숫자만 사용)
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    // 유효한 숫자만 필터링 (NaN, undefined, null 제외)
    const values = filteredData
      .map(d => d.value)
      .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));

    if (values.length === 0) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // 변화율 계산 (과거 데이터만 사용)
    const pastData = filteredData.filter(d => !d.isFuture);
    const pastValues = pastData
      .map(d => d.value)
      .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));

    let changeRate = 0;
    if (pastValues.length >= 2) {
      const firstValue = pastValues[0];
      const lastValue = pastValues[pastValues.length - 1];
      changeRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    }

    return { min, max, avg, changeRate };
  }, [filteredData]);

  // 날짜 포맷터
  const formatDate = useCallback((value: string) => {
    const date = new Date(value);
    const dataLength = filteredData.length;

    // 데이터 길이에 따라 포맷 조정
    if (dataLength <= 14) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (dataLength <= 90) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      return `${date.getFullYear().toString().slice(2)}/${date.getMonth() + 1}`;
    }
  }, [filteredData.length]);

  // X축 틱 간격 계산
  const tickInterval = useMemo(() => {
    const length = filteredData.length;
    if (length <= 14) return 0; // 모든 날짜 표시
    if (length <= 30) return 2; // 3일마다
    if (length <= 90) return 6; // 주간
    if (length <= 180) return 13; // 2주마다
    return 29; // 월간
  }, [filteredData.length]);

  const periodButtons: { key: PeriodPreset; label: string }[] = [
    { key: '1W', label: '1주' },
    { key: '1M', label: '1개월' },
    { key: '3M', label: '3개월' },
    { key: '6M', label: '6개월' },
    { key: '1Y', label: '1년' },
    { key: '2Y', label: '2년' },
    { key: 'ALL', label: '전체' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 헤더 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        {/* 기간 선택 버튼 */}
        <div className="flex items-center gap-1 flex-wrap">
          {periodButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePeriodChange(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === key && !zoomRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}

          {zoomRange && (
            <button
              onClick={handleZoomReset}
              className="px-3 py-1 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors ml-2"
            >
              줌 리셋
            </button>
          )}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
          <p className="text-blue-600 dark:text-blue-400 text-xs font-medium mb-1">최저</p>
          <p className="font-bold text-xl text-blue-800 dark:text-blue-200">
            {stats ? stats.min.toFixed(1) : '-'}
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-center">
          <p className="text-rose-600 dark:text-rose-400 text-xs font-medium mb-1">최고</p>
          <p className="font-bold text-xl text-rose-800 dark:text-rose-200">
            {stats ? stats.max.toFixed(1) : '-'}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
          <p className="text-purple-600 dark:text-purple-400 text-xs font-medium mb-1">평균</p>
          <p className="font-bold text-xl text-purple-800 dark:text-purple-200">
            {stats ? stats.avg.toFixed(1) : '-'}
          </p>
        </div>
        <div className={`rounded-lg p-3 text-center border ${
          stats && stats.changeRate > 0
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
            : stats && stats.changeRate < 0
              ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
        }`}>
          <p className={`text-xs font-medium mb-1 ${
            stats && stats.changeRate > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : stats && stats.changeRate < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
          }`}>변화율</p>
          <p className={`font-bold text-xl ${
            stats && stats.changeRate > 0
              ? 'text-emerald-700 dark:text-emerald-300'
              : stats && stats.changeRate < 0
                ? 'text-red-700 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
          }`}>
            {stats ? (
              <>
                {stats.changeRate > 0 ? '▲ +' : stats.changeRate < 0 ? '▼ ' : ''}
                {stats.changeRate.toFixed(1)}%
              </>
            ) : '-'}
          </p>
        </div>
      </div>

      {/* 사용 안내 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        차트를 드래그하여 특정 기간을 확대할 수 있습니다
      </p>

      {/* 메인 차트 */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

            {/* 오늘 날짜 기준선 (예측 영역 시작점) */}
            {filteredData.some((d) => d.isFuture) && (
              <ReferenceLine
                x={new Date().toISOString().split('T')[0]}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '오늘',
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            )}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={formatDate}
              interval={tickInterval}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const targetDate = new Date(date);
                targetDate.setHours(0, 0, 0, 0);
                const isFuture = targetDate > today;

                const dateStr = date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                });

                return isFuture ? `${dateStr} (예측)` : dateStr;
              }}
              formatter={(value: number, name: string, props: { payload?: DataPoint }) => {
                const isFuture = props.payload?.isFuture;
                if (name === 'value' && !isFuture) {
                  return [value.toFixed(1), '검색량'];
                }
                if (name === 'predicted' || (name === 'value' && isFuture)) {
                  return [value.toFixed(1), '예측 검색량'];
                }
                if (name === 'confidenceUpper') {
                  const lower = props.payload?.confidenceLower?.toFixed(1) || '-';
                  return [`${lower} ~ ${value.toFixed(1)}`, '95% 신뢰구간'];
                }
                return [value.toFixed(1), name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => {
                if (value === 'value') return '실제 검색량';
                if (value === 'predicted') return '예측 검색량';
                if (value === 'confidenceUpper') return '95% 신뢰구간';
                return value;
              }}
            />

            {/* 면적 그래프 (배경) */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fillOpacity={1}
              fill="url(#colorValue)"
            />

            {/* 실제 검색량 라인 */}
            <Line
              type="monotone"
              dataKey="value"
              name="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />

            {/* 신뢰구간 영역 */}
            {filteredData.some((d) => d.confidenceUpper !== undefined) && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stroke="transparent"
                fill="url(#colorConfidence)"
                fillOpacity={0.5}
                name="confidenceUpper"
                legendType="none"
              />
            )}

            {/* 예측값 라인 */}
            {filteredData.some((d) => d.predicted !== undefined) && (
              <>
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="transparent"
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="predicted"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={(props: { cx?: number; cy?: number; index?: number; payload?: DataPoint }) => {
                    const { cx, cy, payload } = props;
                    if (payload?.isFuture && cx !== undefined && cy !== undefined) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="#10b981"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <></>;
                  }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </>
            )}

            {/* 드래그 선택 영역 표시 */}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            )}

            {/* 브러시 (미니맵 네비게이터) */}
            <Brush
              dataKey="date"
              height={40}
              stroke="#3b82f6"
              fill="#f3f4f6"
              tickFormatter={formatDate}
              startIndex={0}
              endIndex={filteredData.length - 1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 현재 표시 기간 */}
      {filteredData.length > 0 && (
        <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {new Date(filteredData[0].date).toLocaleDateString('ko-KR')} ~ {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('ko-KR')}
          <span className="ml-2 text-gray-400">({filteredData.length}일)</span>
        </div>
      )}
    </div>
  );
}

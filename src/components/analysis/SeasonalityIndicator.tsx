'use client';

import { useMemo } from 'react';

export type SeasonalityType = 'evergreen' | 'seasonal' | 'highly_seasonal';

export interface SeasonalityInfo {
  type: SeasonalityType;
  strength: number; // 0-100
  peakMonths: number[];
  lowMonths: number[];
  pattern: string;
  recommendation: string;
}

interface SeasonalityIndicatorProps {
  seasonalityInfo: SeasonalityInfo;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 계절성 분류:
 * - evergreen (상록수): 계절 변화에 민감하지 않음 (strength < 20)
 * - seasonal (계절성): 중간 정도의 계절 변동 (20 <= strength < 50)
 * - highly_seasonal (고계절성): 특정 계절에만 수요 급증 (strength >= 50)
 */
export function classifySeasonality(
  data: number[],
  seasonalStrength?: number
): SeasonalityInfo {
  // 기본 strength가 제공되지 않으면 계산
  const strength = seasonalStrength ?? calculateSeasonalStrength(data);

  // 월별 평균 계산
  const monthlyData: number[][] = Array.from({ length: 12 }, () => []);
  const pointsPerMonth = Math.floor(data.length / 12);

  for (let i = 0; i < data.length; i++) {
    const monthIndex = Math.floor((i / data.length) * 12) % 12;
    monthlyData[monthIndex].push(data[i]);
  }

  const monthlyAverages = monthlyData.map(arr =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  );

  const validMonths = monthlyAverages.filter(v => v > 0);
  const overallAvg = validMonths.length > 0
    ? validMonths.reduce((a, b) => a + b, 0) / validMonths.length
    : 1;

  // 피크/저조 월 찾기
  const peakMonths: number[] = [];
  const lowMonths: number[] = [];

  monthlyAverages.forEach((avg, idx) => {
    if (avg > 0) {
      if (avg > overallAvg * 1.2) peakMonths.push(idx + 1);
      else if (avg < overallAvg * 0.8) lowMonths.push(idx + 1);
    }
  });

  // 계절성 타입 결정
  let type: SeasonalityType;
  let pattern: string;
  let recommendation: string;

  if (strength < 20) {
    type = 'evergreen';
    pattern = '연중 안정적인 수요';
    recommendation = '재고 관리가 용이하며, 연중 일정한 마케팅 전략 적용 가능';
  } else if (strength < 50) {
    type = 'seasonal';
    const peakStr = peakMonths.map(m => `${m}월`).join(', ');
    pattern = peakMonths.length > 0
      ? `${peakStr}에 수요 증가`
      : '약한 계절 변동';
    recommendation = '성수기 전 재고 확보 권장, 비수기에는 프로모션 고려';
  } else {
    type = 'highly_seasonal';
    const peakStr = peakMonths.map(m => `${m}월`).join(', ');
    const lowStr = lowMonths.map(m => `${m}월`).join(', ');
    pattern = peakMonths.length > 0 && lowMonths.length > 0
      ? `${peakStr} 성수기, ${lowStr} 비수기`
      : peakMonths.length > 0
      ? `${peakStr}에 수요 집중`
      : '강한 계절 변동';
    recommendation = '성수기 집중 판매, 비수기 재고 최소화 필요. 계절 상품으로 분류';
  }

  return {
    type,
    strength: Math.round(strength),
    peakMonths,
    lowMonths,
    pattern,
    recommendation,
  };
}

/**
 * 계절 강도 계산 (Coefficient of Variation 기반)
 */
function calculateSeasonalStrength(data: number[]): number {
  if (data.length < 30) return 0;

  // 월별 데이터 그룹화
  const monthlyData: number[][] = Array.from({ length: 12 }, () => []);

  for (let i = 0; i < data.length; i++) {
    const monthIndex = Math.floor((i / data.length) * 12) % 12;
    monthlyData[monthIndex].push(data[i]);
  }

  const monthlyAverages = monthlyData
    .map(arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
    .filter(v => v > 0);

  if (monthlyAverages.length < 4) return 0;

  const mean = monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length;
  const variance = monthlyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyAverages.length;
  const std = Math.sqrt(variance);
  const cv = mean > 0 ? (std / mean) * 100 : 0;

  // CV를 0-100 범위로 매핑
  return Math.min(100, cv * 3);
}

/**
 * 계절성 타입별 색상 설정
 */
export function getSeasonalityColor(type: SeasonalityType): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (type) {
    case 'evergreen':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-700',
        icon: '#10b981', // emerald-500
      };
    case 'seasonal':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
        icon: '#f59e0b', // amber-500
      };
    case 'highly_seasonal':
      return {
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-700',
        icon: '#f43f5e', // rose-500
      };
  }
}

/**
 * 계절성 타입 한글 레이블
 */
export function getSeasonalityLabel(type: SeasonalityType): string {
  switch (type) {
    case 'evergreen':
      return '상록수 (연중 안정)';
    case 'seasonal':
      return '계절성 상품';
    case 'highly_seasonal':
      return '고계절성 상품';
  }
}

/**
 * 계절성 아이콘 (SVG)
 */
function SeasonalityIcon({ type, size = 24 }: { type: SeasonalityType; size?: number }) {
  const color = getSeasonalityColor(type).icon;

  switch (type) {
    case 'evergreen':
      // 나무 아이콘 (상록수)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 12H7L3 20H11V22H13V20H21L17 12H20L12 2Z" fill={color} />
        </svg>
      );
    case 'seasonal':
      // 반원 차트 아이콘 (계절 변동)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
          <path d="M12 2C17.523 2 22 6.477 22 12H12V2Z" fill={color} />
        </svg>
      );
    case 'highly_seasonal':
      // 눈송이/태양 아이콘 (극단적 계절성)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill={color} />
          <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

/**
 * 월별 바 그래프 (미니) - 날짜 데이터 기반
 */
function MonthlyBar({ data, dates, peakMonths, lowMonths }: {
  data: number[];
  dates?: string[];
  peakMonths: number[];
  lowMonths: number[];
}) {
  const monthlyData: number[] = Array(12).fill(0);
  const counts: number[] = Array(12).fill(0);

  // 날짜 정보가 있으면 실제 월 기준으로 계산
  if (dates && dates.length === data.length) {
    for (let i = 0; i < data.length; i++) {
      const date = new Date(dates[i]);
      const monthIndex = date.getMonth(); // 0-11
      monthlyData[monthIndex] += data[i];
      counts[monthIndex]++;
    }
  } else {
    // 날짜 정보가 없으면 현재 날짜 기준으로 역산
    const now = new Date();
    for (let i = 0; i < data.length; i++) {
      const daysAgo = data.length - 1 - i;
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const monthIndex = date.getMonth();
      monthlyData[monthIndex] += data[i];
      counts[monthIndex]++;
    }
  }

  const averages = monthlyData.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
  const maxVal = Math.max(...averages.filter(v => v > 0));

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="flex items-end gap-1.5 h-24">
      {averages.map((val, idx) => {
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const isPeak = peakMonths.includes(idx + 1);
        const isLow = lowMonths.includes(idx + 1);
        const hasData = counts[idx] > 0;

        // 색상 및 스타일 설정
        let barColor = 'bg-gray-400 dark:bg-gray-500';
        let labelBg = 'bg-gray-100 dark:bg-gray-700';
        let labelText = 'text-gray-600 dark:text-gray-400';
        let borderStyle = '';

        if (!hasData) {
          barColor = 'bg-gray-200 dark:bg-gray-700';
        } else if (isPeak) {
          barColor = 'bg-gradient-to-t from-rose-600 to-rose-400';
          labelBg = 'bg-rose-100 dark:bg-rose-900/50';
          labelText = 'text-rose-700 dark:text-rose-300 font-semibold';
          borderStyle = 'ring-2 ring-rose-300 dark:ring-rose-600';
        } else if (isLow) {
          barColor = 'bg-gradient-to-t from-blue-500 to-blue-300';
          labelBg = 'bg-blue-100 dark:bg-blue-900/50';
          labelText = 'text-blue-700 dark:text-blue-300 font-semibold';
          borderStyle = 'ring-2 ring-blue-300 dark:ring-blue-600';
        }

        return (
          <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
            {/* 바 영역 */}
            <div className="relative w-full flex-1 flex items-end justify-center">
              <div
                className={`w-full max-w-[28px] ${barColor} ${borderStyle} rounded-t-md transition-all duration-300 cursor-pointer hover:opacity-80`}
                style={{ height: hasData ? `${Math.max(12, height)}%` : '4px' }}
                title={hasData ? `${months[idx]}: 평균 ${Math.round(val)} (${counts[idx]}일 데이터)` : `${months[idx]}: 데이터 없음`}
              >
                {/* 성수기/비수기 아이콘 */}
                {isPeak && hasData && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="text-rose-500 text-xs">▲</span>
                  </div>
                )}
                {isLow && hasData && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="text-blue-500 text-xs">▼</span>
                  </div>
                )}
              </div>
            </div>
            {/* 월 라벨 */}
            <div className={`mt-1.5 px-1 py-0.5 rounded ${labelBg}`}>
              <span className={`text-[10px] ${labelText}`}>
                {idx + 1}월
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 계절성 표시 컴포넌트
 */
export function SeasonalityIndicator({
  seasonalityInfo,
  showDetails = true,
  size = 'md'
}: SeasonalityIndicatorProps) {
  const colors = getSeasonalityColor(seasonalityInfo.type);
  const label = getSeasonalityLabel(seasonalityInfo.type);

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <SeasonalityIcon type={seasonalityInfo.type} size={iconSize} />
        <span className={`font-semibold ${colors.text} ${textSize}`}>
          {label}
        </span>
        <span className={`ml-auto ${textSize} ${colors.text}`}>
          강도: {seasonalityInfo.strength}%
        </span>
      </div>

      {showDetails && (
        <>
          <p className={`${textSize} text-gray-600 dark:text-gray-400 mb-2`}>
            {seasonalityInfo.pattern}
          </p>

          {/* 피크/저조 월 표시 */}
          {(seasonalityInfo.peakMonths.length > 0 || seasonalityInfo.lowMonths.length > 0) && (
            <div className="flex gap-4 text-xs mb-2">
              {seasonalityInfo.peakMonths.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    성수기: {seasonalityInfo.peakMonths.map(m => `${m}월`).join(', ')}
                  </span>
                </div>
              )}
              {seasonalityInfo.lowMonths.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    비수기: {seasonalityInfo.lowMonths.map(m => `${m}월`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 추천사항 */}
          <div className={`${textSize} text-gray-500 dark:text-gray-500 italic border-t border-gray-200 dark:border-gray-700 pt-2 mt-2`}>
            {seasonalityInfo.recommendation}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 간단한 계절성 배지
 */
export function SeasonalityBadge({
  type,
  strength,
  size = 'md'
}: {
  type: SeasonalityType;
  strength: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const colors = getSeasonalityColor(type);
  const label = getSeasonalityLabel(type);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${colors.bg} ${colors.text} ${sizeClasses[size]} font-medium`}>
      <SeasonalityIcon type={type} size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      {label}
      <span className="opacity-70">({strength}%)</span>
    </span>
  );
}

/**
 * 계절성 카드 (전체 정보 표시)
 */
export function SeasonalityCard({
  data,
  dates,
  seasonalStrength
}: {
  data: number[];
  dates?: string[];
  seasonalStrength?: number;
}) {
  // 날짜 정보를 사용한 월별 평균 계산
  const { monthlyAverages, seasonalityInfo } = useMemo(() => {
    const monthlyData: number[] = Array(12).fill(0);
    const counts: number[] = Array(12).fill(0);

    // 날짜 정보가 있으면 실제 월 기준으로 계산
    if (dates && dates.length === data.length) {
      for (let i = 0; i < data.length; i++) {
        const date = new Date(dates[i]);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex] += data[i];
        counts[monthIndex]++;
      }
    } else {
      // 날짜 정보가 없으면 현재 날짜 기준으로 역산
      const now = new Date();
      for (let i = 0; i < data.length; i++) {
        const daysAgo = data.length - 1 - i;
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex] += data[i];
        counts[monthIndex]++;
      }
    }

    const avgs = monthlyData.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
    const validAvgs = avgs.filter(v => v > 0);
    const overallAvg = validAvgs.length > 0 ? validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length : 0;

    // 피크/저조 월 계산
    const peakMonths: number[] = [];
    const lowMonths: number[] = [];
    avgs.forEach((avg, idx) => {
      if (avg > 0 && overallAvg > 0) {
        if (avg > overallAvg * 1.15) peakMonths.push(idx + 1);
        else if (avg < overallAvg * 0.85) lowMonths.push(idx + 1);
      }
    });

    // 계절성 강도 계산
    let strength = seasonalStrength;
    if (strength === undefined && validAvgs.length >= 4) {
      const mean = validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length;
      const variance = validAvgs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validAvgs.length;
      const std = Math.sqrt(variance);
      const cv = mean > 0 ? (std / mean) * 100 : 0;
      strength = Math.min(100, cv * 3);
    }
    strength = strength ?? 0;

    // 계절성 타입 결정
    let type: SeasonalityType;
    let pattern: string;
    let recommendation: string;

    if (strength < 20) {
      type = 'evergreen';
      pattern = '연중 안정적인 수요';
      recommendation = '재고 관리가 용이하며, 연중 일정한 마케팅 전략 적용 가능';
    } else if (strength < 50) {
      type = 'seasonal';
      const peakStr = peakMonths.map(m => `${m}월`).join(', ');
      pattern = peakMonths.length > 0 ? `${peakStr}에 수요 증가` : '약한 계절 변동';
      recommendation = '성수기 전 재고 확보 권장, 비수기에는 프로모션 고려';
    } else {
      type = 'highly_seasonal';
      const peakStr = peakMonths.map(m => `${m}월`).join(', ');
      const lowStr = lowMonths.map(m => `${m}월`).join(', ');
      pattern = peakMonths.length > 0 && lowMonths.length > 0
        ? `${peakStr} 성수기, ${lowStr} 비수기`
        : peakMonths.length > 0
        ? `${peakStr}에 수요 집중`
        : '강한 계절 변동';
      recommendation = '성수기 집중 판매, 비수기 재고 최소화 필요. 계절 상품으로 분류';
    }

    return {
      monthlyAverages: avgs,
      seasonalityInfo: {
        type,
        strength: Math.round(strength),
        peakMonths,
        lowMonths,
        pattern,
        recommendation,
      }
    };
  }, [data, dates, seasonalStrength]);

  const colors = getSeasonalityColor(seasonalityInfo.type);

  return (
    <div className={`rounded-lg border-2 ${colors.border} overflow-hidden`}>
      {/* 헤더 */}
      <div className={`${colors.bg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <SeasonalityIcon type={seasonalityInfo.type} size={24} />
          <div>
            <h3 className={`font-bold ${colors.text}`}>
              {getSeasonalityLabel(seasonalityInfo.type)}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              계절성 강도: {seasonalityInfo.strength}%
            </p>
          </div>
        </div>

        {/* 강도 게이지 */}
        <div className="w-24">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                seasonalityInfo.type === 'evergreen' ? 'bg-emerald-500' :
                seasonalityInfo.type === 'seasonal' ? 'bg-amber-500' : 'bg-rose-500'
              } transition-all`}
              style={{ width: `${seasonalityInfo.strength}%` }}
            />
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 bg-white dark:bg-gray-800">
        {/* 패턴 설명 */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {seasonalityInfo.pattern}
        </p>

        {/* 월별 그래프 */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">월별 수요 분포</p>
          <MonthlyBar
            data={data}
            dates={dates}
            peakMonths={seasonalityInfo.peakMonths}
            lowMonths={seasonalityInfo.lowMonths}
          />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-900/30 rounded-full">
              <span className="text-rose-500">▲</span>
              <span className="w-3 h-3 rounded bg-gradient-to-t from-rose-600 to-rose-400" />
              <span className="text-rose-700 dark:text-rose-300 font-medium">성수기</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <span className="text-blue-500">▼</span>
              <span className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-blue-300" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">비수기</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              <span className="w-3 h-3 rounded bg-gray-400 dark:bg-gray-500" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">보통</span>
            </div>
          </div>
        </div>

        {/* 추천사항 */}
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            판매 전략 추천
          </p>
          <p className={`text-sm ${colors.text}`}>
            {seasonalityInfo.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

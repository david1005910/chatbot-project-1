'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  className,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => value || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days: (Date | null)[] = [];

    // 이전 달 빈칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month]);

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
    return disabledDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return value?.toDateString() === date.toDateString();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange?.(date);
    }
  };

  return (
    <div className={cn('w-full max-w-sm bg-white rounded-lg border p-4', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {year}년 {MONTHS[month]}
        </h2>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-medium py-2',
              index === 0 && 'text-red-500',
              index === 6 && 'text-blue-500',
              index !== 0 && index !== 6 && 'text-gray-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDateDisabled(date)}
                className={cn(
                  'w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors',
                  isSelected(date)
                    ? 'bg-blue-500 text-white'
                    : isToday(date)
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100',
                  date.getDay() === 0 && !isSelected(date) && 'text-red-500',
                  date.getDay() === 6 && !isSelected(date) && 'text-blue-500',
                  isDateDisabled(date) && 'opacity-30 cursor-not-allowed'
                )}
              >
                {date.getDate()}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  minDate,
  maxDate,
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleSelect = (date: Date) => {
    onChange?.(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 text-left',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
      >
        <span className={cn(!value && 'text-gray-400')}>
          {value ? formatDate(value) : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="날짜 지우기"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 shadow-lg">
            <Calendar
              value={value}
              onChange={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onRangeChange?: (start: Date | undefined, end: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  placeholder = '기간 선택',
  minDate,
  maxDate,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleSelect = (date: Date) => {
    if (!selectingEnd || !startDate) {
      onRangeChange?.(date, undefined);
      setSelectingEnd(true);
    } else {
      if (date < startDate) {
        onRangeChange?.(date, startDate);
      } else {
        onRangeChange?.(startDate, date);
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRangeChange?.(undefined, undefined);
    setSelectingEnd(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 text-left',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
      >
        <span className={cn(!startDate && !endDate && 'text-gray-400')}>
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : startDate
            ? `${formatDate(startDate)} - 종료일 선택`
            : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="기간 지우기"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSelectingEnd(false);
            }}
          />
          <div className="absolute z-50 mt-2 shadow-lg">
            <Calendar
              value={selectingEnd ? endDate : startDate}
              onChange={handleSelect}
              minDate={selectingEnd ? startDate : minDate}
              maxDate={maxDate}
            />
          </div>
        </>
      )}
    </div>
  );
}

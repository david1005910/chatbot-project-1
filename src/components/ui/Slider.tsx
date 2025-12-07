'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  showTicks?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  showValue = false,
  showTicks = false,
  label,
  formatValue = (v) => v.toString(),
  className,
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return currentValue;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = percentage * (max - min) + min;
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [currentValue, min, max, step]
  );

  const updateValue = useCallback(
    (newValue: number) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDragging.current = true;
    const newValue = getValueFromPosition(e.clientX);
    updateValue(newValue);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    isDragging.current = true;
    const touch = e.touches[0];
    const newValue = getValueFromPosition(touch.clientX);
    updateValue(newValue);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newValue = getValueFromPosition(e.clientX);
      updateValue(newValue);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];
      const newValue = getValueFromPosition(touch.clientX);
      updateValue(newValue);
    };

    const handleEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onChangeEnd?.(currentValue);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [getValueFromPosition, updateValue, onChangeEnd, currentValue]);

  const ticks = showTicks
    ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
    : [];

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          {showValue && (
            <span className="text-sm font-medium text-gray-900">{formatValue(currentValue)}</span>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        className={cn(
          'relative h-2 bg-gray-200 rounded-full cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${getPercentage(currentValue)}%` }}
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-sm',
            'transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            disabled && 'cursor-not-allowed'
          )}
          style={{ left: `${getPercentage(currentValue)}%` }}
          role="slider"
          aria-valuenow={currentValue}
          aria-valuemin={min}
          aria-valuemax={max}
          tabIndex={disabled ? -1 : 0}
        />
      </div>
      {showTicks && ticks.length <= 11 && (
        <div className="flex justify-between mt-1">
          {ticks.map((tick) => (
            <span key={tick} className="text-xs text-gray-400">
              {tick}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: [number, number]) => void;
  disabled?: boolean;
  showValues?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function RangeSlider({
  value,
  defaultValue = [0, 100],
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValues = false,
  label,
  formatValue = (v) => v.toString(),
  className,
}: RangeSliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumb = useRef<'min' | 'max' | null>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = percentage * (max - min) + min;
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  const updateValue = useCallback(
    (thumb: 'min' | 'max', newValue: number) => {
      const newRange: [number, number] =
        thumb === 'min'
          ? [Math.min(newValue, currentValue[1]), currentValue[1]]
          : [currentValue[0], Math.max(newValue, currentValue[0])];

      if (!isControlled) {
        setInternalValue(newRange);
      }
      onChange?.(newRange);
    },
    [isControlled, currentValue, onChange]
  );

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    activeThumb.current = thumb;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeThumb.current) return;
      const newValue = getValueFromPosition(e.clientX);
      updateValue(activeThumb.current, newValue);
    };

    const handleMouseUp = () => {
      activeThumb.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getValueFromPosition, updateValue]);

  return (
    <div className={cn('w-full', className)}>
      {(label || showValues) && (
        <div className="flex justify-between items-center mb-2">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          {showValues && (
            <span className="text-sm font-medium text-gray-900">
              {formatValue(currentValue[0])} - {formatValue(currentValue[1])}
            </span>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        className={cn(
          'relative h-2 bg-gray-200 rounded-full',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getPercentage(currentValue[0])}%`,
            width: `${getPercentage(currentValue[1]) - getPercentage(currentValue[0])}%`,
          }}
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer',
            'hover:shadow-md',
            disabled && 'cursor-not-allowed'
          )}
          style={{ left: `${getPercentage(currentValue[0])}%` }}
          onMouseDown={handleMouseDown('min')}
          role="slider"
          aria-valuenow={currentValue[0]}
          aria-valuemin={min}
          aria-valuemax={currentValue[1]}
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer',
            'hover:shadow-md',
            disabled && 'cursor-not-allowed'
          )}
          style={{ left: `${getPercentage(currentValue[1])}%` }}
          onMouseDown={handleMouseDown('max')}
          role="slider"
          aria-valuenow={currentValue[1]}
          aria-valuemin={currentValue[0]}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

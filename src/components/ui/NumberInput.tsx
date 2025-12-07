'use client';

import { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  className?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      disabled = false,
      placeholder,
      prefix,
      suffix,
      showControls = true,
      size = 'md',
      error = false,
      className,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const formatValue = useCallback(
      (val: number | undefined): string => {
        if (val === undefined) return '';
        if (precision !== undefined) {
          return val.toFixed(precision);
        }
        return val.toString();
      },
      [precision]
    );

    const parseValue = useCallback(
      (val: string): number | undefined => {
        if (val === '' || val === '-') return undefined;
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return undefined;
        return parsed;
      },
      []
    );

    const clampValue = useCallback(
      (val: number): number => {
        let result = val;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        if (precision !== undefined) {
          result = parseFloat(result.toFixed(precision));
        }
        return result;
      },
      [min, max, precision]
    );

    const updateValue = useCallback(
      (newValue: number | undefined) => {
        const clampedValue = newValue !== undefined ? clampValue(newValue) : undefined;
        if (!isControlled) {
          setInternalValue(clampedValue);
        }
        onChange?.(clampedValue);
      },
      [isControlled, clampValue, onChange]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseValue(e.target.value);
      updateValue(parsed);
    };

    const handleBlur = () => {
      if (currentValue !== undefined) {
        updateValue(clampValue(currentValue));
      }
    };

    const increment = () => {
      if (disabled) return;
      const newValue = (currentValue ?? 0) + step;
      updateValue(newValue);
    };

    const decrement = () => {
      if (disabled) return;
      const newValue = (currentValue ?? 0) - step;
      updateValue(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        increment();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        decrement();
      }
    };

    const sizeStyles = {
      sm: 'h-8 text-sm px-2',
      md: 'h-10 text-base px-3',
      lg: 'h-12 text-lg px-4',
    };

    const controlSizeStyles = {
      sm: 'w-6',
      md: 'w-8',
      lg: 'w-10',
    };

    return (
      <div
        className={cn(
          'flex items-center border rounded-lg overflow-hidden',
          error ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500',
          'focus-within:ring-2 focus-within:ring-blue-500/20',
          disabled && 'bg-gray-100 opacity-60',
          className
        )}
      >
        {showControls && (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (min !== undefined && currentValue !== undefined && currentValue <= min)}
            className={cn(
              'flex items-center justify-center border-r border-gray-300 text-gray-500',
              'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
              sizeStyles[size],
              controlSizeStyles[size]
            )}
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        )}

        <div className={cn('flex-1 flex items-center', sizeStyles[size])}>
          {prefix && <span className="text-gray-500 mr-1">{prefix}</span>}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={formatValue(currentValue)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'flex-1 w-full bg-transparent text-center outline-none',
              'placeholder:text-gray-400',
              disabled && 'cursor-not-allowed'
            )}
          />
          {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
        </div>

        {showControls && (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && currentValue !== undefined && currentValue >= max)}
            className={cn(
              'flex items-center justify-center border-l border-gray-300 text-gray-500',
              'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
              sizeStyles[size],
              controlSizeStyles[size]
            )}
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

// 통화 입력
interface CurrencyInputProps extends Omit<NumberInputProps, 'prefix' | 'suffix' | 'precision'> {
  currency?: string;
  locale?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currency = 'KRW', locale = 'ko-KR', ...props }, ref) => {
    const formatCurrency = (value: number | undefined): string => {
      if (value === undefined) return '';
      return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const currencySymbols: Record<string, string> = {
      KRW: '₩',
      USD: '$',
      EUR: '€',
      JPY: '¥',
    };

    return (
      <NumberInput
        ref={ref}
        prefix={currencySymbols[currency] || currency}
        precision={currency === 'KRW' || currency === 'JPY' ? 0 : 2}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

// 퍼센트 입력
interface PercentInputProps extends Omit<NumberInputProps, 'suffix' | 'min' | 'max'> {
  allowOver100?: boolean;
}

export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  ({ allowOver100 = false, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        suffix="%"
        min={0}
        max={allowOver100 ? undefined : 100}
        precision={1}
        {...props}
      />
    );
  }
);

PercentInput.displayName = 'PercentInput';

// 수량 입력
interface QuantityInputProps extends Omit<NumberInputProps, 'precision' | 'step'> {
  minQuantity?: number;
  maxQuantity?: number;
}

export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ minQuantity = 1, maxQuantity, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        min={minQuantity}
        max={maxQuantity}
        step={1}
        precision={0}
        {...props}
      />
    );
  }
);

QuantityInput.displayName = 'QuantityInput';

'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-colors',
              error && 'border-red-500 focus:ring-red-500',
              !error && 'border-gray-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-lg text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors appearance-none cursor-pointer',
            error && 'border-red-500 focus:ring-red-500',
            !error && 'border-gray-300',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-lg text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors resize-none',
            error && 'border-red-500 focus:ring-red-500',
            !error && 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <label
        htmlFor={checkboxId}
        className="inline-flex items-center gap-2 cursor-pointer"
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            'w-4 h-4 text-blue-600 border-gray-300 rounded',
            'focus:ring-blue-500 focus:ring-2',
            className
          )}
          {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

'use client';

import { cn } from '@/lib/utils';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
type TagSize = 'sm' | 'md' | 'lg';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  icon,
  clickable = false,
  onClick,
  className,
}: TagProps) {
  const variantStyles: Record<TagVariant, string> = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    error: 'bg-red-100 text-red-700 hover:bg-red-200',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  const sizeStyles: Record<TagSize, string> = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const Component = clickable || onClick ? 'button' : 'span';

  return (
    <Component
      type={clickable || onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        (clickable || onClick) && 'cursor-pointer',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors',
            '-mr-1'
          )}
          aria-label="태그 삭제"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </Component>
  );
}

interface TagGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TagGroup({ children, className }: TagGroupProps) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>;
}

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  variant?: TagVariant;
  size?: TagSize;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = '태그 입력 후 Enter',
  maxTags,
  allowDuplicates = false,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const inputValue = input.value.trim();

    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();

      if (maxTags && value.length >= maxTags) return;
      if (!allowDuplicates && value.includes(inputValue)) return;

      onChange?.([...value, inputValue]);
      input.value = '';
    }

    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange?.(value.slice(0, -1));
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange?.(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 p-2 min-h-[42px]',
        'bg-white border border-gray-300 rounded-lg',
        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        disabled && 'bg-gray-100 opacity-60 cursor-not-allowed',
        className
      )}
    >
      {value.map((tag, index) => (
        <Tag
          key={index}
          variant={variant}
          size={size}
          removable={!disabled}
          onRemove={() => handleRemove(index)}
        >
          {tag}
        </Tag>
      ))}
      {(!maxTags || value.length < maxTags) && (
        <input
          type="text"
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-[120px] outline-none bg-transparent text-sm',
            'placeholder:text-gray-400',
            disabled && 'cursor-not-allowed'
          )}
        />
      )}
    </div>
  );
}

interface SelectableTagProps {
  children: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  size?: TagSize;
  disabled?: boolean;
  className?: string;
}

export function SelectableTag({
  children,
  selected = false,
  onSelect,
  size = 'md',
  disabled = false,
  className,
}: SelectableTagProps) {
  const sizeStyles: Record<TagSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all',
        sizeStyles[size],
        selected
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {selected && (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {children}
    </button>
  );
}

interface MultiSelectTagGroupProps {
  options: { value: string; label: string }[];
  value?: string[];
  onChange?: (value: string[]) => void;
  max?: number;
  size?: TagSize;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectTagGroup({
  options,
  value = [],
  onChange,
  max,
  size = 'md',
  disabled = false,
  className,
}: MultiSelectTagGroupProps) {
  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);

    if (isSelected) {
      onChange?.(value.filter((v) => v !== optionValue));
    } else {
      if (max && value.length >= max) return;
      onChange?.([...value, optionValue]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <SelectableTag
          key={option.value}
          selected={value.includes(option.value)}
          onSelect={() => handleToggle(option.value)}
          size={size}
          disabled={disabled || (max !== undefined && value.length >= max && !value.includes(option.value))}
        >
          {option.label}
        </SelectableTag>
      ))}
    </div>
  );
}

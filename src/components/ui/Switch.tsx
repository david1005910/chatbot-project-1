'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onChange,
      disabled = false,
      size = 'md',
      label,
      description,
      className,
      id,
      name,
    },
    ref
  ) => {
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : defaultChecked;

    const handleToggle = () => {
      if (!disabled) {
        onChange?.(!currentChecked);
      }
    };

    const sizeStyles: Record<SwitchSize, { track: string; thumb: string; translate: string }> = {
      sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7',
      },
    };

    const styles = sizeStyles[size];

    const switchButton = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        disabled={disabled}
        onClick={handleToggle}
        id={id}
        name={name}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          styles.track,
          currentChecked ? 'bg-blue-500' : 'bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
          className
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out',
            styles.thumb,
            'absolute top-0.5 left-0.5',
            currentChecked && styles.translate
          )}
        />
      </button>
    );

    if (!label && !description) {
      return switchButton;
    }

    return (
      <div className="flex items-start gap-3">
        {switchButton}
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium text-gray-900',
                disabled && 'opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className={cn('text-sm text-gray-500', disabled && 'opacity-50')}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SwitchGroup({ children, className }: SwitchGroupProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

interface ToggleButtonProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      disabled = false,
      children,
      className,
    },
    ref
  ) => {
    const isControlled = pressed !== undefined;
    const currentPressed = isControlled ? pressed : defaultPressed;

    const handleToggle = () => {
      if (!disabled) {
        onPressedChange?.(!currentPressed);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={currentPressed}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          currentPressed
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

interface ToggleButtonGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function ToggleButtonGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: ToggleButtonGroupProps) {
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : defaultValue;

  return (
    <div className={cn('inline-flex rounded-lg bg-gray-100 p-1', className)} role="group">
      {Array.isArray(children)
        ? children.map((child, index) => {
            if (child && typeof child === 'object' && 'props' in child) {
              const childValue = child.props.value as string;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onValueChange?.(childValue)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    currentValue === childValue
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {child.props.children}
                </button>
              );
            }
            return child;
          })
        : children}
    </div>
  );
}

interface ToggleButtonOptionProps {
  value: string;
  children: React.ReactNode;
}

export function ToggleButtonOption({ children }: ToggleButtonOptionProps) {
  return <>{children}</>;
}

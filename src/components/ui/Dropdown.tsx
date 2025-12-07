'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown provider');
  }
  return context;
}

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

export function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, closeDropdown }}>
      <div ref={dropdownRef} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdownContext();

  const handleClick = () => setIsOpen(!isOpen);

  if (asChild) {
    return (
      <div onClick={handleClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium',
        'bg-white border border-gray-300 rounded-lg shadow-sm',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
      <svg
        className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

type DropdownAlign = 'left' | 'right' | 'center';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  align?: DropdownAlign;
}

export function DropdownMenu({ children, className, align = 'left' }: DropdownMenuProps) {
  const { isOpen } = useDropdownContext();

  if (!isOpen) return null;

  const alignStyles: Record<DropdownAlign, string> = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[200px] py-1',
        'bg-white border border-gray-200 rounded-lg shadow-lg',
        'animate-in fade-in zoom-in-95 duration-100',
        alignStyles[align],
        className
      )}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  className,
}: DropdownItemProps) {
  const { closeDropdown } = useDropdownContext();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      closeDropdown();
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
        'transition-colors',
        destructive
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className }: DropdownDividerProps) {
  return <div className={cn('my-1 border-t border-gray-200', className)} role="separator" />;
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div className={cn('px-4 py-2 text-xs font-semibold text-gray-500 uppercase', className)}>
      {children}
    </div>
  );
}

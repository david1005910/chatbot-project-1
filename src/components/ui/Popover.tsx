'use client';

import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils';

type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';
type PopoverAlign = 'start' | 'center' | 'end';

interface PopoverContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within a Popover provider');
  }
  return context;
}

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Popover({ children, open, onOpenChange, className }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={cn('relative inline-block', className)}>{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function PopoverTrigger({ children, asChild, className }: PopoverTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = usePopoverContext();

  const handleClick = () => setIsOpen(!isOpen);

  if (asChild) {
    return (
      <div ref={triggerRef} onClick={handleClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={triggerRef}>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'inline-flex items-center justify-center px-4 py-2 text-sm font-medium',
          'bg-white border border-gray-300 rounded-lg shadow-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
      >
        {children}
      </button>
    </div>
  );
}

interface PopoverContentProps {
  children: React.ReactNode;
  position?: PopoverPosition;
  align?: PopoverAlign;
  sideOffset?: number;
  className?: string;
}

export function PopoverContent({
  children,
  position = 'bottom',
  align = 'center',
  sideOffset = 8,
  className,
}: PopoverContentProps) {
  const { isOpen, setIsOpen } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
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
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const positionStyles: Record<PopoverPosition, string> = {
    top: `bottom-full mb-${sideOffset / 4}`,
    bottom: `top-full mt-${sideOffset / 4}`,
    left: `right-full mr-${sideOffset / 4}`,
    right: `left-full ml-${sideOffset / 4}`,
  };

  const alignStyles: Record<PopoverPosition, Record<PopoverAlign, string>> = {
    top: {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    },
    bottom: {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    },
    left: {
      start: 'top-0',
      center: 'top-1/2 -translate-y-1/2',
      end: 'bottom-0',
    },
    right: {
      start: 'top-0',
      center: 'top-1/2 -translate-y-1/2',
      end: 'bottom-0',
    },
  };

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        'absolute z-50 min-w-[200px] p-4',
        'bg-white border border-gray-200 rounded-lg shadow-lg',
        'animate-in fade-in zoom-in-95 duration-100',
        positionStyles[position],
        alignStyles[position][align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface PopoverCloseProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverClose({ children, className }: PopoverCloseProps) {
  const { setIsOpen } = usePopoverContext();

  return (
    <button
      type="button"
      onClick={() => setIsOpen(false)}
      className={className}
    >
      {children}
    </button>
  );
}

// 호버로 열리는 버전
interface HoverPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: PopoverPosition;
  delay?: number;
  className?: string;
}

export function HoverPopover({
  trigger,
  children,
  position = 'top',
  delay = 200,
  className,
}: HoverPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionStyles: Record<PopoverPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 p-3',
            'bg-white border border-gray-200 rounded-lg shadow-lg',
            'animate-in fade-in zoom-in-95 duration-100',
            positionStyles[position],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

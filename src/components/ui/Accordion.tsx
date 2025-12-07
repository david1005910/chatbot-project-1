'use client';

import { useState, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  expandedItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
}

interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  type = 'single',
  defaultValue,
  children,
  className,
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = useCallback(
    (value: string) => {
      setExpandedItems((prev) => {
        if (type === 'single') {
          return prev.includes(value) ? [] : [value];
        }
        return prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value];
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
      <div className={cn('divide-y divide-gray-200 border rounded-lg', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within an AccordionItem');
  }
  return context;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      <div className={cn('', className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function AccordionTrigger({ children, className, icon }: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext();
  const { value, isExpanded } = useAccordionItemContext();

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      aria-expanded={isExpanded}
      className={cn(
        'flex items-center justify-between w-full px-4 py-3 text-left',
        'text-sm font-medium text-gray-900',
        'hover:bg-gray-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
        className
      )}
    >
      <span>{children}</span>
      {icon || (
        <svg
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { isExpanded } = useAccordionItemContext();

  if (!isExpanded) return null;

  return (
    <div
      className={cn(
        'px-4 pb-4 pt-0 text-sm text-gray-600',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

// FAQ 스타일 아코디언 프리셋
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <Accordion type="single" className={className}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

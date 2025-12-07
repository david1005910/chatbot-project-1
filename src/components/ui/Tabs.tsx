'use client';

import { useState, createContext, useContext, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = useCallback(
    (tab: string) => {
      if (value === undefined) {
        setInternalValue(tab);
      }
      onValueChange?.(tab);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 bg-gray-100 rounded-lg',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('mt-4 focus:outline-none', className)}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

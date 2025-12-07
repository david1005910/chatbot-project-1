'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const defaultSeparator = (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}
              {isLast ? (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium text-gray-900',
                    item.icon && 'inline-flex'
                  )}
                  aria-current="page"
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors',
                    item.icon && 'inline-flex'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm text-gray-500',
                    item.icon && 'inline-flex'
                  )}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface BreadcrumbWithHomeProps {
  items: Omit<BreadcrumbItem, 'href'>[];
  homePath?: string;
  separator?: React.ReactNode;
  className?: string;
}

export function BreadcrumbWithHome({
  items,
  homePath = '/',
  separator,
  className,
}: BreadcrumbWithHomeProps) {
  const homeItem: BreadcrumbItem = {
    label: '홈',
    href: homePath,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  };

  const itemsWithHrefs: BreadcrumbItem[] = items.map((item, index) => ({
    ...item,
    href: index === items.length - 1 ? undefined : `#`,
  }));

  return (
    <Breadcrumb
      items={[homeItem, ...itemsWithHrefs]}
      separator={separator}
      className={className}
    />
  );
}

interface CollapsibleBreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  separator?: React.ReactNode;
  className?: string;
}

export function CollapsibleBreadcrumb({
  items,
  maxItems = 3,
  separator,
  className,
}: CollapsibleBreadcrumbProps) {
  if (items.length <= maxItems) {
    return <Breadcrumb items={items} separator={separator} className={className} />;
  }

  const firstItem = items[0];
  const lastItems = items.slice(-2);
  const collapsedCount = items.length - 3;

  const collapsedItems: BreadcrumbItem[] = [
    firstItem,
    {
      label: `...${collapsedCount}개 항목`,
    },
    ...lastItems,
  ];

  return <Breadcrumb items={collapsedItems} separator={separator} className={className} />;
}

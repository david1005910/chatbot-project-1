'use client';

import { Navigation } from './Navigation';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CommandPalette } from '@/components/CommandPalette';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
          <CommandPalette />
          <OfflineIndicator />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

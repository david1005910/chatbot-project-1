'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/', label: '대시보드', icon: '📊' },
  { href: '/calculator', label: '마진 계산기', icon: '🧮' },
  { href: '/sourcing', label: '소싱 검색', icon: '🔍' },
  { href: '/favorites', label: '즐겨찾기', icon: '⭐' },
  { href: '/history', label: '히스토리', icon: '📜' },
  { href: '/settings', label: '설정', icon: '⚙️' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeMobileMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-lg text-gray-900">쿠팡 소싱 도우미</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span className="font-bold text-gray-900">쿠팡 소싱 도우미</span>
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'md:hidden fixed top-14 right-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-14 md:h-16" />
    </>
  );
}

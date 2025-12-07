'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    registration: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    const isSupported = 'serviceWorker' in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) return;

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available - could trigger a UI notification here
              }
            });
          }
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerSW();

    // Online/offline detection
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online state
    setState((prev) => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!state.registration) return;

    const hasPermission = Notification.permission === 'granted';
    if (!hasPermission) return;

    await state.registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  };

  return {
    ...state,
    requestNotificationPermission,
    sendNotification,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

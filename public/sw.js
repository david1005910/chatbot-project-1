const CACHE_NAME = 'coupang-sourcing-v1';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/calculator',
  '/sourcing',
  '/history',
  '/settings',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests
  if (request.url.includes('/api/')) return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response to cache it
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      })
      .catch(async () => {
        // Try to get from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        // Return empty response for other requests
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analyses') {
    event.waitUntil(syncAnalyses());
  }
});

async function syncAnalyses() {
  // Sync pending analyses when back online
  console.log('Syncing pending analyses...');
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title || '쿠팡 소싱 도우미', {
        body: data.body || '새로운 트렌드 알림이 있습니다.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.url || '/',
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

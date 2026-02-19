/**
 * Service Worker for HR Pass PWA
 * 
 * Enables offline access and caching for the employee pass.
 */

const CACHE_NAME = 'hr-pass-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/pass',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// API endpoints to cache (with network-first strategy)
const API_CACHE_URLS = [
  '/api/pass/my',
  '/api/businesscard/my',
  '/api/leave/balance',
  '/api/attendance/today',
  '/api/calendar/today',
  '/api/policies/pending/acknowledgments'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok && API_CACHE_URLS.some(u => url.pathname.includes(u))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline JSON for API
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'You are currently offline. Data may not be up to date.',
                cached: false
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          // Return cached and update in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          return cached;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'clock-in-sync') {
    event.waitUntil(syncClockIn());
  }
  if (event.tag === 'leave-request-sync') {
    event.waitUntil(syncLeaveRequests());
  }
});

// Sync queued clock-in actions
async function syncClockIn() {
  try {
    const db = await openDB();
    
    // Validate database schema exists
    if (!db) {
      console.error('[SW] Failed to open database');
      return;
    }
    
    const queue = await db.getAll('clock-in-queue');
    
    for (const item of queue) {
      try {
        await fetch('/api/attendance/clock-in', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${item.token}`
          },
          body: JSON.stringify(item.data)
        });
        await db.delete('clock-in-queue', item.id);
      } catch (error) {
        console.error('[SW] Failed to sync clock-in:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync clock-in queue:', error);
  }
}

// Sync queued leave requests
async function syncLeaveRequests() {
  // Similar to clock-in sync
  console.log('[SW] Syncing leave requests...');
}

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/pass/my'
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'HR Pass', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/pass/my';
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((windowClients) => {
          // Check if already open
          for (const client of windowClients) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window
          return clients.openWindow(url);
        })
    );
  }
});

// Helper: Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hr-pass-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (store) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readonly');
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        delete: (store, key) => new Promise((res, rej) => {
          const tx = db.transaction(store, 'readwrite');
          const req = tx.objectStore(store).delete(key);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      });
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('clock-in-queue')) {
        db.createObjectStore('clock-in-queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('leave-request-queue')) {
        db.createObjectStore('leave-request-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

console.log('[SW] Service Worker loaded');

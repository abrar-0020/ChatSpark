/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'ChatSpark';
  const options = {
    body: data.body || 'New message',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: data.channelId || 'chatspark',
    renotify: true,
    data: { url: data.url || '/' },
  } as NotificationOptions;

  // Suppress if the app is already open and focused
  const showNotif = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      const focused = clients.some((c) => (c as WindowClient).focused);
      if (focused) return; // app is open — no need to notify
      return self.registration.showNotification(title, options);
    });

  event.waitUntil(showNotif);
});

// Click on notification opens the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        return existing.navigate(url);
      }
      return self.clients.openWindow(url);
    })
  );
});

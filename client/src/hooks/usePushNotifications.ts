import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store';
import api from '../services/api';

const VAPID_CACHE_KEY = 'vapid-public-key';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
};

const usePushNotifications = () => {
  const { isAuthenticated } = useAuthStore();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || subscribedRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const subscribe = async () => {
      try {
        // 1. Ask permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 2. Get VAPID public key from server
        let vapidKey = sessionStorage.getItem(VAPID_CACHE_KEY);
        if (!vapidKey) {
          const res = await api.get('/push/vapid-public-key');
          vapidKey = res.data.publicKey;
          if (vapidKey) sessionStorage.setItem(VAPID_CACHE_KEY, vapidKey);
        }
        if (!vapidKey) return;

        // 3. Get the active service worker
        const reg = await navigator.serviceWorker.ready;

        // 4. Subscribe to push
        const existing = await reg.pushManager.getSubscription();
        const sub = existing || await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        // 5. Send subscription to server
        await api.post('/push/subscribe', { subscription: sub.toJSON() });
        subscribedRef.current = true;
      } catch (err) {
        console.warn('[Push] Subscription failed:', err);
      }
    };

    // Slight delay so service worker is ready
    const timer = setTimeout(subscribe, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);
};

export default usePushNotifications;

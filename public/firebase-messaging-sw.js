/* eslint-disable no-undef */
// Firebase Messaging Service Worker (Compat for simplicity)
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

// IMPORTANT: Service worker does not have access to Vite env vars.
// Use the same config as your web app (from src/lib/firebase.ts).
firebase.initializeApp({
  apiKey: "AIzaSyCioSkmiej6_C4veGC4sgBuSd07ACdq40o",
  authDomain: "cashew-marketplace.firebaseapp.com",
  projectId: "cashew-marketplace",
  messagingSenderId: "221424155521",
  appId: "1:221424155521:web:38a2b75c7a6136f4958680",
});
console.debug('[FCM SW] Initialized Firebase app');

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const data = payload.data || {};
  const notificationTitle = title || data.title || 'Notification';
  const notificationOptions = {
    body: body || data.body,
    icon: icon || '/favicon.ico',
    data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // Forward payload to page if open
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'FCM_BACKGROUND_MESSAGE', payload }));
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'FCM_NOTIFICATION_CLICK', data: event.notification.data });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

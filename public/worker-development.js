/******/ (() => { // webpackBootstrap
/// <reference lib="webworker" />

self.addEventListener("push", event => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const title = payload.title || "通知";
    const options = {
      body: payload.body,
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/icon-96x96.png",
      data: payload.data
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});
self.addEventListener("notificationclick", event => {
  var _event$notification$d;
  event.notification.close();

  // URL to open
  const urlToOpen = new URL(((_event$notification$d = event.notification.data) === null || _event$notification$d === void 0 ? void 0 : _event$notification$d.url) || "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({
    type: "window",
    includeUncontrolled: true
  }).then(clients => {
    // Check if there is already a window/tab open with the target URL
    for (const client of clients) {
      if (client.url === urlToOpen && "focus" in client) {
        return client.focus();
      }
    }
    // If not, open a new window
    if (self.clients.openWindow) {
      return self.clients.openWindow(urlToOpen);
    }
  }));
});
/******/ })()
;
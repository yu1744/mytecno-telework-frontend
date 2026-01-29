/// <reference lib="webworker" />

// This makes the script a module, preventing the global 'self' conflict
export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event: PushEvent) => {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const title = payload.title || "通知";
        const options = {
            body: payload.body,
            icon: payload.icon || "/icon-192x192.png",
            badge: payload.badge || "/icon-96x96.png",
            data: payload.data,
        };

        event.waitUntil(sw.registration.showNotification(title, options));
    } catch (err) {
        console.error('Error handling push event:', err);
    }
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();

    // URL to open
    const urlToOpen = new URL(event.notification.data?.url || "/", sw.location.origin).href;

    event.waitUntil(
        sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // Check if there is already a window/tab open with the target URL
            for (const client of clients) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (sw.clients.openWindow) {
                return sw.clients.openWindow(urlToOpen);
            }
        })
    );
});

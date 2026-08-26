self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'schedule_notification') {
    setTimeout(() => {
      self.registration.showNotification("La Palabra Aragonesa del Día", {
        body: "¿Has resuelto ya la palabra aragonesa de hoy? 🎯 ¡Entra y acepta el reto!",
        icon: "favicon.png",
        tag: "daily-reminder"
      });
    }, event.data.delay);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./');
    })
  );
});
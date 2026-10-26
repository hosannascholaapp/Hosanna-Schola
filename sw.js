const CACHE_NAME = "hosanna-schola-v1";

const ARCHIVOS = [
  "/hosanna-schola/",
  "/hosanna-schola/index.html",
  "/hosanna-schola/manifest.json",
  "/hosanna-schola/icons/hosanna-192.png",
  "/hosanna-schola/icons/hosanna-512.png"
];

// Instalar el service worker y guardar los archivos básicos.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Activar la nueva versión y limpiar cachés anteriores.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) =>
              nombre.startsWith("hosanna-schola-") &&
              nombre !== CACHE_NAME
            )
            .map((nombre) => caches.delete(nombre))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Para la página principal, intentar conectarse primero a la red.
self.addEventListener("fetch", (event) => {
  const solicitud = event.request;
  const url = new URL(solicitud.url);

  if (
    solicitud.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith("/hosanna-schola/")
  ) {
    return;
  }

  if (solicitud.mode === "navigate") {
    event.respondWith(
      fetch(solicitud)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(
              "/hosanna-schola/index.html",
              copia
            ));
          return respuesta;
        })
        .catch(async () => {
          return (
            await caches.match(solicitud) ||
            await caches.match("/hosanna-schola/index.html")
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(solicitud).then((respuestaGuardada) => {
      return respuestaGuardada || fetch(solicitud);
    })
  );
});

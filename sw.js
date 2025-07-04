var cacheName = 'cache';

self.addEventListener('install', function (event){
    console.log('El Service Worker se instalo correctamente', event);
});

self.addEventListener('activate', function (event) {
    console.log('El Service Worker esta activado.', event);
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request)
        .then((response) =>{
            if(response){
                return response
            }

            const requestToCache = event.request.clone()
            
            return fetch(requestToCache)
                .then( (response) => {
                    if(!response || response.status !== 200){
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(cacheName)
                        .then((cache)=> {
                            cache.put(requestToCache, responseToCache);
                        });
                    return response;
                })
        })
 
    )

});

self.addEventListener('push', (e)=>{
    console.log(e)

    let title = "Demo Cuthulu"

    let options = {
        body: "click para regresar a la Aplicacion",
        icon: "icons/android-icon-192x192.png", 
        vibrate: [100, 50, 100],
        data : {id:1},
        actions:
        [
            { 
                'action' : 'Si',
                'tittle' : 'Me gusta la app',
                'icon' : 'icons/android-icon-192x192.png'
            },
            {
                'action' : 'No',
                'tittle' : 'Le falta app',
                'icon' : 'icons/android-icon-192x192.png'
            }
        ]
    }

    e.waitUntil(self.registration.showNotification(title, options))
});
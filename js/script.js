if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
        navigator.serviceWorker.register('sw.js')
            .then(function(registration){
                // registro ok
                console.log('Service Worker registrado, ', registration.scope);
                console.log('Service Worker contenido, ', registration)
            }).catch(function(error){
                //registro fallo :(
                console.log('El registro del serviceWorker fallo: ', error)
            })
    })
}

//Funcion flecha que se ejecuta sola
(() => {
    let notice;
    let showAlert = document.querySelector('#show-alert');
    let btnInstalar = document.querySelector('#btn-instalar');

    // Verificar si la app ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        if (showAlert) {
            showAlert.style.display = "none";
            btnInstalar.style.display = "none";
        }
    }

    // Ocultar el botón cuando la PWA se instale
    window.addEventListener('appinstalled', () => {
        if (showAlert) showAlert.style.display = "none";
    });

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        notice = e;
        console.log(notice);
        showAddToHomeScreen();
    });

    const showAddToHomeScreen = () => {
        if (showAlert) {
            showAlert.style.display = "flex";
            btnInstalar.style.display = "flex";
            
            showAlert.addEventListener('click', addToHomeScreen);
            console.log(showAlert);
        }
    }

    const addToHomeScreen = () => {
        showAlert.style.display = "none";
        // if (showAlert) {
        //     showAlert.style.display = "none";
        // }
        if(notice){
            notice.prompt();
            notice.userChoice
                .then((choiceResult) => {
                    if(choiceResult.outcome === 'accepted'){
                        console.log('El usuario acepto');
                        if (showAlert) {
                            showAlert.style.display = "none";
                        }
                    } else {
                        console.log('El usuario no acepto');
                    }
                    notice = null;
                })
        }
    }
})()

/* pregunta si aceptamos notificaciones */
if(window.Notification && Notification.permission !== 'denied' ){
    console.log('ejecutando')
    setTimeout('Notification.requestPermission()', 5000);

    new Notification('Titulo', {
        body: "Bienvenido al mundo del terror cosmico.",
        icon: "icons/icon-192x192.png",
        image: "assets/logo.png",
        badge: "assets/logo.png"
    })
}

/* Detectar estado de conexion */
(()=>{

    console.log("estado de conexion");

    let indicator = document.querySelector('.status-online');
    let theme = document.querySelector('meta[name=theme-color]');

    const status = (e) =>{
        console.log(e)

        if(navigator.online){
            indicator.classList.remove('offline');
            theme.setAttribute("content", "#D9F400")
        } else {
            indicator.classList.add('offline');
            theme.setAttribute("content", "#D90000")
        }
    }

    if(navigator.online){
        status(this)
    }


    window.addEventListener("online", status);
    window.addEventListener("offline", status);


})();

/* API Share */ 
(()=>{
    
    document.querySelector('.share').addEventListener('click', () =>{
        
        if(navigator.share){
            navigator.share({
                title: "DWT3AP - PWA",
                text: "Finalmente es una pwa",
                url: "https://dwt3ap-pwa.netlify.app/",
            })
            .then(()=>{
                console.log("se compartio")
            })
            .catch((error)=>{
                console.error(error)
            })
        }

    });
})()



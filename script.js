document.addEventListener('DOMContentLoaded', () => {

    // VARIABILI GLOBALI
    const header = document.getElementById('main-header');
    const sectionsToAnimate = document.querySelectorAll('.fade-in');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    // === VARIABILI PER COOKIE CONSENT ===
    const banner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-cookies');
    const customizeButton = document.getElementById('customize-cookies');
    const cookieName = 'tisan-ae_cookie_consent'; // Nome del cookie per storage

     // === VARIABILI PER MODAL PERSONALIZZAZIONE ===
    const modal = document.getElementById('customize-modal');
    const saveButton = document.getElementById('save-preferences');
    const rejectAllModalButton = document.getElementById('reject-all-modal');
    const modalClose = document.getElementById('modal-close');
    
    // Checkbox
    const analyticsCheckbox = document.getElementById('cookie-analytics');
    const marketingCheckbox = document.getElementById('cookie-marketing');
    
    // Nome storage specifico
    const preferencesName = 'tisan-ae_cookie_preferences';
    
    // ==================================================================
    // 1. GESTIONE ANIMAZIONE HEADER FISSO (SCROLL)
    // ==================================================================

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Esegue subito per gestire il ricaricamento

    // ==================================================================
    // 2. GESTIONE HAMBURGER MENU (MOBILE)
    // ==================================================================
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // ==================================================================
    // 3. GESTIONE ANIMAZIONE FADE-IN ON SCROLL (IL TUO SCRIPT)
    // ==================================================================

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 
    });

    // Applica l'osservatore a tutti gli elementi con la classe .fade-in (che hai già aggiunto)
    // Qui includiamo le sezioni e i singoli elementi come i 'senso-item'
    sectionsToAnimate.forEach(item => {
        observer.observe(item);
    });

    // ==================================================================
    // 4. GESTIONE COOKIE CONSENT (Accetta, Rifiuta, Personalizza)
    // ==================================================================

    // ------------------------------------------------------------------
// A. FUNZIONI CHIAVE
// ------------------------------------------------------------------

// 1. Funzione che abilita i servizi in base alle preferenze
function caricaServiziTracciamento(prefs) {
    // Carica le preferenze dall'storage se non fornite (ovvero, al caricamento pagina)
    prefs = prefs || JSON.parse(localStorage.getItem(preferencesName)) || { analytics: false, marketing: false }; 

    if (prefs.analytics) {
        // *** INSERISCI QUI IL TUO CODICE GOOGLE ANALYTICS O GTM ***
        console.log("Servizi di Analisi/Statistiche caricati.");
        /* Esempio di caricamento GTM dinamico:
        const scriptGTM = document.createElement('script');
        scriptGTM.src = 'https://www.googletagmanager.com/gtag/js?id=GTM-XXXXXX';
        scriptGTM.async = true;
        document.head.appendChild(scriptGTM);
        */
    }
    
    if (prefs.marketing) {
        // *** INSERISCI QUI IL TUO CODICE META PIXEL/PROFILAZIONE ***
        console.log("Servizi di Marketing caricati.");
    }
}

// 2. Funzione che apre il pannello e carica lo stato precedente
function apriPannelloPersonalizzazione() {
    banner.style.display = 'none';
    modal.style.display = 'block'; 

    const currentPrefs = JSON.parse(localStorage.getItem(preferencesName));
    
    // Se ci sono preferenze salvate, ripristina lo stato dei checkbox
    if (currentPrefs) {
        analyticsCheckbox.checked = currentPrefs.analytics;
        marketingCheckbox.checked = currentPrefs.marketing;
    } else {
        // Impostazione iniziale: Analisi ON, Marketing OFF (come da default UX)
        analyticsCheckbox.checked = true; 
        marketingCheckbox.checked = false;
    }
}

// 3. Funzione che salva le preferenze e ricarica i servizi
function salvaEAbilitaServizi() {
    const prefs = {
        analytics: analyticsCheckbox.checked,
        marketing: marketingCheckbox.checked
    };
    
    // Salva le scelte nel localStorage
    localStorage.setItem(preferencesName, JSON.stringify(prefs));
    localStorage.setItem(cookieName, 'true'); // Consenso interagito

    modal.style.display = 'none'; 
    banner.style.display = 'none';
    
    // Carica i servizi in base alle scelte fatte
    caricaServiziTracciamento(prefs);
}


// ------------------------------------------------------------------
// B. LOGICA DI CONTROLLO ALL'AVVIO
// ------------------------------------------------------------------

// Controlla all'avvio: se ha già interagito in passato, riabilita i servizi
if (localStorage.getItem(cookieName) === 'true') {
    caricaServiziTracciamento();
} else {
    // Altrimenti, mostra il banner minimale (che è nascosto nel CSS di default)
    banner.style.display = 'block';
}


// ------------------------------------------------------------------
// C. LISTENERS DI INTERAZIONE
// ------------------------------------------------------------------

// ACCETTA (dal Banner): Accetta tutto (Analytics: true, Marketing: true)
if (acceptButton) {
    acceptButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem(preferencesName, JSON.stringify({ analytics: true, marketing: true }));
        localStorage.setItem(cookieName, 'true');
        banner.style.display = 'none';
        caricaServiziTracciamento({ analytics: true, marketing: true }); 
    });
}

// RIFIUTA (dal Banner): Rifiuta tutto (Analytics: false, Marketing: false)
if (rejectButton) {
    rejectButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem(preferencesName, JSON.stringify({ analytics: false, marketing: false }));
        localStorage.setItem(cookieName, 'true'); // Salva l'interazione per non mostrare il banner
        banner.style.display = 'none';
        caricaServiziTracciamento({ analytics: false, marketing: false });
    });
}

// PERSONALIZZA (dal Banner): Apre il modale
if (customizeButton) {
    customizeButton.addEventListener('click', (e) => {
        e.preventDefault();
        apriPannelloPersonalizzazione();
    });
}

// SALVA PREFERENZE (dal Modale): Salva le scelte e abilita
if (saveButton) {
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        salvaEAbilitaServizi();
    });
}

// RIFIUTA TUTTI (dal Modale): Forza i checkbox a OFF e salva
if (rejectAllModalButton) {
    rejectAllModalButton.addEventListener('click', (e) => {
        e.preventDefault();
        analyticsCheckbox.checked = false;
        marketingCheckbox.checked = false;
        salvaEAbilitaServizi();
    });
}

// CHIUDI SENZA SALVARE (dal Modale): Chiude il modale e torna al banner principale
if (modalClose) {
    modalClose.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        banner.style.display = 'block'; 
    });
}

// ==================================================================
// 5. GESTIONE CAROSELLO GRIMORIO (SLIDER + SWIPE MOBILE)
// ==================================================================

function initGrimorioCarousel() {
    // Variabili locali per gli elementi del carosello
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const navDots = document.querySelectorAll('.carousel-nav .nav-dot');
    const carouselItems = document.querySelectorAll('.carousel-wrapper .carousel-item');
    const carouselWrapper = document.querySelector('.carousel-wrapper'); 
    const carouselContent = document.querySelector('.carousel-content'); // NUOVO: Riferimento al contenitore delle slide

    // Variabili per il calcolo dello swipe
    let touchstartX = 0;
    let touchendX = 0;

    // Mappa dei capitoli per la navigazione sequenziale (DEVE CORRISPONDERE AI data-capitolo nell'HTML)
    const capitoliSequenza = ['attuale', 'samurai', 'druidi'];

    // Funzione per aggiornare lo stato di tutte le slide E FARLE SCORRERE
    function updateCarousel(slideData) {
        // 1. Rimuove la classe 'attivo' da tutti i pallini e slide
        navDots.forEach(dot => dot.classList.remove('attivo'));
        carouselItems.forEach(item => item.classList.remove('attivo'));

        // 2. Trova la slide e il pallino che DEVONO diventare attivi
        const activeItem = document.querySelector(`.carousel-item[data-capitolo="${slideData}"]`);
        const activeDot = document.querySelector(`.nav-dot[data-slide="${slideData}"]`);

        if (activeItem && activeDot) {
            activeItem.classList.add('attivo'); // Rende la slide visibile (CSS opacity/display)
            activeDot.classList.add('attivo');

            // 3. NUOVA LOGICA CRUCIALE: CALCOLA E APPLICA LO SCORRIMENTO FISICO
            // Ottiene la larghezza del wrapper per calcolare lo scorrimento
            const wrapperWidth = carouselWrapper.clientWidth; 
            const currentIndex = capitoliSequenza.indexOf(slideData);
            
            // Calcola lo spostamento necessario (es. -100% per la seconda slide, -200% per la terza)
            const offset = -currentIndex * wrapperWidth; 

            // Applica la trasformazione al carouselContent
            if (carouselContent) {
                carouselContent.style.transform = `translateX(${offset}px)`;
            }
        }
    }

    // --- Logica Navigazione Sequenziale (Swipe e Frecce) ---

    // Gestisce il passaggio alla slide successiva o precedente
    function changeSlide(direction) {
        // Cerca la slide attualmente attiva
        const currentActiveItem = document.querySelector('.carousel-item.attivo');
        // Se non trova una slide attiva all'inizio, assume 'attuale' come punto di partenza
        const currentCapitolo = currentActiveItem ? currentActiveItem.getAttribute('data-capitolo') : 'attuale';
        
        let currentIndex = capitoliSequenza.indexOf(currentCapitolo);
        let newIndex = currentIndex;

        if (direction === 'left') { // 'left' significa avanzare (scorrere a sinistra per mostrare il successivo)
            newIndex = (currentIndex + 1) % capitoliSequenza.length; 
        } else if (direction === 'right') { // 'right' significa tornare indietro (scorrere a destra per mostrare il precedente)
            newIndex = (currentIndex - 1 + capitoliSequenza.length) % capitoliSequenza.length;
        }

        if (newIndex !== currentIndex) {
            updateCarousel(capitoliSequenza[newIndex]);
        }
    }

    // Funzione per il controllo del tocco (swipe)
    function handleGesture() {
        const swipeThreshold = 50; // Differenza minima in pixel per registrare uno swipe
        
        if (touchendX < touchstartX - swipeThreshold) {
            changeSlide('left'); // Swipe a sinistra (passa alla slide successiva)
        } else if (touchendX > touchstartX + swipeThreshold) {
            changeSlide('right'); // Swipe a destra (passa alla slide precedente)
        }
    }

    // --- Event Listeners ---

    // 1. Click sui pallini di navigazione
    navDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideToActivate = this.getAttribute('data-slide');
            updateCarousel(slideToActivate);
        });
    });

    // 2. Click sui pulsanti freccia
    if (prevButton) {
        prevButton.addEventListener('click', () => changeSlide('right'));
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => changeSlide('left'));
    }

    // 3. Tocco (Swipe) sul contenitore
    if (carouselWrapper) {
        carouselWrapper.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        });

        carouselWrapper.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            handleGesture();
        });
    }

    // NUOVO: Inizializza il carosello alla prima slide all'avvio
    // Questo è fondamentale per assicurare che lo scorrimento sia corretto fin dall'inizio
    updateCarousel(capitoliSequenza[0]); 
}

// Chiama la funzione di inizializzazione quando il DOM è completamente caricato
initGrimorioCarousel();

// ==================================================================
// FINE GESTIONE CAROSELLO
// ==================================================================
});
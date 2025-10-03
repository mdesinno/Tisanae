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
            // Aggiungi/rimuovi una classe sul body per bloccare lo scroll quando il menu è aperto
            document.body.classList.toggle('no-scroll'); // useremo questa classe nel CSS
        });
        // Logica di chiusura quando si clicca su un link del menu
        const navLinks = mainNav.querySelectorAll('a[href^="#"]'); // Seleziona solo i link che puntano a un ID (scroll sulla stessa pagina)
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Chiudi il menu mobile
                mainNav.classList.remove('open');
                // Riporta l'hamburger allo stato di default
                menuToggle.classList.remove('open');
                // Aggiorna l'attributo aria-expanded per l'accessibilità
                menuToggle.setAttribute('aria-expanded', 'false');
                // Rimuovi la classe dal body per sbloccare lo scroll
                document.body.classList.remove('no-scroll');

                // Opzionale: Se hai uno smooth scroll personalizzato via JS,
                // potresti voler aggiungere un piccolo setTimeout qui prima di chiudere
                // il menu, per dare il tempo allo smooth scroll di iniziare.
                // Per ora, lo lasciamo senza setTimeout, che è il comportamento più comune.
            });
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
// 5. GESTIONE CAROSELLO GRIMORIO (SLIDER + SWIPE MOBILE) - AGGIORNATO
// ==================================================================

function initGrimorioCarousel() {
    // Variabili locali per gli elementi del carosello
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const navDots = document.querySelectorAll('.carousel-nav .nav-dot');
    const carouselItems = document.querySelectorAll('.carousel-wrapper .carousel-item');
    const carouselWrapper = document.querySelector('.carousel-wrapper'); 
    const carouselContent = document.querySelector('.carousel-content'); 
    
    // --- VARIABILI AUTOPLAY E PAUSA ---
    let autoPlayInterval;
    const autoPlayTime = 5000; // 5 secondi
    let isPaused = false; // Flag per sapere se l'utente ha interagito manualmente

    // Variabili per il calcolo dello swipe
    let touchstartX = 0;
    let touchendX = 0;

    // Mappa dei capitoli per la navigazione sequenziale
    const capitoliSequenza = ['attuale', 'samurai', 'druidi'];

    // Funzione per avviare l'autoplay
    function startAutoplay() {
        if (!isPaused) {
            stopAutoplay(); // Evita intervalli duplicati
            autoPlayInterval = setInterval(() => {
                changeSlide('left'); // Avanza alla slide successiva
            }, autoPlayTime);
        }
    }

    // Funzione per fermare l'autoplay
    function stopAutoplay() {
        clearInterval(autoPlayInterval);
    }
    
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

            // 3. LOGICA CRUCIALE: CALCOLA E APPLICA LO SCORRIMENTO FISICO
            const wrapperWidth = carouselWrapper.clientWidth; 
            const currentIndex = capitoliSequenza.indexOf(slideData);
            const offset = -currentIndex * wrapperWidth; 

            if (carouselContent) {
                carouselContent.style.transform = `translateX(${offset}px)`;
            }
        }
    }

    // --- Logica Navigazione Sequenziale (Swipe e Frecce) ---

    // Gestisce il passaggio alla slide successiva o precedente
    function changeSlide(direction) {
        const currentActiveItem = document.querySelector('.carousel-item.attivo');
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

    // Funzione helper per gestire l'interazione manuale e la pausa
    function handleManualInteraction() {
        stopAutoplay();
        isPaused = true;
    }

    // 1. Click sui pallini di navigazione
    navDots.forEach(dot => {
        dot.addEventListener('click', function() {
            handleManualInteraction();
            const slideToActivate = this.getAttribute('data-slide');
            updateCarousel(slideToActivate);
        });
    });

    // 2. Click sui pulsanti freccia
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            handleManualInteraction();
            changeSlide('right');
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            handleManualInteraction();
            changeSlide('left');
        });
    }

    // 3. Tocco (Swipe) sul contenitore
    if (carouselWrapper) {
        carouselWrapper.addEventListener('touchstart', e => {
            handleManualInteraction();
            touchstartX = e.changedTouches[0].screenX;
        });

        carouselWrapper.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            handleGesture();
        });
    }
    
    // 4. Pausa/Riavvio al passaggio del mouse (Solo Desktop)
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoplay);
        carouselWrapper.addEventListener('mouseleave', () => {
            // Riavvia solo se l'utente non ha messo in pausa manualmente
            if (isPaused === false) {
                startAutoplay();
            }
        });
    }
    
    // 5. Intersection Observer: Avvia/Ferma l'autoplay quando visibile/nascosto
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Il carosello è visibile
                if (isPaused === false) {
                    startAutoplay();
                }
            } else {
                // Il carosello non è visibile
                stopAutoplay();
            }
        });
    }, { threshold: 0.6 }); // Il 60% del carosello deve essere visibile

    if (carouselWrapper) {
        observer.observe(carouselWrapper);
    }

    // Inizializza il carosello alla prima slide all'avvio
    updateCarousel(capitoliSequenza[0]); 
    
    // L'autoplay verrà avviato dall'IntersectionObserver quando il carosello entra nella viewport.
}

// Chiama la funzione di inizializzazione quando il DOM è completamente caricato
initGrimorioCarousel();

// ==================================================================
// FINE GESTIONE CAROSELLO
// ==================================================================

// ==================================================================
    // 6. GESTIONE FORM NEWSLETTER (INVIO AJAX + FEEDBACK INLINE)
    // ==================================================================
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');

    if (newsletterForm && newsletterFeedback) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impedisce il ricaricamento della pagina
            
            // Rimuovi eventuali classi di feedback precedenti
            newsletterFeedback.classList.remove('success', 'error');
            newsletterFeedback.style.opacity = 0;
            newsletterFeedback.style.maxHeight = '0';
            newsletterFeedback.innerHTML = ''; // Pulisci il messaggio precedente

            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            const formData = new URLSearchParams();
            formData.append('form-name', 'newsletter'); // Importante per Netlify
            formData.append('email', email);

            try {
                // Invio dei dati a Netlify.
                // Netlify processa le submission dei form con data-netlify="true" tramite POST
                // all'URL della pagina corrente o all'action specificato.
                // Usando fetch con l'URL della pagina, Netlify lo intercetta.
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });

                if (response.ok) {
                    newsletterFeedback.classList.add('success');
                    newsletterFeedback.innerHTML = 'Iscrizione confermata. Grazie!';
                    emailInput.value = ''; // Pulisci l'input dopo il successo
                } else {
                    // Netlify Forms risponde con 200 OK anche in caso di errori interni del form,
                    // quindi questa parte potrebbe essere difficile da testare senza errori di rete.
                    // Per errori specifici, si dovrebbe usare Netlify Functions.
                    newsletterFeedback.classList.add('error');
                    newsletterFeedback.innerHTML = 'C\'è stato un problema. Riprova più tardi.';
                }
            } catch (error) {
                console.error('Errore nell\'invio del form:', error);
                newsletterFeedback.classList.add('error');
                newsletterFeedback.innerHTML = 'C\'è stato un problema di rete. Riprova più tardi.';
            } finally {
                // Mostra il messaggio con un piccolo ritardo per l'animazione
                 setTimeout(() => {
                newsletterFeedback.style.opacity = 1;
                newsletterFeedback.style.maxHeight = '100px';
                newsletterFeedback.style.padding = '10px 15px'; // Rendi visibile il padding

                // NUOVA AGGIUNTA: NASCONDI IL MESSAGGIO DOPO 4 SECONDI
                const HIDE_DELAY = 4000; // 4000 millisecondi = 4 secondi
                
                setTimeout(() => {
                    newsletterFeedback.style.opacity = 0;
                    newsletterFeedback.style.maxHeight = '0';
                    newsletterFeedback.style.padding = '0'; // Rimuovi il padding
                    // Togli la classe 'success' o 'error' alla fine della transizione CSS (0.5s)
                    setTimeout(() => {
                        newsletterFeedback.classList.remove('success', 'error');
                        newsletterFeedback.innerHTML = ''; // Pulisci il contenuto
                    }, 500); 
                    
                }, HIDE_DELAY); 
                
            }, 50); // Piccolo ritardo iniziale per l'animazione SHOW
        }
    });
}
});
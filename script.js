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

// === VARIABILI GLOBALI PER GLI ID ===
const GA4_ID = 'G-ZSH2CM6EGD'; // Il tuo ID GA4 reale
const PIXEL_ID = 'YOUR_PIXEL_ID'; // IL TUO ID Meta Pixel (da inserire quando lo crei)
const TIKTOK_PIXEL_ID = 'YOUR_TIKTOK_PIXEL_ID'; // Manteniamo la costante ID qui per pulizia


// ------------------------------------------------------------------
// A. FUNZIONI CHIAVE
// ------------------------------------------------------------------

// 1. Funzione che abilita i servizi in base alle preferenze
function caricaServiziTracciamento(prefs) {
    // Carica le preferenze dall'storage se non fornite (ovvero, al caricamento pagina)
    // Ho aggiunto il controllo if (typeof window.gtag === 'undefined') e if (typeof window.fbq === 'undefined')
    // per assicurarci che gli script vengano caricati una sola volta.
    prefs = prefs || JSON.parse(localStorage.getItem(preferencesName)) || { analytics: false, marketing: false }; 

    // --- Servizi di Statistiche (Google Analytics) ---
    if (prefs.analytics) {
        console.log("Servizi di Analisi/Statistiche (GA4) caricati.");
        
        if (typeof window.gtag === 'undefined') { // Carica lo script solo la prima volta
            const scriptGA4 = document.createElement('script');
            scriptGA4.async = true;
            scriptGA4.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
            document.head.appendChild(scriptGA4);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Inizializza GA4: anonimizzazione IP per GDPR
            gtag('config', GA4_ID, { 'anonymize_ip': true });
        } else {
            // Se gtag esiste già (utente ha ricaricato la pagina con consenso ON), chiama solo config
            gtag('config', GA4_ID, { 'anonymize_ip': true });
        }
    }
    
    // --- Servizi di Marketing (unificati) ---
    if (prefs.marketing) {
        console.log("Servizi di Marketing (Meta e TikTok) caricati.");

                // --- META PIXEL ---
        if (typeof window.fbq === 'undefined') { // Carica lo script solo la prima volta
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
        }
        
        fbq('init', PIXEL_ID); 
        fbq('track', 'PageView');

                // --- TIKTOK PIXEL ---
        if (typeof window.ttq === 'undefined') { 
            !function (w, d, t) {
                w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
                ttq.methods = ["page", "track", "identify", "instances", "load", "ready", "pageLoad", "trackEvents", "debug", "on", "off", "once", "setAndTrack", "t", "enableCookie"];
                ttq.setAndTrack = function (t, e) { ttq.set(t), ttq.track(e) };
                ttq.load = function (t, e) { var n = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}; ttq._i[t] = { tid: t, mayViewThrough: !(e.mayViewThrough = !(e.mayViewThrough = e.mayViewThrough || !0)), isTT: !e.isTT }; ttq._i[t].load = !0; ttq._i[t].loadTime = (new Date).getTime(); ttq._i[t].loadTimeDiff = 0; n = e.host || n; ttq._i[t].host = n; ttq.push({ event: "load", arguments: [t, e] }); var s = d.createElement(t); s.type = "text/javascript", s.async = !0, s.src = n, d.head.appendChild(s); };
                ttq.page = function (e) { ttq.push({ event: "page", arguments: [e] }); }; var n = w.location.pathname, s = w.location.search, r = w.location.hash; n && ttq.page(n.replace(/(^\/)|\/$/g, "") + s.replace(/(^\/)|\/$/g, "") + r.replace(/(^\/)|\/$/g, ""));
            }(window, document, 'ttq');
        }
        ttq.load(TIKTOK_PIXEL_ID);
        ttq.page();
    }
}
// ... (Il resto del tuo script rimane invariato)

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
const email = emailInput.value.trim();

const formData = new URLSearchParams();
formData.append('email', email);  // <-- niente form-name

try {
  const response = await fetch('/.netlify/functions/handle-newsletter', { // <-- endpoint giusto
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (response.ok) {
    newsletterFeedback.classList.add('success');
    newsletterFeedback.innerHTML = 'Iscrizione confermata. Grazie!';
    emailInput.value = '';
  } else {
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



// ==================================================================
// 7. SHOP E CARRELLO (IMPLEMENTAZIONE COMPLETA)
// ==================================================================

// === VARIABILI MODALE SHOP ===
const productModal = document.getElementById('product-modal');
const buyNowBtn = document.getElementById('buy-now-btn');
const addToCartBtn = document.getElementById('add-to-cart-btn');
const notifyBtn = document.getElementById('notify-btn');
const productQtyInput = document.getElementById('product-qty');
const cartCountSpan = document.getElementById('cart-count'); 

// Dati di esempio per i prodotti (ORA CON TUTTI E 4 I PRODOTTI)
const productsData = {
    'box-dee-della-luna': {
        id: 'box-dee-della-luna',
        name: 'Box Dee della Luna',
        price: 39.90,
        status: 'available',
        description: 'La box definitiva per affrontare il freddo con un mix di spezie calde, cannella e zenzero. Perfetta per le serate davanti al camino.',
        contents: ['Infuso alla Cannella (50g)', 'Tisana Zenzero e Limone (50g)', 'Mug in Ceramica a tema', 'Breve guida alle ricette autunnali'],
        images: ['Img/Box Dee.png', 'Img/Box Samurai.png']
    },
    'box-samurai': {
        id: 'box-samurai',
        name: 'Box Risveglio di Primavera (Samurai)',
        price: 29.90,
        status: 'refill',
        description: 'Una box fresca e leggera, pensata per energizzare e disintossicare. Include erbe aromatiche e note floreali delicate.',
        contents: ['Infuso alla Menta (50g)', 'Tisana Fiori di Campo (50g)', 'Filtri riutilizzabili', 'Breve guida al benessere primaverile'],
        images: ['Img/Box Samurai.png', 'Img/Box Samurai.png']
    },
    'box-druidi': { // PRODOTTO CLONATO
        id: 'box-druidi',
        name: 'Box I Druidi',
        price: 39.90,
        status: 'available',
        description: 'Un rito di purificazione con erbe purificanti e terrene (Salvia, Menta). Contiene il Mini Mortaio in legno d\'ulivo.',
        contents: ['Infuso alla Salvia (50g)', 'Tisana Menta e Limone (50g)', 'Mortaio in legno', 'Breve guida ai rituali dei Boschi'],
        images: ['Img/Box Druidi.png', 'Img/Box Druidi.png']
    },
    'box-autunno': { // PRODOTTO CLONATO
        id: 'box-autunno',
        name: 'Box Antiche Dee (Autunno)',
        price: 39.90,
        status: 'refill',
        description: 'La box definitiva per affrontare il freddo con un mix di spezie calde, cannella e zenzero. Perfetta per le serate davanti al camino.',
        contents: ['Infuso alla Cannella (50g)', 'Tisana Zenzero e Limone (50g)', 'Mug in Ceramica a tema', 'Breve guida alle ricette autunnali'],
        images: ['Img/Box Dee.png', 'Img/Box Dee.png']
    }
};

// Array per il carrello (ora gestito da localStorage)
let cart = []; 

// ------------------------------------------------------------------
// A. GESTIONE PERSISTENZA CARRELLO (localStorage)
// ------------------------------------------------------------------

function loadCart() {
    const storedCart = localStorage.getItem('tisanae_shopping_cart');
    cart = storedCart ? JSON.parse(storedCart) : [];
}

function saveCart() {
    localStorage.setItem('tisanae_shopping_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountSpan) { 
        cartCountSpan.textContent = totalItems;
    }
    // Aggiorna anche l'elemento nella pagina carrello (se presente)
    const cartPageCount = document.getElementById('cart-page-count');
    if (cartPageCount) {
        cartPageCount.textContent = totalItems;
    }
}

// ------------------------------------------------------------------
// B. GESTIONE MODALE E TAB PRODOTTI
// ------------------------------------------------------------------

function openModal(productId) {
    const product = productsData[productId];
    if (!product) {
        console.error('Prodotto non trovato:', productId);
        return;
    }

    // 1. Inietta i dati statici
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `€ ${product.price.toFixed(2)}`;
    document.getElementById('modal-description').textContent = product.description;

    // 2. Inietta il Contenuto
    const contentsList = document.getElementById('modal-contents');
    contentsList.innerHTML = product.contents.map(item => `<li>${item}</li>`).join('');

    // 3. Gestione Carosello Immagini
    const carouselInner = productModal.querySelector('.carousel-inner'); 
    carouselInner.innerHTML = product.images.map((imgSrc, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${imgSrc}" class="d-block w-100" alt="${product.name} - Immagine ${index + 1}">
        </div>
    `).join('');
    
    // 4. Gestione Tasti CTA in base allo Status
    if (product.status === 'available') {
        buyNowBtn.style.display = 'block';
        addToCartBtn.style.display = 'block';
        productQtyInput.disabled = false;
        notifyBtn.style.display = 'none';
        
        // Collega gli eventi con l'ID prodotto corretto
        buyNowBtn.onclick = () => handleBuyNow(productId, parseInt(productQtyInput.value));
        addToCartBtn.onclick = () => handleAddToCart(productId, parseInt(productQtyInput.value));

    } else if (product.status === 'refill') {
        buyNowBtn.style.display = 'none';
        addToCartBtn.style.display = 'none';
        productQtyInput.disabled = true;
        notifyBtn.style.display = 'block';

        notifyBtn.onclick = () => openNotifyModal(productId); 
    }

    // 5. Apri la Modale (Fix: assicurati che sia il container a cambiare display)
    productModal.style.display = 'block';
    
    // Reset Quantity
    productQtyInput.value = 1;
    
    // Mostra il Tab Info di default
    showTab('info'); 
}

function closeModal() {
    productModal.style.display = 'none';
}

function showTab(tabId) {
    // Gestione Active Class sui link
    document.querySelectorAll('.nav-tabs .nav-link').forEach(link => {
        if (link.dataset.tab === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Gestione visualizzazione dei pannelli
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ------------------------------------------------------------------
// C. FUNZIONI CARRELLO
// ------------------------------------------------------------------

function handleAddToCart(productId, quantity) {
    const product = productsData[productId];
    quantity = parseInt(quantity) || 1; 

    if (!product || quantity <= 0) return;

    let itemFound = false;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].productId === productId) {
            cart[i].quantity += quantity;
            itemFound = true;
            break;
        }
    }

    if (!itemFound) {
        cart.push({ productId, quantity, price: product.price, name: product.name, image: product.images[0] });
    }

    saveCart(); 
    updateCartCount();
    closeModal();
    alert(`${quantity} pz di "${product.name}" aggiunti al carrello!`);
    
    // Reindirizza alla pagina carrello dopo un breve ritardo per feedback visivo
    // setTimeout(() => { window.location.href = 'cart.html'; }, 500); 
}

function handleBuyNow(productId, quantity) {
    const product = productsData[productId];
    if (!product || quantity <= 0) return;

    // Svuota il carrello attuale e aggiunge solo questo articolo per il checkout veloce
    cart = [{ productId, quantity: parseInt(quantity) || 1, price: product.price, name: product.name, image: product.images[0] }];
    saveCart();
    updateCartCount();

    alert(`Procedo al Checkout Veloce per ${quantity} pz di "${product.name}".`); 
    closeModal();
    // Reindirizza al checkout
    // window.location.href = '/checkout-stripe.html'; 
}

function openNotifyModal(productId) {
    alert(`Apro la modale per la notifica email per ${productId}.`);
    closeModal();
}


// ------------------------------------------------------------------
// D. ASSEGNAZIONE EVENTI E INIZIALIZZAZIONE
// ------------------------------------------------------------------

// Inizializza il carrello al caricamento
loadCart();
updateCartCount();

// Listener per i click sulle card prodotto (SOLO NELLA PAGINA SHOP)
if (document.querySelector('#product-grid-wrapper')) {
    document.querySelectorAll('.product-card-wrapper .card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Evita di aprire la modale se l'utente clicca su un bottone interno (se fossero implementati)
            if (!e.target.closest('button')) {
                const productId = card.parentElement.dataset.productId;
                openModal(productId);
            }
        });
    });
}

// Listener per la navigazione a schede nella modale
document.querySelectorAll('.nav-tabs .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showTab(e.target.dataset.tab);
    });
});

// Chiudi la modale cliccando sul bottone X o fuori
const closeButton = document.querySelector('.close-button');
if (closeButton) {
    closeButton.onclick = closeModal;
}
window.addEventListener('click', (event) => {
    if (event.target === productModal) {
        closeModal();
    }
});
// ==================================================================
// FINE GESTIONE SHOP E CARRELLO
// ==================================================================
});
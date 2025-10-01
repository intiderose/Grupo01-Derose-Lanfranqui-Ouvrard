/**
 * Gestiona la interactividad del encabezado de TinyGames,
 * incluyendo los menús desplegables.
 */
class TinyGamesHeader {
    #hamburgerButton;
    #sideMenu;
    #avatarButton;
    #userMenu;

    constructor() {
        this.#hamburgerButton = document.querySelector('.header__hamburger');
        this.#sideMenu = document.getElementById('side-menu');
        this.#avatarButton = document.querySelector('.header__avatar');
        this.#userMenu = document.getElementById('user-menu');

        this.#init();
    }

    /**
     * Inicializa los listeners de eventos.
     * @private
     */
    #init() {
        if (this.#hamburgerButton && this.#sideMenu) {
            this.#hamburgerButton.addEventListener('click', () => this.#toggleMenu(this.#hamburgerButton, this.#sideMenu, true));
        }

        if (this.#avatarButton && this.#userMenu) {
            this.#avatarButton.addEventListener('click', () => this.#toggleMenu(this.#avatarButton, this.#userMenu));
        }

        document.addEventListener('click', (event) => this.#closeMenusOnClickOutside(event));
    }

    /**
     * Muestra u oculta un menú.
     * @private
     * @param {HTMLElement} button - El botón que controla el menú.
     * @param {HTMLElement} menu - El menú a mostrar/ocultar.
     * @param {boolean} [isSideMenu=false] - Indica si es el menú lateral.
     */
    #toggleMenu(button, menu, isSideMenu = false) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        menu.hidden = isExpanded;
        menu.setAttribute('aria-hidden', String(isExpanded));

        // Si se abre el menú lateral, cerramos el de usuario si está abierto.
        if (isSideMenu && !isExpanded && this.#userMenu && !this.#userMenu.hidden) {
            this.#toggleMenu(this.#avatarButton, this.#userMenu);
        }
    }

    /**
     * Cierra los menús si el clic ocurre fuera de ellos.
     * @private
     * @param {MouseEvent} event - El objeto de evento de clic.
     */
    #closeMenusOnClickOutside(event) {
        if (this.#userMenu && !this.#userMenu.hidden && !this.#avatarButton.contains(event.target) && !this.#userMenu.contains(event.target)) {
            this.#toggleMenu(this.#avatarButton, this.#userMenu);
        }

        if (this.#sideMenu && !this.#sideMenu.hidden && !this.#hamburgerButton.contains(event.target) && !this.#sideMenu.contains(event.target)) {
            this.#toggleMenu(this.#hamburgerButton, this.#sideMenu, true);
        }
    }
}

/**
 * Gestiona la funcionalidad del carrusel automático.
 */
class Carousel {
    #carousel;
    #track;
    #slides;
    #slideCount;
    #currentIndex = 0;
    #intervalId;

    /**
     * @param {string} carouselSelector - El selector CSS para el contenedor del carrusel.
     * @param {number} interval - El tiempo en milisegundos para cambiar de slide.
     */
    constructor(carouselSelector, interval = 5000) {
        this.#carousel = document.querySelector(carouselSelector);
        if (!this.#carousel) {
            console.error(`Carousel con selector "${carouselSelector}" no encontrado.`);
            return;
        }

        this.#track = this.#carousel.querySelector('.carousel-track');
        if (!this.#track) return;

        this.#slides = Array.from(this.#track.children);
        this.#slideCount = this.#slides.length;

        this.#init(interval);
    }

    /**
     * Inicializa el carrusel, clonando el primer slide y comenzando el intervalo.
     * @private
     * @param {number} interval - El tiempo para el intervalo.
     */
    #init(interval) {
        if (this.#slideCount > 1) {
            const firstClone = this.#slides[0].cloneNode(true);
            this.#track.appendChild(firstClone);
            this.#intervalId = setInterval(() => this.#moveToNextSlide(), interval);
        }
    }

    /**
     * Mueve el carrusel al siguiente slide.
     * @private
     */
    #moveToNextSlide() {
        this.#currentIndex++;
        this.#track.style.transition = 'transform 0.5s ease-in-out';
        this.#track.style.transform = `translateX(-${this.#currentIndex * 100}%)`;

        // Si hemos llegado al clon, reseteamos al principio sin animación.
        if (this.#currentIndex === this.#slideCount) {
            setTimeout(() => {
                this.#track.style.transition = 'none';
                this.#currentIndex = 0;
                this.#track.style.transform = `translateX(0)`;
            }, 500); // Debe coincidir con la duración de la transición CSS.
        }
    }
}

/**
 * Genera dinámicamente las cajas de contenido en la página.
 */
class ContentBoxGenerator {
    #container;
    #boxData = [
        { title: 'Para Ti', colorClass: 'box-color-1' },
        { title: 'Jugados recientemente', colorClass: 'box-color-2' },
        { title: 'Juegos Online', colorClass: 'box-color-1' },
        { title: 'Juegos de 2 Jugadores', colorClass: 'box-color-2' }
    ];

    /**
     * @param {string} containerSelector - El selector CSS para el contenedor principal de las cajas.
     */
    constructor(containerSelector) {
        this.#container = document.querySelector(containerSelector);
        if (!this.#container) {
            console.error(`Contenedor de cajas con selector "${containerSelector}" no encontrado.`);
            return;
        }
        this.#generate();
    }

    /**
     * Genera el HTML para las cajas de contenido y lo inserta en el contenedor.
     * @private
     */
    #generate() {
        const contentBoxesHTML = this.#boxData.map(data => `
            <div class="content-box ${data.colorClass}">
                <div class="content-box__header">
                    <h2 class="content-box__title">${data.title}</h2>
                    <a href="proximamente.html" class="content-box__see-all">Ver todos</a>
                </div>
                <div class="cards-container"></div>
                <button class="scroll-arrow scroll-arrow--left" aria-label="Desplazar a la izquierda" hidden>‹</button>
                <button class="scroll-arrow scroll-arrow--right" aria-label="Desplazar a la derecha">›</button>
            </div>
        `).join('');

        this.#container.innerHTML = contentBoxesHTML;
    }
}

/**
 * Genera dinámicamente las tarjetas de juego dentro de sus contenedores.
 */
class CardGenerator {
    #containers;
    #numberOfCards;
    #cardHTML = `
        <div class="game-card">
            <img src="foto-de-prueba.png" alt="Imagen del juego" class="game-card__image">
            <h3 class="game-card__title">Nombre del Juego</h3>
            <a href="#" class="game-card__button">Jugar</a>
        </div>
    `;

    /**
     * @param {string} containerSelector - El selector CSS para los contenedores de tarjetas.
     * @param {number} [numberOfCards=8] - El número de tarjetas a generar en cada contenedor.
     */
    constructor(containerSelector, numberOfCards = 8) {
        this.#containers = document.querySelectorAll(containerSelector);
        this.#numberOfCards = numberOfCards;

        if (this.#containers.length > 0) {
            this.#generate();
        }
    }

    /**
     * Genera el HTML para las tarjetas y lo inserta en cada contenedor.
     * @private
     */
    #generate() {
        this.#containers.forEach(container => {
            const cardsToInsert = Array(this.#numberOfCards).fill(this.#cardHTML).join('');
            container.innerHTML = cardsToInsert;
        });
    }
}

/**
 * Gestiona el desplazamiento horizontal de las tarjetas con botones de flecha.
 */
class CardScroller {
    #contentBox;
    #cardsContainer;
    #leftArrow;
    #rightArrow;

    /**
     * @param {HTMLElement} contentBoxElement - El elemento de la caja de contenido.
     */
    constructor(contentBoxElement) {
        this.#contentBox = contentBoxElement;
        this.#cardsContainer = this.#contentBox.querySelector('.cards-container');
        this.#leftArrow = this.#contentBox.querySelector('.scroll-arrow--left');
        this.#rightArrow = this.#contentBox.querySelector('.scroll-arrow--right');

        if (!this.#cardsContainer || !this.#leftArrow || !this.#rightArrow) {
            return;
        }

        this.#init();
    }

    /**
     * Inicializa los listeners de eventos y el estado inicial de las flechas.
     * @private
     */
    #init() {
        this.#leftArrow.addEventListener('click', () => this.#scroll(-1));
        this.#rightArrow.addEventListener('click', () => this.#scroll(1));
        this.#cardsContainer.addEventListener('scroll', () => this.#updateArrowVisibility());

        // Comprobar visibilidad al inicio y en cada cambio de tamaño
        this.checkScrollable();
    }

    /**
     * Desplaza el contenedor de tarjetas.
     * @private
     * @param {number} direction - -1 para izquierda, 1 para derecha.
     */
    #scroll(direction) {
        // El valor de desplazamiento es aproximadamente el ancho de una tarjeta + el gap
        const scrollAmount = (196 + 22) * direction;
        this.#cardsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    /**
     * Comprueba si el contenedor es desplazable y actualiza la visibilidad de las flechas.
     */
    checkScrollable() {
        const container = this.#cardsContainer;
        const isScrollable = container.scrollWidth > container.clientWidth;

        this.#contentBox.classList.toggle('is-scrollable', isScrollable);

        if (isScrollable) {
            this.#updateArrowVisibility();
        }
    }

    /**
     * Comprueba la posición del scroll y muestra u oculta las flechas.
     * @private
     */
    #updateArrowVisibility() {
        const container = this.#cardsContainer;
        const scrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        // Ocultar flecha izquierda si está al principio
        this.#leftArrow.hidden = scrollLeft <= 0;

        // Ocultar flecha derecha si está al final (con un pequeño margen de error)
        this.#rightArrow.hidden = scrollLeft >= maxScrollLeft - 1;
    }
}


// Inicializar todos los componentes cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    new TinyGamesHeader();
    new Carousel('.carousel-container');
    new ContentBoxGenerator('.content-container');
    new CardGenerator('.cards-container');

    // Inicializar un scroller para cada caja de contenido
    const scrollers = [];
    document.querySelectorAll('.content-box').forEach(box => {
        scrollers.push(new CardScroller(box));
    });

    // Volver a comprobar la visibilidad de las flechas al redimensionar la ventana
    window.addEventListener('resize', () => {
        scrollers.forEach(scroller => scroller.checkScrollable());
    });
});

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
            this.#hamburgerButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#toggleMenu(this.#hamburgerButton, this.#sideMenu);
                if (this.#userMenu.getAttribute('aria-hidden') === 'false') {
                    this.#closeMenu(this.#avatarButton, this.#userMenu);
                }
            });
        }

        if (this.#avatarButton && this.#userMenu) {
            this.#avatarButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#toggleMenu(this.#avatarButton, this.#userMenu);
                if (this.#sideMenu && this.#sideMenu.getAttribute('aria-hidden') === 'false') {
                    this.#closeMenu(this.#hamburgerButton, this.#sideMenu);
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (this.#sideMenu && this.#sideMenu.getAttribute('aria-hidden') === 'false' && !this.#sideMenu.contains(e.target) && !this.#hamburgerButton.contains(e.target)) {
                this.#closeMenu(this.#hamburgerButton, this.#sideMenu);
            }
            if (this.#userMenu && this.#userMenu.getAttribute('aria-hidden') === 'false' && !this.#userMenu.contains(e.target) && !this.#avatarButton.contains(e.target)) {
                this.#closeMenu(this.#avatarButton, this.#userMenu);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.#sideMenu && this.#sideMenu.getAttribute('aria-hidden') === 'false') {
                    this.#closeMenu(this.#hamburgerButton, this.#sideMenu);
                }
                if (this.#userMenu && this.#userMenu.getAttribute('aria-hidden') === 'false') {
                    this.#closeMenu(this.#avatarButton, this.#userMenu);
                }
            }
        });
    }

    /**
     * Muestra u oculta un menú.
     * @private
     * @param {HTMLElement} button - El botón que controla el menú.
     * @param {HTMLElement} menu - El menú a mostrar/ocultar.
     */
    #toggleMenu(button, menu) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this.#closeMenu(button, menu);
        } else {
            this.#openMenu(button, menu);
        }
    }

    /**
     * Abre un menú.
     * @private
     */
    #openMenu(button, menu) {
        button.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        if (menu === this.#sideMenu) {
            document.body.classList.add('no-scroll');
        }
    }

    /**
     * Cierra un menú.
     * @private
     * @param {HTMLElement} button - El botón que controla el menú.
     * @param {HTMLElement} menu - El menú a cerrar.
     */
    #closeMenu(button, menu) {
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');

        if (menu === this.#sideMenu) {
            document.body.classList.remove('no-scroll');
        }
    }
}

/**
 * Genera dinámicamente las cajas de contenido en la pgina.
 */
class ContentBoxGenerator {
    #container;
    #boxData = [
        { title: 'Para Ti', colorClass: 'box-color-1' },
        { title: 'Juegos Premium', colorClass: 'box-color-2', premium: true },
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
        const crownIcon = `<img src="assets/logo-premium.png" alt="Premium" class="title-icon">`;

        const contentBoxesHTML = this.#boxData.map(data => `
            <div class="content-box ${data.colorClass} ${data.premium ? 'content-box--premium' : ''}">
                <div class="content-box__header">
                    <h2 class="content-box__title">
                        ${data.title}
                        ${data.premium ? crownIcon : ''}
                    </h2>
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
    #cardData;

    /**
     * @param {string} containerSelector - El selector CSS para los contenedores de tarjetas.
     * @param {Array} cardData - Array de objetos con la información de los juegos.
     */
    constructor(containerSelector, cardData = []) {
        this.#containers = document.querySelectorAll(containerSelector);
        this.#cardData = cardData;

        if (this.#containers.length > 0 && this.#cardData.length > 0) {
            this.#generate();
        }
    }

    /**
     * Genera el HTML para una tarjeta de juego.
     * @private
     * @param {object} game - El objeto del juego con título e imagen.
     * @param {boolean} isPremium - Si la tarjeta debe ser premium.
     * @returns {string} - El HTML de la tarjeta.
     */
    #createCardHTML(game, isPremium) {
        const premiumBadge = `
            <div class="game-card__premium-badge">
                <img src="assets/logo-premium.png" alt="Premium">
            </div>`;

        return `
            <a href="proximamente.html" class="game-card ${isPremium ? 'game-card--premium' : ''}">
                ${isPremium ? premiumBadge : ''}
                <img src="${game.imagen}" alt="Imagen de ${game.titulo}" class="game-card__image">
                <div class="game-card__content">
                    <h3 class="game-card__title">${game.titulo}</h3>
                    <div class="game-card__button">Jugar</div>
                </div>
            </a>
        `;
    }

    /**
     * Genera el HTML para las tarjetas y lo inserta en cada contenedor.
     * @private
     */
    #generate() {
        const premiumCounts = {
            'Para Ti': 3,
            'Juegos Online': 2,
            'Juegos de 2 Jugadores': 5
        };
        const cardsPerSection = 8;

        // Clonamos y mezclamos los datos de la API para cada sección para que no se repitan en el mismo orden
        let availableGames = [...this.#cardData];
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };


        this.#containers.forEach(container => {
            shuffleArray(availableGames); // Mezclar juegos para esta sección
            const sectionGames = availableGames.slice(0, cardsPerSection);

            const contentBox = container.closest('.content-box');
            const titleElement = contentBox.querySelector('.content-box__title');
            const title = titleElement.firstChild.textContent.trim();
            const isAllPremiumBox = contentBox.classList.contains('content-box--premium');

            let cardsToInsert = '';

            if (isAllPremiumBox) {
                cardsToInsert = sectionGames.map(game => this.#createCardHTML(game, true)).join('');
            } else {
                const numPremium = premiumCounts[title] || 0;

                cardsToInsert = sectionGames.map((game, index) => {
                    // Los primeros 'numPremium' juegos de la lista mezclada serán premium
                    const isPremium = index < numPremium;
                    return this.#createCardHTML(game, isPremium);
                }).join('');
            }

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

async function consumirAPI() {
    try{
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        if (!response.ok) { throw new Error(`Error en la API: ${response.status}`); }

        const data = await response.json();

        // Si viene un objeto con "results", por ejemplo: { results: [...] }
        const juegos = Array.isArray(data) ? data : data.results;

        // Transformamos cada juego al formato que usa CardGenerator
        const juegosFormateados = juegos.map(juego => ({
            imagen: juego.background_image,
            titulo: juego.name,

        }));

        return juegosFormateados;
    }
    catch (error){
        console.error("Error al consumir la API:", error);
        return [];
    }
}

// Inicializar todos los componentes cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', async () => {
    new TinyGamesHeader();
    new ContentBoxGenerator('.content-container');

    const cardData = await consumirAPI(); // <-- Usar await aquí
    new CardGenerator('.cards-container', cardData);

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

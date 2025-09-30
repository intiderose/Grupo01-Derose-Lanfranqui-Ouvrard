/**
 * Gestiona la interactividad del encabezado de TinyGames,
 * incluyendo los menús desplegables.
 */
class TinyGamesHeader {
    constructor() {
        this.hamburgerButton = document.querySelector('.header__hamburger');
        this.sideMenu = document.getElementById('side-menu');

        this.avatarButton = document.querySelector('.header__avatar');
        this.userMenu = document.getElementById('user-menu');

        this.init();
    }

    /**
     * Inicializa los listeners de eventos.
     */
    init() {
        if (this.hamburgerButton && this.sideMenu) {
            this.hamburgerButton.addEventListener('click', () => this.toggleMenu(this.hamburgerButton, this.sideMenu, true));
        }

        if (this.avatarButton && this.userMenu) {
            this.avatarButton.addEventListener('click', () => this.toggleMenu(this.avatarButton, this.userMenu));
        }

        // Cierra los menús si se hace clic fuera de ellos
        document.addEventListener('click', (event) => this.closeMenusOnClickOutside(event));
    }

    /**
     * Muestra u oculta un menú.
     * @param {HTMLElement} button - El botón que controla el menú.
     * @param {HTMLElement} menu - El menú a mostrar/ocultar.
     * @param {boolean} isSideMenu - Indica si es el menú lateral para aplicar una lógica diferente.
     */
    toggleMenu(button, menu, isSideMenu = false) {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);

        menu.hidden = isExpanded;
        // La animación se controla vía CSS con el atributo `aria-hidden`
        menu.setAttribute('aria-hidden', isExpanded);

        if (isSideMenu) {
            // Si se abre el menú lateral, cerramos el de usuario por si estuviera abierto
            if (!isExpanded && this.userMenu && !this.userMenu.hidden) {
                this.toggleMenu(this.avatarButton, this.userMenu);
            }
        }
    }

    /**
     * Cierra los menús si el clic ocurre fuera de ellos o de sus botones de control.
     * @param {Event} event - El objeto de evento de clic.
     */
    closeMenusOnClickOutside(event) {
        // Cierre del menú de usuario
        if (this.userMenu && !this.userMenu.hidden && !this.avatarButton.contains(event.target) && !this.userMenu.contains(event.target)) {
            this.toggleMenu(this.avatarButton, this.userMenu);
        }

        // Cierre del menú lateral
        if (this.sideMenu && !this.sideMenu.hidden && !this.hamburgerButton.contains(event.target) && !this.sideMenu.contains(event.target)) {
            this.toggleMenu(this.hamburgerButton, this.sideMenu, true);
        }
    }
}

/**
 * Gestiona la funcionalidad del carrusel.
 */
class Carousel {
    constructor(carouselSelector) {
        this.carousel = document.querySelector(carouselSelector);
        if (!this.carousel) return;

        this.track = this.carousel.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.slideCount = this.slides.length;
        this.currentIndex = 0;

        this.init();
    }

    init() {
        // Clona el primer slide al final para un bucle infinito y suave
        if (this.slideCount > 1) {
            const firstClone = this.slides[0].cloneNode(true);
            this.track.appendChild(firstClone);
        }

        setInterval(() => this.moveToNextSlide(), 5000);
    }

    moveToNextSlide() {
        this.currentIndex++;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        // Si hemos llegado al clon, reseteamos al principio sin animación
        if (this.currentIndex === this.slideCount) {
            setTimeout(() => {
                this.track.style.transition = 'none';
                this.currentIndex = 0;
                this.track.style.transform = `translateX(0)`;
            }, 500); // Debe coincidir con la duración de la transición
        }
    }
}


// Inicializar el comportamiento del encabezado cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    new TinyGamesHeader();
    new Carousel('.carousel-container');
});

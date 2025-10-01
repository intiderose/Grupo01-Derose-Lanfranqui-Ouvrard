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

// Inicializar el comportamiento del encabezado cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    new TinyGamesHeader();

    // Toggle password visibility
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('contraseña');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const eyeOpen = togglePasswordBtn.querySelectorAll('.eye-open');
            const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeOpen.forEach(el => el.style.display = 'none');
                eyeClosed.style.display = 'block';
                togglePasswordBtn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                passwordInput.type = 'password';
                eyeOpen.forEach(el => el.style.display = 'block');
                eyeClosed.style.display = 'none';
                togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    }

    // Toggle repeat password visibility
    const togglePasswordRepeatBtn = document.querySelector('.toggle-password-repeat');
    const repeatPasswordInput = document.getElementById('repetir-contraseña');

    if (togglePasswordRepeatBtn && repeatPasswordInput) {
        togglePasswordRepeatBtn.addEventListener('click', () => {
            const eyeOpen = togglePasswordRepeatBtn.querySelectorAll('.eye-open');
            const eyeClosed = togglePasswordRepeatBtn.querySelector('.eye-closed');

            if (repeatPasswordInput.type === 'password') {
                repeatPasswordInput.type = 'text';
                eyeOpen.forEach(el => el.style.display = 'none');
                eyeClosed.style.display = 'block';
                togglePasswordRepeatBtn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                repeatPasswordInput.type = 'password';
                eyeOpen.forEach(el => el.style.display = 'block');
                eyeClosed.style.display = 'none';
                togglePasswordRepeatBtn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    }

    // Form validation function
    function showError(input) {
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 400);
    }

    // Example validation listeners (you can customize these)
    const dateInput = document.getElementById('fecha-nacimiento');
    const emailInput = document.getElementById('correo');

    if (dateInput) {
        dateInput.addEventListener('blur', () => {
            if (!dateInput.value) {
                showError(dateInput);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                showError(emailInput);
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-*$#+])[A-Za-z\d-*$#+]{8,}$/;
            if (!passwordRegex.test(passwordInput.value)) {
                showError(passwordInput);
            }
        });
    }

    if (repeatPasswordInput) {
        repeatPasswordInput.addEventListener('blur', () => {
            if (!repeatPasswordInput.value || (passwordInput && repeatPasswordInput.value !== passwordInput.value)) {
                showError(repeatPasswordInput);
            }
        });
    }

    const nameInput = document.getElementById('nombre-apellido');
    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            if (!nameInput.value || nameInput.value.trim().length < 2) {
                showError(nameInput);
            }
        });
    }
});

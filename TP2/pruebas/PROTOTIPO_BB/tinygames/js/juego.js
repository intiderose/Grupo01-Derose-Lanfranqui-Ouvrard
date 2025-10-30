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

// Clase Juego
class Juego {
    constructor(canvas) {
        this.canvas = canvas;
        this.tablero = new Tablero(canvas);
        this.fichaSeleccionada = null;
        this.juegoActivo = true;
        this.tiempoInicio = Date.now();
        this.tiempoTranscurrido = 0;
        this.intervaloTimer = null;

        this.inicializarEventos();
        this.iniciarTimer();
        this.iniciarAnimacion();
        this.actualizarInterfaz();
    }

    inicializarEventos() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.juegoActivo) return;

            let rect = this.canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);

            if (ficha) {
                if (this.fichaSeleccionada && this.fichaSeleccionada !== ficha) {
                    this.fichaSeleccionada.seleccionada = false;
                }

                this.fichaSeleccionada = ficha;
                this.fichaSeleccionada.iniciarArrastre(mouseX, mouseY);
                this.tablero.calcularMovimientosValidos(ficha);
            } else {
                this.tablero.limpiarMovimientosValidos();
                this.fichaSeleccionada = null;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.juegoActivo) return;

            if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
                let rect = this.canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;

                this.fichaSeleccionada.actualizarPosicion(mouseX, mouseY);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.juegoActivo) return;

            if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
                let rect = this.canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;

                let casillaDestino = this.tablero.obtenerCasillaMasCercana(mouseX, mouseY);

                let movimientoExitoso = false;
                if (casillaDestino) {
                    movimientoExitoso = this.tablero.realizarMovimiento(this.fichaSeleccionada, casillaDestino);
                }

                if (!movimientoExitoso) {
                    this.fichaSeleccionada.volverPosicionInicial();
                    this.tablero.limpiarMovimientosValidos();
                }

                this.fichaSeleccionada.detenerArrastre();
                this.fichaSeleccionada = null;

                this.actualizarInterfaz();
                this.verificarFinDeJuego();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.juegoActivo) return;

            let rect = this.canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);
            this.canvas.style.cursor = ficha ? 'grab' : 'default';
        });
    }

    iniciarTimer() {
        this.intervaloTimer = setInterval(() => {
            if (this.juegoActivo) {
                this.tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
                this.actualizarTimer();
            }
        }, 1000);
    }

    actualizarTimer() {
        let minutos = Math.floor(this.tiempoTranscurrido / 60);
        let segundos = this.tiempoTranscurrido % 60;

        let timerElemento = document.getElementById('timer');
        if (timerElemento) {
            timerElemento.textContent =
                (minutos < 10 ? '0' : '') + minutos + ':' +
                (segundos < 10 ? '0' : '') + segundos;
        }
    }

    actualizarInterfaz() {
      let fichasCount = this.tablero.contarFichas();
            let elementoFichas = document.getElementById('fichas-count');
            if (elementoFichas) {
                elementoFichas.textContent = fichasCount;
            }
        }

        verificarFinDeJuego() {
            if (!this.tablero.hayMovimientosPosibles()) {
                this.finalizarJuego();
            }
        }

        finalizarJuego() {
            this.juegoActivo = false;
            clearInterval(this.intervaloTimer);

            let fichasRestantes = this.tablero.contarFichas();
            let gameOverDiv = document.getElementById('game-over');
            let gameOverTitle = document.getElementById('game-over-title');
            let gameOverMessage = document.getElementById('game-over-message');

            if (fichasRestantes === 1) {
                gameOverTitle.textContent = '🏆 ¡Victoria Perfecta!';
                gameOverMessage.textContent = `¡Increíble! Completaste el juego con solo 1 ficha en ${this.formatearTiempo()}`;
            } else {
                gameOverTitle.textContent = '¡Juego Terminado!';
                gameOverMessage.textContent = `Quedaron ${fichasRestantes} fichas. Tiempo: ${this.formatearTiempo()}. ¡Intenta de nuevo!`;
            }

            gameOverDiv.classList.remove('hidden');
        }

        formatearTiempo() {
            let minutos = Math.floor(this.tiempoTranscurrido / 60);
            let segundos = this.tiempoTranscurrido % 60;
            return (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
        }

        reiniciar() {
            this.tablero.reiniciar();
            this.fichaSeleccionada = null;
            this.juegoActivo = true;
            this.tiempoInicio = Date.now();
            this.tiempoTranscurrido = 0;

            clearInterval(this.intervaloTimer);
            this.iniciarTimer();

            this.actualizarInterfaz();

            let gameOverDiv = document.getElementById('game-over');
            if (gameOverDiv) {
                gameOverDiv.classList.add('hidden');
            }
        }

        iniciarAnimacion() {
            const loop = () => {
                this.tablero.dibujar();
                requestAnimationFrame(loop);
            };
            loop();
        }
    }

// Inicializar el comportamiento del encabezado cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    new TinyGamesHeader();

    // Scroll suave para botones de la página de juego
    const instructionsButton = document.getElementById('btn-instructions');
    const howToPlaySection = document.getElementById('howToPlay');
    const commentButton = document.getElementById('btn-comment');
    const commentsSection = document.getElementById('comments-section');

    if (instructionsButton && howToPlaySection) {
        instructionsButton.addEventListener('click', (event) => {
            event.preventDefault();
            howToPlaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (commentButton && commentsSection) {
        commentButton.addEventListener('click', (event) => {
            event.preventDefault();
            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

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

    // Menú de compartir en la botonera
    const btnShare = document.getElementById('btn-share');
    const shareMenu = document.getElementById('share-menu');
    if (btnShare && shareMenu) {
        btnShare.addEventListener('click', function(e) {
            e.stopPropagation();
            shareMenu.hidden = !shareMenu.hidden;
        });
        document.addEventListener('click', function(e) {
            if (!shareMenu.hidden && !shareMenu.contains(e.target) && e.target !== btnShare) {
                shareMenu.hidden = true;
            }
        });
    }

    // Form validation functions
    function showError(input) {
        input.classList.remove('valid');
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 400);
    }

    function showValid(input) {
        input.classList.remove('error');
        input.classList.add('valid');
    }

    function removeValid(input) {
        input.classList.remove('valid');
    }

    // Example validation listeners (you can customize these)
    const dateInput = document.getElementById('fecha-nacimiento');
    const emailInput = document.getElementById('correo');

    if (dateInput) {
        dateInput.addEventListener('blur', () => {
            if (!dateInput.value) {
                showError(dateInput);
            } else {
                showValid(dateInput);
            }
        });
        dateInput.addEventListener('input', () => {
            if (dateInput.value) {
                showValid(dateInput);
            } else {
                removeValid(dateInput);
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                showError(emailInput);
            } else {
                showValid(emailInput);
            }
        });
        emailInput.addEventListener('input', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInput.value)) {
                showValid(emailInput);
            } else {
                removeValid(emailInput);
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('blur', () => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-*$#+])[A-Za-z\d-*$#+]{8,}$/;
            if (!passwordRegex.test(passwordInput.value)) {
                showError(passwordInput);
            } else {
                showValid(passwordInput);
            }
        });
        passwordInput.addEventListener('input', () => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[-*$#+])[A-Za-z\d-*$#+]{8,}$/;
            if (passwordRegex.test(passwordInput.value)) {
                showValid(passwordInput);
            } else {
                removeValid(passwordInput);
            }
        });
    }

    if (repeatPasswordInput) {
        repeatPasswordInput.addEventListener('blur', () => {
            if (!repeatPasswordInput.value || (passwordInput && repeatPasswordInput.value !== passwordInput.value)) {
                showError(repeatPasswordInput);
            } else {
                showValid(repeatPasswordInput);
            }
        });
        repeatPasswordInput.addEventListener('input', () => {
            if (repeatPasswordInput.value && passwordInput && repeatPasswordInput.value === passwordInput.value) {
                showValid(repeatPasswordInput);
            } else {
                removeValid(repeatPasswordInput);
            }
        });
    }

    const nameInput = document.getElementById('nombre-apellido');
    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            if (!nameInput.value || nameInput.value.trim().length < 2) {
                showError(nameInput);
            } else {
                showValid(nameInput);
            }
        });
        nameInput.addEventListener('input', () => {
            if (nameInput.value && nameInput.value.trim().length >= 2) {
                showValid(nameInput);
            } else {
                removeValid(nameInput);
            }
        });
    }

    const nicknameInput = document.getElementById('nickname');
    if (nicknameInput) {
        nicknameInput.addEventListener('input', () => {
            if (nicknameInput.value && nicknameInput.value.length >= 6) {
                showValid(nicknameInput);
            } else {
                removeValid(nicknameInput);
            }
        });
    }
});

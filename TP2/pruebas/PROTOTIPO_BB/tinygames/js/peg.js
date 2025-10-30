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

// Inicialización del juego
let juego;
window.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('gameCanvas');

    if (canvas) {
        juego = new Juego(canvas);

        let btnReiniciar = document.getElementById('btn-reiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', () => {
                juego.reiniciar();
            });
        }

        let btnReiniciarGameOver = document.getElementById('btn-reiniciar-gameover');
        if (btnReiniciarGameOver) {
            btnReiniciarGameOver.addEventListener('click', () => {
                juego.reiniciar();
            });
        }

        console.log('Juego Peg Solitaire iniciado correctamente');
    } else {
        console.error('No se encontró el canvas del juego');
    }
});

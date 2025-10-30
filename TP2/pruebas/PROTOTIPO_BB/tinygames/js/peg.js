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

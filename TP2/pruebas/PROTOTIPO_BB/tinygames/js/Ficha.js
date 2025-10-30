// Clase Ficha - Representa una ficha individual del juego
class Ficha {
    constructor(fila, columna, x, y, radio) {
        this.fila = fila;
        this.columna = columna;
        this.x = x;
        this.y = y;
        this.xInicial = x;
        this.yInicial = y;
        this.radio = radio;
        this.seleccionada = false;
        this.arrastrando = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    dibujar(ctx) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = this.seleccionada ? 15 : 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);

        let gradiente = ctx.createRadialGradient(
            this.x - this.radio/3,
            this.y - this.radio/3,
            this.radio/10,
            this.x,
            this.y,
            this.radio
        );

        if (this.seleccionada) {
            gradiente.addColorStop(0, '#ffd700');
            gradiente.addColorStop(1, '#ff8c00');
        } else {
            gradiente.addColorStop(0, '#8b4513');
            gradiente.addColorStop(1, '#5c2e0a');
        }

        ctx.fillStyle = gradiente;
        ctx.fill();

        ctx.strokeStyle = this.seleccionada ? '#ffd700' : '#3d1f0a';
        ctx.lineWidth = this.seleccionada ? 4 : 2;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio/3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }

    contienePunto(x, y) {
        let distancia = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
        return distancia <= this.radio;
    }

    iniciarArrastre(mouseX, mouseY) {
        this.arrastrando = true;
        this.seleccionada = true;
        this.offsetX = mouseX - this.x;
        this.offsetY = mouseY - this.y;
    }

    actualizarPosicion(mouseX, mouseY) {
        if (this.arrastrando) {
            this.x = mouseX - this.offsetX;
            this.y = mouseY - this.offsetY;
        }
    }

    detenerArrastre() {
        this.arrastrando = false;
    }

    volverPosicionInicial() {
        this.x = this.xInicial;
        this.y = this.yInicial;
        this.seleccionada = false;
    }

    moverACasilla(fila, columna, x, y) {
        this.fila = fila;
        this.columna = columna;
        this.x = x;
        this.y = y;
        this.xInicial = x;
        this.yInicial = y;
        this.seleccionada = false;
    }
}


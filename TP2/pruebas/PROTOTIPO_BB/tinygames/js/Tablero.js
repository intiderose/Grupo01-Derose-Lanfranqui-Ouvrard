// Clase Tablero
class Tablero {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.filas = 7;
        this.columnas = 7;
        this.tamañoCasilla = 80;
        this.espaciado = 20;
        this.radioFicha = 30;

        this.offsetX = (canvas.width - (this.columnas * this.tamañoCasilla + (this.columnas - 1) * this.espaciado)) / 2;
        this.offsetY = (canvas.height - (this.filas * this.tamañoCasilla + (this.filas - 1) * this.espaciado)) / 2;

        this.matriz = [
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [ 1,  1,  1,  0,  1,  1,  1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1]
        ];

        this.fichas = [];
        this.movimientosValidos = [];
        this.animacionHints = 0;

        this.inicializarFichas();
    }

    inicializarFichas() {
        this.fichas = [];
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                if (this.matriz[fila][col] === 1) {
                    let pos = this.obtenerPosicionCasilla(fila, col);
                    let ficha = new Ficha(fila, col, pos.x, pos.y, this.radioFicha);
                    this.fichas.push(ficha);
                }
            }
        }
    }

    obtenerPosicionCasilla(fila, columna) {
        let x = this.offsetX + columna * (this.tamañoCasilla + this.espaciado) + this.tamañoCasilla / 2;
        let y = this.offsetY + fila * (this.tamañoCasilla + this.espaciado) + this.tamañoCasilla / 2;
        return { x: x, y: y };
    }

    obtenerCasillaMasCercana(x, y) {
        let mejorCasilla = null;
        let menorDistancia = Infinity;

        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                if (this.matriz[fila][col] !== -1) {
                    let pos = this.obtenerPosicionCasilla(fila, col);
                    let distancia = Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y));

                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        mejorCasilla = { fila: fila, columna: col, x: pos.x, y: pos.y };
                    }
                }
            }
        }

        if (menorDistancia < this.tamañoCasilla) {
            return mejorCasilla;
        }
        return null;
    }

    dibujar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#2c1810';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                if (this.matriz[fila][col] !== -1) {
                    this.dibujarCasilla(fila, col);
                }
            }
        }

        if (this.movimientosValidos.length > 0) {
            this.dibujarHints();
        }

        for (let i = 0; i < this.fichas.length; i++) {
            this.fichas[i].dibujar(this.ctx);
        }
    }

    dibujarCasilla(fila, columna) {
        let pos = this.obtenerPosicionCasilla(fila, columna);

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        this.ctx.fillStyle = '#d2b48c';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.radioFicha + 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#8b7355';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    dibujarHints() {
        this.animacionHints += 0.1;
        let escala = 1 + Math.sin(this.animacionHints) * 0.2;

        for (let i = 0; i < this.movimientosValidos.length; i++) {
            let mov = this.movimientosValidos[i];
            let pos = this.obtenerPosicionCasilla(mov.filaDestino, mov.colDestino);

            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.scale(escala, escala);

            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, -20);
            this.ctx.lineTo(-10, -10);
            this.ctx.lineTo(-5, -10);
            this.ctx.lineTo(-5, 0);
            this.ctx.lineTo(5, 0);
            this.ctx.lineTo(5, -10);
            this.ctx.lineTo(10, -10);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = '#ff8c00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.restore();

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.radioFicha * escala, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    obtenerFichaEnPosicion(x, y) {
        for (let i = this.fichas.length - 1; i >= 0; i--) {
            if (this.fichas[i].contienePunto(x, y)) {
                return this.fichas[i];
            }
        }
        return null;
    }

    calcularMovimientosValidos(ficha) {
        this.movimientosValidos = [];
        let fila = ficha.fila;
        let col = ficha.columna;

        let direcciones = [
            { df: -1, dc: 0 },
            { df: 1, dc: 0 },
            { df: 0, dc: -1 },
            { df: 0, dc: 1 }
        ];

        for (let i = 0; i < direcciones.length; i++) {
            let dir = direcciones[i];
            let filaAdyacente = fila + dir.df;
            let colAdyacente = col + dir.dc;
            let filaDestino = fila + dir.df * 2;
            let colDestino = col + dir.dc * 2;

            if (this.esMovimientoValido(fila, col, filaAdyacente, colAdyacente, filaDestino, colDestino)) {
                this.movimientosValidos.push({
                    filaAdyacente: filaAdyacente,
                    colAdyacente: colAdyacente,
                    filaDestino: filaDestino,
                    colDestino: colDestino
                });
            }
        }
    }

    esMovimientoValido(filaOrigen, colOrigen, filaAdyacente, colAdyacente, filaDestino, colDestino) {
        if (filaDestino < 0 || filaDestino >= this.filas || colDestino < 0 || colDestino >= this.columnas) {
            return false;
        }

        if (this.matriz[filaDestino][colDestino] === -1) {
            return false;
        }

        if (this.matriz[filaAdyacente][colAdyacente] !== 1) {
            return false;
        }

        if (this.matriz[filaDestino][colDestino] !== 0) {
            return false;
        }

        return true;
    }

    limpiarMovimientosValidos() {
        this.movimientosValidos = [];
        for (let i = 0; i < this.fichas.length; i++) {
            this.fichas[i].seleccionada = false;
        }
    }

    realizarMovimiento(ficha, casillaDestino) {
        for (let i = 0; i < this.movimientosValidos.length; i++) {
            let mov = this.movimientosValidos[i];
            if (mov.filaDestino === casillaDestino.fila && mov.colDestino === casillaDestino.columna) {
                this.eliminarFicha(mov.filaAdyacente, mov.colAdyacente);

                this.matriz[ficha.fila][ficha.columna] = 0;
                this.matriz[casillaDestino.fila][casillaDestino.columna] = 1;

                ficha.moverACasilla(casillaDestino.fila, casillaDestino.columna, casillaDestino.x, casillaDestino.y);

                this.limpiarMovimientosValidos();
                return true;
            }
        }
        return false;
    }

    eliminarFicha(fila, columna) {
        for (let i = 0; i < this.fichas.length; i++) {
            if (this.fichas[i].fila === fila && this.fichas[i].columna === columna) {
                this.fichas.splice(i, 1);
                this.matriz[fila][columna] = 0;
                break;
            }
        }
    }

    contarFichas() {
        return this.fichas.length;
    }

    hayMovimientosPosibles() {
        for (let i = 0; i < this.fichas.length; i++) {
            let ficha = this.fichas[i];
            let fila = ficha.fila;
            let col = ficha.columna;

            let direcciones = [
                { df: -1, dc: 0 },
                { df: 1, dc: 0 },
                { df: 0, dc: -1 },
                { df: 0, dc: 1 }
            ];

            for (let j = 0; j < direcciones.length; j++) {
                let dir = direcciones[j];
                let filaAdyacente = fila + dir.df;
                let colAdyacente = col + dir.dc;
                let filaDestino = fila + dir.df * 2;
                let colDestino = col + dir.dc * 2;

                if (this.esMovimientoValido(fila, col, filaAdyacente, colAdyacente, filaDestino, colDestino)) {
                    return true;
                }
            }
        }
        return false;
    }

    reiniciar() {
        this.matriz = [
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [ 1,  1,  1,  0,  1,  1,  1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1]
        ];
        this.inicializarFichas();
        this.limpiarMovimientosValidos();
    }
}


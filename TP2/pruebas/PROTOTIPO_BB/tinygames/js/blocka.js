const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');

let pieceSizeW = 0;
let pieceSizeH = 0;
let originalOrder = [];
let pieces = [];
let grid = 4;
let img = new Image();
let imageLoaded = false;
const FALLBACK_DATAURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

// Nuevo: recorte cuadrado en coordenadas de la imagen original
let srcCrop = { x: 0, y: 0, size: 0 };


// Controles
const piecesCount = document.getElementById('piecesCount');
const statusEl = document.getElementById('status');
const warnEl = document.getElementById('warn');
const timerBarContainer = document.getElementById('timer-bar-container'); /* timer de los ultimos juegos*/
const timerBar = document.getElementById('timer-bar');


canvas.addEventListener('contextmenu', (e)=>e.preventDefault());

// Nota: evitar establecer crossOrigin de forma incondicional cuando la página se abre
// desde el protocolo file:// (puede causar que la imagen no cargue en algunos navegadores).
// Solo usar crossOrigin si la página está servida por http/https.
function shouldUseCORS() {
    try {
        return location && (location.protocol === 'http:' || location.protocol === 'https:');
    } catch (e) {
        return false;
    }
}

img.onload = () => {
    imageLoaded = true;
    statusEl.textContent = 'Estado: imagen cargada';
    fitCanvasToImage();
    createPieces();
    // Mezclar rotaciones al cargar la imagen
    for(let i=0;i<pieces.length;i++){
        pieces[i].rotation = [0,90,180,270][Math.floor(Math.random()*4)];
    }
    draw();
};
img.onerror = (e)=>{
    console.warn('No se pudo cargar imagen, usando fallback', e);
    imageLoaded = false;
    img.src = FALLBACK_DATAURL;
    statusEl.textContent = 'Estado: imagen no disponible, fallback activo';
};

function fitCanvasToImage(){
    const maxW = 720, maxH = 480;
    let w = img.naturalWidth || img.width || maxW;
    let h = img.naturalHeight || img.height || maxH;

    // Escalar la imagen si es más grande que el máximo
    const scale = Math.min(maxW / w, maxH / h, 1);
    const scaledW = Math.round(w * scale);
    const scaledH = Math.round(h * scale);

    // Hacer el canvas cuadrado: tamaño = el menor lado escalado
    const size = Math.min(scaledW, scaledH);
    canvas.width = size;
    canvas.height = size;

    // Calcular recorte cuadrado centrado en la imagen original (coordenadas en la imagen original)
    if ((img.naturalWidth || img.width) >= (img.naturalHeight || img.height)) {
        srcCrop.size = img.naturalHeight || img.height;
        srcCrop.x = Math.floor(((img.naturalWidth || img.width) - srcCrop.size) / 2);
        srcCrop.y = 0;
    } else {
        srcCrop.size = img.naturalWidth || img.width;
        srcCrop.x = 0;
        srcCrop.y = Math.floor(((img.naturalHeight || img.height) - srcCrop.size) / 2);
    }
}

function createPieces(){
    grid = parseInt(piecesCount.value, 10) || 4;

    // Usar tamaño cuadrado de pieza para que sean "cuadrados perfectos"
    const pieceSize = canvas.width / grid;
    pieceSizeW = pieceSize;
    pieceSizeH = pieceSize;

    pieces = [];
    for(let y=0;y<grid;y++){
        for(let x=0;x<grid;x++){
            pieces.push({
                sx: x*pieceSizeW,
                sy: y*pieceSizeH,
                x: x*pieceSizeW,
                y: y*pieceSizeH,
                correctIndex: y*grid + x,
                rotation: 0 // rotación individual en grados (0, 90, 180, 270)
            });
        }
    }
    originalOrder = pieces.map((p,i)=>i);
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Fondo general
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(!imageLoaded){
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px sans-serif';
        ctx.fillText('Cargando imagen...', 10, 30);
        return;
    }

    // Helper: tamaño en la imagen fuente por pieza (en coordenadas originales)
    const imgPieceSize = srcCrop.size / grid;
    const pieceSize = pieceSizeW; // square

    // --- PRIMER NIVEL: filtro gris por pieza ---
    if(currentLevel === 1){
        // Crear un canvas temporal para obtener la pieza escalada y luego procesarla píxel a píxel
        for(let i=0;i<pieces.length;i++){
            const p = pieces[i];

            // Coordenadas fuente en la imagen original (recortada a cuadrado)
            const srcX = Math.floor(srcCrop.x + (p.correctIndex % grid) * imgPieceSize);
            const srcY = Math.floor(srcCrop.y + Math.floor(p.correctIndex / grid) * imgPieceSize);

            // Canvas temporal por pieza (tamaño en destino = pieceSize x pieceSize)
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceSize;
            pieceCanvas.height = pieceSize;
            const pieceCtx = pieceCanvas.getContext('2d');

            // Dibujar la porción de la imagen original recortada y escalada a tamaño cuadrado de la pieza
            pieceCtx.drawImage(
                img,
                srcX, srcY, imgPieceSize, imgPieceSize,
                0, 0, pieceSize, pieceSize
            );

            // Obtener los datos y convertir a escala de grises píxel a píxel
            const pieceImageData = pieceCtx.getImageData(0, 0, pieceSize, pieceSize);
            for (let j = 0; j < pieceImageData.data.length; j += 4) {
                const r = pieceImageData.data[j];
                const g = pieceImageData.data[j + 1];
                const b = pieceImageData.data[j + 2];
                const a = pieceImageData.data[j + 3];
                const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                pieceImageData.data[j] = gray;
                pieceImageData.data[j + 1] = gray;
                pieceImageData.data[j + 2] = gray;
                pieceImageData.data[j + 3] = a;
            }
            pieceCtx.putImageData(pieceImageData, 0, 0);

            // Dibuja la pieza rotada en el canvas principal
            ctx.save();
            ctx.translate(p.x + pieceSize/2, p.y + pieceSize/2);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.drawImage(pieceCanvas, -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-pieceSize/2+1, -pieceSize/2+1, pieceSize-2, pieceSize-2);
            ctx.restore();
        }
        return;
    }

    // --- SEGUNDO NIVEL: filtro brillo +30% por pieza ---
    if(currentLevel === 2){
        for(let i=0;i<pieces.length;i++){
            const p = pieces[i];
            const srcX = Math.floor(srcCrop.x + (p.correctIndex % grid) * imgPieceSize);
            const srcY = Math.floor(srcCrop.y + Math.floor(p.correctIndex / grid) * imgPieceSize);

            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceSize;
            pieceCanvas.height = pieceSize;
            const pieceCtx = pieceCanvas.getContext('2d');

            pieceCtx.drawImage(
                img,
                srcX, srcY, imgPieceSize, imgPieceSize,
                0, 0, pieceSize, pieceSize
            );

            const pieceImageData = pieceCtx.getImageData(0, 0, pieceSize, pieceSize);
            for (let j = 0; j < pieceImageData.data.length; j += 4) {
                pieceImageData.data[j]     = Math.min(255, Math.round(pieceImageData.data[j] * 1.3));     // R
                pieceImageData.data[j + 1] = Math.min(255, Math.round(pieceImageData.data[j + 1] * 1.3)); // G
                pieceImageData.data[j + 2] = Math.min(255, Math.round(pieceImageData.data[j + 2] * 1.3)); // B
            }
            pieceCtx.putImageData(pieceImageData, 0, 0);

            ctx.save();
            ctx.translate(p.x + pieceSize/2, p.y + pieceSize/2);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.drawImage(pieceCanvas, -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
            ctx.strokeStyle = 'rgba(255,255,255,0,5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-pieceSize/2+1, -pieceSize/2+1, pieceSize-2, pieceSize-2);
            ctx.restore();
        }
        return;
    }

    // --- TERCER NIVEL: filtro negativo por pieza ---
    if(currentLevel === 3){
        for(let i=0;i<pieces.length;i++){
            const p = pieces[i];
            const srcX = Math.floor(srcCrop.x + (p.correctIndex % grid) * imgPieceSize);
            const srcY = Math.floor(srcCrop.y + Math.floor(p.correctIndex / grid) * imgPieceSize);

            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceSize;
            pieceCanvas.height = pieceSize;
            const pieceCtx = pieceCanvas.getContext('2d');

            pieceCtx.drawImage(
                img,
                srcX, srcY, imgPieceSize, imgPieceSize,
                0, 0, pieceSize, pieceSize
            );

            const pieceImageData = pieceCtx.getImageData(0, 0, pieceSize, pieceSize);
            for (let j = 0; j < pieceImageData.data.length; j += 4) {
                pieceImageData.data[j]     = 255 - pieceImageData.data[j];     // R
                pieceImageData.data[j + 1] = 255 - pieceImageData.data[j + 1]; // G
                pieceImageData.data[j + 2] = 255 - pieceImageData.data[j + 2]; // B
            }
            pieceCtx.putImageData(pieceImageData, 0, 0);

            ctx.save();
            ctx.translate(p.x + pieceSize/2, p.y + pieceSize/2);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.drawImage(pieceCanvas, -pieceSize/2, -pieceSize/2, pieceSize, pieceSize);
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-pieceSize/2+1, -pieceSize/2+1, pieceSize-2, pieceSize-2);
            ctx.restore();
        }
        return;
    }

    // --- RESTO DE NIVELES: imagen normal por piezas ---
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        ctx.save();
        ctx.translate(p.x + pieceSize/2, p.y + pieceSize/2);
        ctx.rotate((p.rotation * Math.PI) / 180);

        ctx.fillStyle = '#111827';
        ctx.fillRect(-pieceSize/2, -pieceSize/2, pieceSize, pieceSize);

        // Usar recorte cuadrado de la imagen original para cada pieza
        const srcX = srcCrop.x + (p.correctIndex % grid) * imgPieceSize;
        const srcY = srcCrop.y + Math.floor(p.correctIndex / grid) * imgPieceSize;

        ctx.drawImage(
            img,
            srcX, srcY, imgPieceSize, imgPieceSize,
            -pieceSize/2, -pieceSize/2, pieceSize, pieceSize
        );
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-pieceSize/2+1, -pieceSize/2+1, pieceSize-2, pieceSize-2);
        ctx.restore();
    }
}

function checkSolved(){
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        const expectedX = (p.correctIndex % grid) * pieceSizeW;
        const expectedY = Math.floor(p.correctIndex / grid) * pieceSizeH;
        if(Math.abs(p.x - expectedX) > 2 || Math.abs(p.y - expectedY) > 2) return false;
        if(p.rotation !== 0) return false;
    }
    return true;
}

let timerInterval = null;
let timerTimeout = null;
let timerActive = false;
let timerDuration = 0;
let timerStart = 0;

function startTimer(duration) {
    timerDuration = duration;
    timerStart = Date.now();
    timerActive = true;
    timerBarContainer.style.display = 'block';
    timerBarContainer.classList.remove('timeout');
    timerBar.style.width = '100%';
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);

    timerInterval = setInterval(()=>{
        const elapsed = (Date.now() - timerStart) / 1000;
        let percent = Math.max(0, 1 - elapsed / timerDuration);
        timerBar.style.width = (percent*100) + '%';
        if(percent <= 0){
            clearInterval(timerInterval);
            timerBar.style.width = '0%';
            timerBarContainer.classList.add('timeout');
            timerActive = false;
            setTimeout(()=>{
                timerBarContainer.style.display = 'none';
                timerBarContainer.classList.remove('timeout');
            }, 800);
            statusEl.textContent = '¡Tiempo agotado! Pasando al siguiente nivel...';
            setTimeout(()=>{
                loadImage(getNextImage());
            }, 1200);
        }
    }, 100);
}

function stopTimer() {
    timerActive = false;
    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
    timerBarContainer.style.display = 'none';
    timerBar.style.width = '100%';
    timerBarContainer.classList.remove('timeout');
}

// Evento click izquierdo: rotar 90° a la izquierda la pieza clickeada
canvas.addEventListener('click', (ev)=>{
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        if(mx >= p.x && mx < p.x + pieceSizeW && my >= p.y && my < p.y + pieceSizeH){
            p.rotation = (p.rotation + 270) % 360;
            draw();
            if(checkSolved()){
                setTimeout(()=>{
                    stopTimer();
                    if (usedImages.length < MAX_LEVELS) {
                        statusEl.textContent = '¡Felicidades! Puzzle resuelto. Pasando al siguiente nivel...';
                        setTimeout(()=>{
                            loadImage(getNextImage());
                        }, 1200);
                    } else {
                        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
                    }
                }, 100);
            }
            break;
        }
    }
});

// Evento click derecho: rotar 90° a la derecha la pieza clickeada
canvas.addEventListener('contextmenu', (ev)=>{
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        if(mx >= p.x && mx < p.x + pieceSizeW && my >= p.y && my < p.y + pieceSizeH){
            p.rotation = (p.rotation + 90) % 360;
            draw();
            if(checkSolved()){
                setTimeout(()=>{
                    stopTimer();
                    if (usedImages.length < MAX_LEVELS) {
                        statusEl.textContent = '¡Felicidades! Puzzle resuelto. Pasando al siguiente nivel...';
                        setTimeout(()=>{
                            loadImage(getNextImage());
                        }, 1200);
                    } else {
                        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
                    }
                }, 100);
            }
            break;
        }
    }
});

// Eventos controles
piecesCount.addEventListener('change', ()=>{
    createPieces();
    for(let i=0;i<pieces.length;i++){
        pieces[i].rotation = [0,90,180,270][Math.floor(Math.random()*4)];
    }
    draw();
});

// Lista de imágenes disponibles
const imageList = [
    "assets/ac-fondo.jpg",
    "assets/ff-fondo.jpg",
    "assets/hk-fondo.jpg",
    "assets/loz-fondo.jpg",
    "assets/minecraft-fondo.jpg",
    "assets/sekiro-fondo.jpg"
];

// Nuevo: límite máximo de niveles con filtro
const MAX_LEVELS = 3;

let currentLevel = 0;
let usedImages = [];

function getNextImage() {
    // Limitar a MAX_LEVELS niveles (selección aleatoria sin repetir hasta MAX_LEVELS)
    if (usedImages.length >= MAX_LEVELS) {
        return null;
    }
    let available = imageList.filter(img => !usedImages.includes(img));
    const next = available[Math.floor(Math.random() * available.length)];
    usedImages.push(next);
    currentLevel = usedImages.length;
    return next;
}

function loadImage(url){
    if (!url) {
        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
        stopTimer();
        return;
    }
    imageLoaded = false;
    statusEl.textContent = 'Nivel ' + currentLevel + ' de ' + MAX_LEVELS + ': cargando imagen...';
    stopTimer();
    try{
        img = new Image();
        if(shouldUseCORS()) img.crossOrigin = 'Anonymous';
        img.onload = () => {
            imageLoaded = true;
            statusEl.textContent = 'Nivel ' + currentLevel + ' de ' + MAX_LEVELS + ': imagen cargada';
            fitCanvasToImage();
            createPieces();
            for(let i=0;i<pieces.length;i++){
                pieces[i].rotation = [0,90,180,270][Math.floor(Math.random()*4)];
            }
            draw();

            // Temporizador para los dos últimos niveles (relativo a MAX_LEVELS)
            if (currentLevel === MAX_LEVELS - 1) {
                startTimer(40);
            } else if (currentLevel === MAX_LEVELS) {
                startTimer(20);
            }
        };
        img.onerror = (e)=>{
            console.warn('Error al cargar imagen', e);
            statusEl.textContent = 'No se pudo cargar la imagen. Usando fallback.';
            img.src = FALLBACK_DATAURL;
        };
        img.src = url;
    } catch(e){
        console.warn('loadImage fallo', e);
        img.src = FALLBACK_DATAURL;
    }
}

// --- Cambios ---
// Antes: al iniciar se cargaba automáticamente una imagen.
// Ahora: no cargamos al cargar la página; esperamos a que el usuario haga click en "Jugar".
// Inicializar arrays/contadores pero no lanzar loadImage automáticamente.
usedImages = [];
currentLevel = 0;

// Conectar el botón "Jugar" (está en el HTML encima del canvas)
const playButton = document.getElementById('playButton');

function startGame(){
    // Reiniciar estado de niveles y lista de usados
    usedImages = [];
    currentLevel = 0;
    // Ocultar el botón y comenzar el primer nivel
    if (playButton) playButton.classList.add('hidden');
    loadImage(getNextImage());
}

// Si el botón existe, conectar el evento click para iniciar el juego.
// Si no existe (por cambios futuros), no hace nada y la carga manual puede hacerse con loadImage().
if (playButton) {
    playButton.addEventListener('click', startGame);
}

function setPixel(imageData, x, y, r, g, b, a) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}

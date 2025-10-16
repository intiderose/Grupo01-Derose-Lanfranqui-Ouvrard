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


// Controles
const piecesCount = document.getElementById('piecesCount');
const shuffleBtn = document.getElementById('shuffleBtn');
const solveBtn = document.getElementById('solveBtn');
const exportBtn = document.getElementById('exportBtn');
const presetButtons = document.querySelectorAll('[data-preset]');
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
    const ratio = Math.min(maxW / w, maxH / h, 1);
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
}

function createPieces(){
    grid = parseInt(piecesCount.value, 10) || 4;
    // Dividir toda la imagen en grid x grid (puede no ser cuadrado perfecto)
    pieceSizeW = canvas.width / grid;
    pieceSizeH = canvas.height / grid;
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
    if(!imageLoaded){
        ctx.fillStyle = '#111827';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px sans-serif';
        ctx.fillText('Cargando imagen...', 10, 30);
        return;
    }

    // Dibujar fondo general
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar cada pieza según la cuadrícula completa
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        ctx.save();
        ctx.translate(p.x + pieceSizeW/2, p.y + pieceSizeH/2);
        ctx.rotate((p.rotation * Math.PI) / 180);

        // Rellenar fondo del cuadrado antes de dibujar la imagen
        ctx.fillStyle = '#111827';
        ctx.fillRect(-pieceSizeW/2, -pieceSizeH/2, pieceSizeW, pieceSizeH);

        // Calcular la porción de la imagen original que corresponde a la pieza
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const imgPieceW = imgW / grid;
        const imgPieceH = imgH / grid;

        ctx.drawImage(
            img,
            (p.correctIndex % grid) * imgPieceW,
            Math.floor(p.correctIndex / grid) * imgPieceH,
            imgPieceW, imgPieceH,
            -pieceSizeW/2, -pieceSizeH/2, pieceSizeW, pieceSizeH
        );
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-pieceSizeW/2+1, -pieceSizeH/2+1, pieceSizeW-2, pieceSizeH-2);
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
                    if (usedImages.length < imageList.length) {
                        statusEl.textContent = '¡Felicidades! Puzzle resuelto. Pasando al siguiente nivel...';
                        setTimeout(()=>{
                            loadImage(getNextImage());
                        }, 1200);
                    } else {
                        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
                        shuffleBtn.disabled = true;
                        solveBtn.disabled = true;
                        exportBtn.disabled = true;
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
                    if (usedImages.length < imageList.length) {
                        statusEl.textContent = '¡Felicidades! Puzzle resuelto. Pasando al siguiente nivel...';
                        setTimeout(()=>{
                            loadImage(getNextImage());
                        }, 1200);
                    } else {
                        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
                        shuffleBtn.disabled = true;
                        solveBtn.disabled = true;
                        exportBtn.disabled = true;
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
shuffleBtn.addEventListener('click', ()=>{
    grid = parseInt(piecesCount.value, 10) || 4;
    pieceSizeW = canvas.width / grid;
    pieceSizeH = canvas.height / grid;
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        p.x = (p.correctIndex % grid)*pieceSizeW;
        p.y = Math.floor(p.correctIndex / grid) * pieceSizeH;
        p.rotation = [0,90,180,270][Math.floor(Math.random()*4)];
    }
    draw();
});

solveBtn.addEventListener('click', ()=>{
    grid = parseInt(piecesCount.value, 10) || 4;
    pieceSizeW = canvas.width / grid;
    pieceSizeH = canvas.height / grid;
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        p.x = (p.correctIndex % grid)*pieceSizeW;
        p.y = Math.floor(p.correctIndex / grid) * pieceSizeH;
        p.rotation = 0;
    }
    draw();
    statusEl.textContent = 'Nivel ' + (currentLevel+1) + ': ordenado';
});

exportBtn.addEventListener('click', ()=>{
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'rompecabezas.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
});

presetButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
        draw();
    });
});

// Lista de imágenes disponibles
const imageList = [
    "assets/MotoX3M.jpg",
    "assets/pamplona.jpg",
    "assets/solitaire-peg.png"
];
let currentLevel = 0;
let usedImages = [];

function getNextImage() {
    // Si ya jugó todas las imágenes, no hay más niveles
    if (usedImages.length >= imageList.length) {
        return null;
    }
    // Selecciona una imagen que no se haya jugado aún
    let available = imageList.filter(img => !usedImages.includes(img));
    const next = available[Math.floor(Math.random() * available.length)];
    usedImages.push(next);
    currentLevel = usedImages.length;
    return next;
}

function loadImage(url){
    if (!url) {
        statusEl.textContent = '¡Felicidades! Has completado todos los niveles.';
        shuffleBtn.disabled = true;
        solveBtn.disabled = true;
        exportBtn.disabled = true;
        stopTimer();
        return;
    }
    imageLoaded = false;
    statusEl.textContent = 'Nivel ' + currentLevel + ' de ' + imageList.length + ': cargando imagen...';
    stopTimer();
    try{
        img = new Image();
        if(shouldUseCORS()) img.crossOrigin = 'Anonymous';
        img.onload = () => {
            imageLoaded = true;
            statusEl.textContent = 'Nivel ' + currentLevel + ' de ' + imageList.length + ': imagen cargada';
            fitCanvasToImage();
            createPieces();
            for(let i=0;i<pieces.length;i++){
                pieces[i].rotation = [0,90,180,270][Math.floor(Math.random()*4)];
            }
            draw();

            // Temporizador para los dos últimos niveles
            if (currentLevel === imageList.length - 1) {
                startTimer(40);
            } else if (currentLevel === imageList.length) {
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

// Al iniciar, cargar una imagen aleatoria y preparar niveles
usedImages = [];
currentLevel = 0;
loadImage(getNextImage());

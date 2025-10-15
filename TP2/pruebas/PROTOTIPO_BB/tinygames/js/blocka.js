const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');

let pieceSize = 0;
let originalOrder = [];
let pieces = [];
let grid = 4;
let img = new Image();
let imageLoaded = false;
const FALLBACK_DATAURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';


// Controles
const imageSelect = document.getElementById('imageSelect');
const piecesCount = document.getElementById('piecesCount');
const shuffleBtn = document.getElementById('shuffleBtn');
const solveBtn = document.getElementById('solveBtn');
const exportBtn = document.getElementById('exportBtn');
const presetButtons = document.querySelectorAll('[data-preset]');
const statusEl = document.getElementById('status');
const warnEl = document.getElementById('warn');


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
    // cuadrado perfecto: usar el menor entre ancho y alto
    pieceSize = Math.floor(Math.min(canvas.width, canvas.height) / grid);
    // centrar el área de piezas en el canvas
    const offsetX = Math.floor((canvas.width - pieceSize * grid) / 2);
    const offsetY = Math.floor((canvas.height - pieceSize * grid) / 2);
    pieces = [];
    for(let y=0;y<grid;y++){
        for(let x=0;x<grid;x++){
            pieces.push({
                sx: x*pieceSize, // posición en canvas
                sy: y*pieceSize,
                x: offsetX + x*pieceSize, // posición en canvas
                y: offsetY + y*pieceSize,
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

    // Dibujar fondo
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);

    // Dibujar cada pieza como cuadrado perfecto, con su rotación individual
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        ctx.save();
        // Mover al centro del cuadrado
        ctx.translate(p.x + pieceSize/2, p.y + pieceSize/2);
        // Rotar según la rotación de la pieza
        ctx.rotate((p.rotation * Math.PI) / 180);
        // Dibujar la porción de la imagen correspondiente
        // Calcular la porción de la imagen original que corresponde al cuadrado perfecto
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const imgPieceSize = Math.floor(Math.min(imgW, imgH) / grid);
        const imgOffsetX = Math.floor((imgW - imgPieceSize * grid) / 2);
        const imgOffsetY = Math.floor((imgH - imgPieceSize * grid) / 2);

        ctx.drawImage(
            img,
            imgOffsetX + (p.correctIndex % grid) * imgPieceSize,
            imgOffsetY + Math.floor(p.correctIndex / grid) * imgPieceSize,
            imgPieceSize, imgPieceSize,
            -pieceSize/2, -pieceSize/2, pieceSize, pieceSize
        );
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-pieceSize/2+1, -pieceSize/2+1, pieceSize-2, pieceSize-2);
        ctx.restore();
    }
}

function checkSolved(){
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        const expectedX = (p.correctIndex % grid) * pieceSize;
        const expectedY = Math.floor(p.correctIndex / grid) * pieceSize;
        if(Math.abs(p.x - expectedX) > 2 || Math.abs(p.y - expectedY) > 2) return false;
    }
    return true;
}

// Eliminar todos los eventos de arrastre y touch

// Evento click izquierdo: rotar 90° a la izquierda la pieza clickeada
canvas.addEventListener('click', (ev)=>{
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        if(mx >= p.x && mx < p.x + pieceSize && my >= p.y && my < p.y + pieceSize){
            p.rotation = (p.rotation + 270) % 360;
            draw();
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
        if(mx >= p.x && mx < p.x + pieceSize && my >= p.y && my < p.y + pieceSize){
            p.rotation = (p.rotation + 90) % 360;
            draw();
            break;
        }
    }
});

// Eventos controles
imageSelect.addEventListener('change', ()=>loadImage(imageSelect.value));
piecesCount.addEventListener('change', ()=>{ createPieces(); draw(); });
shuffleBtn.addEventListener('click', ()=>{
    // Mantener posiciones originales y rotar cada pieza aleatoriamente
    grid = parseInt(piecesCount.value, 10) || 4;
    pieceSize = Math.floor(Math.min(canvas.width, canvas.height) / grid);
    const offsetX = Math.floor((canvas.width - pieceSize * grid) / 2);
    const offsetY = Math.floor((canvas.height - pieceSize * grid) / 2);
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        p.x = offsetX + (p.correctIndex % grid)*pieceSize;
        p.y = offsetY + Math.floor(p.correctIndex / grid) * pieceSize;
        // Rotación aleatoria: 0, 90, 180, 270
        p.rotation = [0,90,180,270][Math.floor(Math.random()*4)];
    }
    draw();
});

solveBtn.addEventListener('click', ()=>{
    // Restaurar posiciones y rotaciones
    grid = parseInt(piecesCount.value, 10) || 4;
    pieceSize = Math.floor(Math.min(canvas.width, canvas.height) / grid);
    const offsetX = Math.floor((canvas.width - pieceSize * grid) / 2);
    const offsetY = Math.floor((canvas.height - pieceSize * grid) / 2);
    for(let i=0;i<pieces.length;i++){
        const p = pieces[i];
        p.x = offsetX + (p.correctIndex % grid)*pieceSize;
        p.y = offsetY + Math.floor(p.correctIndex / grid) * pieceSize;
        p.rotation = 0;
    }
    draw();
    statusEl.textContent = 'Estado: ordenado';
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

function loadImage(url){
    imageLoaded = false;
    statusEl.textContent = 'Estado: cargando imagen...';
    try{
        img = new Image();
        if(shouldUseCORS()) img.crossOrigin = 'Anonymous';
        img.onload = () => {
            imageLoaded = true;
            statusEl.textContent = 'Estado: imagen cargada';
            fitCanvasToImage();
            createPieces();
            draw();
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

// Cargar imagen inicial (usar valor por defecto select)
loadImage(imageSelect.value);
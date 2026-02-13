const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frameCountEl = document.getElementById('frameCount');
const ghostBtn = document.getElementById('ghostBtn');
const eraserBtn = document.getElementById('eraserBtn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let ghostMode = false;
let isEraser = false;
let frames = []; 
let isPlaying = false;

function toggleGhost() {
  ghostMode = !ghostMode;
  ghostBtn.innerText = ghostMode ? "GHOST: ON" : "GHOST: OFF";
  ghostBtn.style.background = ghostMode ? "#ffeb3b" : "#eee";
}

function toggleEraser() {
  isEraser = !isEraser;
  eraserBtn.innerText = isEraser ? "🧽 ERASER: ON" : "🧽 ERASER: OFF";
  eraserBtn.style.background = isEraser ? "#333" : "#f0f0f0";
  eraserBtn.style.color = isEraser ? "#fff" : "#333";
}

function undo() {
  if (frames.length > 0) {
    frames.pop();
    frameCountEl.innerText = frames.length;
    renderCurrentState();
  }
}

function renderCurrentState() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frames.length > 0) {
    const img = new Image();
    img.src = frames[frames.length - 1];
    img.onload = () => {
      if (ghostMode && !isPlaying) ctx.globalAlpha = 0.2;
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = 1.0;
    };
  }
}

function clearAll() {
  if(confirm("Delete everything?")) {
    frames = [];
    frameCountEl.innerText = "0";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startDrawing(e) {
  if (isPlaying) return;
  drawing = true;
  ctx.beginPath();
  ctx.lineWidth = document.getElementById('sizeSlider').value;
  
  // Eraser Logic: Destination-out "cuts" through the drawing
  ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
  ctx.strokeStyle = document.getElementById('colorPicker').value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(e.clientX, e.clientY);
}

function draw(e) {
  if (!drawing || isPlaying) return;
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
}

function stopDrawing() {
  if (!drawing) return;
  drawing = false;
  
  const frameData = canvas.toDataURL();
  frames.push(frameData);
  frameCountEl.innerText = frames.length;

  if (ghostMode) {
    ctx.globalCompositeOperation = 'source-over'; // Reset for ghosting
    renderCurrentState();
  }
}

function playAnimation() {
  if (frames.length === 0) return;
  isPlaying = true;
  let currentFrame = 0;
  const speed = document.getElementById('speedSlider').value;

  const playStep = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = frames[currentFrame];
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      currentFrame++;
      if (currentFrame < frames.length && isPlaying) {
        setTimeout(playStep, speed);
      } else {
        isPlaying = false;
        renderCurrentState();
      }
    };
  };
  playStep();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

window.addEventListener('resize', () => {
  const currentImg = canvas.toDataURL();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const img = new Image();
  img.src = currentImg;
  img.onload = () => ctx.drawImage(img, 0, 0);
});


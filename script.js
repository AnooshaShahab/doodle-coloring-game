const pictures = [
  { name: 'Burger', src: './assets/burger.jfif' },
  { name: 'Cake', src: './assets/cake.jfif' },
  { name: 'Flower', src: './assets/flower.jfif' },
  { name: 'Juice', src: './assets/juice.jfif' },
  { name: 'Noodles', src: './assets/noodles.jfif' },
  { name: 'Chocolate', src: './assets/chocolate.jfif' },
  { name: 'Bears', src: './assets/bears.jfif' }, 
  { name: 'Cow', src: './assets/cow.jfif' },
  { name: 'Duck', src: './assets/duck.jfif' },
  { name: 'Fruit', src: './assets/fruit.jfif' }, 
  { name: 'Giraffe', src: './assets/giraffe.jfif' },
  { name: 'Hei Hei', src: './assets/heihei.jfif' },
  { name: 'Labubu', src: './assets/labubu.jfif' }, 
  { name: 'Penguin', src: './assets/penguin.jfif' }, { name: 'Whale', src: './assets/whale.jfif' }, { name: 'Octopus', src: './assets/octopus.jfif' }, { name: 'Monkey', src: './assets/monkey.jfif' }, { name: 'Rocket', src: './assets/rocket.jfif' }, { name: 'Tiger', src: './assets/tiger.jfif' }, { name: 'Ice Cream', src: './assets/ice cream.jfif' }, { name: 'Dinosaur', src: './assets/dinosaur.jfif' }, { name: 'Dog', src: './assets/dog.jfif' }, { name: 'Butterfly', src: './assets/butterfly.jfif' }, { name: 'Calf', src: './assets/calf.jfif' }, { name: 'Bear', src: './assets/bear.jfif' }, { name: 'Cat', src: './assets/cat.jfif' }, { name: 'Capybara', src: './assets/capybara.jfif' },
 { name: 'Tulip', src: './assets/tulip.jfif' },
{ name: 'Strawberry', src: './assets/Strawberry.jfif' }
];
                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  const paletteColors = [ '#ff1744', '#ff6d00', '#ffca28', '#ffee58', '#7cb342', '#00c853',
  '#00bfa5', '#00b0ff', '#2962ff', '#651fff', '#d500f9', '#f50057',
  '#ff8a80', '#ffcc80', '#fff59d', '#c5e1a5', '#80deea', '#90caf9',
  '#b39ddb', '#f8bbd0', '#8d6e63', '#fcfcfc', '#9e9e9e', '#111111'
];

const screens = [...document.querySelectorAll('.screen')];
const grid = document.querySelector('#imageGrid');
const playBtn = document.querySelector('#playBtn');
const baseCanvas = document.querySelector('#baseCanvas');
const drawCanvas = document.querySelector('#drawCanvas');
const baseCtx = baseCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');
const colorPicker = document.querySelector('#colorPicker');
const brushSize = document.querySelector('#brushSize');
const studioTitle = document.querySelector('#studioTitle');
const undoBtn = document.querySelector('#undoBtn');
const clearBtn = document.querySelector('#clearBtn');
const saveBtn = document.querySelector('#saveBtn');
const toolButtons = [...document.querySelectorAll('[data-tool]')];
const palette = document.querySelector('#palette');

let selectedPicture = pictures[0];
let drawing = false;
let activeTool = 'brush';
let lastPoint = null;
let history = [];

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.id === id));
  if (id === 'studioScreen') setTimeout(renderBaseImage, 50);
}

function setBrushColor(color) {
  colorPicker.value = color;
  palette.querySelectorAll('.swatch').forEach(button => {
    button.classList.toggle('selected', button.dataset.color === color.toLowerCase());
  });
}

function buildPalette() {
  palette.innerHTML = '';
  paletteColors.forEach(color => {
    const button = document.createElement('button');
    button.className = 'swatch';
    button.type = 'button';
    button.dataset.color = color;
    button.style.setProperty('--swatch', color);
    button.setAttribute('aria-label', `Use color ${color}`);
    button.addEventListener('click', () => {
      activeTool = 'brush';
      toolButtons.forEach(toolButton => {
        toolButton.classList.toggle('selected', toolButton.dataset.tool === 'brush');
      });
      setBrushColor(color);
    });
    palette.appendChild(button);
  });
  setBrushColor(colorPicker.value);
}

function buildPicker() {
  grid.innerHTML = '';
  pictures.forEach(pic => {
    const button = document.createElement('button');
    button.className = 'image-card';
    button.type = 'button';
    button.innerHTML = `<img src="${pic.src}" alt="${pic.name}"><span>${pic.name}</span>`;
    button.addEventListener('click', () => {
      selectedPicture = pic;
      studioTitle.textContent = pic.name;
      history = [];
      clearCanvas(false);
      showScreen('studioScreen');
    });
    grid.appendChild(button);
  });
}

function canvasPoint(event) {
  const rect = drawCanvas.getBoundingClientRect();
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  const source = touch || event;
  return {
    x: (source.clientX - rect.left) * (drawCanvas.width / rect.width),
    y: (source.clientY - rect.top) * (drawCanvas.height / rect.height)
  };
}

function saveHistory() {
  if (history.length > 12) history.shift();
  history.push(drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height));
}

function startDraw(event) {
  event.preventDefault();
  saveHistory();
  drawing = true;
  lastPoint = canvasPoint(event);
  drawDot(lastPoint);
}

function moveDraw(event) {
  if (!drawing) return;
  event.preventDefault();
  const point = canvasPoint(event);
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.lineWidth = Number(brushSize.value);
  drawCtx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
  drawCtx.strokeStyle = colorPicker.value;
  drawCtx.beginPath();
  drawCtx.moveTo(lastPoint.x, lastPoint.y);
  drawCtx.lineTo(point.x, point.y);
  drawCtx.stroke();
  lastPoint = point;
}

function endDraw() {
  drawing = false;
  lastPoint = null;
  drawCtx.globalCompositeOperation = 'source-over';
}

function drawDot(point) {
  drawCtx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
  drawCtx.fillStyle = colorPicker.value;
  drawCtx.beginPath();
  drawCtx.arc(point.x, point.y, Number(brushSize.value) / 2, 0, Math.PI * 2);
  drawCtx.fill();
  drawCtx.globalCompositeOperation = 'source-over';
}

async function preloadPictures() {
  const loads = pictures.map(async pic => {
    try {
      const response = await fetch(pic.src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      pic.src = URL.createObjectURL(blob);
    } catch (err) {
      console.warn('Could not preload image:', pic.src, err);
    }
  });
  await Promise.all(loads);
}

function renderBaseImage() {
  const img = new Image();
  img.onload = () => {
    baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.fillStyle = '#ffffff';
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
    const scale = Math.min(baseCanvas.width / img.width, baseCanvas.height / img.height) * 0.82;
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (baseCanvas.width - width) / 2;
    const y = (baseCanvas.height - height) / 2;
    baseCtx.drawImage(img, x, y, width, height);
  };
  img.onerror = () => {
    console.error('Failed to load image:', selectedPicture.src);
    baseCtx.fillStyle = '#ffcccc';
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
    baseCtx.fillStyle = '#ff0000';
    baseCtx.font = '20px Arial';
    baseCtx.textAlign = 'center';
    baseCtx.fillText('Image failed to load', baseCanvas.width / 2, baseCanvas.height / 2);
  };
  img.src = selectedPicture.src;
}

function clearCanvas(remember = true) {
  if (remember) saveHistory();
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

async function downloadArtwork() {
  const merged = document.createElement('canvas');
  merged.width = baseCanvas.width;
  merged.height = baseCanvas.height;
  const ctx = merged.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, merged.width, merged.height);

  // Draw the user drawing first.
  ctx.drawImage(drawCanvas, 0, 0);

  // Then composite the base image directly from the source to avoid tainting from baseCanvas.
  const baseImageSrc = selectedPicture.blobUrl || selectedPicture.src;
  const img = new Image();
  const drawBaseImage = () => new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(img, 0, 0, merged.width, merged.height);
        ctx.globalCompositeOperation = 'source-over';
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load base image: ${baseImageSrc}`));
    img.src = baseImageSrc;
  });

  try {
    await drawBaseImage();
  } catch (err) {
    console.warn('Could not composite base image directly:', err);
  }

  let href;
  try {
    href = merged.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to export image as PNG:', err);
    alert('Save failed: the browser blocked exporting the canvas.\n\nTry: Run via local server (`python -m http.server 8000`) or use Microsoft Edge.');
    return;
  }

  const link = document.createElement('a');
  link.download = `${(selectedPicture.name || 'artwork').toLowerCase()}-coloring.png`;
  link.href = href;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log('✓ Artwork saved:', link.download);
}

playBtn.addEventListener('click', () => showScreen('pickerScreen'));
document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => showScreen(btn.dataset.go)));
toolButtons.forEach(btn => btn.addEventListener('click', () => {
  activeTool = btn.dataset.tool;
  toolButtons.forEach(button => button.classList.toggle('selected', button === btn));
}));
undoBtn.addEventListener('click', () => {
  const previous = history.pop();
  if (previous) drawCtx.putImageData(previous, 0, 0);
});
clearBtn.addEventListener('click', () => {
  clearCanvas(true);
});
saveBtn.addEventListener('click', downloadArtwork);
colorPicker.addEventListener('input', () => {
  setBrushColor(colorPicker.value);
});

drawCanvas.addEventListener('pointerdown', startDraw);
drawCanvas.addEventListener('pointermove', moveDraw);
drawCanvas.addEventListener('pointerup', endDraw);
drawCanvas.addEventListener('pointerleave', endDraw);
drawCanvas.addEventListener('pointercancel', endDraw);
window.addEventListener('resize', renderBaseImage);

buildPalette();
buildPicker();
preloadPictures().then(() => renderBaseImage());

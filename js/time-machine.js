document.addEventListener('DOMContentLoaded', () => {
  initTimeMachine();
});

// For Pjax support (often used in Hexo themes)
document.addEventListener('pjax:complete', () => {
  applyThemeFromUrl();
});

function initTimeMachine() {
  // We no longer inject the standalone widget here, as it's integrated into Anomaly Control Center.
  // 3. Initial check URL params
  applyThemeFromUrl();
}

function applyThemeFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  let year = urlParams.get('year');
  
  if (!year) {
    year = sessionStorage.getItem('time_machine_year') || 'modern';
  } else {
    sessionStorage.setItem('time_machine_year', year);
  }

  if (year === '1998' || year === '2077') {
    applyTheme(year);
  } else {
    applyTheme('modern');
  }
}

function switchYear(year) {
  const url = new URL(window.location);
  if (year === 'modern') {
    url.searchParams.delete('year');
    sessionStorage.removeItem('time_machine_year');
  } else {
    url.searchParams.set('year', year);
    sessionStorage.setItem('time_machine_year', year);
  }
  window.history.pushState({}, '', url);
  
  if (year === '2077' && !document.documentElement.classList.contains('tm-2077')) {
    playGlassShatterEffect(() => applyTheme(year));
  } else {
    applyTheme(year);
  }
}

function applyTheme(year) {
  const html = document.documentElement;
  html.classList.remove('tm-1998', 'tm-2077');
  
  stopMatrix();

  if (year === '1998') {
    html.classList.add('tm-1998');
  } else if (year === '2077') {
    html.classList.add('tm-2077');
    startMatrix();
  }
}

/* --- Matrix Canvas Effect --- */
let matrixInterval;
let matrixCanvas;
function startMatrix() {
  if (!matrixCanvas) {
    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'tm-matrix-canvas';
    document.body.appendChild(matrixCanvas);
  }
  
  const ctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
  const fontSize = 16;
  const columns = matrixCanvas.width / fontSize;
  const drops = Array.from({length: columns}).fill(1);

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

  matrixInterval = setInterval(() => {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    ctx.fillStyle = '#00ff41'; // Matrix green
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 50);
}

function stopMatrix() {
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
  }
  if (matrixCanvas) {
    matrixCanvas.remove();
    matrixCanvas = null;
  }
}

/* --- Glass Shatter Effect --- */
function playGlassShatterEffect(callback) {
  const canvas = document.createElement('canvas');
  canvas.id = 'tm-glass-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Simple shatter effect for demonstration
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let opacity = 1;
  const fadeInterval = setInterval(() => {
    opacity -= 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some random "cracks"
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<15; i++) {
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    }
    ctx.stroke();

    if (opacity <= 0) {
      clearInterval(fadeInterval);
      canvas.remove();
      if (callback) callback();
    }
  }, 40);
}

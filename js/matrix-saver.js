/* ============================================
 * 全屏 Matrix 数字雨屏保 (Idle Matrix Screen Saver)
 * 闲置 45 秒后切入，任意动作唤醒
 * ============================================ */

(() => {
  'use strict';

  class MatrixSaver {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.drops = [];
      this.fontSize = 16;
      this.columns = 0;
      this.isActive = false;
      this.idleThreshold = 45000; // 45 seconds
      this.lastTime = Date.now();
      
      this.draw = this.draw.bind(this);
      this.resetIdle = this.resetIdle.bind(this);
      this.checkIdle = this.checkIdle.bind(this);
    }

    init() {
      if (document.getElementById('matrix-saver-canvas')) return;
      
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'matrix-saver-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.zIndex = '9999998';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.opacity = '0';
      this.canvas.style.transition = 'opacity 2s ease-in-out';
      this.canvas.style.background = '#000';
      document.body.appendChild(this.canvas);
      
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', this.resetIdle);
      window.addEventListener('keypress', this.resetIdle);
      window.addEventListener('scroll', this.resetIdle);
      window.addEventListener('click', this.resetIdle);
      
      setInterval(this.checkIdle, 1000);
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.columns = Math.floor(this.canvas.width / this.fontSize);
      this.drops = [];
      for (let i = 0; i < this.columns; i++) {
        this.drops[i] = Math.random() * -100;
      }
    }

    start() {
      if (this.isActive) return;
      this.init();
      this.isActive = true;
      this.canvas.style.opacity = '1';
      this.canvas.style.pointerEvents = 'auto';
      requestAnimationFrame(this.draw);
    }

    stop() {
      if (!this.isActive) return;
      this.isActive = false;
      this.canvas.style.opacity = '0';
      this.canvas.style.pointerEvents = 'none';
      this.resetIdle();
      // Glitch effect on wake
      document.body.style.filter = `hue-rotate(90deg) contrast(150%)`;
      setTimeout(() => { document.body.style.filter = ''; }, 150);
    }

    draw() {
      if (!this.isActive) return;
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#0F0';
      this.ctx.font = this.fontSize + 'px monospace';
      
      for (let i = 0; i < this.drops.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
        
        if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }
        this.drops[i]++;
      }
      requestAnimationFrame(this.draw);
    }

    resetIdle() {
      this.lastTime = Date.now();
      if (this.isActive) {
        this.stop();
      }
    }

    checkIdle() {
      if (!this.isActive && (Date.now() - this.lastTime > this.idleThreshold)) {
        this.start();
      }
    }
  }

  window.MatrixSaver = new MatrixSaver();
  // Init idle detection on load
  document.addEventListener('DOMContentLoaded', () => {
    window.MatrixSaver.init();
  });
  
  window.triggerMatrixSaver = function() {
    window.MatrixSaver.start();
  };
})();

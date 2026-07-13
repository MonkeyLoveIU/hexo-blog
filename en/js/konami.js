/* ============================================
 * 多组合隐藏彩蛋系统
 *
 * 在下方 EASTER_EGGS 数组中配置多个彩蛋：
 *   keys  — 按键序列（使用 KeyCode 名称）
 *   emoji — 弹窗顶部的表情
 *   text  — 弹窗正文（支持 HTML）
 *   sakura    — 是否触发樱花雨 (默认 true)
 *   hueRotate — 是否触发彩虹色 (默认 true)
 *   popup     — 是否弹窗 (默认 true)
 *
 * 8 秒后一切自动恢复
 * ============================================ */
(() => {
  'use strict';

  /* =============================================
   *  🎮 在这里配置你的所有彩蛋组合
   * ============================================= */
  const EASTER_EGGS = [
    {
      // 经典 Konami Code：↑ ↑ ↓ ↓ ← → ← → B A
      keys: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'],
      emoji: '🎉',
      text: '恭喜你找到了隐藏的秘密！<br>你一定是个有趣的人~',
      sakura: true,
      hueRotate: true,
      popup: true,
    },
    {
      // CNY
      keys: ['KeyC','KeyN','KeyY'],
      emoji: '🧧',
      text: '新年快乐！恭喜发财！🎆<br>愿你万事如意~',
      sakura: true,
      hueRotate: false,
      popup: true,
    },
    {
      // LOVE
      keys: ['KeyL','KeyO','KeyV','KeyE'],
      emoji: '💕',
      text: 'Love is in the air 💌<br>你被这个博客爱着哦~',
      sakura: true,
      hueRotate: true,
      popup: true,
    },
    // ↓↓↓ 想加更多？照着上面的格式复制一组就行 ↓↓↓
  ];

  /* ---- 常量 ---- */
  const DURATION    = 8000;  // 特效持续时间（毫秒）
  const FADE_OUT_MS = 800;   // 淡出动画时间
  const PETAL_COUNT = 55;    // 花瓣数量

  /* ---- 状态 ---- */
  let inputBuffer = [];
  let isActive = false;
  const maxLen = Math.max(...EASTER_EGGS.map(e => e.keys.length));

  /* ---- 键盘监听 ---- */
  document.addEventListener('keydown', (e) => {
    if (isActive) return;

    inputBuffer.push(e.code);
    // 只保留最近 maxLen 次按键
    if (inputBuffer.length > maxLen) {
      inputBuffer.shift();
    }

    // 逐个检查是否有匹配的彩蛋
    for (const egg of EASTER_EGGS) {
      const len = egg.keys.length;
      if (inputBuffer.length >= len) {
        const tail = inputBuffer.slice(-len);
        if (tail.every((key, i) => key === egg.keys[i])) {
          inputBuffer = [];
          activateEasterEgg(egg);
          return;
        }
      }
    }
  });

  /* ==============================
   *  主触发函数
   * ============================== */
  function activateEasterEgg(egg) {
    isActive = true;

    const elements = []; // 收集所有需要清理的 DOM

    if (egg.sakura !== false) {
      elements.push(createSakuraCanvas());
    }
    if (egg.popup !== false) {
      elements.push(createPopup(egg));
    }
    if (egg.hueRotate !== false) {
      applyHueRotate();
    }

    // 8 秒后开始淡出
    setTimeout(() => {
      elements.forEach(el => el.classList.add('konami-fade-out'));

      setTimeout(() => {
        elements.forEach(el => el.remove());
        document.documentElement.classList.remove('konami-active');
        isActive = false;
      }, FADE_OUT_MS);
    }, DURATION);
  }

  /* ==============================
   *  1. 樱花雨（Canvas）
   * ============================== */
  function createSakuraCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'konami-sakura-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h;
    let animId;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(makePetal());
    }

    function makePetal(startFromTop) {
      return {
        x: Math.random() * w,
        y: startFromTop ? -20 : Math.random() * h,
        size: 6 + Math.random() * 10,
        speedY: 0.6 + Math.random() * 1.8,
        speedX: -0.4 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.025,
        opacity: 0.5 + Math.random() * 0.5,
        hue: 340 + Math.random() * 20,
        lightness: 75 + Math.random() * 15
      };
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        p.size * 0.4,  -p.size * 0.3,
        p.size * 0.8,  -p.size * 0.1,
        p.size,         0
      );
      ctx.bezierCurveTo(
        p.size * 0.8,   p.size * 0.1,
        p.size * 0.4,   p.size * 0.3,
        0,              0
      );
      ctx.fillStyle = `hsl(${p.hue}, 80%, ${p.lightness}%)`;
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.6;
        p.rotation += p.rotSpeed;

        if (p.y > h + 20) {
          petals[i] = makePetal(true);
        }
        drawPetal(p);
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    const origRemove = canvas.remove.bind(canvas);
    canvas.remove = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      origRemove();
    };

    return canvas;
  }

  /* ==============================
   *  2. 主题色彩虹旋转
   * ============================== */
  function applyHueRotate() {
    document.documentElement.classList.add('konami-active');
  }

  /* ==============================
   *  3. 弹窗卡片
   * ============================== */
  function createPopup(egg) {
    const popup = document.createElement('div');
    popup.id = 'konami-popup';
    popup.innerHTML = `
      <span class="konami-emoji">${egg.emoji || '🎉'}</span>
      <div class="konami-text">${egg.text || ''}</div>
      <div class="konami-hint">点击关闭 · 或等待自动消失</div>
    `;
    popup.addEventListener('click', () => {
      popup.classList.add('konami-fade-out');
      setTimeout(() => popup.remove(), FADE_OUT_MS);
    });
    document.body.appendChild(popup);
    return popup;
  }

})();

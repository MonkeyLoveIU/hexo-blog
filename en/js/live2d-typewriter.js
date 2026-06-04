/* ============================================
 * Live2D 对话框打字机效果（增强版）
 * 功能：
 *   1. 监听 #live2d-tips 内容变化，逐字显示
 *   2. 打完一句自动停下，不自动切换
 *   3. 用户交互（点击/悬停）才允许下一句
 * ============================================ */

(() => {
  'use strict';

  const TYPING_SPEED = 60;     // 打字速度（毫秒/字）
  const COOLDOWN = 800;        // 打完一句的冷却时间（毫秒）

  let typing = false;          // 是否正在打字
  let locked = false;          // 是否锁定（锁定时不接受新消息）
  let currentTimer = null;
  let lastText = '';

  // 打字机核心
  const typewrite = (el, text) => {
    if (currentTimer) clearInterval(currentTimer);

    typing = true;
    locked = true;
    el.textContent = '';

    let i = 0;
    currentTimer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(currentTimer);
        currentTimer = null;
        typing = false;
        // 打完后短暂冷却，避免立即被覆盖
        setTimeout(() => { locked = false; }, COOLDOWN);
      }
    }, TYPING_SPEED);
  };

  // 解锁（用户主动触发时调用）
  const unlock = () => {
    locked = false;
  };

  const initObserver = () => {
    const target = document.getElementById('live2d-tips');
    if (!target) {
      setTimeout(initObserver, 500);
      return;
    }

    const observer = new MutationObserver(() => {
      if (typing) return;          // 正在打字 → 忽略
      const text = target.textContent.trim();
      if (!text) return;
      if (text === lastText) return; // 文本没变 → 忽略
      if (locked) {
        // 锁定中 → 把新文本"塞回去"维持当前显示
        target.textContent = lastText;
        return;
      }
      lastText = text;
      typewrite(target, text);
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // —— 用户交互时解锁，允许下一句 ——
    // 点击看板娘容器
    const waifu = document.getElementById('waifu') || document.getElementById('live2d-widget');
    if (waifu) {
      waifu.addEventListener('click', unlock);
      waifu.addEventListener('mouseenter', unlock);
    }
    // 点击对话框本身也解锁
    target.addEventListener('click', unlock);

    console.log('[Live2D Typewriter] 增强版已启动 ✨（打完即停，点击解锁）');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
/* ============================================
 * Live2D 智能场景对话系统（增强版）
 * 功能：
 *   1. 打字机效果逐字输出
 *   2. 场景感知：滚动底部、停留时长、深夜、页面类型
 *   3. 对话框星空魔法样式
 *   4. 守护精灵模式 — 根据博客更新频率改变态度
 * ============================================ */

(() => {
  'use strict';

  const TYPING_SPEED = 60;
  const COOLDOWN = 800;
  const SCENE_PRIORITY = 50;

  let typing = false;
  let locked = false;
  let currentTimer = null;
  let lastText = '';
  let sceneTimer = null;
  let stayTimer = null;

  /* ----- 打字机核心 ----- */
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
        setTimeout(() => { locked = false; }, COOLDOWN);
      }
    }, TYPING_SPEED);
  };

  const unlock = () => { locked = false; };

  const scene = {
    say(text, timeout = 6000) {
      const el = document.getElementById('live2d-tips');
      if (!el) return;
      sessionStorage.setItem('live2d-priority', SCENE_PRIORITY);
      el.innerHTML = text;
      el.classList.add('live2d-tips-active');
      if (sceneTimer) clearTimeout(sceneTimer);
      sceneTimer = setTimeout(() => {
        sessionStorage.removeItem('live2d-priority');
        el.classList.remove('live2d-tips-active');
        sceneTimer = null;
      }, timeout);
    },
  };

  /* ----- 守护精灵 ----- */
  let guardianState = null;

  const getGuardianState = (days) => {
    if (days <= 3) return { mood: 'quiet', msg: null };
    if (days <= 7) return { mood: 'normal', msg: null };
    if (days <= 14) return { mood: 'worried', msg: null };
    if (days <= 30) return { mood: 'sad', msg: '好久没更新了…' };
    return { mood: 'angry', msg: `已经 ${days} 天没更新了` };
  };

  const initGuardian = () => {
    fetch('/site-meta.json')
      .then(r => r.json())
      .then(data => {
        const state = getGuardianState(data.daysSinceLastUpdate);
        guardianState = state.mood;

        // >14 天再不显示坏ge
        if (state.mood === 'quiet' || state.mood === 'normal' || state.mood === 'worried') return;

        const badge = document.createElement('div');
        badge.id = 'guardian-badge';
        badge.style.cssText = 'margin-top:8px;padding:8px 12px;border-radius:8px;font-size:12px;text-align:center;line-height:1.5;';
        badge.style.background = 'rgba(244,67,54,0.1)';
        badge.style.border = '1px solid rgba(244,67,54,0.3)';
        badge.style.color = '#f44336';
        badge.innerHTML = state.msg;

        const injectBadge = () => {
          if (document.getElementById('guardian-badge')) return;
          const sidebar = document.querySelector('aside#sidebar');
          if (!sidebar) { setTimeout(injectBadge, 500); return; }
          const gameWidget = document.getElementById('miku-game-widget');
          if (gameWidget && gameWidget.parentNode) gameWidget.parentNode.insertBefore(badge, gameWidget.nextSibling);
          else { const wa = sidebar.querySelector('.sidebar-widget'); if (wa) wa.appendChild(badge); else sidebar.appendChild(badge); }
        };
        setTimeout(injectBadge, 1500);

        if (window.location.pathname === '/') setTimeout(() => scene.say(state.msg, 6000), 4000);
      })
      .catch(() => {});
  };

  /* ----- 每周主题 ----- */
  const initWeeklyTheme = () => {
    // 不再显示每周 banner。保留函数占位。
  };

  /* ----- 场景 ---- */
  const DAILY_LINES = ['……','。','（安静）',null,null,null];

  const initScrollTrigger = () => {
    let hasTriggered = false;
    let triggerCount = 0;
    try { triggerCount = parseInt(localStorage.getItem('miku_scroll_count') || '0'); } catch {}
    if (triggerCount >= 3) return; // 超过 3 次后不再触发
    window.addEventListener('scroll', () => {
      if (hasTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.85) {
        hasTriggered = true;
        try { localStorage.setItem('miku_scroll_count', String(triggerCount + 1)); } catch {}
        const msgs = ['居然看完了…','看完了？'];
        scene.say(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, { passive: true });
  };

  const initPageGreeting = () => {
    // 70% 概率什么都不说
    if (Math.random() < 0.7) return;
    const path = window.location.pathname;
    let msg = '';
    if (path === '/' || path === '/index.html') {
      if (guardianState === 'angry') msg = '……';
      else if (guardianState === 'sad') msg = '……';
      else msg = DAILY_LINES[Math.floor(Math.random() * DAILY_LINES.length)];
    } else if (path.startsWith('/about')) msg = DAILY_LINES[Math.floor(Math.random() * DAILY_LINES.length)];
    else if (path.startsWith('/friend')) msg = DAILY_LINES[Math.floor(Math.random() * DAILY_LINES.length)];
    else if (path.startsWith('/diary')) msg = DAILY_LINES[Math.floor(Math.random() * DAILY_LINES.length)];
    else if (path.match(/^\/(\d{4})\//)) msg = DAILY_LINES[Math.floor(Math.random() * DAILY_LINES.length)];
    if (msg) setTimeout(() => scene.say(msg, 5000), 800);
  };

  const initNightCheck = () => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      // 30% 概率触发，会话级只一次
      try {
        if (sessionStorage.getItem('miku_night_done')) return;
        sessionStorage.setItem('miku_night_done', '1');
      } catch {}
      if (Math.random() < 0.3) {
        setTimeout(() => { scene.say('……', 5000); }, 5000);
      }
    }
  };

  const initStayTimer = () => {
    stayTimer = setTimeout(() => { scene.say('看了好一会儿了呢，要喝杯水休息下吗～', 5000); }, 120000);
  };

  /* ----- MutationObserver ----- */
  const initObserver = () => {
    const target = document.getElementById('live2d-tips');
    if (!target) { setTimeout(initObserver, 500); return; }

    const observer = new MutationObserver(() => {
      if (typing) return;
      const text = target.textContent.trim();
      if (!text || text === lastText) return;
      if (locked) { target.textContent = lastText; return; }
      lastText = text;
      typewrite(target, text);
    });

    observer.observe(target, { childList: true, subtree: true, characterData: true });

    const waifu = document.getElementById('waifu') || document.getElementById('live2d-plugin');
    if (waifu) { waifu.addEventListener('click', unlock); waifu.addEventListener('mouseenter', unlock); }
    target.addEventListener('click', unlock);
  };

  const boot = () => {
    initObserver();
    initScrollTrigger();
    initNightCheck();
    initStayTimer();
    initGuardian();
    initWeeklyTheme();
    setTimeout(initPageGreeting, 2000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

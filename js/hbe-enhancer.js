/* ============================================
 * 加密增强系统 🎭
 *
 * 功能集成：
 *   #1 解密彩蛋 — 输错密码显示假文章
 *   #2 密码线索迷宫 — 需要先在别的文章找到线索
 *   #3 成就系统 — 累积解密次数获得称号
 *   #4 解密烟花 — 成功解密触发庆祝
 *   #5 阅后即焚 — 解密后离开页面自动重新加密
 *   #6 知识问答解锁 — 答对问题才显示密码框
 *   #7 双人解密 — 需要两人各自输入密码
 *   #8 暗黑彩蛋 — 解密成功自动切深色模式
 * ============================================ */

(() => {
  'use strict';

  /* ========== 通用工具 ========== */

  const LS_KEY = 'hbe_achievements';

  const loadAchievements = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || { count: 0, milestone: 0 }; }
    catch { return { count: 0, milestone: 0 }; }
  };

  const saveAchievements = (data) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* noop */ }
  };

  const getFakeContent = () => {
    const el = document.getElementById('hbe-fake-content');
    return el ? el.textContent.trim() : null;
  };

  const getArticle = () => document.querySelector('article.h-entry');

  const mikuSay = (text) => {
    try {
      const tips = document.getElementById('live2d-tips');
      if (tips) {
        sessionStorage.setItem('live2d-priority', 99999);
        tips.innerHTML = text;
        tips.classList.add('live2d-tips-active');
        setTimeout(() => {
          tips.classList.remove('live2d-tips-active');
          sessionStorage.removeItem('live2d-priority');
        }, 5000);
      }
    } catch { /* noop */ }
  };

  const triggerFireworks = () => {
    try {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const evt = new MouseEvent('click', {
            clientX: cx + (Math.random() - 0.5) * 200,
            clientY: cy + (Math.random() - 0.5) * 200,
          });
          document.dispatchEvent(evt);
        }, i * 500);
      }
    } catch { /* noop */ }
  };

  const switchToDarkMode = () => {
    try {
      const toggle = document.querySelector('.dark-mode-toggle');
      if (toggle) { toggle.click(); }
    } catch { /* noop */ }
  };

  /** 获取已读文章 slug 列表 */
  const getReadSlugs = () => {
    try {
      const slugs = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mist_read_')) {
          slugs.push(key.replace('mist_read_', ''));
        }
      }
      return slugs;
    } catch { return []; }
  };

  /** 判断某篇文章是否已读 */
  const hasRead = (slug) => {
    try { return !!localStorage.getItem(`mist_read_${slug}`); } catch { return false; }
  };

  const MILESTONES = [
    { count: 1, title: '初窥门径', badge: '🔓', msg: '第一次解密成功！这是一个开始～' },
    { count: 3, title: '小有成就', badge: '🔑', msg: '已经解开 3 篇文章了呢，不错嘛！' },
    { count: 5, title: '解密能手', badge: '🗝️', msg: '5 篇！你是真正的解密达人了！' },
    { count: 10, title: '藏书家', badge: '📚', msg: '10 篇！没有秘密能逃过你的眼睛！' },
    { count: 20, title: '归处守护者', badge: '👑', msg: '20 篇…你比主人还了解这个博客！' },
  ];

  const checkMilestone = (achievements) => {
    const unlocked = achievements.milestone;
    for (const m of MILESTONES) {
      if (achievements.count >= m.count && unlocked < m.count) {
        achievements.milestone = m.count;
        saveAchievements(achievements);
        return m;
      }
    }
    return null;
  };

  const renderBadge = (achievements) => {
    let title = '无名访客';
    let badge = '👤';
    for (const m of [...MILESTONES].reverse()) {
      if (achievements.count >= m.count) { title = m.title; badge = m.badge; break; }
    }
    const el = document.getElementById('hbe-badge');
    if (el) {
      el.innerHTML = `${badge} ${title} <span style="font-size:12px;opacity:0.6">(${achievements.count}次)</span>`;
    }
  };

  /* ========== Feature #1: 解密彩蛋 ========== */
  const initFakeDecrypt = () => {
    const fakeContent = getFakeContent();
    if (!fakeContent) return;
    const target = document.getElementById('hexo-blog-encrypt');
    if (!target) return;
    const observer = new MutationObserver(() => {
      const errorEl = target.querySelector('[role="alert"], .hbe-error');
      if (!errorEl) return;
      const form = target.querySelector('#hbeForm');
      if (form) {
        const fakeDiv = document.createElement('div');
        fakeDiv.className = 'hbe hbe-decrypted-content';
        fakeDiv.innerHTML = `<div style="padding: 20px;">
          <p style="color: var(--red-2); font-weight: 700; margin-bottom: 16px;">✅ 解密成功！（大概吧）</p>
          <div>${fakeContent}</div>
        </div>`;
        form.parentNode.replaceChild(fakeDiv, form);
      }
      if (errorEl.parentNode) errorEl.parentNode.removeChild(errorEl);
    });
    observer.observe(target, { childList: true, subtree: true });
  };

  /* ========== Feature #2: 密码线索迷宫 ========== */
  const initClueMaze = () => {
    const article = getArticle();
    if (!article || !article.dataset.clues) return;
    let clues;
    try { clues = JSON.parse(decodeURIComponent(article.dataset.clues)); } catch { return; }
    if (!Array.isArray(clues) || !clues.length) return;

    const target = document.getElementById('hexo-blog-encrypt');
    if (!target) return;

    const observer = new MutationObserver(() => {
      const form = target.querySelector('#hbeForm');
      if (!form || target.querySelector('.hbe-clues-panel')) return;

      const panel = document.createElement('div');
      panel.className = 'hbe-clues-panel';
      panel.style.cssText =
        'margin: 12px 0; padding: 12px 14px; border-radius: 10px; ' +
        'background: var(--red-5-5, rgba(255,228,228,0.1)); ' +
        'border: 1px dashed var(--red-3, #ffafaf); font-size: 13px; line-height: 1.7;';

      let html = '<div style="font-weight:700;color:var(--red-1);margin-bottom:8px;">🔍 线索追踪</div>';

      let allDone = true;
      clues.forEach((clue, i) => {
        const done = hasRead(clue.article);
        if (!done) allDone = false;
        html += `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;opacity:${done ? 1 : 0.6}">
          <span>${done ? '✅' : '⬜'}</span>
          <span><strong>线索 ${i + 1}</strong>：${clue.hint || '?'}</span>
          ${done ? '<span style="margin-left:auto;font-size:11px;color:var(--green)">已收集 ✓</span>' : ''}
        </div>`;
      });

      if (allDone) {
        html += '<div style="margin-top:10px;padding:10px;border-radius:8px;background:rgba(255,215,0,0.15);border:1px solid gold;text-align:center;">';
        html += '<span style="font-weight:700;">🎯 所有线索已集齐！试试用你找到的信息作为密码吧</span></div>';
      } else {
        html += '<div style="margin-top:8px;font-size:12px;opacity:0.7;">💡 阅读线索指向的文章来收集密码碎片</div>';
      }

      panel.innerHTML = html;

      // 插入到表单下方
      const submitBtn = form.querySelector('.hbe-button');
      if (submitBtn && submitBtn.parentNode) {
        submitBtn.parentNode.insertBefore(panel, submitBtn.nextSibling);
      } else {
        form.appendChild(panel);
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  };

  /* ========== Feature #5: 阅后即焚 ========== */
  const initBurnAfterReading = () => {
    const article = getArticle();
    if (!article || !article.dataset.burn) return;
    const duration = parseInt(article.dataset.burnDuration) || 30; // 默认30秒

    let burned = false;

    const burn = () => {
      if (burned) return;
      burned = true;
      // 清除 HBE 的 localStorage 缓存
      const hbeKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hbe.v4.')) hbeKeys.push(key);
      }
      hbeKeys.forEach(k => localStorage.removeItem(k));
      mikuSay('🔥 阅后即焚：这篇文章已重新加密');
    };

    // 解密成功后开始计时
    window.addEventListener('hexo-blog-decrypt', () => {
      // 计时器：duration秒后焚毁
      setTimeout(burn, duration * 1000);

      // 页面隐藏/关闭时立即焚毁
      window.addEventListener('pagehide', burn);
      window.addEventListener('visibilitychange', () => {
        if (document.hidden) setTimeout(burn, 5000); // 离开5秒后焚毁
      });
    });
  };

  /* ========== Feature #6: 知识问答解锁 ========== */
  const initQuizUnlock = () => {
    const article = getArticle();
    if (!article || !article.dataset.quiz) return;
    let quizData;
    try { quizData = JSON.parse(decodeURIComponent(article.dataset.quiz)); } catch { return; }
    if (!quizData.question || !quizData.answer) return;

    const target = document.getElementById('hexo-blog-encrypt');
    if (!target) return;

    let quizPassed = false;

    const observer = new MutationObserver(() => {
      const form = target.querySelector('#hbeForm');
      if (!form || target.querySelector('.hbe-quiz-wrap') || quizPassed) return;

      // 找到密码输入框
      const passInput = form.querySelector('#hbePass');
      if (!passInput) return;

      // 隐藏原始密码框
      passInput.style.display = 'none';

      // 如果已经有 quiz 容器跳过
      if (form.querySelector('.hbe-quiz-wrap')) return;

      const quizWrap = document.createElement('div');
      quizWrap.className = 'hbe-quiz-wrap';
      quizWrap.style.cssText = 'margin: 12px 0;';

      quizWrap.innerHTML = `
        <div style="font-weight:700;color:var(--red-1);margin-bottom:8px;">❓ 知识问答</div>
        <div style="margin-bottom:10px;font-size:14px;line-height:1.6;">${quizData.question}</div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="hbe-quiz-input" placeholder="输入你的答案..."
            style="flex:1;padding:8px 12px;border:2px solid var(--red-3,#ffafaf);border-radius:8px;
            background:var(--red-6,#fff7f7);color:var(--text-color);font-size:14px;outline:none;">
          <button id="hbe-quiz-btn" style="padding:8px 16px;background:var(--red-1,#ff5252);color:#fff;
            border:none;border-radius:8px;font-weight:600;cursor:pointer;">提交</button>
        </div>
        <div id="hbe-quiz-feedback" style="margin-top:8px;font-size:13px;"></div>
      `;

      // 找到按钮，插入 quiz 到它前面
      const btn = form.querySelector('.hbe-button');
      if (btn) {
        btn.parentNode.insertBefore(quizWrap, btn);
      } else {
        form.appendChild(quizWrap);
      }

      const quizInput = quizWrap.querySelector('#hbe-quiz-input');
      const quizBtn = quizWrap.querySelector('#hbe-quiz-btn');
      const feedback = quizWrap.querySelector('#hbe-quiz-feedback');

      const checkAnswer = () => {
        const userAns = quizInput.value.trim().toLowerCase();
        const correctAns = String(quizData.answer).toLowerCase();
        if (userAns === correctAns) {
          quizPassed = true;
          feedback.innerHTML = '<span style="color:var(--green,#4caf50);font-weight:600;">✅ 回答正确！正在解密…</span>';
          // 自动填入密码并提交
          passInput.value = quizData.password || '';
          passInput.style.display = '';
          const submitBtn = form.querySelector('.hbe-button');
          if (submitBtn) submitBtn.click();
        } else {
          feedback.innerHTML = '<span style="color:var(--red-2);">❌ 答案不对，再想想？</span>';
          quizInput.value = '';
          quizInput.focus();
        }
      };

      quizBtn.addEventListener('click', checkAnswer);
      quizInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkAnswer(); });
    });

    observer.observe(target, { childList: true, subtree: true });
  };

  /* ========== Feature #7: 双人解密 ========== */
  const initDualDecrypt = () => {
    const article = getArticle();
    if (!article || !article.dataset.dualPassword) return;

    const target = document.getElementById('hexo-blog-encrypt');
    if (!target) return;

    let dualReady = false;

    const observer = new MutationObserver(() => {
      const form = target.querySelector('#hbeForm');
      if (!form || target.querySelector('.hbe-dual-wrap') || dualReady) return;

      const passInput = form.querySelector('#hbePass');
      const submitBtn = form.querySelector('.hbe-button');
      if (!passInput || !submitBtn) return;

      // 隐藏原始密码框
      passInput.style.display = 'none';

      const dualWrap = document.createElement('div');
      dualWrap.className = 'hbe-dual-wrap';
      dualWrap.style.cssText = 'margin: 12px 0;';

      dualWrap.innerHTML = `
        <div style="font-weight:700;color:var(--red-1);margin-bottom:8px;">🔐 双人联合解密</div>
        <div style="font-size:13px;opacity:0.7;margin-bottom:10px;">需要两个人各自输入密码才能解锁</div>
        <div style="margin-bottom:8px;">
          <div style="font-size:12px;margin-bottom:4px;opacity:0.6;">👤 第一位密码</div>
          <input type="password" id="hbe-dual-pass1" placeholder="输入第一位密码..."
            style="width:100%;padding:8px 12px;border:2px solid var(--red-3,#ffafaf);border-radius:8px;
            background:var(--red-6,#fff7f7);color:var(--text-color);font-size:14px;outline:none;box-sizing:border-box;">
        </div>
        <div>
          <div style="font-size:12px;margin-bottom:4px;opacity:0.6;">👤 第二位密码</div>
          <input type="password" id="hbe-dual-pass2" placeholder="输入第二位密码..."
            style="width:100%;padding:8px 12px;border:2px solid var(--red-3,#ffafaf);border-radius:8px;
            background:var(--red-6,#fff7f7);color:var(--text-color);font-size:14px;outline:none;box-sizing:border-box;">
        </div>
        <div id="hbe-dual-status" style="margin-top:6px;font-size:12px;opacity:0.6;">
          ⚡ 两个密码都填好后点击解密
        </div>
      `;

      // 把输入框放在 submit 按钮前面
      submitBtn.parentNode.insertBefore(dualWrap, submitBtn);

      const pass1 = dualWrap.querySelector('#hbe-dual-pass1');
      const pass2 = dualWrap.querySelector('#hbe-dual-pass2');
      const status = dualWrap.querySelector('#hbe-dual-status');

      // 拦截原始 submit 逻辑
      const origClick = submitBtn.onclick;
      submitBtn.onclick = null; // 移除原有监听

      const doSubmit = () => {
        const p1 = pass1.value.trim();
        const p2 = pass2.value.trim();
        if (!p1) { status.innerHTML = '⚠️ 请输入第一位密码'; pass1.focus(); return; }
        if (!p2) { status.innerHTML = '⚠️ 请输入第二位密码'; pass2.focus(); return; }

        // 组合密码：第一位|第二位
        const combined = `${p1}|${p2}`;
        passInput.value = combined;
        passInput.style.display = '';
        status.innerHTML = '🔓 正在验证…';
        // 触发提交
        if (typeof origClick === 'function') origClick();
        else submitBtn.click();
      };

      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        doSubmit();
      });

      pass1.addEventListener('keydown', (e) => { if (e.key === 'Enter') pass2.focus(); });
      pass2.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
    });

    observer.observe(target, { childList: true, subtree: true });
  };

  /* ========== Feature #3 + #4 + #8: 解密成功回调 ========== */
  const initDecryptSuccess = () => {
    const handleDecrypt = () => {
      const achievements = loadAchievements();
      achievements.count += 1;
      saveAchievements(achievements);
      renderBadge(achievements);

      const milestone = checkMilestone(achievements);
      if (milestone) {
        setTimeout(() => mikuSay(`🎉 ${milestone.msg}`), 500);
      } else {
        setTimeout(() => {
          const msgs = [
            '又解开一篇！快看看里面有什么～',
            '密码正确！你果然是有缘人呢',
            '🔓 迷雾散去了……',
            '解密成功！要不要再看看别的文章？',
          ];
          mikuSay(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 500);
      }

      setTimeout(triggerFireworks, 800);

      if (Math.random() < 0.3) {
        setTimeout(() => {
          const isDark = document.body.classList.contains('dark-mode');
          if (!isDark) {
            switchToDarkMode();
            setTimeout(() => mikuSay('🌙 暗黑模式已开启，夜晚的世界更适合阅读秘密呢'), 1000);
          }
        }, 1500);
      }
    };

    window.addEventListener('hexo-blog-decrypt', handleDecrypt);
  };

  /* ========== 侧边栏成就徽章 ========== */
  const injectBadge = () => {
    const sidebar = document.querySelector('aside#sidebar');
    if (!sidebar) return;
    if (document.getElementById('hbe-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'hbe-badge';
    badge.className = 'widget-wrap';
    badge.style.cssText =
      'padding: 12px 16px; border-radius: 12px; ' +
      'background: var(--red-5-5, rgba(255,228,228,0.15)); ' +
      'border: 1px solid var(--red-5, rgba(255,228,228,0.15)); ' +
      'font-size: 13px; line-height: 1.6; ' +
      'color: var(--highlight-foreground, #666); text-align: center;';

    renderBadge(loadAchievements());

    const widgetArea = sidebar.querySelector('.sidebar-widget');
    if (widgetArea) widgetArea.appendChild(badge);
    else sidebar.appendChild(badge);
  };

  /* ========== 启动 ========== */
  const boot = () => {
    initFakeDecrypt();
    initClueMaze();
    initBurnAfterReading();
    initQuizUnlock();
    initDualDecrypt();
    initDecryptSuccess();
    setTimeout(injectBadge, 1000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('pjax:complete', () => {
    setTimeout(() => {
      initFakeDecrypt();
      initClueMaze();
      initBurnAfterReading();
      initQuizUnlock();
      initDualDecrypt();
      // 徽章 PJAX 后重新注入
      const existing = document.getElementById('hbe-badge');
      if (!existing) injectBadge();
      else renderBadge(loadAchievements());
    }, 200);
  });
})();

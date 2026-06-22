/* ============================================
 * 文章迷雾解锁系统 — 客户端脚本
 *
 * 迷雾锁类型：
 *   1. 时间锁 (unlock_date) — 到达指定日期才能看
 *   2. 进度锁 (read_required) — 读完 N 篇文章才能看
 *   3. 禁阅锁 (forbid_start / forbid_end) — 指定时间段内不能看
 *
 * 使用方式 (文章 front-matter):
 *   unlock_date: 2030-06-01          # 在此日期后才能看
 *   forbid_start: 2025-05-05         # 在此日期后不能看
 *   forbid_end: 2025-06-01           # 在此日期后才能看
 *   或者精确到分钟：
 *   forbid_start: 2026-01-01 16:30
 *   forbid_end: 2026-03-15 15:00
 *   read_required: 3                # 读满 N 篇才能看
 *   mist_title: "迷雾的标题"         # 自定义迷雾标题
 * ============================================ */

(() => {
  'use strict';

  /* ---- 工具函数 ---- */
  const getArticleEl = () => document.querySelector(
    'article[data-unlock-date], article[data-read-required], article[data-forbid-start], article[data-forbid-end]'
  );

  const getReadCount = () => {
    try { return parseInt(localStorage.getItem('mist_read_count') || '0', 10); }
    catch { return 0; }
  };

  const setReadCount = (n) => {
    try { localStorage.setItem('mist_read_count', String(n)); } catch { /* noop */ }
  };

  const markArticleRead = (slug) => {
    try {
      const key = `mist_read_${slug}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
      setReadCount(getReadCount() + 1);
    } catch { /* noop */ }
  };

  /** 解析日期字符串：支持 "2026-01-01" 或 "2026-01-01 16:30" */
  const parseDate = (str) => {
    if (!str) return null;
    const dt = str.trim();
    // "2026-01-01 16:30" 格式
    if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}$/.test(dt)) {
      return new Date(dt.replace(' ', 'T') + ':00');
    }
    // "2026-01-01" 格式 — 视为当天的 00:00
    return new Date(dt + 'T00:00:00');
  };

  /* 获取迷雾状态 */
  const getMistState = (el) => {
    const now = new Date();
    const unlockDate = parseDate(el.dataset.unlockDate);
    const forbidStart = parseDate(el.dataset.forbidStart);
    const forbidEnd = parseDate(el.dataset.forbidEnd);
    const readRequired = parseInt(el.dataset.readRequired || '0', 10);

    // 禁阅锁：
    //   forbid_start 单独使用 → 此日期之后永久禁阅
    //   forbid_start + forbid_end → 此时间段内禁阅
    let inForbid = false;
    let forbidTarget = null;
    if (forbidStart && forbidEnd) {
      // 时间段禁阅：start <= now < end
      inForbid = now >= forbidStart && now < forbidEnd;
      if (inForbid) forbidTarget = forbidEnd;
    } else if (forbidStart && !forbidEnd) {
      // 永久禁阅：now >= start
      inForbid = now >= forbidStart;
      forbidTarget = null; // 无倒计时
    }

    const timeLocked = unlockDate && now < unlockDate;
    const progressLocked = readRequired > 0 && getReadCount() < readRequired;

    return {
      locked: inForbid || timeLocked || progressLocked,
      inForbid,
      forbidTarget,
      timeLocked,
      progressLocked,
      unlockDate,
      forbidStart,
      forbidEnd,
      readRequired,
      readCount: getReadCount(),
    };
  };

  /* 计算剩余时间 */
  const getTimeRemaining = (target) => {
    const diff = target - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff,
    };
  };

  /* 格式化日期显示 */
  const formatDate = (d) => {
    if (!d) return '';
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };

  const formatDateTime = (d) => {
    if (!d) return '';
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${formatDate(d)} ${h}:${m}`;
  };

  /* 渲染迷雾遮罩 HTML */
  const renderOverlay = (state) => {
    const overlay = document.createElement('div');
    overlay.className = 'mist-overlay';

    let html = '<div class="mist-icon">🔮</div>';

    const title = document.querySelector('article')?.dataset.mistTitle || '被迷雾笼罩的文章';
    html += `<div class="mist-title">${title}</div>`;

    if (state.inForbid) {
      html += `<div class="mist-subtitle">⛔ 这篇文章在当前时间不可访问</div>`;
      if (state.forbidTarget) {
        // 有时间范围 → 显示倒计时
        html += `<div class="mist-countdown" id="mist-forbid-timer">
          ⛔ 不可访问期还剩<br>
          <span class="cd-num" id="cd-days">--</span> 天
          <span class="cd-num" id="cd-hours">--</span> 时
          <span class="cd-num" id="cd-minutes">--</span> 分
          <span class="cd-num" id="cd-seconds">--</span> 秒
        </div>`;
      } else {
        // 永久禁阅 → 无倒计时
        html += `<div class="mist-countdown">⛔ 这篇文章已被永久封印</div>`;
      }
    }

    if (state.timeLocked) {
      const dateStr = formatDateTime(state.unlockDate);
      html += `<div class="mist-subtitle">这篇被时间迷雾封印了<br>将在 ${dateStr} 揭晓</div>`;
      html += `<div class="mist-countdown" id="mist-countdown-timer">
        ⏳ <span class="cd-num" id="cd-days">--</span> 天
        <span class="cd-num" id="cd-hours">--</span> 时
        <span class="cd-num" id="cd-minutes">--</span> 分
        <span class="cd-num" id="cd-seconds">--</span> 秒
      </div>`;
    }

    if (state.progressLocked) {
      const pct = Math.min(100, Math.round((state.readCount / state.readRequired) * 100));
      html += '<div class="mist-subtitle">📖 需要阅读足够多的文章才能揭开迷雾</div>';
      html += `<div class="mist-progress">
        <span>已读 <strong>${state.readCount}</strong> / ${state.readRequired}</span>
        <div class="mist-progress-bar">
          <div class="mist-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
      const remain = state.readRequired - state.readCount;
      if (remain > 0) {
        html += `<div class="mist-countdown">📖 再读 <strong>${remain}</strong> 篇即可解锁</div>`;
      }
    }

    overlay.innerHTML = html;
    return overlay;
  };

  /* 更新倒计时 */
  const updateCountdown = (target, prefix) => {
    const r = getTimeRemaining(target);
    const id = (name) => `${prefix}-${name}`;
    const daysEl = document.getElementById(id('days'));
    if (!daysEl) return r.total > 0;
    daysEl.textContent = String(r.days).padStart(2, '0');
    document.getElementById(id('hours')).textContent = String(r.hours).padStart(2, '0');
    document.getElementById(id('minutes')).textContent = String(r.minutes).padStart(2, '0');
    document.getElementById(id('seconds')).textContent = String(r.seconds).padStart(2, '0');
    return r.total > 0;
  };

  /* ---- 监视器 ---- */
  const watchCountdown = (el, state) => {
    if (!state.locked) return;

    const prefix = state.inForbid ? 'cd' : 'cd';
    // 需要知道用 forbid_end 还是 unlockDate 作为目标
    const target = state.inForbid ? state.forbidTarget : state.unlockDate;
    if (!target) return;

    // 初始化显示
    updateCountdown(target, prefix);

    const timer = setInterval(() => {
      // 重新获取完整状态（因为可能跨过了 forbid 窗口）
      const fresh = getMistState(el);
      if (!fresh.locked) {
        el.classList.add('mist-unlocked');
        clearInterval(timer);
        return;
      }

      // 选择正确的目标
      const t = fresh.inForbid ? fresh.forbidTarget : fresh.unlockDate;
      updateCountdown(t, prefix);
    }, 1000);
  };

  const watchProgress = (el, state) => {
    if (!state.progressLocked) return;
    const timer = setInterval(() => {
      const cur = getReadCount();
      if (cur >= state.readRequired) {
        el.classList.add('mist-unlocked');
        clearInterval(timer);
      }
    }, 2000);
  };

  /* ---- 初始化 ---- */
  const init = () => {
    const el = getArticleEl();
    if (!el) return;

    const state = getMistState(el);

    // 没有锁 → 解锁并记录已读
    if (!state.locked) {
      el.classList.add('mist-unlocked');
      const slug = el.id?.replace(/^post-/, '');
      if (slug) markArticleRead(slug);
      return;
    }

    // 挂载迷雾遮罩
    const articleInner = el.querySelector('.article-inner');
    if (!articleInner) return;
    if (articleInner.querySelector('.mist-overlay')) return; // 防止 PJAX 重复
    const overlay = renderOverlay(state);
    articleInner.style.position = 'relative';
    articleInner.appendChild(overlay);

    const slug = el.id?.replace(/^post-/, '');
    if (slug && !state.progressLocked) markArticleRead(slug);

    // 启动监视器
    watchCountdown(el, state);
    watchProgress(el, state);
  };

  /* ---- 启动 ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('pjax:complete', () => setTimeout(init, 100));
})();

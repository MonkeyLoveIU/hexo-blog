/* ============================================
 * 写作目标进度环 — 客户端脚本
 *
 * 从 /writing-stats.json 读取数据
 * 在侧边栏渲染环形进度 + 统计
 * ============================================ */

(() => {
  'use strict';

  const fmt = (n) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };

  const C = 2 * Math.PI * 45; // 圆环周长

  const render = (el, data) => {
    const pct = Math.min(100, Math.round((data.totalWordsThisYear / data.annualGoal) * 100));
    const offset = C - (C * pct) / 100;

    el.innerHTML = `
      <div class="writing-goal-ring-container">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="writingGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="var(--red-1, #ff5252)" />
              <stop offset="100%" stop-color="var(--red-2, #ff7c7c)" />
            </linearGradient>
          </defs>
          <circle class="writing-goal-ring-bg" cx="50" cy="50" r="45" />
          <circle class="writing-goal-ring-fg" cx="50" cy="50" r="45"
            stroke-dasharray="${C}" stroke-dashoffset="${offset}" />
        </svg>
        <div class="writing-goal-ring-text">
          <div class="writing-goal-percent">${pct}%</div>
          <div class="writing-goal-label">已完成</div>
        </div>
      </div>
      <div class="writing-goal-stats">
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📝 今日日均</span>
          <span class="writing-goal-stat-value">${fmt(data.dailyAverage)} 字</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">🎯 年度目标</span>
          <span class="writing-goal-stat-value">${fmt(data.totalWordsThisYear)} / ${fmt(data.annualGoal)}</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📅 本月发文</span>
          <span class="writing-goal-stat-value">${data.thisMonthPosts} 篇</span>
        </div>
        <div class="writing-goal-stat">
          <span class="writing-goal-stat-label">📚 累计</span>
          <span class="writing-goal-stat-value">${fmt(data.totalWords)} 字 · ${data.totalPosts} 篇</span>
        </div>
      </div>
    `;
  };

  const init = () => {
    const el = document.getElementById('writing-goal-widget');
    if (!el) return;

    fetch('/writing-stats.json')
      .then((r) => r.json())
      .then((data) => render(el, data))
      .catch(() => {
        el.innerHTML = '<div class="writing-goal-loading">暂无数据</div>';
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('pjax:complete', () => setTimeout(init, 200));
})();

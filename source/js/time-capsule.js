/* ============================================
 * 留言时空胶囊 — 客户端
 *
 * 在文章页评论区展示「来自过去的信息」
 * 使用方式 (front-matter):
 *   time_capsule_date: 2026-12-25
 *   time_capsule_message: "圣诞节的你，还好吗？"
 * ============================================ */

(() => {
  const init = () => {
    const article = document.querySelector('article.h-entry');
    if (!article) return;

    fetch('/time-capsule-data.json')
      .then(r => r.json())
      .then(capsules => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

        // 找今天匹配的胶囊
        const match = capsules.find(c => c.date === todayStr);
        if (!match) return;

        // 找评论区容器
        const comments = document.getElementById('comments') || document.querySelector('.comment-content, #waline-comment');
        if (!comments) return;

        const capsule = document.createElement('div');
        capsule.className = 'time-capsule';
        capsule.innerHTML = `
          <div class="time-capsule-title">📜 时空胶囊 — "${match.title}"</div>
          <div class="time-capsule-message">${match.message}</div>
          <div class="time-capsule-date">🕰️ 这封信写于过去，于 ${todayStr} 开启</div>
        `;

        comments.parentNode.insertBefore(capsule, comments);
      })
      .catch(() => {});
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('pjax:complete', () => setTimeout(init, 200));
})();

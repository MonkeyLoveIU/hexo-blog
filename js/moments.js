import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

// Waline 评论初始化配置
const DEFAULT_WALINE_SERVER = 'https://waline.monkeyiu.icu';

const getWalineServer = () => {
  const server = window.REIMU_CONFIG?.waline_server || DEFAULT_WALINE_SERVER;
  return String(server).replace(/\/+$/, '');
};

const initMoments = () => {
  // 点赞功能
  document.querySelectorAll('.moments-like-btn').forEach(btn => {
    if (btn.dataset.momentsLikeBound === 'true') return;
    btn.dataset.momentsLikeBound = 'true';

    const momentId = btn.dataset.momentId;
    const countSpan = btn.querySelector('.moments-like-count');
    const iconPath = btn.querySelector('.moments-like-icon path');

    // 读取本地点赞状态
    const likedMoments = JSON.parse(localStorage.getItem('moments_liked') || '{}');
    if (likedMoments[momentId]) {
      btn.classList.add('liked');
      countSpan.textContent = likedMoments[momentId];
      iconPath.style.fill = '#ff5252';
    }

    btn.addEventListener('click', () => {
      const likedMoments = JSON.parse(localStorage.getItem('moments_liked') || '{}');
      let count = parseInt(likedMoments[momentId] || 0);

      if (btn.classList.contains('liked')) {
        // 取消点赞
        count--;
        if (count <= 0) {
          delete likedMoments[momentId];
          btn.classList.remove('liked');
          countSpan.textContent = '赞';
          iconPath.style.fill = '';
        } else {
          likedMoments[momentId] = count;
          countSpan.textContent = count;
        }
      } else {
        // 点赞
        count++;
        likedMoments[momentId] = count;
        btn.classList.add('liked');
        countSpan.textContent = count;
        iconPath.style.fill = '#ff5252';
      }
      localStorage.setItem('moments_liked', JSON.stringify(likedMoments));
    });
  });

  // 评论展开/收起
  document.querySelectorAll('.moments-comment-toggle').forEach(btn => {
    if (btn.dataset.momentsCommentBound === 'true') return;
    btn.dataset.momentsCommentBound = 'true';

    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const wrapper = document.querySelector(`#${targetId} .moments-comments-wrapper`);
      if (!wrapper) return;

      const isHidden = wrapper.style.display === 'none';
      wrapper.style.display = isHidden ? 'block' : 'none';

      // 如果是首次展开，初始化 Waline
      if (isHidden && !wrapper.dataset.initialized) {
        const walineEl = wrapper.querySelector('.moments-comments');
        if (walineEl) {
          init({
            el: `#${walineEl.id}`,
            serverURL: getWalineServer(),
            path: `/moments/${targetId}`,
            comment: true,
            reaction: ['❤️'],
            pageSize: 5,
            wordLimit: 200,
            requiredMeta: ['nick', 'mail'],
            login: 'force'
          });
          wrapper.dataset.initialized = 'true';
        }
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMoments, { once: true });
} else {
  initMoments();
}

document.addEventListener('pjax:complete', initMoments);
document.addEventListener('pjax:end', initMoments);

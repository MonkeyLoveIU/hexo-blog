/* ============================================
 * 花园寄语 — 随机切换
 * ============================================ */

const GARDEN_REVERIES = [
  '每篇文章都是一颗种子，迟早会发芽 🌱',
  '这个花园里，藏着主人走过的路、看过的风景',
  '阅读是漫步，写作是耕耘',
  '有时候最好的发现，是在旧文章里找到新的自己',
  '这里的每一篇文字，都是时间长河里的一粒沙',
  '看完了？那就去下一篇吧，花园里还有路要走',
  '"悟已往之不谏，知来者之可追"',
  '山在那里，文字在这里',
  '谢谢你来这个角落走走 🍃',
];

window.__gardenReverie = () => {
  const msg = GARDEN_REVERIES[Math.floor(Math.random() * GARDEN_REVERIES.length)];
  try {
    const tips = document.getElementById('live2d-tips');
    if (tips) {
      sessionStorage.setItem('live2d-priority', 99999);
      tips.innerHTML = msg;
      tips.classList.add('live2d-tips-active');
      setTimeout(() => {
        tips.classList.remove('live2d-tips-active');
        sessionStorage.removeItem('live2d-priority');
      }, 5000);
    } else {
      alert(msg);
    }
  } catch {}
};

/* ============================================
 * 花园寄语 — 随机切换
 * ============================================ */

const GARDEN_REVERIES = [
  '……',
  null,
  null,
  null,
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

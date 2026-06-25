/* ============================================
 * 留言精选墙 — 客户端脚本
 *
 * 从 Waline API 获取最近留言
 * 从 /messages-data.json 映射文章标题
 * 渲染瀑布流卡片
 * ============================================ */

(() => {
  'use strict';

  const WALINE_SERVER = 'https://waline-text-six.vercel.app';

  /** 相对时间 */
  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} 小时前`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} 天前`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} 个月前`;
    return `${Math.floor(months / 12)} 年前`;
  };

  /** 安全截断 HTML */
  const truncate = (text, max = 300) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  /** Gravatar URL */
  const gravatar = (mail) => {
    const email = (mail || '').trim().toLowerCase();
    // 内联简易 MD5（仅用于 Gravatar）
    const md5 = (s) => {
      const md5cycle = (x, k) => {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = FF(a, b, c, d, k[0], 7, -680876936);
        d = FF(d, a, b, c, k[1], 12, -389564586);
        c = FF(c, d, a, b, k[2], 17, 606105819);
        b = FF(b, c, d, a, k[3], 22, -1044525330);
        a = FF(a, b, c, d, k[4], 7, -176418897);
        d = FF(d, a, b, c, k[5], 12, 1200080426);
        c = FF(c, d, a, b, k[6], 17, -1473231341);
        b = FF(b, c, d, a, k[7], 22, -45705983);
        a = FF(a, b, c, d, k[8], 7, 1770035416);
        d = FF(d, a, b, c, k[9], 12, -1958414417);
        c = FF(c, d, a, b, k[10], 17, -42063);
        b = FF(b, c, d, a, k[11], 22, -1990404162);
        a = FF(a, b, c, d, k[12], 7, 1804603682);
        d = FF(d, a, b, c, k[13], 12, -40341101);
        c = FF(c, d, a, b, k[14], 17, -1502002290);
        b = FF(b, c, d, a, k[15], 22, 1236535329);
        a = GG(a, b, c, d, k[1], 5, -165796510);
        d = GG(d, a, b, c, k[6], 9, -1069501632);
        c = GG(c, d, a, b, k[11], 14, 643717713);
        b = GG(b, c, d, a, k[0], 20, -373897302);
        a = GG(a, b, c, d, k[5], 5, -701558691);
        d = GG(d, a, b, c, k[10], 9, 38016083);
        c = GG(c, d, a, b, k[15], 14, -660478335);
        b = GG(b, c, d, a, k[4], 20, -405537848);
        a = GG(a, b, c, d, k[9], 5, 568446438);
        d = GG(d, a, b, c, k[14], 9, -1019803690);
        c = GG(c, d, a, b, k[3], 14, -187363961);
        b = GG(b, c, d, a, k[8], 20, 1163531501);
        a = GG(a, b, c, d, k[13], 5, -1444681467);
        d = GG(d, a, b, c, k[2], 9, -51403784);
        c = GG(c, d, a, b, k[7], 14, 1735328473);
        b = GG(b, c, d, a, k[12], 20, -1926607734);
        a = HH(a, b, c, d, k[5], 4, -378558);
        d = HH(d, a, b, c, k[8], 11, -2022574463);
        c = HH(c, d, a, b, k[11], 16, 1839030562);
        b = HH(b, c, d, a, k[14], 23, -35309556);
        a = HH(a, b, c, d, k[1], 4, -1530992060);
        d = HH(d, a, b, c, k[4], 11, 1272893353);
        c = HH(c, d, a, b, k[7], 16, -155497632);
        b = HH(b, c, d, a, k[10], 23, -1094730640);
        a = HH(a, b, c, d, k[13], 4, 681279174);
        d = HH(d, a, b, c, k[0], 11, -358537222);
        c = HH(c, d, a, b, k[3], 16, -722521979);
        b = HH(b, c, d, a, k[6], 23, 76029189);
        a = HH(a, b, c, d, k[9], 4, -640364487);
        d = HH(d, a, b, c, k[12], 11, -421815835);
        c = HH(c, d, a, b, k[15], 16, 530742520);
        b = HH(b, c, d, a, k[2], 23, -995338651);
        a = II(a, b, c, d, k[0], 6, -198630844);
        d = II(d, a, b, c, k[7], 10, 1126891415);
        c = II(c, d, a, b, k[14], 15, -1416354905);
        b = II(b, c, d, a, k[5], 21, -57434055);
        a = II(a, b, c, d, k[12], 6, 1700485571);
        d = II(d, a, b, c, k[3], 10, -1894986606);
        c = II(c, d, a, b, k[10], 15, -1051523);
        b = II(b, c, d, a, k[1], 21, -2054922799);
        a = II(a, b, c, d, k[8], 6, 1873313359);
        d = II(d, a, b, c, k[15], 10, -30611744);
        c = II(c, d, a, b, k[6], 15, -1560198380);
        b = II(b, c, d, a, k[13], 21, 1309151649);
        a = II(a, b, c, d, k[4], 6, -145523070);
        d = II(d, a, b, c, k[11], 10, -1120210379);
        c = II(c, d, a, b, k[2], 15, 718787259);
        b = II(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
      };
      const cmn = (q, a, b, x, s, t) => add32(add32(a, q), add32(x, t)) << s | add32(add32(a, q), add32(x, t)) >>> (32 - s);
      const FF = (a, b, c, d, x, s, t) => cmn((b & c) | (~b & d), a, b, x, s, t);
      const GG = (a, b, c, d, x, s, t) => cmn((b & d) | (c & ~d), a, b, x, s, t);
      const HH = (a, b, c, d, x, s, t) => cmn(b ^ c ^ d, a, b, x, s, t);
      const II = (a, b, c, d, x, s, t) => cmn(c ^ (b | ~d), a, b, x, s, t);
      const add32 = (a, b) => (a + b) & 0xFFFFFFFF;
      const hex = (n) => (n >>> 0).toString(16).padStart(8, '0');
      const str2blks = (s) => {
        const n = ((s.length + 8) >> 6) + 1;
        const blks = new Array(n * 16);
        for (let i = 0; i < n * 16; i++) blks[i] = 0;
        for (let i = 0; i < s.length; i++) blks[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8);
        blks[s.length >> 2] |= 0x80 << ((s.length % 4) * 8);
        blks[n * 16 - 2] = s.length * 8;
        return blks;
      };
      const x = str2blks(s);
      let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
      for (let i = 0; i < x.length; i += 16) {
        const old = [a, b, c, d];
        md5cycle([a, b, c, d], x.slice(i, i + 16));
        a = add32(a, old[0]); b = add32(b, old[1]);
        c = add32(c, old[2]); d = add32(d, old[3]);
      }
      return hex(a) + hex(b) + hex(c) + hex(d);
    };
    return `https://gravatar.com/avatar/${md5(email)}?d=mp&s=80`;
  };

  const init = () => {
    const container = document.getElementById('messages-container');
    if (!container) return;

    // 并行请求
    Promise.all([
      fetch(`${WALINE_SERVER}/api/comment?type=recent&count=50`).then((r) => r.json()),
      fetch('/messages-data.json').then((r) => r.json()),
    ])
      .then(([comments, titleMap]) => {
        if (!Array.isArray(comments) || comments.length === 0) {
          container.innerHTML =
            '<div class="messages-empty">🌱 还没有留言，快来发表第一条留言吧！</div>';
          return;
        }

        container.innerHTML = '';
        comments.forEach((c, i) => {
          const nick = c.nick || '匿名用户';
          const mail = c.mail || '';
          const content = truncate(c.comment || c.content || '');
          const time = relativeTime(c.insertedAt || c.createdAt || c.time || Date.now());
          const path = c.path || c.url || '';
          const title = titleMap[path] || path || '未知来源';

          const card = document.createElement('div');
          card.className = 'message-card';
          card.style.animationDelay = `${i * 0.04}s`;
          card.innerHTML = `
            <div class="message-card-header">
              <img class="message-card-avatar" src="${gravatar(mail)}" alt="${nick}" loading="lazy">
              <span class="message-card-name">${nick}</span>
              <span class="message-card-time">${time}</span>
            </div>
            <div class="message-card-content">${content}</div>
            <div class="message-card-source">
              来自: <a href="/${path}">${title}</a>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(() => {
        container.innerHTML =
          '<div class="messages-error">😿 留言加载失败了，请稍后再试</div>';
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

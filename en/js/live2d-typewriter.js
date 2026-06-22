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
    if (days <= 3) return { mood: 'happy', icon: '🕺', msg: '最近更新了！好开心～要一起努力哦！', face: '正常' };
    if (days <= 7) return { mood: 'normal', icon: '😊', msg: '主人最近还好吗？', face: '正常' };
    if (days <= 14) return { mood: 'worried', icon: '😟', msg: '已经一周没更新了...主人是不是太忙了？', face: '正常' };
    if (days <= 30) return { mood: 'sad', icon: '😞', msg: '快半个月了…主人不要我了吗？', face: '伤心' };
    return { mood: 'angry', icon: '😤', msg: '一个月不更新！太过分了！哼！', face: '生气' };
  };

  /* ----- 每周不同主题 ----- */
  const WEEKLY_THEMES = [
    { keywords: ['旅行','山','嵩山','泰山','Mount'], msg: '这周是旅行周！想看看主人爬过的每一座山 🏔️' },
    { keywords: ['技术','Hexo','前端','搜索','图床'], msg: '技术周！这周我们来聊聊代码和折腾 🛠️' },
    { keywords: ['随笔','小感','日记','碎碎念'], msg: '日常周！听听主人最近的碎碎念 📝' },
    { keywords: ['电影','剧','纸钞屋','韩国'], msg: '影视周！主人好像又熬夜看剧了 📺' },
    { keywords: ['数学','高考','论文','Pandoc','学'], msg: '学习周！一起努力变强吧 💪' },
  ];

  const getWeeklyTheme = () => {
    const week = Math.floor((Date.now() / 604800000) % WEEKLY_THEMES.length);
    return WEEKLY_THEMES[week];
  };

  const initWeeklyTheme = () => {
    const theme = getWeeklyTheme();
    const sidebar = document.querySelector('aside#sidebar');
    if (!sidebar) return;

    // 在已发表的随机文章中找一篇匹配主题的
    fetch('/site-meta.json')
      .then(r => r.json())
      .then(() => {
        const el = document.createElement('div');
        el.style.cssText = 'margin-top:8px;padding:8px 12px;border-radius:8px;font-size:12px;text-align:center;background:rgba(255,78,106,0.06);border:1px solid rgba(255,78,106,0.15);opacity:0.8;';
        el.innerHTML = `📌 本周主题：${theme.msg}`;
        const insertAfter = () => {
          const badge = document.getElementById('guardian-badge') || document.getElementById('miku-game-widget');
          if (badge && badge.parentNode) badge.parentNode.insertBefore(el, badge.nextSibling);
          else { const wa = sidebar.querySelector('.sidebar-widget'); if (wa) wa.appendChild(el); else sidebar.appendChild(el); }
        };
        setTimeout(insertAfter, 2000);
      })
      .catch(() => {});
  };

  const initGuardian = () => {
    fetch('/site-meta.json')
      .then(r => r.json())
      .then(data => {
        const state = getGuardianState(data.daysSinceLastUpdate);
        guardianState = state.mood;

        // 侧边栏或 footer 显示博客状态
        const badge = document.createElement('div');
        badge.id = 'guardian-badge';
        badge.style.cssText =
          'margin-top:8px;padding:8px 12px;border-radius:8px;font-size:12px;' +
          'text-align:center;line-height:1.5;';

        if (state.mood === 'happy') {
          badge.style.background = 'rgba(76,175,80,0.1)';
          badge.style.border = '1px solid rgba(76,175,80,0.3)';
          badge.style.color = '#4caf50';
          badge.innerHTML = `🕺 Miku：主人最近很勤快呢！`;
        } else if (state.mood === 'sad') {
          badge.style.background = 'rgba(255,152,0,0.1)';
          badge.style.border = '1px solid rgba(255,152,0,0.3)';
          badge.style.color = '#ff9800';
          badge.innerHTML = `😞 Miku：好久没更新了…`;
        } else if (state.mood === 'angry') {
          badge.style.background = 'rgba(244,67,54,0.1)';
          badge.style.border = '1px solid rgba(244,67,54,0.3)';
          badge.style.color = '#f44336';
          badge.innerHTML = `😤 Miku：已经 ${data.daysSinceLastUpdate} 天没更新了！！`;
        } else {
          badge.style.opacity = '0.6';
          badge.innerHTML = `📝 上次更新：${data.daysSinceLastUpdate} 天前`;
        }

        // 注入到侧边栏
        const injectBadge = () => {
          if (document.getElementById('guardian-badge')) return;
          const sidebar = document.querySelector('aside#sidebar');
          if (!sidebar) { setTimeout(injectBadge, 500); return; }
          const gameWidget = document.getElementById('miku-game-widget');
          if (gameWidget && gameWidget.parentNode) {
            gameWidget.parentNode.insertBefore(badge, gameWidget.nextSibling);
          } else {
            const wa = sidebar.querySelector('.sidebar-widget');
            if (wa) wa.appendChild(badge);
            else sidebar.appendChild(badge);
          }
        };
        setTimeout(injectBadge, 1500);

        // 非 happy 状态，Miku 在首页会多说一句
        if (state.mood !== 'happy' && window.location.pathname === '/') {
          setTimeout(() => scene.say(state.msg, 6000), 4000);
        }
      })
      .catch(() => {});
  };

  /* ----- 原场景 ---- */
  const initScrollTrigger = () => {
    let hasTriggered = false;
    window.addEventListener('scroll', () => {
      if (hasTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.85) {
        hasTriggered = true;
        const msgs = guardianState === 'sad' ? ['居然看完了…谢谢你来看我','虽然主人不更新，但还有你在'] : ['居然全部看完了…给你点赞 👍','看完了！要不要翻翻其他文章？'];
        scene.say(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, { passive: true });
  };

  const initPageGreeting = () => {
    const path = window.location.pathname;
    let msg = '';
    if (path === '/' || path === '/index.html') {
      if (guardianState === 'angry') msg = '哼！你来了，但主人不更新有什么用…';
      else if (guardianState === 'sad') msg = '欢迎回家…虽然这里好久没变化了';
      else msg = '欢迎回家～ 看看主人最近写了什么吧';
    } else if (path.startsWith('/about')) msg = '想了解主人吗？他是个很有趣的人呢～';
    else if (path.startsWith('/friend')) msg = '来认识主人的朋友们吧！';
    else if (path.startsWith('/gallery')) msg = '来看看主人拍的照片！';
    else if (path.startsWith('/diary')) msg = '主人的碎碎念都在这里啦～';
    else if (path.match(/^\/(\d{4})\//)) msg = guardianState === 'angry' ? '又来看旧文章吗…' : '又有新文章可以看啦～';
    if (msg) setTimeout(() => scene.say(msg, 5000), 800);
  };

  const initNightCheck = () => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      setTimeout(() => { scene.say('这么晚了还不睡！要注意身体呀 ⚠️', 5000); }, 5000);
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
    console.log('[Live2D Scene] 智能对话系统已启动 ✨');
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

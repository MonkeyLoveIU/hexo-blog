/* ============================================
 * Live2D 智能场景对话系统（增强版）
 * 功能：
 *   1. 打字机效果逐字输出
 *   2. 场景感知：滚动底部、停留时长、深夜、页面类型
 *   3. 对话框星空魔法样式
 * ============================================ */

(() => {
  'use strict';

  const TYPING_SPEED = 60;
  const COOLDOWN = 800;
  const SCENE_PRIORITY = 50; // 高于插件默认优先级(1~4)

  let typing = false;
  let locked = false;
  let currentTimer = null;
  let lastText = '';
  let sceneTimer = null;     // 场景消息定时器
  let stayTimer = null;      // 停留时长定时器

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

  /* ----- 场景消息管理器 ----- */
  const scene = {
    /** 显示一条场景消息（高优先级，不会被插件普通消息覆盖） */
    say(text, timeout = 6000) {
      const el = document.getElementById('live2d-tips');
      if (!el) return;
      // 设置高优先级，阻止插件低优先级消息覆盖
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

  /* ----- 场景触发逻辑 ----- */

  /** 1. 滚动到底部时 */
  const initScrollTrigger = () => {
    let hasTriggered = false;
    window.addEventListener('scroll', () => {
      if (hasTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.85) {
        hasTriggered = true;
        scene.say('居然全部看完了…给你点赞 👍');
      }
    }, { passive: true });
  };

  /** 2. 页面类型感知 */
  const initPageGreeting = () => {
    const path = window.location.pathname;
    let msg = '';
    if (path === '/' || path === '/index.html') {
      msg = '欢迎回家～ 看看主人最近写了什么吧';
    } else if (path.startsWith('/about')) {
      msg = '想了解主人吗？他是个很有趣的人呢～';
    } else if (path.startsWith('/friend')) {
      msg = '来认识主人的朋友们吧！';
    } else if (path.startsWith('/gallery')) {
      msg = '来看看主人拍的照片！';
    } else if (path.startsWith('/diary')) {
      msg = '主人的碎碎念都在这里啦～';
    } else if (path.startsWith('/archives')) {
      msg = '所有的文章都归档在这里了';
    } else if (path.startsWith('/tags')) {
      msg = '按标签找文章很方便哦';
    } else if (path.startsWith('/categories')) {
      msg = '分类浏览也不错呢';
    } else if (path.match(/^\/(\d{4})\//)) {
      // 文章页
      msg = '又有新文章可以看啦～';
    }
    if (msg) {
      setTimeout(() => scene.say(msg, 5000), 800);
    }
  };

  /** 3. 深夜提醒（23:00 - 5:00） */
  const initNightCheck = () => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      setTimeout(() => {
        scene.say('这么晚了还不睡！要注意身体呀 ⚠️', 5000);
      }, 5000);
    }
  };

  /** 4. 停留时长提醒 */
  const initStayTimer = () => {
    stayTimer = setTimeout(() => {
      scene.say('看了好一会儿了呢，要喝杯水休息下吗～', 5000);
    }, 120000); // 2分钟
  };

  /* ----- MutationObserver（接管插件对话进行打字机效果） ----- */
  const initObserver = () => {
    const target = document.getElementById('live2d-tips');
    if (!target) {
      setTimeout(initObserver, 500);
      return;
    }

    const observer = new MutationObserver(() => {
      if (typing) return;
      const text = target.textContent.trim();
      if (!text) return;
      if (text === lastText) return;
      if (locked) {
        target.textContent = lastText;
        return;
      }
      lastText = text;
      typewrite(target, text);
    });

    observer.observe(target, { childList: true, subtree: true, characterData: true });

    // 用户交互解锁
    const waifu = document.getElementById('waifu') || document.getElementById('live2d-plugin');
    if (waifu) {
      waifu.addEventListener('click', unlock);
      waifu.addEventListener('mouseenter', unlock);
    }
    target.addEventListener('click', unlock);

    console.log('[Live2D Scene] 智能对话系统已启动 ✨');
  };

  // 启动所有
  const boot = () => {
    initObserver();
    initScrollTrigger();
    initNightCheck();
    initStayTimer();
    // 页面欢迎词延迟一点，等插件完全加载
    setTimeout(initPageGreeting, 1500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

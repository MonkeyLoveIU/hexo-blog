/* ============================================
 * Miku 互动小游戏 — 主模块
 *
 * 功能：
 *   A. 戳 Miku — canvas 上覆盖 3 个热区（头/身体/脚）
 *      点击升级台词 + 侧边栏统计
 *   B. 猜拳 — 和 Miku 玩石头剪刀布
 * ============================================ */

(() => {
  'use strict';

  /* ========== 常量 ========== */
  const LS_POKE = 'miku_poke';
  const LS_RPS = 'miku_rps';

  const RPS_EMOJI = { rock: '✊', scissors: '✌️', paper: '✋' };
  const RPS_NAME = { rock: '石头', scissors: '剪刀', paper: '布' };
  const RPS_BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

  /* ========== localStorage 工具 ========== */
  const loadPoke = () => {
    try { return JSON.parse(localStorage.getItem(LS_POKE)) || { total: 0, head: 0, body: 0, feet: 0, milestone: 0 }; }
    catch { return { total: 0, head: 0, body: 0, feet: 0, milestone: 0 }; }
  };

  const savePoke = (d) => {
    try { localStorage.setItem(LS_POKE, JSON.stringify(d)); } catch { /* noop */ }
  };

  const loadRps = () => {
    try { return JSON.parse(localStorage.getItem(LS_RPS)) || { wins: 0, losses: 0, ties: 0, total: 0, streak: 0, bestStreak: 0 }; }
    catch { return { wins: 0, losses: 0, ties: 0, total: 0, streak: 0, bestStreak: 0 }; }
  };

  const saveRps = (d) => {
    try { localStorage.setItem(LS_RPS, JSON.stringify(d)); } catch { /* noop */ }
  };

  /* ========== Miku 说话 ========== */
  const mikuSay = (text, timeout) => {
    try {
      const tips = document.getElementById('live2d-tips');
      if (tips) {
        sessionStorage.setItem('live2d-priority', 99999);
        tips.innerHTML = text;
        tips.classList.add('live2d-tips-active');
        if (window.__mikuGameMsgTimer) clearTimeout(window.__mikuGameMsgTimer);
        window.__mikuGameMsgTimer = setTimeout(() => {
          tips.classList.remove('live2d-tips-active');
          sessionStorage.removeItem('live2d-priority');
          window.__mikuGameMsgTimer = null;
        }, timeout || 5000);
      }
    } catch { /* noop */ }
  };

  /* ========== A: 热区系统 ========== */
  const ZONES = ['head', 'body', 'feet'];
  const ZONE_NAMES = { head: '头', body: '身体', feet: '脚' };
  const ZONE_MSGS = {
    head: [
      '摸头会长不高的！',
      '别碰我头发，弄乱了啦！',
      '头…头是敏感部位啦！hentai！',
      '你再摸头我要生气了哦！',
      '你是摸头狂魔吗！！都摸了 {total} 次了！',
    ],
    body: [
      '是…是不小心碰到了吧…',
      '干嘛动我呀！小心我咬你！',
      '别摸我，有什么好摸的！',
      '再摸的话我可要报警了！⌇●﹏●⌇',
      '变态！你已经摸了我 {total} 次了！',
    ],
    feet: [
      '呀！别碰我的脚！',
      '好痒啊哈哈哈～',
      '脚…脚有什么好摸的！',
      '你这是什么奇怪的癖好啊！',
      '救命啊这里有足控变态！！',
    ],
  };

  const injectHitzones = () => {
    if (document.getElementById('live2d-hit-zone')) return;
    const plugin = document.getElementById('live2d-plugin');
    if (!plugin) return;

    const container = document.createElement('div');
    container.id = 'live2d-hit-zone';

    ZONES.forEach((zone) => {
      const div = document.createElement('div');
      div.id = `live2d-hit-${zone}`;
      div.className = 'miku-hitzone';
      div.dataset.zone = zone;
      container.appendChild(div);
    });

    plugin.appendChild(container);
    // 事件委托绑定
    container.addEventListener('click', onHitzoneClick);
  };

  const onHitzoneClick = (e) => {
    const div = e.target.closest('.miku-hitzone');
    if (!div) return;
    const zone = div.dataset.zone;
    if (!zone) return;

    const data = loadPoke();
    data.total++;
    data[zone]++;
    data.lastPoke = Date.now();

    const msgs = ZONE_MSGS[zone];
    const idx = Math.min(Math.floor(data.total / 10), msgs.length - 1);
    let msg = msgs[idx].replace('{total}', data.total);

    // 里程碑
    if (data.total > 0 && data.total % 10 === 0 && data.total <= 50) {
      msg += '<br><span style="font-size:11px;opacity:0.7;">🎯 里程碑：{total} 次达成！</span>'.replace('{total}', data.total);
    }

    data.milestone = idx;
    savePoke(data);
    mikuSay(msg);
    updatePokeDisplay(data);
  };

  /* ========== B: 猜拳系统 ========== */
  let rpsUIVisible = false;

  const playRPS = (playerChoice) => {
    const mikuChoice = ZONES[Math.floor(Math.random() * 3)];
    let result;
    if (playerChoice === mikuChoice) result = 'tie';
    else if (RPS_BEATS[playerChoice] === mikuChoice) result = 'win';
    else result = 'lose';

    const data = loadRps();
    data.total++;
    if (result === 'win') { data.wins++; data.streak++; data.bestStreak = Math.max(data.bestStreak, data.streak); }
    else if (result === 'lose') { data.losses++; data.streak = 0; }
    else data.ties++;
    saveRps(data);
    updateRpsDisplay(data);

    // 对话
    const mikuEmoji = RPS_EMOJI[mikuChoice];
    const mikuName = RPS_NAME[mikuChoice];
    const playerEmoji = RPS_EMOJI[playerChoice];
    const playerName = RPS_NAME[playerChoice];

    let msg;
    if (result === 'win') {
      const winMsgs = [
        `哼！你出${playerName}，我出${mikuName}... 算你走运！`,
        `不可能！你居然赢了？再来！`,
        `我才没有放水呢！你出${playerName}${playerEmoji}赢了而已！`,
      ];
      msg = winMsgs[Math.floor(Math.random() * winMsgs.length)];
      if (data.streak >= 3) msg = `连续赢 ${data.streak} 次了…你一定作弊了吧！😠`;
    } else if (result === 'lose') {
      const loseMsgs = [
        `哈哈！我出${mikuName}${mikuEmoji}，你输啦～`,
        `就这？连我出${mikuName}都赢不了～`,
        `菜菜菜！要不要我教你啊？`,
      ];
      msg = loseMsgs[Math.floor(Math.random() * loseMsgs.length)];
      if (data.losses >= 10) msg = `你已经输给我 ${data.losses} 次了，还玩吗？😏`;
    } else {
      msg = `咦？都出${mikuName}，平手！再来！`;
    }
    msg += `<br><span style="font-size:11px;opacity:0.6;">${playerEmoji} ${playerName} vs ${mikuEmoji} ${mikuName}</span>`;
    mikuSay(msg, 6000);
  };

  /* ========== 侧边栏面板 ========== */
  let widgetInjected = false;

  const updatePokeDisplay = (data) => {
    const d = data || loadPoke();
    ZONES.forEach((z) => {
      const el = document.getElementById(`miku-poke-${z}`);
      if (el) el.textContent = d[z];
    });
    const totalEl = document.getElementById('miku-poke-total');
    if (totalEl) totalEl.textContent = d.total;
  };

  const updateRpsDisplay = (data) => {
    const d = data || loadRps();
    const el = document.getElementById('miku-rps-score');
    if (el) {
      el.innerHTML = `胜 ${d.wins} / 负 ${d.losses} / 平 ${d.ties}${d.streak >= 2 ? `<br><span style="font-size:11px;color:var(--red-1);">🔥 连胜 ${d.streak}</span>` : ''}`;
    }
  };

  const toggleRPS = () => {
    rpsUIVisible = !rpsUIVisible;
    const ui = document.getElementById('miku-rps-ui');
    const btn = document.getElementById('miku-rps-btn');
    if (ui && btn) {
      ui.style.display = rpsUIVisible ? 'block' : 'none';
      btn.textContent = rpsUIVisible ? '✖ 关闭' : '🎮 和 Miku 玩猜拳';
    }
  };

  const injectSidebarWidget = () => {
    if (document.getElementById('miku-game-widget')) return;
    if (widgetInjected) return;

    const sidebar = document.querySelector('aside#sidebar');
    if (!sidebar) return;

    const poke = loadPoke();
    const rps = loadRps();

    let html = '<div class="widget-wrap" id="miku-game-widget">';
    html += '<div class="widget-title" style="margin-bottom:12px;font-weight:700;color:var(--red-1);font-size:1.1em;display:flex;align-items:center;">';
    html += '<span style="margin-right:8px;">🎮</span> Miku 互动</div>';
    html += '<div class="widget" style="text-align:center;">';

    // --- 戳 Miku ---
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-size:12px;font-weight:600;margin-bottom:6px;opacity:0.7;">👆 戳 Miku</div>';
    html += '<div class="miku-stat-row"><span>总次数</span><span class="miku-stat-val" id="miku-poke-total">' + poke.total + '</span></div>';
    ZONES.forEach((z) => {
      html += '<div class="miku-stat-row"><span>' + ZONE_NAMES[z] + '</span><span class="miku-stat-val" id="miku-poke-' + z + '">' + poke[z] + '</span></div>';
    });
    html += '</div>';

    // --- 分隔 ---
    html += '<div style="height:1px;background:var(--red-5, rgba(255,228,228,0.3));margin:10px 0;"></div>';

    // --- 猜拳 ---
    html += '<div>';
    html += '<button id="miku-rps-btn" class="miku-game-btn" onclick="window.__toggleRPS && window.__toggleRPS()">🎮 和 Miku 玩猜拳</button>';
    html += '<div id="miku-rps-ui" style="display:none;margin-top:8px;">';
    html += '<div style="display:flex;justify-content:center;gap:8px;margin-bottom:6px;">';
    html += '<button class="miku-rps-choice" data-choice="rock" style="width:48px;height:48px;border-radius:50%;border:1px solid var(--red-3,#ffafaf);background:var(--red-6,#fff7f7);font-size:22px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.transform=\'scale(1.15)\'" onmouseout="this.style.transform=\'scale(1)\'">✊</button>';
    html += '<button class="miku-rps-choice" data-choice="scissors" style="width:48px;height:48px;border-radius:50%;border:1px solid var(--red-3,#ffafaf);background:var(--red-6,#fff7f7);font-size:22px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.transform=\'scale(1.15)\'" onmouseout="this.style.transform=\'scale(1)\'">✌️</button>';
    html += '<button class="miku-rps-choice" data-choice="paper" style="width:48px;height:48px;border-radius:50%;border:1px solid var(--red-3,#ffafaf);background:var(--red-6,#fff7f7);font-size:22px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.transform=\'scale(1.15)\'" onmouseout="this.style.transform=\'scale(1)\'">✋</button>';
    html += '</div>';
    html += '<div id="miku-rps-score" style="font-size:12px;opacity:0.7;">胜 ' + rps.wins + ' / 负 ' + rps.losses + ' / 平 ' + rps.ties + '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div></div>';

    const temp = document.createElement('div');
    temp.innerHTML = html;
    const widget = temp.firstElementChild;

    // 注入到 sidebar
    const widgetArea = sidebar.querySelector('.sidebar-widget');
    if (widgetArea) {
      widgetArea.appendChild(widget);
    } else {
      const wrap = sidebar.querySelector('.sidebar-wrapper-container');
      if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(widget, wrap.nextSibling);
      else sidebar.appendChild(widget);
    }

    widgetInjected = true;

    // 绑定猜拳事件
    widget.querySelectorAll('.miku-rps-choice').forEach((btn) => {
      btn.addEventListener('click', () => playRPS(btn.dataset.choice));
    });
  };

  window.__toggleRPS = toggleRPS;

  /* ========== 销毁 ========== */
  const destroy = () => {
    const hitZone = document.getElementById('live2d-hit-zone');
    if (hitZone) hitZone.remove();
    const widget = document.getElementById('miku-game-widget');
    if (widget) widget.remove();
    widgetInjected = false;
  };

  /* ========== 启动 ========== */
  const init = () => {
    injectHitzones();
    injectSidebarWidget();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pjax:send', destroy);
  window.addEventListener('pjax:complete', () => setTimeout(init, 150));
})();

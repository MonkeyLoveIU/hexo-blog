/* ============================================
 * Miku 互动小游戏 — 主模块
 *
 * 功能：
 *   A. 戳 Miku — canvas 上覆盖 3 个热区（头/身体/脚）
 *   B. 猜拳 — 和 Miku 玩石头剪刀布
 *   C. 骰子 — 酒吧骰子比大小
 *   D. 老虎机 — 每日免费 5 次
 * ============================================ */

(() => {
  'use strict';

  const LS_POKE = 'miku_poke';
  const LS_RPS = 'miku_rps';
  const LS_DICE = 'miku_dice';
  const LS_SLOT = 'miku_slot';

  const RPS_EMOJI = { rock: '✊', scissors: '✌️', paper: '✋' };
  const RPS_NAME = { rock: '石头', scissors: '剪刀', paper: '布' };
  const RPS_BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
  const RPS_CHOICES = Object.keys(RPS_EMOJI);

  // 老虎机符号（权重越高越常见）
  const SLOT_SYMBOLS = [
    { sym: '🍒', weight: 30, name: '樱桃' },
    { sym: '🍋', weight: 25, name: '柠檬' },
    { sym: '⭐', weight: 15, name: '星星' },
    { sym: '🍀', weight: 10, name: '四叶草' },
    { sym: '🎤', weight: 8, name: '麦克风' },
    { sym: '👑', weight: 6, name: '皇冠' },
    { sym: '💎', weight: 4, name: '钻石' },
    { sym: '🎰', weight: 2, name: '777' },
  ];

  // 奖级表
  const SLOT_PRIZES = [
    { match: 3, sym: '🍒', prize: '🎉 小奖！', msg: '三个樱桃！今天的运气不错嘛～' },
    { match: 3, sym: '🍋', prize: '🎉 小奖！', msg: '柠檬三连！酸酸甜甜就是你～' },
    { match: 3, sym: '⭐', prize: '⭐ 星星奖！', msg: '三星连珠！你被幸运星选中了！' },
    { match: 3, sym: '🍀', prize: '🍀 好运奖！', msg: '四叶草！好运要来了哦～' },
    { match: 3, sym: '🎤', prize: '🎤 Miku 奖！', msg: '三个麦克风！你是最懂我的人！' },
    { match: 3, sym: '👑', prize: '👑 皇冠奖！', msg: '皇冠三连！今天你就是国王！' },
    { match: 3, sym: '💎', prize: '💎 钻石奖！', msg: '钻石！你发大财了！！' },
    { match: 3, sym: '🎰', prize: '🎰 头奖！！', msg: '🎰🎰🎰 头奖！！！你在开玩笑吧！！！' },
    { match: 2, prize: '📯 两连！', msg: '两个一样，再来一次说不定就三个了！' },
  ];

  const DAILY_FREE = 5;

  /* ========== localStorage ========== */
  const loadPoke = () => { try { return JSON.parse(localStorage.getItem(LS_POKE)) || { total: 0, head: 0, body: 0, feet: 0, milestone: 0 }; } catch { return { total: 0, head: 0, body: 0, feet: 0, milestone: 0 }; } };
  const savePoke = (d) => { try { localStorage.setItem(LS_POKE, JSON.stringify(d)); } catch {} };

  const loadRps = () => { try { return JSON.parse(localStorage.getItem(LS_RPS)) || { wins: 0, losses: 0, ties: 0, total: 0, streak: 0, bestStreak: 0 }; } catch { return { wins: 0, losses: 0, ties: 0, total: 0, streak: 0, bestStreak: 0 }; } };
  const saveRps = (d) => { try { localStorage.setItem(LS_RPS, JSON.stringify(d)); } catch {} };

  const loadDice = () => { try { return JSON.parse(localStorage.getItem(LS_DICE)) || { wins: 0, losses: 0, total: 0, bestRoll: 0, mikuBestRoll: 0 }; } catch { return { wins: 0, losses: 0, total: 0, bestRoll: 0, mikuBestRoll: 0 }; } };
  const saveDice = (d) => { try { localStorage.setItem(LS_DICE, JSON.stringify(d)); } catch {} };

  const loadSlot = () => {
    try {
      const d = JSON.parse(localStorage.getItem(LS_SLOT));
      // 检查今天日期，重置剩余次数
      const today = new Date().toDateString();
      if (d && d.date === today) return d;
      return { date: today, remaining: DAILY_FREE, total: 0, plays: 0, bestPrize: '' };
    } catch { return { date: new Date().toDateString(), remaining: DAILY_FREE, total: 0, plays: 0, bestPrize: '' }; }
  };
  const saveSlot = (d) => { try { localStorage.setItem(LS_SLOT, JSON.stringify(d)); } catch {} };

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
    } catch {}
  };

  const spawnParticles = (originEl, count) => {
    count = count || 12;
    const rect = originEl.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const colors = ['#B19CD9', '#F8EEFF', '#7B68EE', '#E6D3FF', '#C4A0FF', '#FFFFFF', '#FFD700'];
    const ps = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div'); p.className = 'rps-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 50;
      const size = 4 + Math.random() * 4;
      const c = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px;background:${c};box-shadow:0 0 4px ${c};`;
      ps.push(p);
    }
    const frag = document.createDocumentFragment();
    ps.forEach(p => frag.appendChild(p));
    document.body.appendChild(frag);
    setTimeout(() => ps.forEach(p => p.remove()), 700);
  };

  /* ========== A: 热区 ========== */
  const ZONES = ['head', 'body', 'feet'];
  const ZONE_NAMES = { head:'头', body:'身体', feet:'脚' };
  const ZONE_MSGS = {
    head: ['摸头会长不高的！','别碰我头发，弄乱了啦！','头…头是敏感部位啦！hentai！','你再摸头我要生气了哦！','你是摸头狂魔吗！！都摸了 {total} 次了！'],
    body: ['是…是不小心碰到了吧…','干嘛动我呀！小心我咬你！','别摸我，有什么好摸的！','再摸的话我可要报警了！⌇●﹏●⌇','变态！你已经摸了我 {total} 次了！'],
    feet: ['呀！别碰我的脚！','好痒啊哈哈哈～','脚…脚有什么好摸的！','你这是什么奇怪的癖好啊！','救命啊这里有足控变态！！'],
  };

  const injectHitzones = () => {
    if (document.getElementById('live2d-hit-zone')) return;
    const plugin = document.getElementById('live2d-plugin');
    if (!plugin) return;
    const c = document.createElement('div'); c.id = 'live2d-hit-zone';
    ZONES.forEach(z => { const d = document.createElement('div'); d.id = `live2d-hit-${z}`; d.className = 'miku-hitzone'; d.dataset.zone = z; c.appendChild(d); });
    plugin.appendChild(c);
    c.addEventListener('click', (e) => {
      const div = e.target.closest('.miku-hitzone'); if (!div) return;
      const zone = div.dataset.zone; if (!zone) return;
      const data = loadPoke(); data.total++; data[zone]++;
      const msgs = ZONE_MSGS[zone];
      const idx = Math.min(Math.floor(data.total / 10), msgs.length - 1);
      let msg = msgs[idx].replace('{total}', data.total);
      if (data.total > 0 && data.total % 10 === 0 && data.total <= 50) msg += '<br><span style="font-size:11px;opacity:0.7;">🎯 里程碑：{total} 次达成！</span>'.replace('{total}', data.total);
      data.milestone = idx; savePoke(data); mikuSay(msg);
      const el = document.getElementById('miku-poke-total'); if (el) el.textContent = data.total;
      ZONES.forEach(z2 => { const e2 = document.getElementById(`miku-poke-${z2}`); if (e2) e2.textContent = data[z2]; });
    });
  };

  /* ========== B: 猜拳 ========== */
  const playRPS = (playerChoice, btnEl) => {
    btnEl.classList.add('miku-rps-flash'); spawnParticles(btnEl);
    setTimeout(() => btnEl.classList.remove('miku-rps-flash'), 120);
    const mikuChoice = RPS_CHOICES[Math.floor(Math.random() * 3)];
    let result; let win = 0, lose = 0, tie = 0;
    if (playerChoice === mikuChoice) { result = 'tie'; tie = 1; }
    else if (RPS_BEATS[playerChoice] === mikuChoice) { result = 'win'; win = 1; }
    else { result = 'lose'; lose = 1; }
    const data = loadRps(); data.total++; data.wins += win; data.losses += lose; data.ties += tie;
    if (win) { data.streak++; data.bestStreak = Math.max(data.bestStreak, data.streak); } else data.streak = 0;
    saveRps(data);
    const rpsEl = document.getElementById('miku-rps-score');
    if (rpsEl) rpsEl.innerHTML = `胜 ${data.wins} / 负 ${data.losses} / 平 ${data.ties}${data.streak >= 2 ? `<br><span style="font-size:11px;color:var(--red-1);">🔥 连胜 ${data.streak}</span>` : ''}`;

    const row = btnEl.closest('.miku-rps-row');
    const btns = row ? row.querySelectorAll('.miku-rps-choice') : [];
    const overlay = document.getElementById('miku-vs-overlay');
    if (!overlay || !row) return;
    btns.forEach(b => b.style.display = 'none'); overlay.style.display = 'flex';
    overlay.innerHTML = `<span style="font-size:32px;animation:vsPop 0.3s ease;">${RPS_EMOJI[playerChoice]}</span><span style="font-size:16px;font-weight:800;color:#F8EEFF;text-shadow:0 0 15px rgba(177,156,217,0.9);animation:vsPop 0.3s ease 0.1s both;">VS</span><span style="font-size:32px;animation:vsPop 0.3s ease 0.2s both;">${RPS_EMOJI[mikuChoice]}</span>`;
    setTimeout(() => {
      overlay.style.display = 'none'; overlay.innerHTML = ''; btns.forEach(b => b.style.display = '');
      const me = RPS_EMOJI[mikuChoice], mn = RPS_NAME[mikuChoice], pe = RPS_EMOJI[playerChoice], pn = RPS_NAME[playerChoice];
      let msg;
      if (win) msg = data.streak >= 3 ? `连续赢 ${data.streak} 次了…你一定作弊了吧！😠` : [`哼！你出${pn}，我出${mn}... 算你走运！`,`不可能！你居然赢了？再来！`,`我才没有放水呢！你出${pn}${pe}赢了而已！`][Math.floor(Math.random()*3)];
      else if (lose) msg = data.losses >= 10 ? `你已经输给我 ${data.losses} 次了，还玩吗？😏` : [`哈哈！我出${mn}${me}，你输啦～`,`就这？连我出${mn}都赢不了～`,`菜菜菜！要不要我教你啊？`][Math.floor(Math.random()*3)];
      else msg = `咦？都出${mn}，平手！再来！`;
      msg += `<br><span style="font-size:11px;opacity:0.6;">${pe} ${pn} vs ${me} ${mn}</span>`;
      mikuSay(msg, 6000);
    }, 1200);
  };

  /* ========== C: 骰子 ========== */
  const playDice = () => {
    const btn = document.getElementById('miku-dice-btn'), pEl = document.getElementById('miku-dice-player'), mEl = document.getElementById('miku-dice-miku'), rEl = document.getElementById('miku-dice-result');
    if (!pEl || !mEl) return;
    rEl.textContent = '🎲 掷骰中...'; if (btn) btn.disabled = true;
    const rd = () => Array.from({length:3}, () => Math.floor(Math.random()*6)+1);
    const h = v => v.map(x => `<span class="miku-die">${x}</span>`).join('');
    let f = 0;
    const t = setInterval(() => {
      const fk = [1,2,3,4,5,6].sort(() => Math.random()-0.5).slice(0,3);
      const fk2 = [1,2,3,4,5,6].sort(() => Math.random()-0.5).slice(0,3);
      pEl.innerHTML = h(fk); mEl.innerHTML = h(fk2);
      pEl.querySelectorAll('.miku-die').forEach(d => d.classList.add('rolling'));
      mEl.querySelectorAll('.miku-die').forEach(d => d.classList.add('rolling'));
      f++;
      if (f >= 12) {
        clearInterval(t);
        const p = rd(), m = rd(), pm = Math.max(...p), mm = Math.max(...m);
        const pa = p.every(v => v === p[0]), ma = m.every(v => v === m[0]);
        pEl.innerHTML = h(p); mEl.innerHTML = h(m);
        if (pa) pEl.querySelectorAll('.miku-die').forEach(d => d.classList.add('yahtzee'));
        if (ma) mEl.querySelectorAll('.miku-die').forEach(d => d.classList.add('yahtzee'));
        let res;
        if (pa && ma) res = pm >= mm ? 'w' : 'l';
        else if (pa) res = 'w';
        else if (ma) res = 'l';
        else res = pm > mm ? 'w' : pm < mm ? 'l' : 't';
        const data = loadDice(); data.total++;
        if (res === 'w') data.wins++; else if (res === 'l') data.losses++;
        data.bestRoll = Math.max(data.bestRoll, pm); data.mikuBestRoll = Math.max(data.mikuBestRoll, mm);
        saveDice(data);
        const se = document.getElementById('miku-dice-score');
        if (se) se.innerHTML = `胜 ${data.wins} / 负 ${data.losses}<br><span style="font-size:11px;opacity:0.6;">你最高 ${data.bestRoll} | Miku 最高 ${data.mikuBestRoll}</span>`;
        let msg;
        if (res === 'w') msg = pa ? `🎯 我掷出了豹子！你输定啦！` : [`嘿嘿，${pm} 比 ${mm}，我赢了～`,`幸运女神站在我这边！${pm} > ${mm}`][Math.floor(Math.random()*2)];
        else if (res === 'l') msg = ma ? `😱 豹子！！这不可能！` : [`切，${pm} 比 ${mm}，你运气好而已`,`你赢了…但我不会认输的！`][Math.floor(Math.random()*2)];
        else msg = `都是 ${pm}，平手！再来一局！`;
        msg += `<br><span style="font-size:11px;opacity:0.6;">你 [${p.join(',')}] vs Miku [${m.join(',')}]</span>`;
        rEl.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--red-1);">${res === 'w' ? '🎉 你赢了！' : res === 'l' ? '😤 你输了！' : '🤝 平手！'}</span>`;
        mikuSay(msg, 6000); if (btn) btn.disabled = false;
      }
    }, 80);
  };

  /* ========== D: 老虎机 ========== */
  const getRandomSymbol = () => {
    const total = SLOT_SYMBOLS.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const s of SLOT_SYMBOLS) { r -= s.weight; if (r <= 0) return s; }
    return SLOT_SYMBOLS[0];
  };

  const playSlot = () => {
    const data = loadSlot();
    if (data.remaining <= 0) {
      mikuSay('今天的免费次数用完啦～明天再来吧！', 4000);
      return;
    }

    const btn = document.getElementById('miku-slot-btn');
    const reels = document.querySelectorAll('.miku-slot-reel');
    const prizeEl = document.getElementById('miku-slot-prize');
    if (!btn || !reels.length) return;
    btn.disabled = true; prizeEl.textContent = '🎰 转动中...';

    // 动画
    let f = 0;
    const t = setInterval(() => {
      reels.forEach(r => {
        r.classList.add('rolling');
        r.textContent = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].sym;
      });
      f++;
      if (f >= 15) {
        clearInterval(t);
        // 结果
        const s1 = getRandomSymbol(), s2 = getRandomSymbol(), s3 = getRandomSymbol();
        reels[0].textContent = s1.sym; reels[1].textContent = s2.sym; reels[2].textContent = s3.sym;
        reels.forEach(r => r.classList.remove('rolling'));

        data.remaining--; data.total++;
        let prizeMsg = '';

        if (s1.sym === s2.sym && s2.sym === s3.sym) {
          // 三连
          const p = SLOT_PRIZES.find(x => x.match === 3 && x.sym === s1.sym);
          prizeMsg = p ? p.prize : '🎉 三个相同！';
          const m = p ? p.msg : `${s1.sym} 三连！厉害！`;
          reels.forEach(r => r.classList.add('win-highlight'));
          spawnParticles(reels[0], 16);
          data.bestPrize = prizeMsg;
          mikuSay(m, 6000);
        } else if (s1.sym === s2.sym || s2.sym === s3.sym || s1.sym === s3.sym) {
          // 两连
          prizeMsg = '📯 两连！';
          mikuSay(`差一点就三个了！再来一次～`, 4000);
        } else {
          const msgs = [`${s1.sym} ${s2.sym} ${s3.sym}... 全都不一样诶`, `今天手气不太好呢～`, `没事没事，下次一定中！`];
          mikuSay(msgs[Math.floor(Math.random()*msgs.length)], 4000);
        }

        data.plays++;
        saveSlot(data);

        prizeEl.innerHTML = prizeMsg ? `<span style="font-size:14px;font-weight:700;color:var(--red-1);">${prizeMsg}</span>` : '';
        const ce = document.getElementById('miku-slot-chances');
        if (ce) ce.textContent = `🎰 今日剩余 ${data.remaining} / ${DAILY_FREE} 次`;
        btn.disabled = false;
      }
    }, 80);
  };

  /* ========== 面板注入 ========== */
  let widgetInjected = false;
  let currentGame = 'rps';

  const switchGame = (game) => {
    currentGame = game;
    ['rps','dice','slot'].forEach(g => {
      const el = document.getElementById(`miku-game-${g}`);
      if (el) el.style.display = g === game ? 'block' : 'none';
    });
    document.querySelectorAll('.miku-tab').forEach(t => t.classList.toggle('active', t.dataset.game === game));
  };
  window.__switchGame = switchGame;

  const injectSidebarWidget = () => {
    if (document.getElementById('miku-game-widget') || widgetInjected) return;
    const sidebar = document.querySelector('aside#sidebar');
    if (!sidebar) return;
    const poke = loadPoke(), rps = loadRps(), dice = loadDice(), slot = loadSlot();

    let h = '<div class="widget-wrap" id="miku-game-widget"><div class="widget-title" style="margin-bottom:12px;font-weight:700;color:var(--red-1);font-size:1.1em;display:flex;align-items:center;"><span style="margin-right:8px;">🎮</span> Miku 互动</div><div class="widget" style="text-align:center;">';

    // 戳
    h += '<div style="margin-bottom:10px;"><div style="font-size:12px;font-weight:600;margin-bottom:6px;opacity:0.7;">👆 戳 Miku</div><div class="miku-stat-row"><span>总次数</span><span class="miku-stat-val" id="miku-poke-total">' + poke.total + '</span></div>';
    ZONES.forEach(z => h += '<div class="miku-stat-row"><span>' + ZONE_NAMES[z] + '</span><span class="miku-stat-val" id="miku-poke-' + z + '">' + poke[z] + '</span></div>');
    h += '</div><div style="height:1px;background:var(--red-5,rgba(255,228,228,0.3));margin:10px 0;"></div>';

    // Tabs
    h += '<div class="miku-tabs"><button class="miku-tab active" data-game="rps" onclick="window.__switchGame(\'rps\')">✊ 猜拳</button><button class="miku-tab" data-game="dice" onclick="window.__switchGame(\'dice\')">🎲 骰子</button><button class="miku-tab" data-game="slot" onclick="window.__switchGame(\'slot\')">🎰 老虎机</button></div>';

    // 猜拳
    h += '<div id="miku-game-rps"><button id="miku-rps-btn" class="miku-game-btn" onclick="(()=>{var u=document.getElementById(\'miku-rps-ui\'),b=document.getElementById(\'miku-rps-btn\');if(!u||!b)return;var s=u.style.display!==\'block\';u.style.display=s?\'block\':\'none\';b.textContent=s?\'✖ 关闭\':\'🎮 和 Miku 玩猜拳\';})()">🎮 和 Miku 玩猜拳</button><div id="miku-rps-ui" style="display:none;margin-top:10px;"><div class="miku-rps-row" style="display:flex;justify-content:center;gap:10px;margin-bottom:6px;position:relative;">';
    h += '<button class="miku-rps-choice" data-choice="rock">✊</button><button class="miku-rps-choice" data-choice="scissors">✌️</button><button class="miku-rps-choice" data-choice="paper">✋</button>';
    h += '<div id="miku-vs-overlay" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;gap:12px;z-index:5;background:rgba(30,20,55,0.85);border-radius:12px;backdrop-filter:blur(4px);"></div></div>';
    h += '<div id="miku-rps-score" style="font-size:12px;opacity:0.7;">胜 ' + rps.wins + ' / 负 ' + rps.losses + ' / 平 ' + rps.ties + '</div></div></div>';

    // 骰子
    h += '<div id="miku-game-dice" style="display:none;"><div class="miku-dice-section"><div class="miku-dice-label">🧑 你</div><div class="miku-dice-area" id="miku-dice-player">🎲 点摇骰开始</div></div><div class="miku-dice-vs">⚡</div><div class="miku-dice-section"><div class="miku-dice-label">🎤 Miku</div><div class="miku-dice-area" id="miku-dice-miku">🎲 等待中</div></div><div id="miku-dice-result" class="miku-dice-result"></div><button id="miku-dice-btn" class="miku-game-btn">🎲 摇骰子</button><div id="miku-dice-score" style="font-size:12px;opacity:0.7;margin-top:4px;">胜 ' + dice.wins + ' / 负 ' + dice.losses + '</div></div>';

    // 老虎机
    h += '<div id="miku-game-slot" style="display:none;"><div class="miku-slot-machine"><div class="miku-slot-display">';
    for (let i = 0; i < 3; i++) h += '<div class="miku-slot-reel" id="miku-slot-reel-' + i + '">🎰</div>';
    h += '</div><div id="miku-slot-prize" class="miku-slot-prize"></div>';
    h += '<button id="miku-slot-btn" class="miku-game-btn">🎰 拉杆！</button>';
    h += '<div id="miku-slot-chances" class="miku-slot-chances">🎰 今日剩余 ' + slot.remaining + ' / ' + DAILY_FREE + ' 次</div>';
    h += '</div></div>';

    h += '</div></div>';

    const tmp = document.createElement('div'); tmp.innerHTML = h;
    const widget = tmp.firstElementChild;
    const wa = sidebar.querySelector('.sidebar-widget');
    if (wa) wa.appendChild(widget);
    else { const w = sidebar.querySelector('.sidebar-wrapper-container'); if (w && w.parentNode) w.parentNode.insertBefore(widget, w.nextSibling); else sidebar.appendChild(widget); }

    widgetInjected = true;
    widget.querySelectorAll('.miku-rps-choice').forEach(b => b.addEventListener('click', e => playRPS(b.dataset.choice, b)));
    const db = widget.querySelector('#miku-dice-btn'); if (db) db.addEventListener('click', playDice);
    const sb = widget.querySelector('#miku-slot-btn'); if (sb) sb.addEventListener('click', playSlot);
  };

  const destroy = () => {
    ['live2d-hit-zone','miku-game-widget'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
    widgetInjected = false;
    document.querySelectorAll('.rps-particle').forEach(el => el.remove());
  };

  const init = () => { injectHitzones(); injectSidebarWidget(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('pjax:send', destroy);
  window.addEventListener('pjax:complete', () => setTimeout(init, 150));
})();

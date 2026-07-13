(function () {
  'use strict';
  if (window.__musicSpaceRuntimeReady) {
    if (window.initMusicSpace) window.initMusicSpace();
    return;
  }
  window.__musicSpaceRuntimeReady = true;

  const h = function () { return window.React.createElement.apply(window.React, arguments); };
  const STORAGE_KEY = 'music-space-state-v3';
  const PREFS_KEY = 'music-space-prefs-v3';

  const DEFAULT_TRACK = {
    id: 'midnight-demo',
    title: 'Midnight Radio',
    artist: 'Music Space',
    album: 'Digital Garden',
    cover: '',
    duration: 0,
    lrc: '[00:00.00]这里不仅收藏音乐\n[00:05.00]也收藏一段人生\n[00:11.00]第一次听它，是凌晨两点\n[00:18.00]世界安静得只剩下耳机里的光\n[00:25.00]把歌单，单独留一盏灯'
  };

  // lyric color presets — 'warm' cream is default; 'auto' derives from album art
  const COLOR_PRESETS = [
    { key: 'warm', label: '', color: '#f3e7cf' },
    { key: 'auto', label: 'A', color: null },
    { key: 'ice', label: '', color: '#d5e6ff' },
    { key: 'sky', label: '', color: '#9ed8ff' },
    { key: 'mint', label: '', color: '#a6f0da' },
    { key: 'gold', label: '', color: '#f2c777' },
    { key: 'rose', label: '', color: '#ffa9c9' },
    { key: 'violet', label: '', color: '#cbacff' }
  ];

  const DEFAULT_PREFS = {
    glow: 0.42,
    lyricColor: 'warm',
    starfield: true,
    coverflow: true,
    vinyl: false,
    beat: true,
    starBrightness: 0.7,   // 星空亮度 0..1
    starDensity: 1,        // 星空密度 0.3..1.4
    reactivity: 0.85,      // 律动强度 0..1
    depth: 1,              // 画面景深 0..1.5
    cinematic: 0.5         // 电影镜头(暗角/呼吸) 0..1
  };

  function cx() { return Array.from(arguments).filter(Boolean).join(' '); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < String(str || '').length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }

  function hslToHex(hue, sat, light) {
    sat /= 100; light /= 100;
    const k = n => (n + hue / 30) % 12;
    const a = sat * Math.min(light, 1 - light);
    const f = n => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(255 * x).toString(16).padStart(2, '0')).join('');
  }

  function fallbackColors(seed) {
    const h1 = hashCode(seed) % 360;
    const h2 = (h1 + 46 + (hashCode(seed + 'x') % 60)) % 360;
    return [hslToHex(h1, 70, 66), hslToHex(h2, 66, 70)];
  }

  function parseLrc(raw) {
    if (!raw || typeof raw !== 'string') return [];
    const lines = [];
    raw.split(/\r?\n/).forEach(line => {
      const times = Array.from(line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g));
      const text = line.replace(/\[[^\]]+\]/g, '').trim();
      if (!times.length || !text) return;
      times.forEach(t => {
        const ms = Number((t[3] || '0').padEnd(3, '0').slice(0, 3));
        lines.push({ time: Number(t[1]) * 60 + Number(t[2]) + ms / 1000, text });
      });
    });
    return lines.sort((a, b) => a.time - b.time);
  }

  function normalizeAudio(audio, index) {
    if (!audio) return { ...DEFAULT_TRACK, id: 'fallback-' + index };
    const title = audio.name || audio.title || audio.song || DEFAULT_TRACK.title;
    const artist = Array.isArray(audio.artist) ? audio.artist.join(' / ') : (audio.artist || audio.author || audio.singer || DEFAULT_TRACK.artist);
    const album = audio.album || audio.al || audio.source || '';
    const cover = audio.cover || audio.pic || audio.picture || audio.image || '';
    const id = String(audio.id || audio.song_id || audio.neteaseId || audio.url || title + '-' + artist || index);
    return {
      id,
      sourceId: String(audio.id || audio.song_id || audio.neteaseId || ''),
      title, artist, album, cover,
      url: audio.url,
      lrc: audio.lrc || audio.lyric || '',
      duration: Number(audio.duration) || 0,
      raw: audio
    };
  }

  function readJSON(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { return {}; } }
  function writeJSON(key, patch) {
    try { const next = Object.assign({}, readJSON(key), patch); localStorage.setItem(key, JSON.stringify(next)); return next; }
    catch (_) { return patch; }
  }

  function useReducedMotion() {
    const [reduced, setReduced] = React.useState(() => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    React.useEffect(() => {
      if (!window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const on = () => setReduced(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
      return () => mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on);
    }, []);
    return reduced;
  }

  function useAlbumColors(track, rootRef) {
    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || !track) return;
      root.style.setProperty('--album-cover', track.cover ? 'url("' + track.cover + '")' : 'none');
      let cancelled = false;
      const apply = (colors) => {
        if (cancelled) return;
        root.style.setProperty('--album-primary', colors[0]);
        root.style.setProperty('--album-secondary', colors[1]);
        root.style.setProperty('--album-auto', colors[0]);
      };
      if (!track.cover) { apply(fallbackColors(track.title + track.artist)); return () => { cancelled = true; }; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 24; canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 16) {
            const rr = data[i], gg = data[i + 1], bb = data[i + 2], aa = data[i + 3];
            if (aa < 120) continue;
            const lum = .2126 * rr + .7152 * gg + .0722 * bb;
            if (lum < 18 || lum > 240) continue;
            r += rr; g += gg; b += bb; n++;
          }
          if (!n) throw new Error('no pixels');
          const base = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
          apply([
            'rgb(' + base.map(v => clamp(v + 34, 0, 255)).join(',') + ')',
            'rgb(' + [clamp(base[2] + 48, 0, 255), clamp(base[0] + 22, 0, 255), clamp(base[1] + 40, 0, 255)].map(Math.round).join(',') + ')'
          ]);
        } catch (_) { apply(fallbackColors(track.title + track.artist)); }
      };
      img.onerror = () => apply(fallbackColors(track.title + track.artist));
      img.src = track.cover;
      return () => { cancelled = true; };
    }, [track && track.id, track && track.cover]);
  }

  function useMetingPlayer(rootEl) {
    const [ap, setAp] = React.useState(null);
    const [tracks, setTracks] = React.useState([DEFAULT_TRACK]);
    const [player, setPlayer] = React.useState({ status: 'loading', currentIndex: 0, currentTime: 0, duration: 0, volume: .7, muted: false, speed: 1 });

    React.useEffect(() => {
      let stop = false;
      let cleanups = [];
      const engine = document.querySelector('.music-space-engine');
      const findAp = () => {
        const candidates = [engine && engine.aplayer, engine && engine.ap, engine && engine._aplayer, window.ap, window.aplayer].filter(Boolean);
        const fromWindow = Array.isArray(window.aplayers) ? window.aplayers[window.aplayers.length - 1] : null;
        if (fromWindow) candidates.push(fromWindow);
        return candidates.find(x => x && (x.audio || x.list || x.container)) || null;
      };
      const sync = (inst) => {
        const audios = (inst && inst.list && Array.isArray(inst.list.audios) && inst.list.audios.length) ? inst.list.audios : [];
        if (audios.length) setTracks(audios.map(normalizeAudio));
        const audio = inst && inst.audio;
        const index = inst && inst.list && Number.isFinite(inst.list.index) ? inst.list.index : 0;
        setPlayer(prev => ({
          ...prev,
          status: audio ? (audio.paused ? 'paused' : 'playing') : prev.status,
          currentIndex: index,
          currentTime: audio ? audio.currentTime || 0 : prev.currentTime,
          duration: audio ? (audio.duration || normalizeAudio(audios[index], index).duration || 0) : prev.duration,
          volume: audio ? audio.volume : prev.volume,
          muted: audio ? audio.muted : prev.muted,
          speed: audio ? audio.playbackRate : prev.speed
        }));
      };
      const attach = (inst) => {
        setAp(inst); sync(inst);
        if (inst && typeof inst.on === 'function') {
          ['play', 'pause', 'listswitch', 'timeupdate', 'ended', 'loadedmetadata', 'canplay', 'volumechange'].forEach(ev => inst.on(ev, () => sync(inst)));
        }
        const tick = window.setInterval(() => sync(inst), 300);
        cleanups.push(() => window.clearInterval(tick));
      };
      const poll = window.setInterval(() => {
        const inst = findAp();
        if (inst || stop) { window.clearInterval(poll); if (inst && !stop) attach(inst); else setPlayer(prev => ({ ...prev, status: 'idle' })); }
      }, 180);
      const fail = window.setTimeout(() => { window.clearInterval(poll); if (!stop) setPlayer(prev => ({ ...prev, status: 'idle' })); }, 9000);
      cleanups.push(() => window.clearInterval(poll), () => window.clearTimeout(fail));
      return () => { stop = true; cleanups.forEach(fn => fn()); };
    }, [rootEl]);

    const api = React.useMemo(() => ({
      toggle() { if (ap && ap.toggle) ap.toggle(); else if (ap && ap.audio) ap.audio.paused ? ap.audio.play() : ap.audio.pause(); },
      play() { if (ap && ap.play) ap.play(); else ap && ap.audio && ap.audio.play(); },
      pause() { if (ap && ap.pause) ap.pause(); else ap && ap.audio && ap.audio.pause(); },
      next() { if (ap && ap.list && tracks.length) ap.list.switch((player.currentIndex + 1) % tracks.length); setTimeout(() => ap && ap.play && ap.play(), 60); },
      prev() { if (ap && ap.list && tracks.length) ap.list.switch((player.currentIndex - 1 + tracks.length) % tracks.length); setTimeout(() => ap && ap.play && ap.play(), 60); },
      seek(sec) { if (ap && ap.seek) ap.seek(sec); else if (ap && ap.audio) ap.audio.currentTime = sec; setPlayer(p => ({ ...p, currentTime: sec })); },
      setVolume(v) { if (ap && ap.volume) ap.volume(v, true); else if (ap && ap.audio) ap.audio.volume = v; setPlayer(p => ({ ...p, volume: v })); },
      setSpeed(v) { if (ap && ap.audio) ap.audio.playbackRate = v; setPlayer(p => ({ ...p, speed: v })); },
      switchTo(i) { if (ap && ap.list) { ap.list.switch(i); setTimeout(() => ap.play && ap.play(), 60); } }
    }), [ap, tracks.length, player.currentIndex]);

    return { ap, tracks, player, setPlayer, api };
  }

  /* ---------- Universe canvas (WebGL 3D cosmos) ----------
     Mounts window.MusicUniverse over a fixed canvas. Falls back to
     the CSS deep-space gradient if Three.js/WebGL is unavailable. */
  function UniverseCanvas({ enabled, reduced, controllerRef, interactionRef, onReady, onZoom }) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!enabled) return;
      let ctrl = null, cancelled = false, tries = 0;
      const boot = () => {
        if (cancelled) return;
        if (!window.THREE || !window.MusicUniverse || !ref.current) {
          if (tries++ > 90) return;
          window.setTimeout(boot, 120);
          return;
        }
        ctrl = window.MusicUniverse.create(ref.current, {
          interactionEl: (interactionRef && interactionRef.current) || ref.current,
          reduced
        });
        if (ctrl) {
          controllerRef.current = ctrl;
          if (onZoom) ctrl.onZoom(onZoom);
          if (onReady) onReady(ctrl);
          window.dispatchEvent(new Event('resize'));
        }
      };
      boot();
      return () => {
        cancelled = true;
        if (ctrl && ctrl.dispose) ctrl.dispose();
        controllerRef.current = null;
      };
    }, [enabled, reduced]);
    if (!enabled) return null;
    return h('canvas', { ref: ref, className: 'ms-universe', 'aria-hidden': 'true' });
  }

  /* ---------- Ambient glow (album light bleeding from below) ---------- */
  function Ambient() {
    return h('div', { className: 'ms-ambient', 'aria-hidden': 'true' },
      h('div', { className: 'ms-ambient__glow' }),
      h('div', { className: 'ms-ambient__grain' })
    );
  }

  /* ---------- Lyric feeder (lyrics now live in the 3D universe) ----------
     Parses LRC + computes current line/progress, then PUSHES to the WebGL
     controller (setLyrics / setLyricState). Renders only an sr-only /
     no-WebGL-fallback DOM copy. Clicking never seeks. */
  function LyricStage({ track, player, universeRef, hasUniverse }) {
    const [lines, setLines] = React.useState(() => parseLrc(track.lrc));
    React.useEffect(() => {
      let cancelled = false;
      const raw = track.lrc;
      const parsed = parseLrc(raw);
      const initial = parsed.length ? parsed : parseLrc(DEFAULT_TRACK.lrc);
      setLines(initial);
      if (raw && /^https?:\/\//.test(raw)) {
        fetch(raw).then(r => r.text()).then(t => { if (!cancelled) { const p = parseLrc(t); if (p.length) setLines(p); } }).catch(() => {});
      }
      return () => { cancelled = true; };
    }, [track.id, track.lrc]);

    // push full line set to the universe whenever it changes
    React.useEffect(() => {
      const c = universeRef && universeRef.current;
      if (c && c.setLyrics) c.setLyrics(lines);
    }, [lines]);

    const current = Math.max(0, lines.findIndex((line, i) => player.currentTime >= line.time && (!lines[i + 1] || player.currentTime < lines[i + 1].time)));
    const line = lines[current];
    const nextTime = lines[current + 1] ? lines[current + 1].time : (line ? line.time + 5 : 5);
    const progress = line ? clamp((player.currentTime - line.time) / Math.max(0.5, nextTime - line.time), 0, 1) : 0;

    // push playback state (line index + per-line progress) to the universe
    React.useEffect(() => {
      const c = universeRef && universeRef.current;
      if (c && c.setLyricState) c.setLyricState(current, progress);
    }, [current, progress]);

    // sr-only current line for a11y; visible only when WebGL universe is unavailable
    return h('div', { className: cx('ms-lyrics-dom', !hasUniverse && 'is-fallback'), 'aria-live': 'polite' },
      lines.length ? [-1, 0, 1].map(d => {
        const l = lines[current + d];
        if (!l) return null;
        return h('p', { key: l.time + '-' + l.text, className: cx('ms-lyric-dom', d === 0 && 'is-current') }, l.text);
      }) : h('p', { className: 'ms-lyric-dom is-current' }, '♪')
    );
  }

  /* ---------- Cover-flow strip (wakes on hover) ---------- */
  function CoverFlow({ tracks, currentIndex, api, vinyl, isPlaying }) {
    const list = tracks && tracks.length ? tracks : [DEFAULT_TRACK];
    const span = list.length > 4 ? 3 : 2;
    const items = [];
    for (let d = -span; d <= span; d++) {
      if (list.length <= 2 && Math.abs(d) > 1) continue;
      const idx = ((currentIndex + d) % list.length + list.length) % list.length;
      items.push({ t: list[idx], idx, rel: d });
    }
    return h('div', { className: cx('ms-flow', vinyl && 'ms-flow--vinyl', isPlaying && 'is-playing') },
      items.map(({ t, idx, rel }) => h('button', {
        key: t.id + '-' + rel,
        className: cx('ms-flow__item', rel === 0 && 'is-active'),
        style: { '--rel': rel, '--abs': Math.abs(rel), zIndex: 20 - Math.abs(rel) },
        onClick: () => rel === 0 ? api.toggle() : api.switchTo(idx),
        title: t.title + ' — ' + t.artist
      },
        h('span', { className: 'ms-flow__disc' }),
        t.cover ? h('img', { className: 'ms-flow__img', src: t.cover, alt: '', loading: 'lazy' }) : h('span', { className: 'ms-flow__img ms-flow__img--empty' }),
        h('span', { className: 'ms-flow__reflect' })
      ))
    );
  }

  /* ---------- Icons ---------- */
  function Icon({ name }) {
    const p = {
      prev: 'M6 5v14M19 5v14l-11-7z', next: 'M18 5v14M5 5v14l11-7z',
      play: 'M8 5.14v13.72L19 12z', pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
      shuffle: 'M16 3h5v5M21 3l-7 7M3 17l6-6M16 21h5v-5M4 7h4l3 3', loop: 'M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
      heart: 'M12 20.5C6 15.4 3.5 11.7 3.5 8.4A4 4 0 0 1 11 6.6 4 4 0 0 1 18.5 8.4c0 3.3-2.5 7-6.5 12.1z',
      list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01', lyrics: 'M4 7h9M4 12h16M4 17h11',
      volume: 'M11 5 6 9H3v6h3l5 4zM16 9.5a3.5 3.5 0 0 1 0 5M19 6.5a7 7 0 0 1 0 11', mute: 'M11 5 6 9H3v6h3l5 4zM22 9.5l-5 5M17 9.5l5 5',
      slider: 'M4 8h11M18 8h2M4 16h2M9 16h11M15 6v4M6 14v4', close: 'M6 6l12 12M18 6L6 18',
      refresh: 'M20 11a8 8 0 1 0-.5 4M20 5v6h-6', cd: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'
    };
    const filled = name === 'play' || name === 'pause' || name === 'prev' || name === 'next';
    return h('svg', { viewBox: '0 0 24 24', width: 19, height: 19, 'aria-hidden': 'true',
      fill: name === 'play' || name === 'pause' ? 'currentColor' : 'none',
      stroke: name === 'play' || name === 'pause' ? 'none' : 'currentColor',
      strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: p[name] || '', fill: filled && name !== 'play' && name !== 'pause' ? 'currentColor' : undefined, stroke: filled && name !== 'play' && name !== 'pause' ? 'none' : undefined }));
  }

  function Btn(props) {
    const { className, children, ...rest } = props;
    return h('button', Object.assign({ className: cx('ms-btn', className), type: 'button' }, rest), children);
  }

  /* ---------- Top bar (whisper) ---------- */
  function TopBar({ page, status, mood }) {
    const label = status === 'playing' ? '正在聆听' : status === 'paused' ? '已暂停' : status === 'loading' ? '连接歌单…' : '待机';
    return h('header', { className: 'ms-top' },
      h('div', { className: 'ms-top__brand' },
        h('span', { className: 'ms-top__mark' }, h(Icon, { name: 'cd' })),
        h('span', { className: 'ms-top__name' }, page.title)
      ),
      h('div', { className: cx('ms-status', status === 'playing' && 'is-live') },
        h('i', { className: 'ms-status__dot' }),
        h('span', null, label),
        mood && h('span', { className: 'ms-status__mood' }, mood)
      )
    );
  }

  /* ---------- Transport (floating glass pill) ---------- */
  function Transport({ track, player, api, local, setLocal, onQueue, onConsole, queueOpen, consoleOpen }) {
    const progress = player.duration ? clamp(player.currentTime / player.duration, 0, 1) : 0;
    const barRef = React.useRef(null);
    const seekFrom = (e) => {
      const el = barRef.current; if (!el || !player.duration) return;
      const rect = el.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      api.seek(clamp(x / rect.width, 0, 1) * player.duration);
    };
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextSpeed = speeds[(speeds.indexOf(Number(player.speed)) + 1 || 1) % speeds.length];

    return h('div', { className: 'ms-transport ms-glass' },
      h('div', { ref: barRef, className: 'ms-seek', role: 'slider', 'aria-label': '进度', 'aria-valuenow': Math.round(progress * 100),
        onMouseDown: (e) => { seekFrom(e); const mv = (ev) => seekFrom(ev); const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); }; window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up); },
        onTouchStart: seekFrom, onTouchMove: seekFrom },
        h('span', { className: 'ms-seek__track' }),
        h('span', { className: 'ms-seek__fill', style: { transform: 'scaleX(' + progress + ')' } }),
        h('span', { className: 'ms-seek__knob', style: { left: (progress * 100) + '%' } })
      ),
      h('div', { className: 'ms-transport__grid' },
        h('div', { className: 'ms-np' },
          h('div', { className: 'ms-np__cover', style: track.cover ? { backgroundImage: 'url("' + track.cover + '")' } : null }),
          h('div', { className: 'ms-np__text' },
            h('div', { className: 'ms-np__title' }, track.title),
            h('div', { className: 'ms-np__artist' }, track.artist)
          ),
          h(Btn, { className: cx('ms-btn--ghost ms-like', local.liked && 'is-liked'), onClick: () => setLocal({ liked: !local.liked }), title: '喜欢', 'aria-pressed': !!local.liked }, h(Icon, { name: 'heart' }))
        ),
        h('div', { className: 'ms-controls' },
          h(Btn, { className: cx('ms-btn--ghost', local.shuffle && 'is-on'), onClick: () => setLocal({ shuffle: !local.shuffle }), title: '随机' }, h(Icon, { name: 'shuffle' })),
          h(Btn, { className: 'ms-btn--ghost', onClick: api.prev, title: '上一首' }, h(Icon, { name: 'prev' })),
          h(Btn, { className: 'ms-play', onClick: api.toggle, title: player.status === 'playing' ? '暂停' : '播放' }, h(Icon, { name: player.status === 'playing' ? 'pause' : 'play' })),
          h(Btn, { className: 'ms-btn--ghost', onClick: api.next, title: '下一首' }, h(Icon, { name: 'next' })),
          h(Btn, { className: cx('ms-btn--ghost', local.loop && 'is-on'), onClick: () => setLocal({ loop: !local.loop }), title: '循环' }, h(Icon, { name: 'loop' }))
        ),
        h('div', { className: 'ms-tools' },
          h('span', { className: 'ms-time' }, fmtTime(player.currentTime), h('i', null, '/'), fmtTime(player.duration || track.duration)),
          h(Btn, { className: 'ms-btn--ghost ms-btn--text', onClick: () => api.setSpeed(nextSpeed), title: '倍速' }, (player.speed || 1) + '×'),
          h('label', { className: 'ms-vol', title: '音量' },
            h(Btn, { className: 'ms-btn--ghost', onClick: () => api.setVolume(player.volume > 0 ? 0 : 0.7) }, h(Icon, { name: player.volume > 0.02 ? 'volume' : 'mute' })),
            h('input', { type: 'range', min: 0, max: 1, step: .01, value: player.volume, onChange: e => api.setVolume(Number(e.target.value)), 'aria-label': '音量' })
          ),
          h(Btn, { className: cx('ms-btn--ghost', queueOpen && 'is-on'), onClick: onQueue, title: '歌单 / 队列' }, h(Icon, { name: 'list' })),
          h(Btn, { className: cx('ms-btn--ghost', consoleOpen && 'is-on'), onClick: onConsole, title: '视觉控制台' }, h(Icon, { name: 'slider' }))
        )
      )
    );
  }

  /* ---------- Queue panel (slides from left) ---------- */
  function QueuePanel({ tracks, currentIndex, api, onClose, ap }) {
    return h('aside', { className: 'ms-panel ms-panel--left ms-glass', role: 'dialog', 'aria-label': '歌单队列' },
      h('div', { className: 'ms-panel__head' },
        h('div', null, h('div', { className: 'ms-panel__title' }, '歌单 / 队列'), h('div', { className: 'ms-panel__sub' }, 'QUEUE · ' + tracks.length + ' 首')),
        h(Btn, { className: 'ms-btn--ghost', onClick: onClose, title: '收起' }, h(Icon, { name: 'close' }))
      ),
      h('div', { className: 'ms-queue' }, tracks.map((t, i) => h('button', {
        key: t.id + i, className: cx('ms-queue__row', i === currentIndex && 'is-active'), onClick: () => api.switchTo(i)
      },
        h('span', { className: 'ms-queue__idx' }, i === currentIndex ? h('span', { className: 'ms-queue__eq' }, h('i'), h('i'), h('i')) : String(i + 1).padStart(2, '0')),
        t.cover ? h('img', { className: 'ms-queue__cover', src: t.cover, alt: '', loading: 'lazy' }) : h('span', { className: 'ms-queue__cover' }),
        h('span', { className: 'ms-queue__meta' },
          h('span', { className: 'ms-queue__title' }, t.title),
          h('span', { className: 'ms-queue__artist' }, t.artist)
        ),
        t.duration ? h('span', { className: 'ms-queue__dur' }, fmtTime(t.duration)) : null
      )))
    );
  }

  /* ---------- Visual console (slides from right) ---------- */
  function Toggle({ label, active, onClick }) {
    return h('button', { className: cx('ms-toggle', active && 'is-on'), onClick: onClick, type: 'button', role: 'switch', 'aria-checked': active },
      h('span', null, label), h('span', { className: 'ms-toggle__dot' }));
  }

  function Slider({ label, value, min, max, step, def, fmt, onChange }) {
    const show = fmt ? fmt(value) : Number(value).toFixed(2);
    return h('div', { className: 'ms-field' },
      h('div', { className: 'ms-field__row' },
        h('span', null, label),
        h('span', { className: 'ms-field__meta' },
          h('span', { className: 'ms-field__v' }, show),
          def != null && h('button', { className: 'ms-field__reset', type: 'button', title: '重置', onClick: () => onChange(def) }, h(Icon, { name: 'refresh' }))
        )
      ),
      h('input', { className: 'ms-range', type: 'range', min, max, step, value, onChange: e => onChange(Number(e.target.value)) })
    );
  }

  function ConsolePanel({ prefs, setPref, onClose }) {
    const [tab, setTab] = React.useState('motion');
    const tabs = [{ k: 'appearance', label: '外观' }, { k: 'lyrics', label: '歌词' }, { k: 'motion', label: '动态' }];
    const pct = v => Math.round(v * 100) + '%';
    return h('aside', { className: 'ms-panel ms-panel--right ms-glass', role: 'dialog', 'aria-label': '视觉控制台' },
      h('div', { className: 'ms-panel__head' },
        h('div', null, h('div', { className: 'ms-panel__title' }, '视觉控制台'), h('div', { className: 'ms-panel__sub' }, 'MUSIC SPACE · 鼠标移开自动隐藏')),
        h(Btn, { className: 'ms-btn--ghost', onClick: onClose, title: '收起' }, h(Icon, { name: 'close' }))
      ),
      h('div', { className: 'ms-tabs' }, tabs.map(t => h('button', { key: t.k, type: 'button', className: cx('ms-tabs__t', tab === t.k && 'is-active'), onClick: () => setTab(t.k) }, t.label))),
      h('div', { className: 'ms-panel__body' },
        tab === 'appearance' && h(React.Fragment, null,
          h('div', { className: 'ms-group' }, '星空'),
          h(Toggle, { label: '星空背景', active: prefs.starfield, onClick: () => setPref({ starfield: !prefs.starfield }) }),
          h(Slider, { label: '星空亮度', value: prefs.starBrightness, min: 0.1, max: 1, step: 0.01, def: 0.7, fmt: pct, onChange: v => setPref({ starBrightness: v }) }),
          h(Slider, { label: '星空密度', value: prefs.starDensity, min: 0.3, max: 1.4, step: 0.01, def: 1, fmt: pct, onChange: v => setPref({ starDensity: v }) }),
          h('div', { className: 'ms-group' }, '元素'),
          h(Toggle, { label: '封面流', active: prefs.coverflow, onClick: () => setPref({ coverflow: !prefs.coverflow }) }),
          h(Toggle, { label: '黑胶唱片', active: prefs.vinyl, onClick: () => setPref({ vinyl: !prefs.vinyl }) })
        ),
        tab === 'lyrics' && h(React.Fragment, null,
          h(Slider, { label: '歌词溢光强度', value: prefs.glow, min: 0, max: 1, step: 0.01, def: 0.42, fmt: pct, onChange: v => setPref({ glow: v }) }),
          h('div', { className: 'ms-field' },
            h('div', { className: 'ms-field__row' }, h('span', null, '文字颜色')),
            h('div', { className: 'ms-swatches' }, COLOR_PRESETS.map(c => h('button', {
              key: c.key, type: 'button',
              className: cx('ms-swatch', prefs.lyricColor === c.key && 'is-active', c.key === 'auto' && 'ms-swatch--auto'),
              style: c.color ? { '--sw': c.color } : null, onClick: () => setPref({ lyricColor: c.key }), title: c.key
            }, c.label)))
          )
        ),
        tab === 'motion' && h(React.Fragment, null,
          h('div', { className: 'ms-group' }, '画面基础'),
          h(Slider, { label: '律动强度', value: prefs.reactivity, min: 0, max: 1, step: 0.01, def: 0.85, fmt: pct, onChange: v => setPref({ reactivity: v }) }),
          h(Slider, { label: '画面景深', value: prefs.depth, min: 0, max: 1.5, step: 0.01, def: 1, onChange: v => setPref({ depth: v }) }),
          h(Slider, { label: '电影镜头', value: prefs.cinematic, min: 0, max: 1, step: 0.01, def: 0.5, fmt: pct, onChange: v => setPref({ cinematic: v }) }),
          h('div', { className: 'ms-group' }, '开关'),
          h(Toggle, { label: '播放时鼓点辉光', active: prefs.beat, onClick: () => setPref({ beat: !prefs.beat }) }),
          h('p', { className: 'ms-panel__hint' }, '开启系统「减少动态效果」时，所有动画会自动降级为静态。')
        )
      )
    );
  }

  /* ---------- Archive (below the fold) ---------- */
  function SongIntel({ track, meta, player }) {
    const items = [
      ['BPM', meta.bpm || '—'], ['Key', meta.key || '—'], ['时长', fmtTime(player.duration || track.duration)], ['专辑', track.album || meta.album || '—'],
      ['发布', meta.releaseDate || meta.year || '—'], ['语言', meta.language || '—'], ['制作', (meta.producer || ['Unknown']).join(' / ')], ['流派', (meta.genre || []).join(' / ') || '—']
    ];
    return h('section', { className: 'ms-card' },
      h('h2', { className: 'ms-card__t' }, 'Song Intelligence'),
      h('div', { className: 'ms-intel' }, items.map(([k, v]) => h('div', { key: k, className: 'ms-intel__i' }, h('span', { className: 'ms-intel__k' }, k), h('span', { className: 'ms-intel__v' }, v)))),
      h('div', { className: 'ms-links' }, Object.entries(meta.platforms || {}).filter(([, v]) => v).map(([k, v]) => h('a', { key: k, className: 'ms-link', href: v, target: '_blank', rel: 'noreferrer' }, k)))
    );
  }

  function MemoryTimeline({ meta }) {
    const timeline = meta.timeline || [];
    if (!timeline.length) return null;
    return h('section', { className: 'ms-card' },
      h('h2', { className: 'ms-card__t' }, 'Memory Timeline'),
      h('div', { className: 'ms-tl' }, timeline.map((it, i) => h('div', { key: i, className: 'ms-tl__i' },
        h('div', { className: 'ms-tl__year' }, it.year),
        h('div', null, h('div', { className: 'ms-tl__label' }, it.label), h('div', { className: 'ms-tl__note' }, it.note))
      )))
    );
  }

  function Review({ meta, track }) {
    return h('section', { className: 'ms-card ms-card--review' },
      h('h2', { className: 'ms-card__t' }, '我的乐评'),
      h('p', { className: 'ms-review__text' }, meta.review || '有些歌不是为了热闹而存在，它更像夜里突然亮起的一盏灯。'),
      h('p', { className: 'ms-review__foot' }, '如果这首《' + track.title + '》也在你的某个夜晚出现过，欢迎留下你的坐标。')
    );
  }

  function Rail({ tracks, currentIndex, api }) {
    const list = tracks.length > 1 ? tracks.map((t, i) => ({ t, i })).filter(x => x.i !== currentIndex).slice(0, 12) : [];
    if (!list.length) return null;
    return h('section', { className: 'ms-card' },
      h('div', { className: 'ms-card__head' }, h('h2', { className: 'ms-card__t' }, 'Music Garden'), h('span', { className: 'ms-card__meta' }, '歌单里的其它光')),
      h('div', { className: 'ms-rail' }, list.map(({ t, i }) => h('button', { key: t.id + i, className: 'ms-rec', onClick: () => api.switchTo(i) },
        t.cover ? h('img', { className: 'ms-rec__cover', src: t.cover, alt: '', loading: 'lazy' }) : h('span', { className: 'ms-rec__cover' }),
        h('span', { className: 'ms-rec__title' }, t.title),
        h('span', { className: 'ms-rec__artist' }, t.artist)
      )))
    );
  }

  /* ---------- App ---------- */
  function MusicSpaceApp({ root }) {
    const appRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const universeRef = React.useRef(null);
    const reduced = useReducedMotion();
    const { ap, tracks, player, api } = useMetingPlayer(root);
    const [meta, setMeta] = React.useState(null);
    const [local, setLocalState] = React.useState(() => Object.assign({ liked: false, saved: false, shuffle: false, loop: true }, readJSON(STORAGE_KEY)));
    const [prefs, setPrefsState] = React.useState(() => Object.assign({}, DEFAULT_PREFS, readJSON(PREFS_KEY)));
    const [queueOpen, setQueueOpen] = React.useState(false);
    const [consoleOpen, setConsoleOpen] = React.useState(false);
    const [zoom, setZoom] = React.useState(0);

    const currentTrack = tracks[player.currentIndex] || tracks[0] || DEFAULT_TRACK;
    const defaultMeta = (meta && meta.defaults) || {};
    const trackMeta = Object.assign({}, defaultMeta, (meta && meta.tracks || []).find(t =>
      String(t.neteaseId || t.id || t.title) === String(currentTrack.sourceId || currentTrack.id) || (t.title && t.title === currentTrack.title)) || {});
    const page = Object.assign({ title: root.dataset.title || 'Music Space', eyebrow: 'Now Playing' }, meta && meta.page || {});
    const mood = (meta && meta.page && meta.page.mood) || '';

    useAlbumColors(currentTrack, appRef);

    React.useEffect(() => {
      let cancelled = false;
      fetch(root.dataset.metaUrl || '/music/music-meta.json').then(r => r.ok ? r.json() : null).then(json => { if (!cancelled && json) setMeta(json); }).catch(() => {});
      return () => { cancelled = true; };
    }, [root]);

    React.useEffect(() => {
      const el = appRef.current; if (!el) return;
      el.style.setProperty('--ms-glow', String(prefs.glow));
      const preset = COLOR_PRESETS.find(c => c.key === prefs.lyricColor);
      el.style.setProperty('--ms-lyric-color', preset && preset.color ? preset.color : 'var(--album-auto, #f3e7cf)');
      // mirror lyric style into the 3D field
      const ctrl = universeRef.current;
      if (ctrl && ctrl.setLyricStyle) {
        const cs = getComputedStyle(el);
        const col = (preset && preset.color) || cs.getPropertyValue('--album-auto').trim() || '#f3e7cf';
        ctrl.setLyricStyle(col, prefs.glow);
      }
    }, [prefs.glow, prefs.lyricColor, currentTrack.id]);

    // feed the universe: album colors + cover planet (read the eased CSS vars)
    React.useEffect(() => {
      const el = appRef.current, ctrl = universeRef.current;
      if (!el || !ctrl) return;
      const cs = getComputedStyle(el);
      const a = cs.getPropertyValue('--album-primary').trim();
      const b = cs.getPropertyValue('--album-secondary').trim();
      if (a) ctrl.setAlbumColors(a, b || a);
      if (ctrl.setCover) ctrl.setCover(currentTrack.cover || '', a);
    }, [currentTrack.id, currentTrack.cover, meta]);

    React.useEffect(() => {
      const ctrl = universeRef.current;
      if (ctrl) ctrl.setPlaying(player.status === 'playing');
    }, [player.status]);

    // Web Audio: attach the APlayer <audio> once it exists (a user gesture resumes the ctx)
    React.useEffect(() => {
      const ctrl = universeRef.current;
      if (ctrl && ctrl.attachAudio && ap && ap.audio) ctrl.attachAudio(ap.audio);
    }, [ap, player.status]);

    // escape closes panels
    React.useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape') { setQueueOpen(false); setConsoleOpen(false); } };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    const setLocal = patch => setLocalState(prev => { const next = Object.assign({}, prev, patch); writeJSON(STORAGE_KEY, next); return next; });
    const setPref = patch => setPrefsState(prev => { const next = Object.assign({}, prev, patch); writeJSON(PREFS_KEY, next); return next; });

    const isPlaying = player.status === 'playing';
    const panelOpen = queueOpen || consoleOpen;

    return h('div', { ref: appRef, className: cx('music-space', isPlaying ? 'is-playing' : 'is-paused', prefs.beat && 'ms-beat', reduced && 'is-reduced', panelOpen && 'has-panel', prefs.starfield && 'has-universe') },
      h(UniverseCanvas, {
        enabled: prefs.starfield, reduced,
        controllerRef: universeRef, interactionRef: stageRef,
        onReady: (ctrl) => {
          const el = appRef.current;
          if (el) { const cs = getComputedStyle(el); ctrl.setAlbumColors(cs.getPropertyValue('--album-primary').trim(), cs.getPropertyValue('--album-secondary').trim()); }
          ctrl.setPlaying(player.status === 'playing');
          if (ctrl.setCover) ctrl.setCover(currentTrack.cover || '', (el && getComputedStyle(el).getPropertyValue('--album-primary').trim()));
          if (ctrl.onLyricHover) ctrl.onLyricHover((on) => { if (stageRef.current) stageRef.current.classList.toggle('is-lyric-hover', on); });
          if (ap && ap.audio && ctrl.attachAudio) ctrl.attachAudio(ap.audio);
        },
        onZoom: (z) => setZoom(z)
      }),
      h(Ambient),

      h('section', { className: 'ms-stage', ref: stageRef },
        h(TopBar, { page, status: player.status, mood }),
        h(LyricStage, { track: currentTrack, player, universeRef, hasUniverse: prefs.starfield }),
        h('div', { className: 'ms-dock' },
          prefs.coverflow && h(CoverFlow, { tracks, currentIndex: player.currentIndex, api, vinyl: prefs.vinyl, isPlaying }),
          h(Transport, { track: currentTrack, player, api, local, setLocal,
            onQueue: () => { setQueueOpen(o => !o); setConsoleOpen(false); },
            onConsole: () => { setConsoleOpen(o => !o); setQueueOpen(false); },
            queueOpen, consoleOpen })
        )
      ),

      // edge hover zones (desktop reveal)
      h('div', { className: 'ms-edge ms-edge--left', onMouseEnter: () => setQueueOpen(true) }, h('span', { className: 'ms-edge__hint' }, '歌单')),
      h('div', { className: 'ms-edge ms-edge--right', onMouseEnter: () => setConsoleOpen(true) }, h('span', { className: 'ms-edge__hint' }, '视觉')),

      panelOpen && h('div', { className: 'ms-scrim', onClick: () => { setQueueOpen(false); setConsoleOpen(false); } }),
      h('div', { className: cx('ms-panel-wrap ms-panel-wrap--left', queueOpen && 'is-open'), onMouseLeave: () => setQueueOpen(false) },
        h(QueuePanel, { tracks, currentIndex: player.currentIndex, api, ap, onClose: () => setQueueOpen(false) })
      ),
      h('div', { className: cx('ms-panel-wrap ms-panel-wrap--right', consoleOpen && 'is-open'), onMouseLeave: () => setConsoleOpen(false) },
        h(ConsolePanel, { prefs, setPref, onClose: () => setConsoleOpen(false) })
      )
    );
  }

  function initMusicSpace() {
    const root = document.getElementById('music-space-root');
    if (!root || root.dataset.mounted === 'true') return;
    if (!window.React || !window.ReactDOM) { window.setTimeout(initMusicSpace, 120); return; }
    root.dataset.mounted = 'true';
    document.body.classList.add('has-music-space');
    const reactRoot = ReactDOM.createRoot(root);
    root.__musicSpaceRoot = reactRoot;
    reactRoot.render(h(MusicSpaceApp, { root }));
  }

  function destroyMusicSpace() {
    const root = document.getElementById('music-space-root');
    document.body.classList.remove('has-music-space');
    if (root && root.__musicSpaceRoot) {
      root.__musicSpaceRoot.unmount();
      delete root.__musicSpaceRoot;
      delete root.dataset.mounted;
    }
  }

  window.initMusicSpace = initMusicSpace;
  window.destroyMusicSpace = destroyMusicSpace;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMusicSpace);
  else initMusicSpace();
  document.addEventListener('pjax:complete', initMusicSpace);
  document.addEventListener('pjax:send', destroyMusicSpace);
})();

(function () {
  'use strict';
  if (window.__musicSpaceRuntimeReady) {
    if (window.initMusicSpace) window.initMusicSpace();
    return;
  }
  window.__musicSpaceRuntimeReady = true;

  const h = function () { return window.React.createElement.apply(window.React, arguments); };

  const DEFAULT_TRACK = {
    id: 'midnight-demo',
    title: 'Midnight Radio',
    artist: 'Music Space',
    album: 'Digital Garden',
    cover: '',
    duration: 0,
    lrc: '[00:00.00]这里不仅收藏音乐\n[00:05.00]也收藏一段人生\n[00:11.00]第一次听它，是凌晨两点\n[00:18.00]世界安静得只剩下耳机里的光\n[00:25.00]把歌单，单独留一盏灯'
  };

  const THEMES = [
    { id: 'breath', icon: '🎨', label: '情绪晕染' },
    { id: 'fireflies', icon: '✨', label: '深海流萤' },
    { id: 'ripple', icon: '🌊', label: '量子涟漪' },
    { id: 'stars', icon: '🌌', label: '跃迁星海' }
  ];

  function cx() { return Array.from(arguments).filter(Boolean).join(' '); }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return m + ':' + s;
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

  function Icon({ name }) {
    const p = {
      prev: 'M6 5v14M19 5v14l-11-7z', next: 'M18 5v14M5 5v14l11-7z',
      play: 'M8 5.14v13.72L19 12z', pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
      shuffle: 'M16 3h5v5M21 3l-7 7M3 17l6-6M16 21h5v-5M4 7h4l3 3', loop: 'M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
      volume: 'M11 5 6 9H3v6h3l5 4zM16 9.5a3.5 3.5 0 0 1 0 5M19 6.5a7 7 0 0 1 0 11', mute: 'M11 5 6 9H3v6h3l5 4zM22 9.5l-5 5M17 9.5l5 5',
      search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.5-4.5',
      sparkles: 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z'
    };
    const filled = name === 'play' || name === 'pause' || name === 'prev' || name === 'next';
    return h('svg', { viewBox: '0 0 24 24', width: '100%', height: '100%', 'aria-hidden': 'true',
      fill: name === 'play' || name === 'pause' ? 'currentColor' : 'none',
      stroke: name === 'play' || name === 'pause' ? 'none' : 'currentColor',
      strokeWidth: name === 'search' || name === 'sparkles' ? 2 : 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: p[name] || '', fill: filled && name !== 'play' && name !== 'pause' ? 'currentColor' : undefined, stroke: filled && name !== 'play' && name !== 'pause' ? 'none' : undefined }));
  }

  // --- Background Components ---
  function FirefliesCanvas({ bgSpeed, bgSize }) {
    const canvasRef = React.useRef(null);
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let particles = [];
      let width = 0, height = 0;
      let animationId = null;

      const init = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        const num = Math.floor(width / 30);
        for(let i=0; i<num; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.5 + 0.5,
            vy: -(Math.random() * 0.5 + 0.1),
            vx: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.8 + 0.1,
            fadeSpeed: (Math.random() - 0.5) * 0.01
          });
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
          // Multiply velocity by bgSpeed
          p.y += p.vy * bgSpeed;
          p.x += p.vx * bgSpeed;
          p.opacity += p.fadeSpeed * bgSpeed;
          if(p.opacity > 1 || p.opacity < 0.1) p.fadeSpeed *= -1;
          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * bgSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(157, 136, 255, ' + p.opacity + ')';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#9d88ff';
          ctx.fill();
        });
        animationId = requestAnimationFrame(draw);
      };

      window.addEventListener('resize', init);
      init();
      draw();

      return () => {
        window.removeEventListener('resize', init);
        cancelAnimationFrame(animationId);
      };
    }, [bgSpeed, bgSize]);
    return h('canvas', { ref: canvasRef, className: 'ms-fireflies-canvas' });
  }

  function BackgroundRenderer({ mode, cover, isPlaying, bgSpeed, bgSize }) {
    if (mode === 'fireflies') {
      return h('div', { className: 'ms-bg-container ms-bg-fireflies' }, h(FirefliesCanvas, { bgSpeed, bgSize }));
    }
    if (mode === 'ripple') {
      return h('div', { className: 'ms-bg-container ms-bg-ripple' },
        isPlaying && h(React.Fragment, null,
          h('div', { className: 'ms-ripple-circle' }),
          h('div', { className: 'ms-ripple-circle' }),
          h('div', { className: 'ms-ripple-circle' })
        )
      );
    }
    if (mode === 'stars') {
      // Generate box shadows once
      const getShadows = (count) => {
        let val = '';
        for(let i=0; i<count; i++){
          val += (Math.random()*100) + 'vw ' + (Math.random()*100) + 'vh rgba(255,255,255,'+(Math.random()*0.8+0.2)+')';
          if(i < count-1) val += ', ';
        }
        return val;
      };
      const s1 = React.useMemo(() => getShadows(200), []);
      const s2 = React.useMemo(() => getShadows(100), []);
      const s3 = React.useMemo(() => getShadows(50), []);
      return h('div', { className: 'ms-bg-container ms-bg-stars' },
        h('div', { className: 'ms-star-layer ms-star-layer-1', style: { width: '1px', height: '1px', boxShadow: s1 } }),
        h('div', { className: 'ms-star-layer ms-star-layer-2', style: { width: '2px', height: '2px', boxShadow: s2 } }),
        h('div', { className: 'ms-star-layer ms-star-layer-3', style: { width: '3px', height: '3px', boxShadow: s3 } })
      );
    }
    // Default: 'breath' (Emotional Gradient)
    return h('div', { className: 'ms-bg-container' },
      h('div', { className: 'ms-bg-breath', style: { backgroundImage: 'url(' + (cover || '') + ')' } })
    );
  }

  // --- UI Components ---
  function LeftCard({ track, player, api }) {
    const isPlaying = player.status === 'playing';
    const progress = player.duration ? clamp(player.currentTime / player.duration, 0, 1) : 0;
    
    const barRef = React.useRef(null);
    const seekFrom = (e) => {
      const el = barRef.current; if (!el || !player.duration) return;
      const rect = el.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      api.seek(clamp(x / rect.width, 0, 1) * player.duration);
    };

    const [isShuffle, setIsShuffle] = React.useState(false);

    return h('div', { className: cx('ms-card ms-player', isPlaying && 'is-playing') },
      h('div', { className: 'ms-cd-wrap' },
        h('div', { className: 'ms-cd', style: { backgroundImage: 'url(' + (track.cover || '') + ')' } })
      ),
      h('div', { className: 'ms-info' },
        h('div', { className: 'ms-title' }, track.title),
        h('div', { className: 'ms-artist' }, track.artist)
      ),
      h('div', { className: 'ms-progress-wrap' },
        h('div', { ref: barRef, className: 'ms-progress-bar', onMouseDown: (e) => { seekFrom(e); const mv = (ev) => seekFrom(ev); const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); }; window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up); }, onTouchStart: seekFrom, onTouchMove: seekFrom },
          h('div', { className: 'ms-progress-fill', style: { width: (progress * 100) + '%' } }),
          h('div', { className: 'ms-progress-knob', style: { left: (progress * 100) + '%' } })
        ),
        h('div', { className: 'ms-time-info' },
          h('span', null, fmtTime(player.currentTime)),
          h('span', null, fmtTime(player.duration || track.duration))
        )
      ),
      h('div', { className: 'ms-controls' },
        h('button', { className: cx('ms-btn', isShuffle && 'is-active'), onClick: () => setIsShuffle(!isShuffle) }, h(Icon, { name: 'shuffle' })),
        h('button', { className: 'ms-btn', onClick: api.prev }, h(Icon, { name: 'prev' })),
        h('button', { className: 'ms-btn ms-btn-play', onClick: api.toggle }, h(Icon, { name: isPlaying ? 'pause' : 'play' })),
        h('button', { className: 'ms-btn', onClick: api.next }, h(Icon, { name: 'next' })),
        h('button', { className: 'ms-btn', onClick: () => api.setVolume(player.volume > 0 ? 0 : 0.7) }, h(Icon, { name: player.volume > 0 ? 'volume' : 'mute' }))
      )
    );
  }

  function LyricLines({ track, player }) {
    const [lines, setLines] = React.useState(() => parseLrc(track.lrc));
    React.useEffect(() => {
      let cancelled = false;
      const raw = track.lrc;
      const parsed = parseLrc(raw);
      setLines(parsed.length ? parsed : parseLrc(DEFAULT_TRACK.lrc));
      if (raw && /^https?:\/\//.test(raw)) {
        fetch(raw).then(r => r.text()).then(t => { if (!cancelled) { const p = parseLrc(t); if (p.length) setLines(p); } }).catch(() => {});
      }
      return () => { cancelled = true; };
    }, [track.id, track.lrc]);

    const current = Math.max(0, lines.findIndex((line, i) => player.currentTime >= line.time && (!lines[i + 1] || player.currentTime < lines[i + 1].time)));
    const containerRef = React.useRef(null);
    const lineRefs = React.useRef([]);

    React.useEffect(() => {
      const activeEl = lineRefs.current[current];
      if (activeEl && containerRef.current) {
        const offset = activeEl.offsetTop - containerRef.current.clientHeight / 2 + activeEl.clientHeight / 2;
        containerRef.current.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, [current]);

    return h('div', { className: 'ms-lyrics-container', ref: containerRef },
      lines.length ? lines.map((l, i) => h('div', { 
        key: i, 
        ref: el => lineRefs.current[i] = el,
        className: cx('ms-lyric-line', i === current && 'is-active') 
      }, l.text)) : h('div', { className: 'ms-lyric-line is-active' }, '纯音乐 / 无歌词')
    );
  }

  function RightCard({ tracks, currentIndex, player, track, api, bgMode, setBgMode, cardOpacity, setCardOpacity, cardBlur, setCardBlur, bgSpeed, setBgSpeed, bgBrightness, setBgBrightness, bgSize, setBgSize }) {
    const [tab, setTab] = React.useState('playlist'); // 'playlist' or 'lyrics'
    const [search, setSearch] = React.useState('');
    const [menuOpen, setMenuOpen] = React.useState(false);

    const filtered = React.useMemo(() => {
      if (!search.trim()) return tracks;
      const kw = search.toLowerCase();
      return tracks.filter(t => t.title.toLowerCase().includes(kw) || t.artist.toLowerCase().includes(kw));
    }, [tracks, search]);

    return h('div', { className: 'ms-card ms-playlist' },
      h('div', { className: 'ms-playlist-header' },
        h('div', { className: 'ms-tabs' },
          h('button', { className: cx('ms-tab', tab === 'lyrics' && 'is-active'), onClick: () => setTab('lyrics') }, '歌词'),
          h('button', { className: cx('ms-tab', tab === 'playlist' && 'is-active'), onClick: () => setTab('playlist') }, '歌单')
        ),
        h('div', { style: { position: 'relative' } },
          h('button', { className: 'ms-theme-toggle', onClick: () => setMenuOpen(!menuOpen), title: '视觉背景' },
            h('span', { style: { width: '18px', height: '18px' } }, h(Icon, { name: 'sparkles' }))
          ),
          h('div', { className: cx('ms-theme-menu', menuOpen && 'is-open'), onMouseLeave: () => setMenuOpen(false) },
            THEMES.map(theme => 
              h('button', {
                key: theme.id,
                className: cx('ms-theme-btn', bgMode === theme.id && 'is-active'),
                onClick: () => setBgMode(theme.id)
              }, h('span', null, theme.icon), theme.label)
            ),
            h('div', { className: 'ms-opacity-control' },
              h('div', { className: 'ms-opacity-label' }, 
                h('span', null, '卡片透明度'), 
                h('span', null, Math.round(cardOpacity * 100) + '%')
              ),
              h('input', { 
                type: 'range', className: 'ms-opacity-slider', 
                min: 0.1, max: 0.9, step: 0.05, value: cardOpacity, 
                onChange: e => setCardOpacity(Number(e.target.value)) 
              })
            ),
            h('div', { className: 'ms-opacity-control' },
              h('div', { className: 'ms-opacity-label' }, 
                h('span', null, '卡片模糊度'), 
                h('span', null, cardBlur + 'px')
              ),
              h('input', { 
                type: 'range', className: 'ms-opacity-slider', 
                min: 0, max: 40, step: 1, value: cardBlur, 
                onChange: e => setCardBlur(Number(e.target.value)) 
              })
            ),
            h('div', { className: 'ms-opacity-control' },
              h('div', { className: 'ms-opacity-label' }, 
                h('span', null, '动效速度'), 
                h('span', null, bgSpeed === 1 ? '中等' : (bgSpeed < 1 ? '慢' : '快'))
              ),
              h('input', { 
                type: 'range', className: 'ms-opacity-slider', 
                min: 0.5, max: 2, step: 0.5, value: bgSpeed, 
                onChange: e => setBgSpeed(Number(e.target.value)) 
              })
            ),
            h('div', { className: 'ms-opacity-control' },
              h('div', { className: 'ms-opacity-label' }, 
                h('span', null, '背景亮度'), 
                h('span', null, Math.round(bgBrightness * 100) + '%')
              ),
              h('input', { 
                type: 'range', className: 'ms-opacity-slider', 
                min: 0.2, max: 2.0, step: 0.1, value: bgBrightness, 
                onChange: e => setBgBrightness(Number(e.target.value)) 
              })
            ),
            h('div', { className: 'ms-opacity-control' },
              h('div', { className: 'ms-opacity-label' }, 
                h('span', null, '动效大小'), 
                h('span', null, Math.round(bgSize * 100) + '%')
              ),
              h('input', { 
                type: 'range', className: 'ms-opacity-slider', 
                min: 0.5, max: 2.0, step: 0.1, value: bgSize, 
                onChange: e => setBgSize(Number(e.target.value)) 
              })
            )
          )
        )
      ),
      tab === 'playlist' ? h(React.Fragment, null,
        h('div', { className: 'ms-search' },
          h('span', null, h(Icon, { name: 'search' })),
          h('input', { type: 'text', placeholder: '搜索音轨...', value: search, onChange: e => setSearch(e.target.value) })
        ),
        h('div', { className: 'ms-list-container' },
          filtered.map((t, idx) => {
            const originalIndex = tracks.indexOf(t);
            const isActive = originalIndex === currentIndex;
            return h('div', { key: t.id + originalIndex, className: cx('ms-list-item', isActive && 'is-active'), onClick: () => api.switchTo(originalIndex) },
              t.cover ? h('img', { className: 'ms-item-cover', src: t.cover, alt: '' }) : h('div', { className: 'ms-item-cover' }),
              h('div', { className: 'ms-item-info' },
                h('div', { className: 'ms-item-title' }, t.title),
                h('div', { className: 'ms-item-artist' }, t.artist)
              )
            );
          })
        )
      ) : h(LyricLines, { track, player })
    );
  }

  function MusicSpaceApp({ root }) {
    const { ap, tracks, player, api } = useMetingPlayer(root);
    const currentTrack = tracks[player.currentIndex] || tracks[0] || DEFAULT_TRACK;
    
    const [bgMode, setBgModeState] = React.useState(() => {
      return localStorage.getItem('ms-bg-mode-v4') || 'breath';
    });
    const [cardOpacity, setCardOpacityState] = React.useState(() => {
      return Number(localStorage.getItem('ms-card-opacity')) || 0.6;
    });
    const [cardBlur, setCardBlurState] = React.useState(() => {
      const val = localStorage.getItem('ms-card-blur');
      return val !== null ? Number(val) : 20;
    });
    const [bgSpeed, setBgSpeedState] = React.useState(() => {
      return Number(localStorage.getItem('ms-bg-speed')) || 1;
    });
    const [bgBrightness, setBgBrightnessState] = React.useState(() => {
      return Number(localStorage.getItem('ms-bg-brightness')) || 1;
    });
    const [bgSize, setBgSizeState] = React.useState(() => {
      return Number(localStorage.getItem('ms-bg-size')) || 1;
    });

    const setBgMode = (mode) => {
      setBgModeState(mode);
      localStorage.setItem('ms-bg-mode-v4', mode);
    };

    const setCardOpacity = (op) => {
      setCardOpacityState(op);
      localStorage.setItem('ms-card-opacity', op);
    };

    const setCardBlur = (b) => {
      setCardBlurState(b);
      localStorage.setItem('ms-card-blur', b);
    };

    const setBgSpeed = (s) => {
      setBgSpeedState(s);
      localStorage.setItem('ms-bg-speed', s);
    };

    const setBgBrightness = (s) => {
      setBgBrightnessState(s);
      localStorage.setItem('ms-bg-brightness', s);
    };

    const setBgSize = (s) => {
      setBgSizeState(s);
      localStorage.setItem('ms-bg-size', s);
    };

    return h(React.Fragment, null,
      h(BackgroundRenderer, { mode: bgMode, cover: currentTrack.cover, isPlaying: player.status === 'playing', bgSpeed: bgSpeed, bgSize: bgSize }),
      h('div', { className: 'ms-container', style: { '--card-opacity': cardOpacity, '--card-blur': cardBlur + 'px', '--bg-speed': bgSpeed, '--bg-brightness': bgBrightness, '--bg-size': bgSize } },
        h(LeftCard, { track: currentTrack, player, api }),
        h(RightCard, { tracks, currentIndex: player.currentIndex, player, track: currentTrack, api, bgMode, setBgMode, cardOpacity, setCardOpacity, cardBlur, setCardBlur, bgSpeed, setBgSpeed, bgBrightness, setBgBrightness, bgSize, setBgSize })
      )
    );
  }

  function initMusicSpace() {
    const root = document.getElementById('music-space-root');
    if (!root || root.dataset.mounted === 'true') return;
    if (!window.React || !window.ReactDOM) { window.setTimeout(initMusicSpace, 120); return; }
    root.dataset.mounted = 'true';
    const reactRoot = ReactDOM.createRoot(root);
    root.__musicSpaceRoot = reactRoot;
    reactRoot.render(h(MusicSpaceApp, { root }));
  }

  function destroyMusicSpace() {
    const root = document.getElementById('music-space-root');
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

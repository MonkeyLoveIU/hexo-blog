/* ============================================================
   Music Universe — a 3D lyric cosmos (Three.js, no build step)
   Starfield · galaxy spiral · nebula · dust · meteors ·
   god-ray core · orbit-drag inertia · scroll dolly ·
   pointer parallax · album-color ambience · gentle breathing
   Exposes: window.MusicUniverse.create(canvas, opts)
   ============================================================ */
(function () {
  'use strict';
  if (window.MusicUniverse) return;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function create(canvas, opts) {
    opts = opts || {};
    var THREE = window.THREE;
    if (!THREE || !canvas) return null;

    var interactionEl = opts.interactionEl || canvas;
    var reduced = !!opts.reduced;
    var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    var DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2);

    // ---- renderer ----
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2000);
    camera.position.set(0, 0, 120);

    // universe rig — orbit rotates this group; camera dollies on z
    var universe = new THREE.Group();
    scene.add(universe);

    // depth sub-groups for parallax
    var farGroup = new THREE.Group();   // galaxy + nebula (slow)
    var midGroup = new THREE.Group();   // stars (mid)
    var nearGroup = new THREE.Group();  // dust (fast)
    universe.add(farGroup, midGroup, nearGroup);

    // ---- shared color uniforms (album ambience) ----
    var uColorA = { value: new THREE.Color('#9ed8ff') };
    var uColorB = { value: new THREE.Color('#cbacff') };
    var targetA = new THREE.Color('#9ed8ff');
    var targetB = new THREE.Color('#cbacff');
    var uTime = { value: 0 };
    var uEnergy = { value: 0 };      // gentle 0..1 breathing while playing
    var uHover = { value: 0 };       // 0..1 hover intensifier
    var uBass = { value: 0 };        // low freq   → particle jitter
    var uMid = { value: 0 };         // mid freq   → bloom breathing
    var uTreble = { value: 0 };      // high freq  → star twinkle
    var uStarBright = { value: 0.7 };// 星空亮度 (star alpha multiplier)
    var uStarCut = { value: 0 };     // 星空密度阈值 (discard aRandom > cut)
    // scalar knobs (not shader uniforms): reactivity/depth/cinematic
    var vparam = { react: 0.85, depth: 1, cine: 0.5 };

    var COUNTS = isMobile
      ? { stars: 1400, galaxy: 2600, dust: 220 }
      : { stars: 3000, galaxy: 5200, dust: 480 };

    // ============================================================
    //  STARFIELD — instanced points, soft, twinkling, tinted
    // ============================================================
    function buildStars() {
      var n = COUNTS.stars;
      var pos = new Float32Array(n * 3);
      var siz = new Float32Array(n);
      var pha = new Float32Array(n);
      var tnt = new Float32Array(n);
      var rnd = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        // spherical shell with depth spread
        var r = 200 + Math.pow(Math.random(), 0.6) * 640;
        var th = Math.random() * Math.PI * 2;
        var ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.cos(ph) * 0.62;              // flatten vertically a touch
        pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
        siz[i] = 0.6 + Math.pow(Math.random(), 2.2) * 3.4;
        pha[i] = Math.random() * Math.PI * 2;
        tnt[i] = Math.random() < 0.16 ? Math.random() : 0;      // few colored, most white
        rnd[i] = Math.random();                                 // for density culling
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(pha, 1));
      g.setAttribute('aTint', new THREE.BufferAttribute(tnt, 1));
      g.setAttribute('aRandom', new THREE.BufferAttribute(rnd, 1));
      var m = new THREE.ShaderMaterial({
        uniforms: { uTime: uTime, uColorA: uColorA, uColorB: uColorB, uEnergy: uEnergy, uHover: uHover, uTreble: uTreble, uBass: uBass, uStarBright: uStarBright, uStarCut: uStarCut, uPixelRatio: { value: DPR } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: [
          'attribute float aSize; attribute float aPhase; attribute float aTint; attribute float aRandom;',
          'uniform float uTime; uniform float uEnergy; uniform float uHover; uniform float uTreble; uniform float uBass; uniform float uStarCut; uniform float uPixelRatio;',
          'varying float vTint; varying float vTw;',
          'void main(){',
          '  vTint = aTint;',
          '  if(aRandom < uStarCut){ gl_Position = vec4(2.0,2.0,2.0,1.0); gl_PointSize = 0.0; return; }', // density cull
          '  vec3 p = position;',
          '  p += normalize(p + 0.001) * uBass * 2.2 * sin(uTime*3.0 + aPhase);',  // low freq: subtle radial jitter
          '  vec4 mv = modelViewMatrix * vec4(p,1.0);',
          '  float tw = 0.6 + 0.4*sin(uTime*1.4 + aPhase);',           // twinkle (high-freq shimmer)
          '  tw = mix(tw, 1.0, uEnergy*0.4);',
          '  tw += uTreble * 0.5 * (0.5 + 0.5*sin(uTime*9.0 + aPhase*3.0));',      // high freq: star sparkle
          '  vTw = tw;',
          '  float s = aSize * (300.0/-mv.z) * uPixelRatio * (1.0 + uHover*0.18 + uTreble*0.25);',
          '  gl_PointSize = clamp(s, 0.5, 9.0);',
          '  gl_Position = projectionMatrix * mv;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform vec3 uColorA; uniform vec3 uColorB; uniform float uStarBright;',
          'varying float vTint; varying float vTw;',
          'void main(){',
          '  vec2 c = gl_PointCoord - 0.5;',
          '  float d = length(c);',
          '  float a = smoothstep(0.5, 0.0, d);',                       // soft round
          '  a *= a;',
          '  vec3 col = mix(vec3(1.0), mix(uColorA,uColorB,vTint), vTint*0.9);',
          '  gl_FragColor = vec4(col, a * vTw * (0.5 + uStarBright));',  // brightness knob (0.5 baseline lift)
          '}'
        ].join('\n')
      });
      var pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      midGroup.add(pts);
      return { g: g, m: m, pts: pts };
    }

    // ============================================================
    //  GALAXY — logarithmic spiral arms, warm core → cool rim
    // ============================================================
    function buildGalaxy() {
      var n = COUNTS.galaxy, arms = 3;
      var pos = new Float32Array(n * 3);
      var siz = new Float32Array(n);
      var mix = new Float32Array(n);   // 0 core .. 1 rim
      var pha = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var t = Math.pow(Math.random(), 0.5);
        var radius = 60 + t * 560;
        var arm = i % arms;
        var ang = radius * 0.011 + arm * (Math.PI * 2 / arms);
        var spread = (1 - t) * 30 + 14;
        var rx = (Math.random() - 0.5) * spread;
        var ry = (Math.random() - 0.5) * spread * 0.42;   // thin disk
        var rz = (Math.random() - 0.5) * spread;
        pos[i * 3] = Math.cos(ang) * radius + rx;
        pos[i * 3 + 1] = ry - 60;                          // sit galaxy slightly below/behind
        pos[i * 3 + 2] = Math.sin(ang) * radius + rz - 240;
        siz[i] = 0.5 + Math.random() * 2.2;
        mix[i] = t;
        pha[i] = Math.random() * 6.28;
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
      g.setAttribute('aMix', new THREE.BufferAttribute(mix, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(pha, 1));
      var m = new THREE.ShaderMaterial({
        uniforms: { uTime: uTime, uColorA: uColorA, uColorB: uColorB, uEnergy: uEnergy, uPixelRatio: { value: DPR } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: [
          'attribute float aSize; attribute float aMix; attribute float aPhase;',
          'uniform float uTime; uniform float uEnergy; uniform float uPixelRatio;',
          'varying float vMix; varying float vTw;',
          'void main(){',
          '  vMix = aMix;',
          '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
          '  vTw = 0.7 + 0.3*sin(uTime*0.8 + aPhase);',
          '  float s = aSize * (300.0/-mv.z) * uPixelRatio;',
          '  gl_PointSize = clamp(s, 0.4, 6.0);',
          '  gl_Position = projectionMatrix * mv;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform vec3 uColorA; uniform vec3 uColorB; uniform float uEnergy;',
          'varying float vMix; varying float vTw;',
          'void main(){',
          '  vec2 c = gl_PointCoord - 0.5; float d = length(c);',
          '  float a = smoothstep(0.5,0.0,d); a*=a;',
          '  vec3 warm = mix(vec3(1.0,0.86,0.62), uColorA, 0.5);',      // creamy core
          '  vec3 col = mix(warm, uColorB, vMix);',
          '  float glow = mix(0.5, 0.85, 1.0-vMix) * (0.85 + uEnergy*0.3);',
          '  gl_FragColor = vec4(col, a*vTw*glow);',
          '}'
        ].join('\n')
      });
      var pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      pts.rotation.x = -0.42;   // tilt the disk for cinematic angle
      farGroup.add(pts);
      return { g: g, m: m, pts: pts };
    }

    // ============================================================
    //  NEBULA — big soft additive billboards
    // ============================================================
    function nebulaTexture() {
      var s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
      var ctx = cv.getContext('2d');
      var grd = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, 'rgba(255,255,255,0.9)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.28)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, s, s);
      var tex = new THREE.CanvasTexture(cv);
      return tex;
    }
    function buildNebula() {
      var tex = nebulaTexture();
      var clouds = [];
      var defs = [
        { x: -180, y: 40, z: -300, s: 360, c: 'A', o: 0.16 },
        { x: 220, y: -30, z: -360, s: 420, c: 'B', o: 0.13 },
        { x: 20, y: 120, z: -260, s: 300, c: 'A', o: 0.10 },
        { x: -60, y: -140, z: -420, s: 480, c: 'B', o: 0.09 }
      ];
      defs.forEach(function (d) {
        var m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: d.o });
        var sp = new THREE.Sprite(m);
        sp.scale.set(d.s, d.s, 1);
        sp.position.set(d.x, d.y, d.z);
        sp.userData = { base: d.o, which: d.c, spin: (Math.random() - 0.5) * 0.02 };
        farGroup.add(sp);
        clouds.push(sp);
      });
      return { tex: tex, clouds: clouds };
    }

    // ============================================================
    //  DUST — near, fast-parallax floaters
    // ============================================================
    function buildDust() {
      var n = COUNTS.dust;
      var pos = new Float32Array(n * 3);
      var siz = new Float32Array(n);
      var pha = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 320;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
        pos[i * 3 + 2] = 20 + Math.random() * 120;   // in front, near camera
        siz[i] = 0.6 + Math.random() * 2.0;
        pha[i] = Math.random() * 6.28;
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(pha, 1));
      var m = new THREE.ShaderMaterial({
        uniforms: { uTime: uTime, uColorA: uColorA, uPixelRatio: { value: DPR } },
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: [
          'attribute float aSize; attribute float aPhase; uniform float uTime; uniform float uPixelRatio;',
          'varying float vA;',
          'void main(){',
          '  vec3 p = position;',
          '  p.y += sin(uTime*0.3 + aPhase)*4.0;',
          '  p.x += cos(uTime*0.22 + aPhase)*3.0;',
          '  vec4 mv = modelViewMatrix * vec4(p,1.0);',
          '  vA = 0.4 + 0.6*sin(uTime*0.9 + aPhase);',
          '  gl_PointSize = clamp(aSize*(320.0/-mv.z)*uPixelRatio, 0.5, 7.0);',
          '  gl_Position = projectionMatrix * mv;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform vec3 uColorA; varying float vA;',
          'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); float a=smoothstep(0.5,0.0,d); a*=a;',
          '  gl_FragColor=vec4(mix(vec3(1.0),uColorA,0.4), a*vA*0.5); }'
        ].join('\n')
      });
      var pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      nearGroup.add(pts);
      return { g: g, m: m, pts: pts };
    }

    // ============================================================
    //  GOD-RAY CORE — soft volumetric glow behind lyrics
    // ============================================================
    function buildCore() {
      var s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
      var ctx = cv.getContext('2d');
      var grd = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, 'rgba(255,255,255,0.8)');
      grd.addColorStop(0.4, 'rgba(255,255,255,0.14)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, s, s);
      var tex = new THREE.CanvasTexture(cv);
      var m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22 });
      var sp = new THREE.Sprite(m);
      sp.scale.set(520, 340, 1);
      sp.position.set(0, 0, -120);
      scene.add(sp);   // in scene (not universe) so it stays centered behind lyrics
      return { sp: sp, m: m };
    }

    // ============================================================
    //  METEORS — rare, quiet streaks
    // ============================================================
    function buildMeteors() {
      var tex = (function () {
        var w = 64, hgt = 8, cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
        var ctx = cv.getContext('2d');
        var grd = ctx.createLinearGradient(0, 0, w, 0);
        grd.addColorStop(0, 'rgba(255,255,255,0)');
        grd.addColorStop(0.75, 'rgba(255,255,255,0.55)');
        grd.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, hgt);
        return new THREE.CanvasTexture(cv);
      })();
      var pool = [];
      for (var i = 0; i < 2; i++) {
        var m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
        var sp = new THREE.Sprite(m);
        sp.center.set(1, 0.5);
        sp.scale.set(60, 2.2, 1);
        sp.userData = { active: false, vx: 0, vy: 0, life: 0 };
        midGroup.add(sp);
        pool.push(sp);
      }
      return { tex: tex, pool: pool, next: 3 + Math.random() * 4 };
    }
    function launchMeteor(mt) {
      var free = mt.pool.find(function (s) { return !s.userData.active; });
      if (!free) return;
      var startX = -260 + Math.random() * 120;
      var startY = 120 + Math.random() * 120;
      free.position.set(startX, startY, -80 - Math.random() * 120);
      var sp = 220 + Math.random() * 160;
      var ang = -0.5 - Math.random() * 0.4;
      free.userData.vx = Math.cos(ang) * sp;
      free.userData.vy = Math.sin(ang) * sp;
      free.material.rotation = ang;
      free.userData.active = true; free.userData.life = 0;
    }

    // build everything
    var stars = buildStars();
    var galaxy = buildGalaxy();
    var nebula = buildNebula();
    var dust = buildDust();
    var core = buildCore();
    var meteors = buildMeteors();

    // ============================================================
    //  LYRIC FIELD — current ±2 lines as glowing 3D planes
    //  (subject of the scene, not a background). Per-char sweep
    //  lighting via shader uProgress; textures rebuilt only on
    //  line change, never per frame.
    // ============================================================
    var lyricGroup = new THREE.Group();
    scene.add(lyricGroup);           // in scene (semi-stable), not universe → small parallax, big presence

    var LYRIC_SLOTS = 5;             // rel -2..+2
    var lyricFont = '"LXGW WenKai Screen","Source Han Serif SC","Noto Serif SC","Songti SC",Georgia,serif';

    function makeLyricTexture(text) {
      var W = 2048, H = 256, dpr = 2;
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // fit font size to width
      var size = 150;
      ctx.font = '600 ' + size + 'px ' + lyricFont;
      var maxW = W * 0.92;
      var m = ctx.measureText(text || '');
      if (m.width > maxW && m.width > 0) { size = Math.max(46, Math.floor(size * maxW / m.width)); }
      ctx.font = '600 ' + size + 'px ' + lyricFont;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255,255,255,0.35)'; ctx.shadowBlur = 18;
      ctx.fillText(text || '', W / 2, H / 2 + 6);
      var tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      return { tex: tex, aspect: W / H };
    }

    function buildLyricSlots() {
      var slots = [];
      for (var i = 0; i < LYRIC_SLOTS; i++) {
        var geo = new THREE.PlaneGeometry(1, 1);
        var mat = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending,
          uniforms: {
            uMap: { value: null }, uProgress: { value: 0 }, uOpacity: { value: 0 },
            uColor: uColorA, uLyric: { value: new THREE.Color('#f3e7cf') },
            uGlow: { value: 0.5 }, uCurrent: { value: 0 }, uHover: uHover, uMid: uMid, uBlur: { value: 0 }
          },
          vertexShader: [
            'varying vec2 vUv;',
            'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'
          ].join('\n'),
          fragmentShader: [
            'uniform sampler2D uMap; uniform float uProgress; uniform float uOpacity;',
            'uniform vec3 uLyric; uniform vec3 uColor; uniform float uGlow; uniform float uCurrent;',
            'uniform float uHover; uniform float uMid; uniform float uBlur;',
            'varying vec2 vUv;',
            'void main(){',
            '  vec4 tx = texture2D(uMap, vUv);',
            '  float a = tx.a;',
            '  if(a < 0.01) discard;',
            // per-char sweep: left of uProgress = lit (album/cream), right = dim base
            '  float lit = smoothstep(uProgress+0.02, uProgress-0.02, vUv.x);', // 1 where lit
            '  vec3 base = mix(vec3(1.0), uLyric, 0.15) * 0.32;',              // dim cream base
            '  vec3 warm = uLyric;',
            '  vec3 glowc = mix(warm, uColor, 0.35);',
            '  vec3 col = mix(base, glowc, lit*uCurrent + (1.0-uCurrent)*0.55);',
            '  float bloom = (0.6 + uMid*0.5 + uHover*0.4) * uGlow;',
            '  col += glowc * lit * uCurrent * bloom * 0.6;',                  // additive bloom on lit chars
            '  gl_FragColor = vec4(col, a * uOpacity);',
            '}'
          ].join('\n')
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { idx: -999, aspect: 4, targetPos: new THREE.Vector3(), targetScale: 1, targetOpacity: 0, rel: i - 2 };
        mesh.renderOrder = 10;
        lyricGroup.add(mesh);
        slots.push(mesh);
      }
      return slots;
    }
    var lyricSlots = buildLyricSlots();
    var lyricLines = [];        // full parsed [{time,text}]
    var lyricCurrent = -1;
    var lyricProgress = 0;
    var lyricGlow = 0.5;
    var lyricColorHex = '#f3e7cf';

    // assign a texture+layout to each slot based on current index
    function refreshLyricSlots() {
      for (var s = 0; s < lyricSlots.length; s++) {
        var slot = lyricSlots[s];
        var rel = s - 2;                       // -2..+2
        var idx = lyricCurrent + rel;
        var line = lyricLines[idx];
        if (!line) {
          slot.userData.idx = -999;
          slot.userData.targetOpacity = 0;
          continue;
        }
        if (slot.userData.idx !== idx) {
          slot.userData.idx = idx;
          if (slot.material.uniforms.uMap.value) slot.material.uniforms.uMap.value.dispose();
          var t = makeLyricTexture(line.text);
          slot.material.uniforms.uMap.value = t.tex;
          slot.userData.aspect = t.aspect;
        }
        slot.userData.lineTime = line.time;
      }
    }

    // depth choreography per frame (called in loop)
    function layoutLyrics() {
      for (var s = 0; s < lyricSlots.length; s++) {
        var slot = lyricSlots[s];
        var rel = s - 2;
        if (slot.userData.idx < 0) { slot.material.uniforms.uOpacity.value = lerp(slot.material.uniforms.uOpacity.value, 0, 0.15); continue; }
        var isCur = rel === 0;
        // base geometry: current large & centered; neighbors recede up/down with depth
        var baseH = isCur ? 26 : 15;                     // world height
        var w = baseH * slot.userData.aspect;
        slot.scale.set(w, baseH, 1);
        // position: y stacks, z pushes back with |rel|, current pulled forward
        var ty = -rel * (isCur ? 0 : 34) - (rel > 0 ? 10 : 0);
        var tz = -Math.abs(rel) * 46 + (isCur ? 20 : 0);
        var tx = rel === 0 ? 0 : rel * 6;
        slot.position.x = lerp(slot.position.x, tx, 0.12);
        slot.position.y = lerp(slot.position.y, ty, 0.12);
        slot.position.z = lerp(slot.position.z, tz, 0.12);
        var op = isCur ? 1.0 : (Math.abs(rel) === 1 ? 0.34 : 0.12);
        slot.material.uniforms.uOpacity.value = lerp(slot.material.uniforms.uOpacity.value, op, 0.12);
        slot.material.uniforms.uCurrent.value = lerp(slot.material.uniforms.uCurrent.value, isCur ? 1 : 0, 0.12);
        slot.material.uniforms.uProgress.value = isCur ? lyricProgress : (rel < 0 ? 1.1 : -0.1);
        slot.material.uniforms.uGlow.value = lyricGlow;
        slot.material.uniforms.uLyric.value.set(lyricColorHex);
      }
    }

    // ============================================================
    //  ALBUM COVER PLANET — textured sphere, slow spin, rim glow
    // ============================================================
    function buildPlanet() {
      var geo = new THREE.SphereGeometry(20, 48, 48);
      var mat = new THREE.MeshBasicMaterial({ color: 0x223047 });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-92, 30, -140);
      universe.add(mesh);
      // atmosphere / rim glow sprite
      var s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
      var ctx = cv.getContext('2d');
      var grd = ctx.createRadialGradient(s/2, s/2, s*0.28, s/2, s/2, s/2);
      grd.addColorStop(0, 'rgba(255,255,255,0.5)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.12)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, s, s);
      var glowTex = new THREE.CanvasTexture(cv);
      var glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 });
      var glow = new THREE.Sprite(glowMat);
      glow.scale.set(64, 64, 1);
      mesh.add(glow);
      return { mesh: mesh, mat: mat, glow: glow, glowMat: glowMat, glowTex: glowTex, tex: null };
    }
    var planet = buildPlanet();
    var texLoader = new THREE.TextureLoader();
    texLoader.crossOrigin = 'anonymous';

    // ============================================================
    //  WEB AUDIO — analyser with WeakSet guard + synthetic fallback
    // ============================================================
    if (!window.__msAudioGraph) window.__msAudioGraph = { ctx: null, sourced: new WeakSet(), analyser: null, freq: null };
    var audioG = window.__msAudioGraph;
    var spectrumSilentFrames = 0;
    var useSynthetic = false;

    function attachAudio(audioEl) {
      if (!audioEl) return false;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { useSynthetic = true; return false; }
        if (!audioG.ctx) audioG.ctx = new AC();
        if (audioG.ctx.state === 'suspended') { audioG.ctx.resume().catch(function () {}); }
        if (!audioG.analyser) {
          audioG.analyser = audioG.ctx.createAnalyser();
          audioG.analyser.fftSize = 256;
          audioG.analyser.smoothingTimeConstant = 0.82;
          audioG.freq = new Uint8Array(audioG.analyser.frequencyBinCount);
          audioG.analyser.connect(audioG.ctx.destination);
        }
        if (!audioG.sourced.has(audioEl)) {
          try { audioEl.crossOrigin = 'anonymous'; } catch (e) {}
          var src = audioG.ctx.createMediaElementSource(audioEl);
          src.connect(audioG.analyser);
          audioG.sourced.add(audioEl);
        }
        return true;
      } catch (e) { useSynthetic = true; return false; }
    }

    // read spectrum → bass/mid/treble (0..1); fall back to synthetic beat when CORS-muted
    function sampleSpectrum(t) {
      var bass = 0, mid = 0, treble = 0;
      if (audioG.analyser && audioG.freq && !useSynthetic) {
        audioG.analyser.getByteFrequencyData(audioG.freq);
        var n = audioG.freq.length, sum = 0;
        var b = 0, mm = 0, tr = 0, bc = 0, mc = 0, tc = 0;
        for (var i = 0; i < n; i++) {
          var v = audioG.freq[i] / 255; sum += audioG.freq[i];
          if (i < n * 0.12) { b += v; bc++; }
          else if (i < n * 0.5) { mm += v; mc++; }
          else { tr += v; tc++; }
        }
        if (sum < 2) { spectrumSilentFrames++; } else { spectrumSilentFrames = 0; }
        if (spectrumSilentFrames > 90 && playing) useSynthetic = true;   // ~1.5s silent while playing → CORS-muted
        bass = bc ? b / bc : 0; mid = mc ? mm / mc : 0; treble = tc ? tr / tc : 0;
      }
      if (useSynthetic || (!audioG.analyser)) {
        // synthetic pseudo-beat driven by time (only when playing) — keeps universe breathing
        if (playing) {
          bass = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3.1));
          mid = 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.7 + 1.0));
          treble = 0.2 + 0.2 * (0.5 + 0.5 * Math.sin(t * 6.3 + 2.0));
        } else { bass = mid = treble = 0; }
      }
      return { bass: bass, mid: mid, treble: treble };
    }

    // ============================================================
    //  Camera state — dolly, orbit (inertial), breathing
    // ============================================================
    var CAM_DEFAULT = 120, CAM_MIN = 52, CAM_MAX = 320;   // wide dolly range: push right up to lyrics / pull far back to full galaxy
    var cam = { z: CAM_DEFAULT, zTarget: CAM_DEFAULT };
    var orbit = { yaw: 0, pitch: 0, yawT: 0, pitchT: 0, vYaw: 0, vPitch: 0 };
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };       // -1..1 parallax
    var hover = { on: 0, target: 0 };
    var playing = false;
    var running = true;
    var zoomCb = null;
    var lastZoomReport = -1;

    // ---- interaction: drag orbit with inertia + click-to-focus lyrics ----
    var raycaster = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    var lyricHoverCb = null;
    var focus = { active: false, hold: 0, z: null, yaw: 0, pitch: 0 };  // camera focus on a lyric plane
    var dragging = false, lastPX = 0, lastPY = 0, downX = 0, downY = 0, moved = 0;

    function updateNdc(clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    }
    function pickLyric() {
      raycaster.setFromCamera(ndc, camera);
      var hits = raycaster.intersectObjects(lyricSlots, false);
      for (var i = 0; i < hits.length; i++) {
        var o = hits[i].object;
        if (o.userData.idx >= 0 && o.material.uniforms.uOpacity.value > 0.2) return o;
      }
      return null;
    }
    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      var p = e.touches ? e.touches[0] : e;
      lastPX = p.clientX; lastPY = p.clientY;
      downX = p.clientX; downY = p.clientY; moved = 0;
      orbit.vYaw = 0; orbit.vPitch = 0;
      interactionEl.classList.add('is-grabbing');
    }
    function onMove(e) {
      var p = e.touches ? e.touches[0] : e;
      // parallax target (normalized)
      var nx = (p.clientX / window.innerWidth) * 2 - 1;
      var ny = (p.clientY / window.innerHeight) * 2 - 1;
      pointer.tx = nx; pointer.ty = ny;
      if (!dragging) {
        // hover-pick lyric for bloom/particle-gather
        updateNdc(p.clientX, p.clientY);
        var hovered = pickLyric();
        hover.target = hovered ? 1 : 0;
        if (lyricHoverCb) lyricHoverCb(!!hovered);
        if (interactionEl.classList) interactionEl.classList.toggle('is-lyric-hover', !!hovered);
        return;
      }
      var dx = p.clientX - lastPX, dy = p.clientY - lastPY;
      moved += Math.abs(dx) + Math.abs(dy);
      lastPX = p.clientX; lastPY = p.clientY;
      // a real drag cancels any lyric focus and takes over
      if (moved > 6) { focus.active = false; focus.hold = 0; }
      orbit.yawT += dx * 0.0022;
      orbit.pitchT = clamp(orbit.pitchT + dy * 0.0018, -0.7, 0.7);
      orbit.vYaw = dx * 0.0022; orbit.vPitch = dy * 0.0018;
    }
    function onUp(e) {
      // treat as a click (not a drag) → focus camera on the lyric, NEVER seek
      if (dragging && moved < 6) {
        var p = (e && e.changedTouches) ? e.changedTouches[0] : e;
        if (p) { updateNdc(p.clientX, p.clientY); var hit = pickLyric(); if (hit) focusLyric(hit); }
      }
      dragging = false;
      interactionEl.classList.remove('is-grabbing');
    }
    function focusLyric(mesh) {
      // dolly in + gently aim; hold ~2s then auto-return. Does NOT touch audio.
      focus.active = true; focus.hold = 2.0;
      focus.z = CAM_MIN + 6;
      // aim orbit so the picked plane comes toward center (small nudge based on its offset)
      focus.yaw = clamp(orbit.yawT - mesh.position.x * 0.004, -0.7, 0.7);
      focus.pitch = clamp(orbit.pitchT + mesh.position.y * 0.004, -0.5, 0.5);
      cam.zTarget = focus.z;
      orbit.yawT = focus.yaw; orbit.pitchT = focus.pitch;
    }
    // ---- wheel: dolly (zoom) — page is locked, so wheel is always camera ----
    function onWheel(e) {
      var d = e.deltaY;
      e.preventDefault();
      focus.active = false; focus.hold = 0;         // user takes over
      cam.zTarget = clamp(cam.zTarget + d * 0.06, CAM_MIN, CAM_MAX);
    }
    // ---- double click: reset view ----
    function onDbl() {
      focus.active = false; focus.hold = 0;
      cam.zTarget = CAM_DEFAULT;
      orbit.yawT = 0; orbit.pitchT = 0; orbit.vYaw = 0; orbit.vPitch = 0;
    }

    interactionEl.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    interactionEl.addEventListener('wheel', onWheel, { passive: false });
    interactionEl.addEventListener('dblclick', onDbl);

    // ============================================================
    //  Resize
    // ============================================================
    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var hgt = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // ============================================================
    //  Loop
    // ============================================================
    var clock = new THREE.Clock();
    function frame() {
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.getElapsedTime();
      uTime.value = t;

      // album color easing
      uColorA.value.lerp(targetA, 0.02);
      uColorB.value.lerp(targetB, 0.02);

      // energy breathing (gentle, only while playing) — NOT an EDM visualizer
      var targetEnergy = playing && !reduced ? (0.5 + 0.5 * Math.sin(t * 1.1)) * 0.6 : 0;
      uEnergy.value = lerp(uEnergy.value, targetEnergy, 0.05);

      // audio spectrum → bass/mid/treble uniforms (smoothed, restrained, scaled by 律动强度)
      var spec = reduced ? { bass: 0, mid: 0, treble: 0 } : sampleSpectrum(t);
      var rk = vparam.react;
      uBass.value = lerp(uBass.value, spec.bass * rk, 0.18);
      uMid.value = lerp(uMid.value, spec.mid * rk, 0.12);
      uTreble.value = lerp(uTreble.value, spec.treble * rk, 0.22);

      // hover intensifier
      hover.on = lerp(hover.on, hover.target, 0.08);
      uHover.value = hover.on;

      // lyric focus auto-return: hold ~2s, then release back to default follow view
      if (focus.active) {
        focus.hold -= dt;
        if (focus.hold <= 0) { focus.active = false; cam.zTarget = CAM_DEFAULT; orbit.yawT = 0; orbit.pitchT = 0; }
      }

      // pointer parallax easing
      pointer.x = lerp(pointer.x, pointer.tx, 0.05);
      pointer.y = lerp(pointer.y, pointer.ty, 0.05);

      // orbit inertia — settle toward target, carry velocity on release
      if (!dragging && !reduced) {
        orbit.yawT += orbit.vYaw;
        orbit.pitchT = clamp(orbit.pitchT + orbit.vPitch, -0.7, 0.7);
        orbit.vYaw *= 0.94; orbit.vPitch *= 0.94;
        if (Math.abs(orbit.vYaw) < 1e-5) orbit.vYaw = 0;
        if (Math.abs(orbit.vPitch) < 1e-5) orbit.vPitch = 0;
      }
      orbit.yaw = lerp(orbit.yaw, orbit.yawT, 0.08);
      orbit.pitch = lerp(orbit.pitch, orbit.pitchT, 0.08);

      // camera breathing + drift + dolly (breath amplitude scaled by 电影镜头)
      cam.z = lerp(cam.z, cam.zTarget, 0.07);
      var breatheZ = reduced ? 0 : Math.sin(t * 0.25) * 2.2 * (0.4 + vparam.cine);
      camera.position.z = cam.z + breatheZ;
      // pointer parallax = camera translate (true depth parallax, scaled by 画面景深)
      var par = reduced ? 0 : vparam.depth;
      camera.position.x = lerp(camera.position.x, pointer.x * 14 * par, 0.06);
      camera.position.y = lerp(camera.position.y, -pointer.y * 10 * par, 0.06);
      camera.lookAt(0, 0, -60);

      // apply orbit + slow autonomous drift to the universe
      var drift = reduced ? 0 : t * 0.008;
      universe.rotation.y = orbit.yaw + drift;
      universe.rotation.x = orbit.pitch;

      // extra parallax: push dust opposite pointer, nudge galaxy with pointer (scaled by depth)
      nearGroup.position.x = -pointer.x * 12 * vparam.depth;
      nearGroup.position.y = pointer.y * 8 * vparam.depth;
      farGroup.position.x = pointer.x * 4;

      // nebula slow life + color assignment
      nebula.clouds.forEach(function (sp) {
        sp.material.rotation += sp.userData.spin * dt;
        var pulse = reduced ? 1 : (0.9 + 0.1 * Math.sin(t * 0.4 + sp.position.x));
        sp.material.opacity = sp.userData.base * pulse * (1 + uEnergy.value * 0.2);
        sp.material.color.copy(sp.userData.which === 'A' ? uColorA.value : uColorB.value);
      });

      // core glow follows album + energy (Bloom breathing) + mid-freq
      core.m.color.copy(uColorA.value);
      core.m.opacity = 0.16 + uEnergy.value * 0.12 + hover.on * 0.06 + uMid.value * 0.1;
      core.sp.scale.set(520 + hover.on * 60 + uMid.value * 40, 340 + hover.on * 40 + uMid.value * 26, 1);

      // lyric planes: keep facing camera-ish (billboard yaw only), choreograph depth
      layoutLyrics();
      lyricGroup.rotation.y = lerp(lyricGroup.rotation.y, orbit.yaw * 0.12, 0.1);   // tiny parallax, "几乎保持稳定"
      lyricGroup.position.x = -pointer.x * 3;
      lyricGroup.position.y = pointer.y * 2;

      // album planet: slow self-spin + rim glow follows album color + treble shimmer
      planet.mesh.rotation.y += dt * 0.15;
      planet.glowMat.color.copy(uColorA.value);
      planet.glowMat.opacity = 0.4 + uMid.value * 0.2 + uTreble.value * 0.15;

      // meteors
      if (!reduced) {
        meteors.next -= dt;
        if (meteors.next <= 0) { launchMeteor(meteors); meteors.next = 5 + Math.random() * 7; }
        meteors.pool.forEach(function (sp) {
          if (!sp.userData.active) return;
          sp.userData.life += dt;
          sp.position.x += sp.userData.vx * dt;
          sp.position.y += sp.userData.vy * dt;
          var l = sp.userData.life;
          sp.material.opacity = l < 0.25 ? l / 0.25 * 0.7 : Math.max(0, 0.7 - (l - 0.25) * 0.5);
          if (sp.material.opacity <= 0.01 && l > 0.3) { sp.userData.active = false; sp.material.opacity = 0; }
        });
      }

      // report zoom (for lyric scaling in DOM)
      if (zoomCb) {
        var z = (CAM_DEFAULT - cam.z) / (CAM_DEFAULT - CAM_MIN); // 0 default .. 1 closest, negative when far
        z = clamp(z, -0.6, 1);
        if (Math.abs(z - lastZoomReport) > 0.01) { lastZoomReport = z; zoomCb(z); }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    var raf = requestAnimationFrame(frame);

    // ============================================================
    //  Public API
    // ============================================================
    function hexToColor(hex) { try { return new THREE.Color(hex); } catch (e) { return null; } }

    var api = {
      setAlbumColors: function (a, b) {
        var ca = hexToColor(a), cb = hexToColor(b);
        if (ca) targetA = ca;
        if (cb) targetB = cb;
      },
      setPlaying: function (v) {
        playing = !!v;
        // browsers require a user gesture to start AudioContext — resume on play
        if (v && audioG.ctx && audioG.ctx.state === 'suspended') audioG.ctx.resume().catch(function () {});
      },
      setHover: function (v) { hover.target = v ? 1 : 0; },
      onLyricHover: function (cb) { lyricHoverCb = cb; },
      // live visual knobs from the console
      setVisualParams: function (p) {
        p = p || {};
        if (p.starBrightness != null) uStarBright.value = clamp(p.starBrightness, 0, 1);
        if (p.starDensity != null) uStarCut.value = clamp(1.15 - p.starDensity, 0, 0.85);  // density 1.15+→show all, 0.3→~85% culled
        if (p.reactivity != null) vparam.react = clamp(p.reactivity, 0, 2);
        if (p.depth != null) vparam.depth = clamp(p.depth, 0, 2);
        if (p.cinematic != null) {
          vparam.cine = clamp(p.cinematic, 0, 1);
          try { if (interactionEl && interactionEl.closest) { var host = interactionEl.closest('.music-space'); if (host) host.style.setProperty('--ms-cine', String(vparam.cine)); } } catch (e) {}
        }
      },
      // full parsed lyric lines: [{time, text}]
      setLyrics: function (lines) {
        lyricLines = Array.isArray(lines) ? lines : [];
        lyricCurrent = -1;   // force refresh on next state
      },
      // called when playback line/progress changes
      setLyricState: function (currentIndex, progress) {
        var changed = currentIndex !== lyricCurrent;
        lyricCurrent = currentIndex;
        lyricProgress = clamp(progress || 0, 0, 1);
        if (changed) refreshLyricSlots();
      },
      setLyricStyle: function (colorHex, glow) {
        if (colorHex) lyricColorHex = colorHex;
        if (glow != null) lyricGlow = glow;
      },
      // album cover → planet texture (crossOrigin; falls back to color on taint)
      setCover: function (url, colorHex) {
        if (colorHex) { try { planet.mat.color.set(colorHex); } catch (e) {} }
        if (!url) return;
        texLoader.load(url, function (tex) {
          tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
          if (planet.tex) planet.tex.dispose();
          planet.tex = tex;
          planet.mat.map = tex; planet.mat.color.set('#ffffff'); planet.mat.needsUpdate = true;
        }, undefined, function () { /* keep color-sphere fallback */ });
      },
      attachAudio: attachAudio,
      reset: onDbl,
      resize: resize,
      onZoom: function (cb) { zoomCb = cb; },
      pause: function () { running = false; if (raf) cancelAnimationFrame(raf); },
      resume: function () { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } },
      dispose: function () {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        interactionEl.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        interactionEl.removeEventListener('wheel', onWheel);
        interactionEl.removeEventListener('dblclick', onDbl);
        window.removeEventListener('resize', resize);
        [stars, galaxy, dust].forEach(function (o) { if (o.g) o.g.dispose(); if (o.m) o.m.dispose(); });
        nebula.clouds.forEach(function (s) { s.material.dispose(); });
        nebula.tex.dispose(); core.m.dispose(); if (core.m.map) core.m.map.dispose();
        meteors.pool.forEach(function (s) { s.material.dispose(); }); meteors.tex.dispose();
        lyricSlots.forEach(function (m) { if (m.material.uniforms.uMap.value) m.material.uniforms.uMap.value.dispose(); m.geometry.dispose(); m.material.dispose(); });
        planet.mesh.geometry.dispose(); planet.mat.dispose();
        if (planet.tex) planet.tex.dispose(); planet.glowMat.dispose(); planet.glowTex.dispose();
        // NOTE: leave window.__msAudioGraph (ctx + sourced elements) alive across pjax —
        // an <audio> can only be source-d once per AudioContext; re-mount reuses it.
        scene.traverse(function () {});
        try { renderer.dispose(); } catch (e) {}
      }
    };
    return api;
  }

  window.MusicUniverse = { create: create };
})();

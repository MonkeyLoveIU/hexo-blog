/* movies.js — Personal Cinema Archive
 * 交互与渲染。ECharts 由页面 md 内联加载。
 * 兼容 pjax：init() 可重入，全局监听只绑一次。
 */
(function () {
  'use strict';

  var STATUS_LABELS = { wish: '想看', watching: '在看', watched: '看过' };
  var TYPE_LABELS = { movie: '电影', tv: '剧集', anime: '番剧', doc: '纪录/综艺' };

  var root = null;   // 每次 init() 重新解析当前页面的 .movies-page
  var state = {
    items: [],
    stats: null,
    status: 'all',
    type: '',
    q: '',
    openYears: Object.create(null)
  };
  var byId = Object.create(null);

  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };

  function fmtNum(n) { return (n || 0).toLocaleString(); }
  function fmtHours(mins) {
    var h = (mins || 0) / 60;
    return h >= 100 ? Math.round(h).toLocaleString() : h.toFixed(1);
  }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function starsHTML(rating) {
    var r = Number(rating) || 0;
    if (r <= 0) return '';
    var pct = Math.max(0, Math.min(100, (r / 5) * 100));
    return (
      '<span class="mv-card__stars" aria-label="' + r + ' / 5">' +
      '<span class="mv-star">★★★★★' +
      '<span class="mv-star__fill" style="clip-path:inset(0 ' + (100 - pct) + '% 0 0)">★★★★★</span>' +
      '</span></span>'
    );
  }

  function passFilter(item) {
    if (state.status !== 'all' && item.status !== state.status) return false;
    if (state.type && item.type !== state.type) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = [
        item.title_cn, item.title_original,
        (item.director || []).join(' '),
        (item.cast || []).join(' '),
        (item.tags || []).join(' '),
        (item.genres || []).join(' ')
      ].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function cardHTML(i) {
    var poster = i.poster
      ? '<img class="mv-card__poster" src="' + esc(i.poster) + '" alt="' + esc(i.title_cn) + '" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'mv-card__poster mv-card__poster--placeholder\',textContent:\'' + esc((i.title_cn || '?').slice(0, 6)) + '\'}));">'
      : '<div class="mv-card__poster mv-card__poster--placeholder">' + esc((i.title_cn || '?').slice(0, 6)) + '</div>';
    
    var ratingVal = Number(i.my_rating) > 0 ? (Number(i.my_rating) * 2).toFixed(0) : '';
    var ratingHtml = ratingVal ? '<div class="mv-card__rating">' + ratingVal + '</div>' : '';
    var statusTag = '<div class="mv-card__status" data-status="' + esc(i.status) + '">' + esc(STATUS_LABELS[i.status] || '') + '</div>';
    var typeLabel = TYPE_LABELS[i.type] || '其他';
    
    return (
      '<div class="mv-card" data-id="' + esc(i.id) + '" tabindex="0" role="button" aria-label="' + esc(i.title_cn) + '">' +
        poster + ratingHtml + statusTag +
        '<div class="mv-card__overlay">' +
          '<h3 class="mv-card__title">' + esc(i.title_cn) + '</h3>' +
          '<div class="mv-card__type">' + esc(typeLabel) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderHero() {
    var s = state.stats || {};
    var totalHours = Math.round((s.totalMinutes || 0) / 60);
    setStat('thisYear', fmtNum(s.thisYearCount));
    setStat('totalHours', fmtNum(totalHours));
    setStat('avgRating', (s.avgRating || 0).toFixed(1));
    setStat('topDirector', s.topDirector || '—');
    setStat('topCountry', s.topCountry || '—');
  }
  function setStat(key, val) {
    var el = $('.mv-stat[data-stat="' + key + '"] .mv-stat__num');
    if (el) el.textContent = val;
  }

  function renderTabs() {
    var items = state.items;
    var counts = { all: items.length, wish: 0, watching: 0, watched: 0 };
    items.forEach(function (i) { if (counts[i.status] !== undefined) counts[i.status]++; });
    $$('.mv-tab').forEach(function (t) {
      var s = t.getAttribute('data-status');
      var n = t.querySelector('.mv-tab__n');
      if (n) n.textContent = counts[s] != null ? counts[s] : '';
      t.classList.toggle('is-active', s === state.status);
    });
  }

  function renderGrid() {
    var host = $('#mv-grid');
    var pHost = $('#mv-pagination');
    if (!host) return;
    var visible = state.items.filter(passFilter);
    if (!visible.length) {
      host.innerHTML = '<div class="mv-empty" style="display:block;grid-column:1/-1">没有符合条件的记录</div>';
      pHost.hidden = true;
      return;
    }
    
    var totalPages = Math.ceil(visible.length / state.pageSize);
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    
    var start = (state.page - 1) * state.pageSize;
    var end = start + state.pageSize;
    var pageItems = visible.slice(start, end);
    
    host.innerHTML = pageItems.map(cardHTML).join('');
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    var pHost = $('#mv-pagination');
    if (totalPages <= 1) {
      pHost.hidden = true;
      return;
    }
    pHost.hidden = false;
    var html = '';
    html += '<button class="mv-page-btn" data-page="' + (state.page - 1) + '" ' + (state.page === 1 ? 'disabled' : '') + '>‹</button>';
    
    var startPage = Math.max(1, state.page - 2);
    var endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (var p = startPage; p <= endPage; p++) {
      html += '<button class="mv-page-btn ' + (p === state.page ? 'is-active' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    
    html += '<button class="mv-page-btn" data-page="' + (state.page + 1) + '" ' + (state.page === totalPages ? 'disabled' : '') + '>›</button>';
    pHost.innerHTML = html;
  }

  var gridObserver = null;
  function bindGridResize() {
    var container = $('.mv-list-container');
    if (!container || typeof ResizeObserver === 'undefined') return;
    if (gridObserver) gridObserver.disconnect();
    gridObserver = new ResizeObserver(debounce(function() {
      var w = container.clientWidth;
      var gap = window.innerWidth <= 768 ? 16 : 28;
      var cols = Math.floor((w + gap) / (156 + gap));
      cols = Math.max(2, cols);
      var newSize = cols * 2;
      if (state.pageSize !== newSize) {
        state.pageSize = newSize;
        state.page = 1;
        renderGrid();
      }
    }, 150));
    gridObserver.observe(container);
  }

  function bindGrid() {
    root.addEventListener('click', function(e) {
      var card = e.target.closest('.mv-card');
      if (card) {
        openModal(card.getAttribute('data-id'));
        return;
      }
      var btn = e.target.closest('.mv-page-btn');
      if (btn && !btn.disabled) {
        state.page = parseInt(btn.getAttribute('data-page'), 10);
        renderGrid();
        var container = $('.mv-list-container');
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    root.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('.mv-card');
      if (card) { e.preventDefault(); openModal(card.getAttribute('data-id')); }
    });
  }

  function bindTabs() {
    $$('.mv-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        state.status = t.getAttribute('data-status');
        state.page = 1;
        renderTabs();
        renderGrid();
      });
    });
    $$('.mv-filter').forEach(function (f) {
      var evt = f.tagName === 'SELECT' ? 'change' : 'input';
      f.addEventListener(evt, debounce(function () {
        var key = f.getAttribute('data-filter');
        state[key] = f.value;
        state.page = 1;
        renderGrid();
      }, 180));
    });
  }

  function debounce(fn, ms) {
    var t; return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  /* ------ MODAL ------ */
  function openModal(id) {
    var i = byId[id];
    if (!i) return;
    var modal = $('.mv-modal');
    modal.innerHTML = modalHTML(i);
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.mv-modal__close');
    if (closeBtn) closeBtn.focus();
    if (location.hash !== '#m/' + id) history.replaceState(null, '', '#m/' + id);
  }

  function closeModal() {
    var modal = $('.mv-modal');
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    setTimeout(function () {
      modal.hidden = true;
      modal.innerHTML = '';
    }, 250);
    document.body.style.overflow = '';
    if (location.hash.indexOf('#m/') === 0) history.replaceState(null, '', location.pathname);
  }

  function modalHTML(i) {
    var backdrop = i.backdrop || i.poster || '';
    var poster = i.poster
      ? '<img class="mv-modal__poster" src="' + esc(i.poster) + '" alt="' + esc(i.title_cn) + '">'
      : '<div class="mv-modal__poster mv-card__poster--placeholder">' + esc((i.title_cn || '?').slice(0, 6)) + '</div>';
    var runtime = i.runtime ? esc(i.runtime) + ' 分钟' : '—';
    var meta = [
      { l: '导演', v: (i.director || []).join(' / ') || '—' },
      { l: '主演', v: (i.cast || []).slice(0, 3).join(' / ') || '—' },
      { l: '国家', v: (i.countries || []).join(' / ') || '—' },
      { l: '类型', v: (i.genres || []).join(' · ') || '—' },
      { l: '时长', v: runtime },
      { l: '首映', v: i.year || '—' },
      { l: '观看', v: i.watched_date || '—' },
      { l: '平台', v: i.platform || '—' },
      { l: '我的评分', v: Number(i.my_rating) > 0 ? Number(i.my_rating).toFixed(1) + ' / 5' : '未评' },
      { l: '豆瓣', v: i.douban_rating != null ? i.douban_rating : '—' }
    ];
    var quotesHTML = (i.quotes && i.quotes.length)
      ? '<div class="mv-modal__quotes">' + i.quotes.map(function (q) {
          return '<div class="mv-modal__quote">' + esc(q) + '</div>';
        }).join('') + '</div>'
      : '';
    var reviewText = i.long_review_md && i.long_review_md.trim()
      ? i.long_review_md
      : (i.short_review || '');
    var reviewHTML = reviewText
      ? '<div class="mv-modal__review">' + esc(reviewText).replace(/\n/g, '<br>') + '</div>'
      : '';
    var aiHTML = i.ai_summary
      ? '<div class="mv-modal__review" style="opacity:.75;font-style:italic">AI · ' + esc(i.ai_summary) + '</div>'
      : '';
    var tagsHTML = (i.tags && i.tags.length)
      ? '<div class="mv-modal__tags">' + i.tags.map(function (t) {
          return '<span class="mv-modal__tag">' + esc(t) + '</span>';
        }).join('') + '</div>'
      : '';

    return (
      '<div class="mv-modal__card" role="document">' +
        '<button class="mv-modal__close" aria-label="关闭">×</button>' +
        '<div class="mv-modal__backdrop" style="background-image:url(' + esc(backdrop) + ')"></div>' +
        '<div class="mv-modal__body">' +
          '<div>' + poster + '</div>' +
          '<div class="mv-modal__meta">' +
            '<h2>' + esc(i.title_cn) + '</h2>' +
            '<div class="mv-modal__orig">' + esc(i.title_original || '') + '</div>' +
            tagsHTML +
            '<div class="mv-modal__row">' +
              meta.map(function (m) {
                return '<div><div class="mv-modal__label">' + m.l + '</div><div class="mv-modal__value">' + esc(m.v) + '</div></div>';
              }).join('') +
            '</div>' +
            reviewHTML +
            aiHTML +
            quotesHTML +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function bindModal() {
    var modal = $('.mv-modal');
    if (!modal || modal.dataset.bound) return;
    modal.dataset.bound = '1';
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.mv-modal__close')) closeModal();
    });
  }

  // document/window 级监听只绑一次（window 跨 pjax 存活）。
  // pjax 会整段重跑本脚本 → 每次 init 刷新 window.__mvActive 指向最新闭包，
  // 一次性监听器据此调用当前页面的 open/closeModal，避免调用已失效的旧闭包。
  function bindGlobalOnce() {
    window.__mvActive = { openModal: openModal, closeModal: closeModal };
    if (window.__mvGlobalBound) return;
    window.__mvGlobalBound = true;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && window.__mvActive) window.__mvActive.closeModal();
    });
    window.addEventListener('hashchange', function () {
      if (!document.querySelector('.movies-page') || !window.__mvActive) return;
      var m = location.hash.match(/^#m\/(.+)$/);
      if (m) window.__mvActive.openModal(m[1]); else window.__mvActive.closeModal();
    });
  }

  /* ------ CHARTS ------ */
  var charts = {};
  var chartsInit = false;
  var chartsObserver = null;
  function initChartsIfReady() {
    if (chartsInit) return;
    var viz = $('.mv-viz');
    if (!viz) return;
    if (chartsObserver) chartsObserver.disconnect();
    chartsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (ent) {
        if (ent.isIntersecting) {
          if (!chartsInit && typeof echarts !== 'undefined') drawCharts();
          if (chartsInit && chartsObserver) chartsObserver.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    chartsObserver.observe(viz);
  }

  function drawCharts() {
    chartsInit = true;
    var s = state.stats || {};
    var baseText = { color: '#8a8a92', fontFamily: '-apple-system, "PingFang SC", sans-serif' };
    var gridBase = { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true };
    var lineColor = 'rgba(255,255,255,0.06)';

    charts.trend = echarts.init($('#mv-chart-trend'));
    var trend = s.yearlyTrend || [];
    charts.trend.setOption({
      textStyle: baseText,
      grid: gridBase,
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      xAxis: { type: 'category', data: trend.map(function (t) { return t.year; }), axisLine: { lineStyle: { color: lineColor } }, axisLabel: { color: '#8a8a92' } },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: lineColor, type: 'dashed' } }, axisLabel: { color: '#8a8a92' } },
      series: [{
        type: 'line', data: trend.map(function (t) { return t.count; }),
        smooth: true, symbol: 'circle', symbolSize: 8,
        lineStyle: { color: '#f5c518', width: 2 },
        itemStyle: { color: '#f5c518' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: 'rgba(245,197,24,0.35)' }, { offset: 1, color: 'rgba(245,197,24,0)' }
        ] } }
      }]
    });

    charts.genre = echarts.init($('#mv-chart-genre'));
    charts.genre.setOption({
      textStyle: baseText,
      tooltip: { trigger: 'item', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      series: [{
        type: 'pie', radius: ['45%', '72%'], center: ['50%', '50%'],
        avoidLabelOverlap: true, itemStyle: { borderColor: '#131317', borderWidth: 2 },
        label: { color: '#8a8a92', fontSize: 11 },
        data: (s.genres || []).slice(0, 8).map(function (g) { return { name: g.name, value: g.count }; }),
        color: ['#f5c518', '#e88b3c', '#c1613d', '#82497a', '#4a4977', '#3d6b7a', '#2f7a5f', '#7f8a34']
      }]
    });

    charts.country = echarts.init($('#mv-chart-country'));
    var countries = (s.countries || []).slice(0, 10);
    charts.country.setOption({
      textStyle: baseText,
      grid: gridBase,
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: lineColor, type: 'dashed' } }, axisLabel: { color: '#8a8a92' } },
      yAxis: { type: 'category', data: countries.map(function (c) { return c.name; }).reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8a8a92' } },
      series: [{ type: 'bar', data: countries.map(function (c) { return c.count; }).reverse(), itemStyle: { color: '#e88b3c', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 14 }]
    });

    charts.directors = echarts.init($('#mv-chart-directors'));
    var directors = (s.directors || []).slice(0, 10);
    charts.directors.setOption({
      textStyle: baseText,
      grid: gridBase,
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: lineColor, type: 'dashed' } }, axisLabel: { color: '#8a8a92' } },
      yAxis: { type: 'category', data: directors.map(function (d) { return d.name; }).reverse(), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8a8a92' } },
      series: [{ type: 'bar', data: directors.map(function (d) { return d.count; }).reverse(), itemStyle: { color: '#82497a', borderRadius: [0, 4, 4, 0] }, barMaxWidth: 14 }]
    });

    charts.rating = echarts.init($('#mv-chart-rating'));
    var dist = s.ratingDist || {};
    var keys = Object.keys(dist).sort(function (a, b) { return +a - +b; });
    charts.rating.setOption({
      textStyle: baseText,
      grid: gridBase,
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      xAxis: { type: 'category', data: keys, axisLine: { lineStyle: { color: lineColor } }, axisLabel: { color: '#8a8a92' } },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: lineColor, type: 'dashed' } }, axisLabel: { color: '#8a8a92' } },
      series: [{ type: 'bar', data: keys.map(function (k) { return dist[k]; }), itemStyle: { color: '#f5c518', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 24 }]
    });

    charts.heat = echarts.init($('#mv-chart-heatmap'));
    var months = s.monthlyHeatmap || {};
    var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    var maxM = Math.max.apply(null, [1].concat(Object.keys(months).map(function (k) { return months[k]; })));
    charts.heat.setOption({
      textStyle: baseText,
      tooltip: { position: 'top', backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'rgba(255,255,255,.06)', textStyle: { color: '#ececee' } },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: monthNames, splitArea: { show: false }, axisLine: { lineStyle: { color: lineColor } }, axisLabel: { color: '#8a8a92', fontSize: 10 } },
      yAxis: { type: 'category', data: ['本年'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8a8a92' } },
      visualMap: { min: 0, max: maxM, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#1a1a1f', '#f5c518'] }, textStyle: { color: '#8a8a92' } },
      series: [{
        type: 'heatmap', data: monthNames.map(function (m, idx) { return [idx, 0, months[idx + 1] || 0]; }),
        label: { show: false },
        itemStyle: { borderColor: '#131317', borderWidth: 2 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(245,197,24,.5)' } }
      }]
    });

    if (!window.__mvResizeBound) {
      window.__mvResizeBound = true;
      window.addEventListener('resize', function () {
        Object.keys(charts).forEach(function (k) { charts[k] && charts[k].resize(); });
      });
    }
  }

  /* ------ INIT (可重入，兼容 pjax) ------ */
  function init() {
    var el = document.querySelector('.movies-page');
    if (!el) return;               // 当前页面不是电影档案，退出
    if (el.dataset.mvReady) return; // 已初始化过（同一 DOM 节点），跳过
    el.dataset.mvReady = '1';
    root = el;

    // 重置每次进入页面的状态（pjax 会给全新 DOM）
    state = { items: [], stats: null, status: 'all', type: '', q: '', page: 1, pageSize: 12 };
    byId = Object.create(null);
    charts = {};
    chartsInit = false;
    if (chartsObserver) { chartsObserver.disconnect(); chartsObserver = null; }
    if (gridObserver) { gridObserver.disconnect(); gridObserver = null; }

    var src = root.getAttribute('data-src') || '/movies/data.json';
    fetch(src)
      .then(function (r) { return r.json(); })
      .then(function (payload) {
        if (!document.body.contains(root)) return; // pjax 已切走，放弃渲染
        state.items = payload.items || [];
        state.stats = payload.stats || {};
        state.items.forEach(function (i) { byId[i.id] = i; });

        preloadTopPosters();

        renderHero();
        renderTabs();
        
        // Initial setup for grid size
        var container = $('.mv-list-container');
        if (container) {
          var w = container.clientWidth;
          var gap = window.innerWidth <= 768 ? 16 : 28;
          var cols = Math.max(2, Math.floor((w + gap) / (156 + gap)));
          state.pageSize = cols * 2;
        }
        
        renderGrid();
        bindTabs();
        bindGrid();
        bindGridResize();
        bindModal();
        bindGlobalOnce();
        initChartsIfReady();

        var m = location.hash.match(/^#m\/(.+)$/);
        if (m) openModal(m[1]);
      })
      .catch(function (err) {
        console.error('Movies page error:', err);
        var host = $('.mv-list-container') || root;
        if (host) host.innerHTML = '<div class="mv-empty" style="display:block">数据加载失败：' + esc(err.message) + '</div>';
      });
  }

  function preloadTopPosters() {
    var top = state.items.filter(passFilter).slice(0, 8);
    top.forEach(function (i) {
      if (!i.poster) return;
      var l = document.createElement('link');
      l.rel = 'preload'; l.as = 'image'; l.href = i.poster;
      document.head.appendChild(l);
    });
  }

  // pjax 机制：主题在 pjax:success 时会重新执行所有 script[data-pjax]
  // （见 themes/reimu/source/js/pjax.js），即整段 IIFE 会重跑一次。
  // 因此这里只需直接 init()，不要再自行注册 pjax 监听（否则每次访问都会叠加）。
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();

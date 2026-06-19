
(function () {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  function initHeroCarousel() {
    const root = $('.hero-carousel');
    if (!root) return;
    const slides = $$('.hero-slide', root);
    const dots = $$('.hero-dot', root);
    const prev = $('.hero-prev', root);
    const next = $('.hero-next', root);
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if (index < 0) index = 0;
    let timer = null;

    function render() {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
      restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(1), 5000);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; render(); restart(); }));
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    root.addEventListener('mouseenter', () => timer && clearInterval(timer));
    root.addEventListener('mouseleave', restart);
    render();
    restart();
  }

  function initSimpleFilter() {
    const input = $('[data-simple-filter-input]');
    if (!input) return;
    const cards = $$('[data-search-item]');
    const counter = $('[data-simple-filter-count]');

    function apply() {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const hay = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.category,
        ].join(' ').toLowerCase();
        const show = !q || hay.includes(q);
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      if (counter) counter.textContent = String(visible);
    }

    input.addEventListener('input', apply);
    apply();
  }

  function initAdvancedSearch() {
    const toolbar = $('[data-advanced-search]');
    if (!toolbar) return;
    const items = $$('[data-search-item]');
    const queryInput = $('[data-query-input]', toolbar);
    const regionSel = $('[data-region-select]', toolbar);
    const genreSel = $('[data-genre-select]', toolbar);
    const yearSel = $('[data-year-select]', toolbar);
    const sortSel = $('[data-sort-select]', toolbar);
    const countEl = $('[data-result-count]', toolbar);

    function num(el, key) {
      const v = Number(el.dataset[key]);
      return Number.isFinite(v) ? v : 0;
    }

    function compareBySort(a, b) {
      switch (sortSel ? sortSel.value : 'hot') {
        case 'new':
          return num(b, 'year') - num(a, 'year');
        case 'rating':
          return num(b, 'rating') - num(a, 'rating') || num(b, 'views') - num(a, 'views');
        case 'views':
        default:
          return num(b, 'views') - num(a, 'views') || num(b, 'rating') - num(a, 'rating');
      }
    }

    function apply() {
      const q = (queryInput?.value || '').trim().toLowerCase();
      const region = regionSel?.value || '';
      const genre = genreSel?.value || '';
      const year = yearSel?.value || '';
      let visible = [];
      items.forEach(item => {
        const hay = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.year,
          item.dataset.genre,
          item.dataset.tags,
          item.dataset.category,
        ].join(' ').toLowerCase();
        const passQ = !q || hay.includes(q);
        const passRegion = !region || item.dataset.region === region;
        const passGenre = !genre || item.dataset.genre.includes(genre) || item.dataset.tags.includes(genre);
        const passYear = !year || item.dataset.year === year;
        const show = passQ && passRegion && passGenre && passYear;
        item.classList.toggle('hidden', !show);
        if (show) visible.push(item);
      });
      visible.sort(compareBySort);
      const parent = visible[0]?.parentElement;
      if (parent) visible.forEach(el => parent.appendChild(el));
      if (countEl) countEl.textContent = String(visible.length);
    }

    [queryInput, regionSel, genreSel, yearSel, sortSel].forEach(el => el && el.addEventListener('input', apply));
    [regionSel, genreSel, yearSel, sortSel].forEach(el => el && el.addEventListener('change', apply));
    apply();
  }

  function initVideoPlayers() {
    $$('video[data-src]').forEach(video => {
      const src = video.dataset.src;
      if (!src) return;
      if (src.endsWith('.m3u8') && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.addEventListener('error', () => {
          video.src = src;
        }, { once: true });
      } else {
        video.src = src;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initSimpleFilter();
    initAdvancedSearch();
    initVideoPlayers();
  });
})();

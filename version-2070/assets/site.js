
(function(){
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobile = document.querySelector('[data-mobile-nav]');
  if (toggle && mobile) {
    toggle.addEventListener('click', function(){
      mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', mobile.classList.contains('open') ? 'true' : 'false');
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      let index = 0;
      const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      };
      let timer = setInterval(() => show(index + 1), 5000);
      hero.addEventListener('mouseenter', () => clearInterval(timer));
      hero.addEventListener('mouseleave', () => { clearInterval(timer); timer = setInterval(() => show(index + 1), 5000); });
      dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    }
  }

  const searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', function(ev){
      ev.preventDefault();
      const input = searchForm.querySelector('input[name="q"]');
      const q = (input && input.value || '').trim();
      window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  const searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.MOVIE_INDEX) {
    const input = document.querySelector('#searchInput');
    const region = document.querySelector('#regionFilter');
    const type = document.querySelector('#typeFilter');
    const year = document.querySelector('#yearFilter');
    const result = document.querySelector('#searchResults');
    const counter = document.querySelector('#resultCount');
    const params = new URLSearchParams(window.location.search);
    if (params.get('q') && input) input.value = params.get('q');
    const render = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const regionValue = region?.value || '';
      const typeValue = type?.value || '';
      const yearValue = year?.value || '';
      const filtered = window.MOVIE_INDEX.filter(item => {
        const hitQ = !q || [item.title, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().includes(q);
        const hitRegion = !regionValue || item.region.includes(regionValue);
        const hitType = !typeValue || item.type.includes(typeValue);
        const hitYear = !yearValue || String(item.year) === yearValue;
        return hitQ && hitRegion && hitType && hitYear;
      });
      if (counter) counter.textContent = '共找到 ' + filtered.length + ' 部影片';
      if (!result) return;
      result.innerHTML = filtered.slice(0, 300).map(item => `
        <article class="card movie-card">
          <a href="${item.url}" class="cover" style="--h:${item.hue}">
            <span class="id">${item.id}</span>
            <div class="mini">
              <h3>${item.title}</h3>
              <div class="meta"><span>${item.region}</span><span>${item.year}</span><span>${item.type}</span></div>
            </div>
          </a>
          <div class="body">
            <p>${item.oneLine}</p>
            <div class="tags"><span class="tag">${item.genre}</span><span class="tag alt">${item.tags.slice(0,2).join(' · ')}</span></div>
          </div>
        </article>
      `).join('') || '<div class="panel pad">没有找到符合条件的影片。</div>';
    };
    [input, region, type, year].filter(Boolean).forEach(el => el.addEventListener('input', render));
    render();
  }
})();

(() => {
  const body = document.body;
  const pageType = body.dataset.page || 'home';
  const app = document.getElementById('app');
  const header = document.getElementById('siteHeader');
  const desktopSearch = document.getElementById('desktopSearch');
  const mobileSearch = document.getElementById('mobileSearch');
  const searchResultsPanel = document.getElementById('searchResultsPanel');
  const mobileSearchWrap = document.getElementById('mobileSearchWrap');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileSearchToggle = document.getElementById('mobileSearchToggle');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const whatsappFab = document.getElementById('whatsappFab');
  const yearEl = document.getElementById('currentYear');

  const state = {
    data: null,
    query: new URLSearchParams(location.search).get('q') || '',
    categorySlug: new URLSearchParams(location.search).get('category') || '',
    productId: Number(new URLSearchParams(location.search).get('product') || 0),
  };
  let badgeUid = 0;

  const ICONS = {
    'graduation-cap': icon('<path d="M12 4 3.8 8.5 12 13l8.2-4.5L12 4Z"/><path d="M6.5 10.2V15c0 1.9 2.4 3.6 5.5 3.6s5.5-1.7 5.5-3.6v-4.8"/><path d="M20 9.5v4.2"/>'),
    exam: icon('<path d="M7 5h10l2 2v12H5V5h2Z"/><path d="M8.5 10.5h7M8.5 14h5.5"/><path d="M16.5 5V8H19"/>'),
    'shopping-bag': icon('<path d="M7 8h10l-1 12H8L7 8Z"/><path d="M9.5 8a2.5 2.5 0 0 1 5 0"/><path d="M10 12h4"/>'),
    'map-pin': icon('<path d="M12 21s5-4.2 5-9a5 5 0 0 0-10 0c0 4.8 5 9 5 9Z"/><circle cx="12" cy="12" r="1.8"/>'),
    briefcase: icon('<path d="M7 7h10a2 2 0 0 1 2 2v8H5V9a2 2 0 0 1 2-2Z"/><path d="M9 7V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M5 12h14"/>'),
    factory: icon('<path d="M4 19V9l5 3V9l5 3V8l6 3v8H4Z"/><path d="M9 19v-3M13 19v-3M17 19v-3"/>'),
    globe: icon('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 3 2.8 14 0 17M12 3.5c-2.8 3-2.8 14 0 17"/>'),
    stethoscope: icon('<path d="M7 6v5a5 5 0 0 0 10 0V6"/><path d="M17 11v3a4 4 0 0 1-8 0"/><circle cx="7" cy="5" r="1.4"/><circle cx="17" cy="5" r="1.4"/>'),
    home: icon('<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M9 20v-6h6v6"/>'),
    users: icon('<path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"/><circle cx="10" cy="8" r="3"/><path d="M20 19v-1a4 4 0 0 0-3-3.5"/><circle cx="16.5" cy="9" r="2.5"/>'),
    target: icon('<path d="M12 5v3M12 16v3M5 12H8M16 12h3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>'),
    building: icon('<path d="M5 21V5h14v16"/><path d="M8 21v-4h3v4M13 21v-4h3v4"/><path d="M8 8h1M11 8h1M14 8h1M8 11h1M11 11h1M14 11h1M8 14h1M11 14h1M14 14h1"/>'),
    school: icon('<path d="M3.5 10.5 12 6l8.5 4.5L12 15 3.5 10.5Z"/><path d="M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4"/>'),
    smartphone: icon('<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M11 17h2"/>'),
    banknote: icon('<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M7 9.5h0M17 14.5h0"/>'),
    signal: icon('<path d="M6 19v-2M10 19v-5M14 19v-8M18 19V6"/><path d="M22 19V4"/>'),
    car: icon('<path d="M5 16h14l-1.2-4.8A2 2 0 0 0 16 9H8a2 2 0 0 0-1.8 1.2L5 16Z"/><circle cx="8.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M7.5 13h9"/>'),
    hotel: icon('<path d="M5 21V6h7a4 4 0 0 1 4 4v11"/><path d="M5 11h11"/><path d="M9 21v-6h4v6"/><path d="M18 12h1.8v9H18z"/>'),
    plane: icon('<path d="M3 12 21 4l-7 8 7 8-18-8Z"/><path d="M3 12h8"/>'),
    'layers-3': icon('<path d="M12 4 4 8.5 12 13l8-4.5L12 4Z"/><path d="M4 12l8 4.5 8-4.5"/><path d="M4 16l8 4.5 8-4.5"/>'),
  };

  const dataPromise = loadData();
  init();

  function init() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    bindHeaderControls();
    bindUiControls();
    dataPromise.then((data) => {
      state.data = data;
      syncHeaderState();
      render();
      body.classList.add('is-ready');
      if (state.query) updateSearchPanel(state.query);
    }).catch(() => {
      app.innerHTML = errorState();
      body.classList.add('is-ready');
    });
  }

  async function loadData() {
    const response = await fetch('data/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load products.json');
    return response.json();
  }

  function bindHeaderControls() {
    if (desktopSearch) {
      desktopSearch.value = state.query;
      desktopSearch.addEventListener('input', onSearchInput);
    }
    if (mobileSearch) {
      mobileSearch.value = state.query;
      mobileSearch.addEventListener('input', onSearchInput);
    }
  }

  function bindUiControls() {
    mobileSearchToggle?.addEventListener('click', () => togglePanel(mobileSearchWrap, mobileSearchToggle));
    mobileMenuToggle?.addEventListener('click', () => togglePanel(mobileMenu, mobileMenuToggle));
    scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    whatsappFab?.addEventListener('click', () => {});

    window.addEventListener('scroll', () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 8);
      if (scrollTopBtn) {
        const hidden = window.scrollY < 500;
        scrollTopBtn.classList.toggle('opacity-0', hidden);
        scrollTopBtn.classList.toggle('pointer-events-none', hidden);
        scrollTopBtn.classList.toggle('translate-y-2', hidden);
      }
    }, { passive: true });

    document.addEventListener('click', (event) => {
      const rippleTarget = event.target.closest('[data-ripple]');
      if (rippleTarget) {
        addRipple(rippleTarget, event);
      }

      if (mobileMenu && !event.target.closest('#mobileMenu') && !event.target.closest('#mobileMenuToggle')) {
        closePanel(mobileMenu, mobileMenuToggle);
      }
      if (mobileSearchWrap && !event.target.closest('#mobileSearchWrap') && !event.target.closest('#mobileSearchToggle')) {
        closePanel(mobileSearchWrap, mobileSearchToggle);
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePanel(mobileMenu, mobileMenuToggle);
        closePanel(mobileSearchWrap, mobileSearchToggle);
        closeSearchResults();
      }
    });
  }

  function addRipple(button, event) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  function togglePanel(panel, trigger) {
    if (!panel) return;
    const hidden = panel.classList.contains('is-hidden');
    hidden ? openPanel(panel, trigger) : closePanel(panel, trigger);
  }

  function openPanel(panel, trigger) {
    panel.classList.remove('is-hidden');
    trigger?.setAttribute('aria-expanded', 'true');
  }

  function closePanel(panel, trigger) {
    if (!panel) return;
    panel.classList.add('is-hidden');
    trigger?.setAttribute('aria-expanded', 'false');
  }

  function onSearchInput(event) {
    state.query = event.target.value.trim();
    if (desktopSearch && event.target !== desktopSearch) desktopSearch.value = state.query;
    if (mobileSearch && event.target !== mobileSearch) mobileSearch.value = state.query;

    const params = new URLSearchParams(location.search);
    if (state.query) params.set('q', state.query);
    else params.delete('q');
    history.replaceState({}, '', `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);

    updateSearchPanel(state.query);
    render();
  }

  function updateSearchPanel(query) {
    if (!searchResultsPanel) return;
    if (!query) {
      closeSearchResults();
      return;
    }

    const { categories, products } = searchData(query);
    searchResultsPanel.classList.remove('hidden');
    searchResultsPanel.innerHTML = `
      <div class="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="glass search-overlay rounded-premium border border-slate-200/80 shadow-premium">
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div>
              <p class="text-sm font-semibold text-slate-900">Instant search</p>
              <p class="text-xs text-slate-500">Showing categories and products for "${escapeHtml(query)}"</p>
            </div>
            <button id="closeSearchResultsBtn" type="button" class="text-xs font-semibold text-slate-500 hover:text-slate-900">Close</button>
          </div>
          <div class="grid gap-5 p-4 sm:p-5 ${products.length ? 'lg:grid-cols-[1fr_1.25fr]' : ''}">
            <div>
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">Categories</h3>
                <span class="text-xs text-slate-500">${categories.length}</span>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                ${categories.length ? categories.slice(0, 8).map(renderMiniCategoryCard).join('') : miniEmpty('No categories found')}
              </div>
            </div>
            <div>
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">Products</h3>
                <span class="text-xs text-slate-500">${products.length}</span>
              </div>
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                ${products.length ? products.slice(0, 9).map(renderMiniProductCard).join('') : miniEmpty('No products found')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('closeSearchResultsBtn')?.addEventListener('click', () => {
      state.query = '';
      desktopSearch && (desktopSearch.value = '');
      mobileSearch && (mobileSearch.value = '');
      const params = new URLSearchParams(location.search);
      params.delete('q');
      history.replaceState({}, '', `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`);
      closeSearchResults();
      render();
    });
  }

  function closeSearchResults() {
    if (!searchResultsPanel) return;
    searchResultsPanel.classList.add('hidden');
    searchResultsPanel.innerHTML = '';
  }

  function render() {
    if (!state.data) return;
    syncHeaderState();
    if (pageType === 'home') renderHome();
    else if (pageType === 'category') renderCategoryPage();
    else renderProductPage();
  }

  function syncHeaderState() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach((link) => {
      const type = link.getAttribute('data-nav');
      const active = (type === 'home' && current === 'index.html') || (type === 'category' && current === 'category.html') || (type === 'product' && current === 'product.html');
      link.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function renderHome() {
    const query = state.query.toLowerCase();
    const categories = query ? searchData(query).categories : state.data.categories;
    const featured = state.data.products.filter((product) => product.featured).slice(0, 6);

    app.innerHTML = `
      <div class="page-fade">
        ${renderHomeHero()}
        ${renderCategoryGridSection(categories, query)}
        ${renderValueProps()}
        ${renderFeaturedProducts(featured)}
        ${renderContactSection()}
        ${renderFaqSection()}
      </div>
    `;
  }

  function renderCategoryPage() {
    const category = getCategory();
    if (!category) {
      app.innerHTML = notFoundState('Category not found', 'Use the homepage categories to continue browsing.');
      return;
    }

    const query = state.query.toLowerCase();
    const products = state.data.products.filter((product) => product.categorySlug === category.slug && matchesProduct(product, query));
    const relatedCategories = state.data.categories.filter((item) => item.slug !== category.slug).slice(0, 8);

    app.innerHTML = `
      <div class="page-fade">
        ${renderCategoryHero(category, products.length)}
        <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          ${query ? renderSearchBanner(query) : ''}
          ${products.length ? renderProductsGrid(products) : emptyState('No products match your search in this category.')}
        </section>
        ${renderRelatedCategories(relatedCategories)}
        ${renderSupportStrip()}
      </div>
    `;
  }

  function renderProductPage() {
    const product = getProduct();
    if (!product) {
      app.innerHTML = notFoundState('Product not found', 'Return to the catalog and choose another database.');
      return;
    }

    const category = state.data.categories.find((item) => item.slug === product.categorySlug);
    const related = state.data.products.filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id).slice(0, 8);

    app.innerHTML = `
      <div class="page-fade">
        ${renderProductHero(product, category)}
        <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="rounded-[18px] border border-slate-200 bg-white p-5 shadow-premium sm:p-7">
              <div class="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
                <div class="overflow-hidden rounded-[18px] bg-slate-50 p-4">
                  <img src="${productImage(product)}" alt="${escapeAttr(product.name)}" class="h-full w-full object-contain" loading="eager" decoding="async">
                </div>
                <div>
                  <div class="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Verified database</div>
                  <h2 class="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">${escapeHtml(product.name)}</h2>
                  <p class="mt-3 text-sm leading-7 text-slate-600">${escapeHtml(product.description)}</p>
                  <div class="mt-5 flex flex-wrap items-end gap-3">
                    <span class="text-3xl font-bold text-slate-900">${escapeHtml(product.price)}</span>
                    <span class="text-sm text-slate-500 line-through">${escapeHtml(product.oldPrice)}</span>
                    <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Best for performance campaigns</span>
                  </div>
                  <div class="mt-6 flex flex-wrap gap-3">
                    <a data-ripple href="${whatsappUrl(product.whatsappMessage)}" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600">Buy on WhatsApp</a>
                    <a href="category.html?category=${encodeURIComponent(product.categorySlug)}" class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">View category</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              ${infoCard('What you get', 'Clean categorized records, fast response on WhatsApp, and premium support from request to delivery.', 'shield')}
              ${infoCard('Delivery', 'Delivery details are shared directly in WhatsApp after inquiry for the selected database.', 'truck')}
              ${infoCard('Best use cases', 'Lead generation, outreach campaigns, CRM enrichment, and targeted follow-up.', 'spark')}
            </div>
          </div>
        </section>
        ${renderRelatedProducts(related, category)}
        ${renderSupportStrip()}
      </div>
    `;
  }

  function renderHomeHero() {
    return `
      <section class="relative isolate overflow-hidden" style="background: linear-gradient(180deg, #0f172a 0%, #0f766e 48%, #2563eb 100%);">
        <div class="absolute -left-24 top-8 hidden h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float sm:block"></div>
        <div class="absolute right-0 top-16 hidden h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-float-slow sm:block"></div>
        <div class="absolute bottom-0 left-1/2 hidden h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-3xl sm:block"></div>
        <div class="mx-auto grid max-w-7xl content-start gap-5 px-4 pt-4 pb-10 sm:px-6 sm:pt-8 sm:pb-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div class="relative z-10 max-w-3xl text-white">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur sm:px-4 sm:py-2 sm:text-xs">
              Verified data marketplace
            </div>
            <h1 class="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl">Verified & Premium Databases</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-white/82 sm:text-base sm:leading-8">Browse curated databases across education, business, consumer, location, healthcare, travel, and more. Fast search, clear categories, and direct WhatsApp ordering built for mobile-first conversion.</p>
            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <a data-ripple href="#data-available" class="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5">Browse Databases</a>
              <a data-ripple href="${whatsappUrl('Hello, I want to know more about your databases.')}" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">Contact on WhatsApp</a>
            </div>
            <div class="mt-5 grid max-w-xl grid-cols-3 gap-2 sm:gap-4">
              ${heroStat('20+', 'Categories')}
              ${heroStat('140+', 'Products')}
              ${heroStat('Instant', 'WhatsApp inquiry')}
            </div>
          </div>
          <div class="relative hidden items-center justify-center lg:flex">
            <div class="absolute inset-8 rounded-[28px] border border-white/15 bg-white/5 shadow-2xl backdrop-blur-xl"></div>
            <div class="relative w-full max-w-md rounded-[28px] border border-white/15 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-white/60">Top categories</p>
                  <h2 class="mt-2 text-xl font-semibold">Fast discovery flow</h2>
                </div>
                <div class="rounded-full bg-white/10 p-3">${ICONS.target}</div>
              </div>
              <div class="mt-6 space-y-3">
                ${state.data.categories.slice(0, 5).map((category) => `
                  <a href="category.html?category=${encodeURIComponent(category.slug)}" class="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15">
                    <span class="flex h-11 w-11 items-center justify-center">${renderCategoryBadge(category.icon, category.slug, 'h-11 w-11')}</span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-semibold">${escapeHtml(category.name)}</span>
                      <span class="block text-xs text-white/65">${escapeHtml(category.description)}</span>
                    </span>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderCategoryGridSection(categories, query = '') {
    return `
      <section id="data-available" class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Data Available</p>
            <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">Main database categories</h2>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-600">Choose a category to open its product page. The homepage stays focused on the main collections instead of dumping every product at once.</p>
        </div>
        ${query ? renderSearchBanner(query) : ''}
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          ${(categories.length ? categories : state.data.categories).map(renderCategoryCard).join('')}
        </div>
      </section>
    `;
  }

  function renderCategoryCard(category) {
    const count = state.data.products.filter((product) => product.categorySlug === category.slug).length;
    return `
      <a href="category.html?category=${encodeURIComponent(category.slug)}" class="group rounded-[18px] border border-slate-200 bg-white p-5 shadow-premium shadow-premium-hover transition duration-200 hover:border-emerald-200 focus-ring animate-fade-in">
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-14 w-14 items-center justify-center">${renderCategoryBadge(category.icon, category.slug, 'h-14 w-14')}</div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">${count} products</span>
        </div>
        <h3 class="mt-5 text-lg font-semibold text-slate-950">${escapeHtml(category.name)}</h3>
        <p class="mt-2 text-sm leading-7 text-slate-600 line-clamp-3">${escapeHtml(category.description)}</p>
        <div class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:gap-3">
          Explore category <span aria-hidden="true">→</span>
        </div>
      </a>
    `;
  }

  function renderMiniCategoryCard(category) {
    return `
      <a href="category.html?category=${encodeURIComponent(category.slug)}" class="rounded-[18px] border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-white focus-ring">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center">${renderCategoryBadge(category.icon, category.slug, 'h-11 w-11')}</div>
          <div class="min-w-0">
            <p class="line-clamp-2 text-sm font-semibold text-slate-950">${escapeHtml(category.name)}</p>
            <p class="mt-1 line-clamp-2 text-xs text-slate-500">${escapeHtml(category.description)}</p>
          </div>
        </div>
      </a>
    `;
  }

  function renderMiniProductCard(product) {
    const category = getCategoryBySlug(product.categorySlug);
    return `
      <article class="rounded-[18px] border border-slate-200 bg-white p-3 shadow-premium">
        <a href="product.html?product=${product.id}" class="group block">
          <div class="overflow-hidden rounded-[16px] bg-slate-50 p-3">
            <img src="${productImage(product)}" alt="${escapeAttr(product.name)}" class="h-32 w-full object-contain transition duration-300 group-hover:scale-[1.03]" loading="lazy" decoding="async">
          </div>
          <div class="p-2">
            <div class="flex items-center justify-between gap-3">
              <span class="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">${discountText(product)}</span>
              <span class="text-[11px] font-medium text-slate-500">${escapeHtml(category?.name || product.category)}</span>
            </div>
            <h4 class="mt-3 text-sm font-semibold text-slate-950 line-clamp-2">${escapeHtml(product.name)}</h4>
            <p class="mt-1 text-xs text-slate-500 line-clamp-2">${escapeHtml(product.description)}</p>
          </div>
        </a>
      </article>
    `;
  }

  function renderFeaturedProducts(products) {
    return `
      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Featured</p>
            <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">Popular databases</h2>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-600">A quick view of high-demand products. Browse a category for the full list.</p>
        </div>
        ${renderProductsGrid(products)}
      </section>
    `;
  }

  function renderProductsGrid(products) {
    return `
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        ${products.map(renderProductCard).join('')}
      </div>
    `;
  }

  function renderProductCard(product) {
    const category = getCategoryBySlug(product.categorySlug);
    return `
      <article class="group overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-premium shadow-premium-hover">
        <a href="product.html?product=${product.id}" class="block p-3 pb-0 sm:p-4 sm:pb-0">
          <div class="relative overflow-hidden rounded-[18px] bg-slate-50 p-3 sm:p-4">
            <div class="absolute left-4 top-4 z-10 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold text-white">${discountText(product)}</div>
            <img src="${productImage(product)}" alt="${escapeAttr(product.name)}" class="h-44 w-full object-contain transition duration-300 group-hover:scale-[1.03] sm:h-52" loading="lazy" decoding="async">
          </div>
        </a>
        <div class="space-y-4 p-4 sm:p-5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">${escapeHtml(category?.name || product.category)}</p>
            <a href="product.html?product=${product.id}" class="mt-2 block text-base font-semibold text-slate-950 transition group-hover:text-emerald-700 sm:text-lg">${escapeHtml(product.name)}</a>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl font-bold text-slate-950 sm:text-2xl">${escapeHtml(product.price)}</span>
            <span class="text-sm text-slate-500 line-through">${escapeHtml(product.oldPrice)}</span>
          </div>
          <p class="line-clamp-3 text-sm leading-7 text-slate-600">${escapeHtml(product.description)}</p>
          <div class="flex flex-wrap gap-3">
            <a data-ripple href="${whatsappUrl(product.whatsappMessage)}" target="_blank" rel="noreferrer" class="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Buy Now</a>
            <a href="product.html?product=${product.id}" class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">Details</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderSearchBanner(query) {
    return `
      <div class="mb-6 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Showing results for <span class="font-semibold">${escapeHtml(query)}</span>.
      </div>
    `;
  }

  function renderValueProps() {
    return `
      <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div class="grid gap-5 md:grid-cols-3">
          ${pillCard('Fast discovery', 'Find a category or product instantly with responsive search across the entire catalog.', 'search')}
          ${pillCard('Premium interface', 'Glass, shadow, and spacing tuned to feel closer to a SaaS storefront than a legacy shop.', 'spark')}
          ${pillCard('WhatsApp ordering', 'Every buy action opens WhatsApp directly with a product-specific message.', 'message')}
        </div>
      </section>
    `;
  }

  function pillCard(title, text, kind) {
    return `
      <div class="rounded-[18px] border border-slate-200 bg-white p-4 shadow-premium sm:p-5">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">${glyph(kind)}</div>
        <h3 class="mt-4 text-base font-semibold text-slate-950 sm:text-lg">${escapeHtml(title)}</h3>
        <p class="mt-2 text-sm leading-7 text-slate-600">${escapeHtml(text)}</p>
      </div>
    `;
  }

  function renderContactSection() {
    const email = state.data?.site?.email || 'mgcgloble@gmail.com';
    return `
      <section id="contact" class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div class="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-premium sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Contact</p>
            <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">Need a custom database recommendation?</h2>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Share your use case, target geography, audience type, and budget. We will suggest the right category and product mix directly on WhatsApp.</p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <a data-ripple href="${whatsappUrl('Hello, I need help choosing the right database.')}" target="_blank" rel="noreferrer" class="rounded-[18px] border border-emerald-200 bg-emerald-50 p-5 transition hover:border-emerald-300 hover:bg-emerald-100/60">
              <p class="text-sm font-semibold text-emerald-800">WhatsApp</p>
              <p class="mt-1 text-sm text-emerald-700">Quick buying and support</p>
            </a>
            <a href="mailto:${email}" class="rounded-[18px] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white">
              <p class="text-sm font-semibold text-slate-900">Email</p>
              <p class="mt-1 text-sm text-slate-600">${escapeHtml(email)}</p>
            </a>
          </div>
        </div>
      </section>
    `;
  }

  function renderFaqSection() {
    const faqs = [
      ['How do I buy?', 'Click Buy Now and WhatsApp opens with a prefilled product message.'],
      ['Do you have a checkout page?', 'No. Purchases are handled directly over WhatsApp as requested.'],
      ['Can I search products and categories?', 'Yes. The search bar filters categories and products instantly while typing.'],
      ['Is the site mobile friendly?', 'Yes. The interface is designed mobile-first and scales cleanly from 320px upward.'],
    ];

    return `
      <section id="faq" class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div class="mb-6">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">FAQ</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">Frequently asked questions</h2>
        </div>
        <div class="grid gap-4">
          ${faqs.map(([q, a]) => `
            <details class="group rounded-[18px] border border-slate-200 bg-white p-5 shadow-premium">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-slate-950">
                <span>${escapeHtml(q)}</span>
                <span class="transition group-open:rotate-45">+</span>
              </summary>
              <p class="mt-3 text-sm leading-7 text-slate-600">${escapeHtml(a)}</p>
            </details>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRelatedCategories(categories) {
    return `
      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Related categories</p>
            <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">Explore adjacent databases</h2>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          ${categories.map(renderMiniCategoryCard).join('')}
        </div>
      </section>
    `;
  }

  function renderRelatedProducts(products, category) {
    return `
      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Related products</p>
            <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">More in ${escapeHtml(category?.name || 'this category')}</h2>
          </div>
        </div>
        ${products.length ? renderProductsGrid(products) : emptyState('No related products found.')}
      </section>
    `;
  }

  function renderSupportStrip() {
    return `
      <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div class="rounded-[28px] bg-slate-950 px-5 py-7 text-white shadow-2xl sm:px-6 sm:py-8">
          <div class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p class="text-sm uppercase tracking-[0.22em] text-white/60">Support</p>
              <h2 class="mt-2 text-xl font-bold sm:text-2xl lg:text-3xl">Need a custom quote or category shortlist?</h2>
              <p class="mt-3 max-w-2xl text-sm leading-7 text-white/75">Use WhatsApp for direct questions, pricing discussion, and database matching. The site stays lightweight and quick while the inquiry flow remains simple.</p>
            </div>
            <div class="flex flex-wrap gap-3 lg:justify-end">
              <a data-ripple href="${whatsappUrl('Hello, I want a custom quote for premium databases.')}" target="_blank" rel="noreferrer" class="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">WhatsApp support</a>
              <a href="#faq" class="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Read FAQ</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderCategoryHero(category, count) {
    return `
      <section class="relative overflow-hidden border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          ${renderBreadcrumbs(category.name)}
          <div class="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">${count} products</div>
              <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">${escapeHtml(category.name)}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">${escapeHtml(category.description)}</p>
            </div>
            <div class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-premium">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Category overview</p>
                  <p class="mt-2 text-xl font-semibold text-slate-950">Browse all products</p>
                </div>
                <div class="flex h-14 w-14 items-center justify-center">${renderCategoryBadge(category.icon, category.slug, 'h-14 w-14')}</div>
              </div>
              <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
                ${statCard('Focus', 'Targeted leads')}
                ${statCard('Order flow', 'WhatsApp direct')}
                ${statCard('Layout', 'Mobile first')}
                ${statCard('Search', 'Instant filters')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderProductHero(product, category) {
    return `
      <section class="relative overflow-hidden border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          ${renderBreadcrumbs(product.name, category)}
          <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Verified product</div>
              <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">${escapeHtml(product.name)}</h1>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">${escapeHtml(product.description)}</p>
            </div>
            <div class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-premium">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Pricing</p>
                  <p class="mt-2 text-2xl font-bold text-slate-950">${escapeHtml(product.price)}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500 line-through">${escapeHtml(product.oldPrice)}</p>
                  <p class="text-xs font-semibold text-emerald-700">Direct inquiry on WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderBreadcrumbs(current, category) {
    if (category) {
      return `
        <nav aria-label="Breadcrumb" class="text-sm">
          <ol class="flex flex-wrap items-center gap-2 text-slate-400">
            <li><a href="index.html" class="text-slate-500 transition hover:text-slate-900">Home</a></li>
            <li>/</li>
            <li><a href="category.html?category=${encodeURIComponent(category.slug)}" class="text-slate-500 transition hover:text-slate-900">${escapeHtml(category.name)}</a></li>
            <li>/</li>
            <li class="text-slate-900">${escapeHtml(current)}</li>
          </ol>
        </nav>
      `;
    }

    return `
      <nav aria-label="Breadcrumb" class="text-sm">
        <ol class="flex flex-wrap items-center gap-2 text-slate-400">
          <li><a href="index.html" class="text-slate-500 transition hover:text-slate-900">Home</a></li>
          <li>/</li>
          <li class="text-slate-900">${escapeHtml(current)}</li>
        </ol>
      </nav>
    `;
  }

  function renderSearchResultsHidden() {
    closeSearchResults();
  }

  function renderSearchResultsVisible() {
    if (state.query) updateSearchPanel(state.query);
  }

  function statCard(label, value) {
    return `
      <div class="rounded-[16px] border border-slate-200 bg-white p-3">
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">${escapeHtml(label)}</p>
        <p class="mt-1 text-sm font-semibold text-slate-950">${escapeHtml(value)}</p>
      </div>
    `;
  }

  function heroStat(value, label) {
    return `
      <div class="rounded-[18px] border border-white/15 bg-white/10 p-4 text-center backdrop-blur">
        <div class="text-xl font-bold sm:text-2xl">${escapeHtml(value)}</div>
        <div class="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">${escapeHtml(label)}</div>
      </div>
    `;
  }

  function infoCard(title, text, kind) {
    return `
      <div class="rounded-[18px] border border-slate-200 bg-white p-5 shadow-premium">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">${glyph(kind)}</div>
        <h3 class="mt-4 text-lg font-semibold text-slate-950">${escapeHtml(title)}</h3>
        <p class="mt-2 text-sm leading-7 text-slate-600">${escapeHtml(text)}</p>
      </div>
    `;
  }

  function renderSearchResultsContainer() {
    return searchResultsPanel?.innerHTML || '';
  }

  function emptyState(message) {
    return `
      <div class="rounded-[18px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-premium">
        <p class="text-lg font-semibold text-slate-900">${escapeHtml(message)}</p>
        <p class="mt-2 text-sm text-slate-600">Try a different search term or return to the category list.</p>
      </div>
    `;
  }

  function miniEmpty(message) {
    return `<div class="rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">${escapeHtml(message)}</div>`;
  }

  function notFoundState(title, message) {
    return `
      <section class="page-fade mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="rounded-[18px] border border-slate-200 bg-white p-8 text-center shadow-premium">
          <h1 class="text-2xl font-bold text-slate-900">${escapeHtml(title)}</h1>
          <p class="mt-2 text-slate-600">${escapeHtml(message)}</p>
          <a href="index.html" class="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Back to home</a>
        </div>
      </section>
    `;
  }

  function errorState() {
    return `
      <section class="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div class="rounded-[18px] border border-slate-200 bg-white p-8 shadow-premium">
          <h1 class="text-3xl font-bold text-slate-950">Unable to load the catalog</h1>
          <p class="mt-3 text-slate-600">The JSON data file could not be loaded. Run the site from a local server so fetch can read <code>data/products.json</code>.</p>
        </div>
      </section>
    `;
  }

  function searchData(query) {
    const q = query.trim().toLowerCase();
    return {
      categories: state.data.categories.filter((category) =>
        [category.name, category.description].some((value) => value.toLowerCase().includes(q))
      ),
      products: state.data.products.filter((product) =>
        [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(q))
      ),
    };
  }

  function matchesProduct(product, query) {
    if (!query) return true;
    return [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(query));
  }

  function getCategory() {
    return getCategoryBySlug(state.categorySlug || new URLSearchParams(location.search).get('category'));
  }

  function getCategoryBySlug(slug) {
    return state.data.categories.find((category) => category.slug === slug);
  }

  function getProduct() {
    return state.data.products.find((product) => product.id === state.productId);
  }

  function whatsappUrl(message) {
    const number = state.data?.site?.whatsappNumber || '917776966619';
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function discountText(product) {
    const newPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const oldPrice = parseInt(product.oldPrice.replace(/[^0-9]/g, ''), 10) || newPrice;
    const discount = oldPrice > newPrice ? Math.round((1 - newPrice / oldPrice) * 100) : 0;
    return `${discount}% OFF`;
  }

  function productImage(product) {
    const category = getCategoryBySlug(product.categorySlug);
    const slug = category?.slug || 'other-databases';
    const [base, accent] = paletteForSlug(slug);
    const badge = initials(product.name);
    const iconSvg = stripSvg(renderCategoryIcon(category?.icon || 'layers-3'));
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${base}"/>
            <stop offset="100%" stop-color="${accent}"/>
          </linearGradient>
          <radialGradient id="r" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <rect width="640" height="420" rx="28" fill="#f8fafc"/>
        <rect x="28" y="28" width="584" height="364" rx="24" fill="url(#g)"/>
        <circle cx="490" cy="114" r="102" fill="url(#r)" opacity="0.85"/>
        <circle cx="154" cy="324" r="110" fill="rgba(255,255,255,0.08)"/>
        <circle cx="530" cy="320" r="72" fill="rgba(255,255,255,0.08)"/>
        <rect x="70" y="70" width="198" height="34" rx="17" fill="rgba(255,255,255,0.15)"/>
        <rect x="70" y="126" width="270" height="22" rx="11" fill="rgba(255,255,255,0.82)"/>
        <rect x="70" y="160" width="230" height="18" rx="9" fill="rgba(255,255,255,0.55)"/>
        <rect x="70" y="192" width="182" height="18" rx="9" fill="rgba(255,255,255,0.42)"/>
        <rect x="70" y="264" width="118" height="118" rx="28" fill="rgba(255,255,255,0.14)"/>
        <text x="129" y="338" text-anchor="middle" fill="white" font-size="42" font-family="Poppins, Arial, sans-serif" font-weight="700">${badge}</text>
        <g transform="translate(430 238) scale(1.5)">
          ${iconSvg}
        </g>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function paletteForSlug(slug) {
    const paletteMap = {
      'student-database': ['#0f766e', '#14b8a6'],
      'entrance-exam-database': ['#6d28d9', '#c084fc'],
      'consumer-database': ['#0284c7', '#38bdf8'],
      'location-database': ['#047857', '#34d399'],
      'business-database': ['#1d4ed8', '#60a5fa'],
      'manufacturing-database': ['#b45309', '#fbbf24'],
      'exporters-importers-database': ['#0f172a', '#475569'],
      'healthcare-database': ['#dc2626', '#fb7185'],
      'real-estate-database': ['#15803d', '#86efac'],
      'job-seekers-database': ['#2563eb', '#93c5fd'],
      'marketing-leads': ['#be185d', '#f9a8d4'],
      'college-database': ['#3730a3', '#818cf8'],
      'school-database': ['#0e7490', '#67e8f9'],
      'digital-users-database': ['#9a3412', '#fdba74'],
      'financial-database': ['#166534', '#4ade80'],
      'telecom-database': ['#5b21b6', '#c4b5fd'],
      'automobile-database': ['#b45309', '#fcd34d'],
      'hospitality-database': ['#0f766e', '#5eead4'],
      'travel-database': ['#0369a1', '#7dd3fc'],
      'other-databases': ['#334155', '#94a3b8'],
    };
    return paletteMap[slug] || ['#0f172a', '#334155'];
  }

  function initials(text) {
    return text
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  function icon(paths) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">${paths}</svg>`;
  }

  function glyph(kind) {
    const icons = {
      search: icon('<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/><path d="m21 21-4.3-4.3"/>'),
      spark: icon('<path d="m12 3 1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3Z"/>'),
      message: icon('<path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"/>'),
      shield: icon('<path d="M12 3 4 6v5c0 5 3.5 8.8 8 10 4.5-1.2 8-5 8-10V6l-8-3Z"/>'),
      truck: icon('<path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="8" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>'),
    };
    return icons[kind] || icons.spark;
  }

  function stripSvg(svg) {
    return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll('`', '&#96;');
  }

  function renderCategoryIcon(name) {
    return ICONS[name] || ICONS['layers-3'];
  }

  function renderCategoryBadge(iconName, slug, sizeClass = 'h-11 w-11') {
    const [base, accent] = paletteForSlug(slug || 'other-databases');
    const glyphSvg = stripSvg(renderCategoryIcon(iconName || 'layers-3'));
    const uid = ++badgeUid;
    return `
      <svg viewBox="0 0 48 48" aria-hidden="true" class="${sizeClass} drop-shadow-sm">
        <defs>
          <linearGradient id="badge-${uid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f8fafc"/>
          </linearGradient>
          <linearGradient id="icon-${uid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${base}"/>
            <stop offset="100%" stop-color="${accent}"/>
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="45" height="45" rx="16" fill="url(#badge-${uid})"/>
        <circle cx="35" cy="12" r="7" fill="${accent}" opacity="0.14"/>
        <circle cx="14" cy="35" r="8" fill="${base}" opacity="0.12"/>
        <g transform="translate(12 12)" stroke="url(#icon-${uid})" fill="none">
          ${glyphSvg}
        </g>
      </svg>
    `;
  }

  function closeSearchResultsPanelOnRender() {
    if (!state.query) closeSearchResults();
  }

  function renderSearchBannerIfNeeded() {
    if (state.query) updateSearchPanel(state.query);
  }

  function renderSearchResultsPlaceholder() {
    return searchResultsPanel ? searchResultsPanel.innerHTML : '';
  }

  function syncHeaderStateAndSearch() {
    syncHeaderState();
    if (state.query) updateSearchPanel(state.query);
  }

})();

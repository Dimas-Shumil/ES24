'use strict';

(() => {
  const componentHosts = document.querySelectorAll('[data-component]');

  const loadComponent = async (host) => {
    const componentName = host.dataset.component;
    if (!componentName) return;

    try {
      const response = await fetch(`site/components/${componentName}.html`, {
        cache: 'force-cache',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Component ${componentName}: ${response.status}`);
      }

      host.innerHTML = await response.text();

      if (componentName === 'header') {
        initHeader(host.querySelector('[data-site-header]'));
      }
    } catch (error) {
      console.error('Не удалось загрузить компонент:', error);
    }
  };

  const initHeader = (header) => {
    if (!header) return;

    const menuToggle = header.querySelector('[data-header-menu-toggle]');
    const mobileMenu = header.querySelector('[data-header-mobile-menu]');
    const catalogToggle = header.querySelector('[data-catalog-toggle]');
    const catalogItem = catalogToggle?.closest('.site-header__nav-item--catalog');
    const mobileCatalogToggle = header.querySelector('[data-mobile-catalog-toggle]');
    const mobileCatalog = header.querySelector('[data-mobile-catalog]');
    const searchToggle = header.querySelector('[data-header-search-toggle]');
    const searchPanel = header.querySelector('[data-header-search]');
    const searchClose = header.querySelector('[data-header-search-close]');
    const searchInput = searchPanel?.querySelector('input[type="search"]');
    const homeLinks = header.querySelectorAll('[data-nav-home]');
    const motorcycleLink = header.querySelector('[data-nav-motorcycles]');

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomePage = currentPage === 'index.html' || currentPage === '';
    const isModelPage = currentPage === 'legend-300.html';

    homeLinks.forEach((link) => {
      link.classList.toggle('is-active', isHomePage);
      if (isHomePage) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (motorcycleLink) {
      motorcycleLink.classList.toggle('is-active', isModelPage);
      if (isModelPage) motorcycleLink.setAttribute('aria-current', 'page');
      else motorcycleLink.removeAttribute('aria-current');
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const isMenuOpen = () => header.classList.contains('site-header--menu-open');
    const isSearchOpen = () => header.classList.contains('site-header--search-open');

    const closeDesktopCatalog = () => {
      catalogItem?.classList.remove('is-open');
      catalogToggle?.setAttribute('aria-expanded', 'false');
    };

    const closeSearch = ({ restoreFocus = false } = {}) => {
      header.classList.remove('site-header--search-open');
      searchPanel?.setAttribute('aria-hidden', 'true');
      searchToggle?.setAttribute('aria-expanded', 'false');

      if (restoreFocus) searchToggle?.focus();
    };

    const closeMobileMenu = ({ restoreFocus = false } = {}) => {
      header.classList.remove('site-header--menu-open');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('header-menu-open');

      if (restoreFocus) menuToggle?.focus();
    };

    const openSearch = () => {
      closeMobileMenu();
      closeDesktopCatalog();
      header.classList.add('site-header--search-open');
      searchPanel?.setAttribute('aria-hidden', 'false');
      searchToggle?.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => searchInput?.focus());
    };

    const toggleMobileMenu = () => {
      const shouldOpen = !isMenuOpen();
      closeSearch();
      closeDesktopCatalog();

      header.classList.toggle('site-header--menu-open', shouldOpen);
      mobileMenu?.setAttribute('aria-hidden', String(!shouldOpen));
      menuToggle?.setAttribute('aria-expanded', String(shouldOpen));
      menuToggle?.setAttribute('aria-label', shouldOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('header-menu-open', shouldOpen);
    };

    const updateScrollState = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY;

      header.classList.toggle('site-header--scrolled', currentScrollY > 24);

      if (!isMenuOpen() && !isSearchOpen()) {
        if (currentScrollY <= 18) {
          header.classList.remove('site-header--hidden');
        } else if (delta > 5 && currentScrollY > 110) {
          header.classList.add('site-header--hidden');
          closeDesktopCatalog();
        } else if (delta < -5) {
          header.classList.remove('site-header--hidden');
        }
      } else {
        header.classList.remove('site-header--hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    menuToggle?.addEventListener('click', toggleMobileMenu);

    catalogToggle?.addEventListener('click', (event) => {
      event.preventDefault();
      const shouldOpen = !catalogItem?.classList.contains('is-open');
      catalogItem?.classList.toggle('is-open', shouldOpen);
      catalogToggle.setAttribute('aria-expanded', String(shouldOpen));
    });

    mobileCatalogToggle?.addEventListener('click', () => {
      const shouldOpen = !mobileCatalog?.classList.contains('is-open');
      mobileCatalog?.classList.toggle('is-open', shouldOpen);
      mobileCatalogToggle.setAttribute('aria-expanded', String(shouldOpen));
    });

    searchToggle?.addEventListener('click', () => {
      if (isSearchOpen()) {
        closeSearch({ restoreFocus: true });
      } else {
        openSearch();
      }
    });

    searchClose?.addEventListener('click', () => closeSearch({ restoreFocus: true }));

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) {
        closeDesktopCatalog();
        closeSearch();
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      if (isSearchOpen()) {
        closeSearch({ restoreFocus: true });
        return;
      }

      if (isMenuOpen()) {
        closeMobileMenu({ restoreFocus: true });
        return;
      }

      closeDesktopCatalog();
    });

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateScrollState);
      },
      { passive: true },
    );

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMobileMenu();
        mobileCatalog?.classList.remove('is-open');
        mobileCatalogToggle?.setAttribute('aria-expanded', 'false');
      }
    });

    updateScrollState();
    requestAnimationFrame(() => header.classList.add('site-header--ready'));
  };

const initSecond = () => {
  const section = document.querySelector('.second');

  if (!section) return;

  const controls = Array.from(
    section.querySelectorAll('[data-second-target]'),
  );

  const cards = Array.from(
    section.querySelectorAll('[data-second-card]'),
  );

  if (!controls.length || !cards.length) return;

  let activeId = 'engine';

  const setActive = (id) => {
    activeId = id;

    controls.forEach((control) => {
      const active = control.dataset.secondTarget === id;

      control.classList.toggle('is-active', active);
      control.setAttribute('aria-pressed', String(active));
    });

    cards.forEach((card) => {
      const active = card.dataset.secondCard === id;

      card.classList.toggle('is-active', active);
    });
  };

  controls.forEach((control) => {
    const id = control.dataset.secondTarget;

    control.addEventListener('mouseenter', () => {
      if (window.innerWidth > 900) {
        setActive(id);
      }
    });

    control.addEventListener('focus', () => {
      setActive(id);
    });

    control.addEventListener('click', () => {
      setActive(id);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setActive(activeId);
    }
  });

  setActive('engine');
};

initSecond();

  Promise.all(Array.from(componentHosts, loadComponent));
})();

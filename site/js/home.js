'use strict';

(() => {
  const hero = document.querySelector('[data-home-hero]');
  if (!hero) return;

  const slides = [
    {
      title: ['МОТОЦИКЛЫ,', 'КОТОРЫЕ ВЫБИРАЮТ', 'ДУШОЙ'],
      copy: 'Эндуро для бездорожья. Турэндуро для свободы.<br>Питбайки для драйва.',
      cta: 'СМОТРЕТЬ ЭНДУРО',
      href: 'legend-300.html',
    },
    {
      title: ['ДАЛЬШЕ,', 'ЧЕМ КОНЧАЕТСЯ', 'АСФАЛЬТ'],
      copy: 'Техника для длинных маршрутов, перевалов и дорог,<br>которые хочется продолжать.',
      cta: 'СМОТРЕТЬ ТУРЭНДУРО',
      href: 'legend-300.html',
    },
    {
      title: ['МАЛЕНЬКИЙ', 'ТОЛЬКО', 'ПО РАЗМЕРУ'],
      copy: 'Компактная техника для тренировок, трасс<br>и первого настоящего бездорожья.',
      cta: 'СМОТРЕТЬ ПИТБАЙКИ',
      href: 'legend-300.html',
    },
    {
      title: ['ГОТОВ', 'К ЛЮБОМУ', 'МАРШРУТУ'],
      copy: 'Шлемы, защита и экипировка, которые становятся<br>частью поездки, а не просто обязательным комплектом.',
      cta: 'СМОТРЕТЬ ЭКИПИРОВКУ',
      href: '#equipment',
    },
    {
      title: ['ВСЁ,', 'ЧТО ДЕРЖИТ', 'В ДВИЖЕНИИ'],
      copy: 'Расходники и обслуживание для техники,<br>которая должна быть готова к следующему выезду.',
      cta: 'СМОТРЕТЬ РАСХОДНИКИ',
      href: '#consumables',
    },
  ];

  const items = [...hero.querySelectorAll('[data-home-item]')];
  const tabs = [...hero.querySelectorAll('[data-home-tab]')];
  const tabsRail = hero.querySelector('.home-hero__tabs');
  const progress = [...hero.querySelectorAll('[data-home-progress] span')];
  const prev = hero.querySelector('[data-home-prev]');
  const next = hero.querySelector('[data-home-next]');
  const title1 = hero.querySelector('[data-home-title-1]');
  const title2 = hero.querySelector('[data-home-title-2]');
  const title3 = hero.querySelector('[data-home-title-3]');
  const copy = hero.querySelector('[data-home-copy]');
  const primary = hero.querySelector('[data-home-primary]');
  const picker = hero.querySelector('[data-home-picker]');

  let active = 0;
  let locked = false;
  let touchStartX = null;
  let touchStartY = null;
  let touchBlocked = false;

  const mod = (value) => (value + slides.length) % slides.length;


  const centerMobileTab = (index, behavior = 'smooth') => {
    if (!tabsRail || window.innerWidth > 900) return;

    const tab = tabs[index];
    if (!tab) return;

    const target = Math.max(
      0,
      tab.offsetLeft - (tabsRail.clientWidth - tab.offsetWidth) / 2,
    );

    tabsRail.scrollTo({ left: target, behavior });
  };

  const setPositions = () => {
    items.forEach((item, index) => {
      item.classList.remove('is-main', 'is-prev', 'is-next', 'is-hidden');
      const relative = mod(index - active);

      if (relative === 0) item.classList.add('is-main');
      else if (relative === 1) item.classList.add('is-next');
      else if (relative === slides.length - 1) item.classList.add('is-prev');
      else item.classList.add('is-hidden');
    });
  };

  const updateUI = (index, animate = true) => {
    const slide = slides[index];
    if (animate) hero.classList.add('is-changing');

    window.setTimeout(() => {
      title1.textContent = slide.title[0];
      title2.textContent = slide.title[1];
      title3.textContent = slide.title[2];
      copy.innerHTML = slide.copy;
      primary.textContent = slide.cta;
      primary.setAttribute('href', slide.href);

      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });

      requestAnimationFrame(() => {
        centerMobileTab(index, animate ? 'smooth' : 'auto');
      });

      progress.forEach((bar, barIndex) => {
        bar.classList.toggle('is-active', barIndex === index);
      });

      setPositions();
      hero.dataset.activeCategory = String(index);
      window.dispatchEvent(new CustomEvent('home:slide-change', { detail: { index } }));
      requestAnimationFrame(() => hero.classList.remove('is-changing'));
    }, animate ? 240 : 0);
  };

  const changeSlide = (index) => {
    if (locked || hero.classList.contains('home-hero--animating')) return;

    const nextIndex = mod(index);
    if (nextIndex === active) return;

    locked = true;
    active = nextIndex;
    updateUI(active, true);

    window.setTimeout(() => {
      locked = false;
    }, 920);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => changeSlide(Number(tab.dataset.homeTab)));
  });

  prev?.addEventListener('click', () => changeSlide(active - 1));
  next?.addEventListener('click', () => changeSlide(active + 1));

  picker?.addEventListener('click', () => {
    document.querySelector('.home-hero__tabs')?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') changeSlide(active - 1);
    if (event.key === 'ArrowRight') changeSlide(active + 1);
  });

  hero.addEventListener(
    'touchstart',
    (event) => {
      touchBlocked = Boolean(
        event.target.closest('.home-hero__tabs, .home-hero__actions, .home-hero__arrow'),
      );

      if (touchBlocked) {
        touchStartX = null;
        touchStartY = null;
        return;
      }

      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true },
  );

  hero.addEventListener(
    'touchend',
    (event) => {
      if (touchBlocked || touchStartX === null || touchStartY === null) {
        touchBlocked = false;
        return;
      }

      const diffX = touchStartX - event.changedTouches[0].clientX;
      const diffY = touchStartY - event.changedTouches[0].clientY;

      touchStartX = null;
      touchStartY = null;
      touchBlocked = false;

      if (Math.abs(diffX) < 48 || Math.abs(diffX) <= Math.abs(diffY) * 1.15) return;
      changeSlide(active + (diffX > 0 ? 1 : -1));
    },
    { passive: true },
  );

  const hashMap = {
    '#enduro': 0,
    '#tour-enduro': 1,
    '#pitbikes': 2,
    '#equipment': 3,
    '#consumables': 4,
  };

  const syncHash = () => {
    const index = hashMap[window.location.hash];
    if (Number.isInteger(index) && index !== active) {
      active = index;
      updateUI(active, false);
    }
  };

  window.addEventListener('hashchange', syncHash);

  [
    'site/img/home-hero.webp',
    'site/img/mot2.webp',
    'site/img/mot.webp',
    'site/img/mot1.webp',
    'site/img/rider.webp',
  ].forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  const initialIndex = hashMap[window.location.hash];
  if (Number.isInteger(initialIndex)) active = initialIndex;
  updateUI(active, false);
})();


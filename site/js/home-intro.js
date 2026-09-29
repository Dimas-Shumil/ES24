'use strict';

(() => {
  const hero = document.querySelector('[data-home-hero]');

  window.__homeIntroRegistered = true;
  window.__homeIntroDone = false;

  const finishIntro = () => {
    if (window.__homeIntroDone) return;

    window.__homeIntroDone = true;
    hero?.classList.remove('home-hero--animating');
    window.dispatchEvent(new CustomEvent('home:intro-complete'));
  };

  if (!hero || !window.gsap) {
    finishIntro();
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(min-width: 1024px) and (pointer: fine)');

  const background = hero.querySelector('.home-hero__background');
  const slashAcid = hero.querySelector('.home-hero__slash--acid');
  const slashDark = hero.querySelector('.home-hero__slash--dark');
  const slashLight = hero.querySelector('.home-hero__slash--light');
  const ground = hero.querySelector('.home-hero__ground');
  const titleLines = gsap.utils.toArray('.home-hero__title > *', hero);
  const copy = hero.querySelector('.home-hero__copy');
  const actions = hero.querySelector('.home-hero__actions');
  const benefits = gsap.utils.toArray('.home-hero__benefit', hero);
  const progress = hero.querySelector('.home-hero__progress');
  const progressBars = gsap.utils.toArray('.home-hero__progress span', hero);
  const tabs = hero.querySelector('.home-hero__tabs');
  const tabButtons = gsap.utils.toArray('.home-hero__tab', hero);
  const manifest = hero.querySelector('.home-hero__manifest');
  const arrows = gsap.utils.toArray('.home-hero__arrow', hero);
  const items = gsap.utils.toArray('.home-hero__item', hero);

  const getMainItem = () => hero.querySelector('.home-hero__item.is-main');
  const getMainVisual = () =>
    getMainItem()?.querySelector('img, .home-hero__parts-art') || null;

  let mainItem = getMainItem();
  let mainVisual = getMainVisual();
  let sideItems = items.filter((item) => item !== mainItem && !item.classList.contains('is-hidden'));
  let sideTargets = new Map();

  hero.classList.add('home-hero--animating');

  const setupInitialState = () => {
    sideTargets = new Map(
      sideItems.map((item) => [item, Number.parseFloat(getComputedStyle(item).opacity) || 0.5]),
    );

    gsap.set(background, {
      scale: 1.055,
      y: 10,
      force3D: true,
    });

    gsap.set(slashDark, {
      xPercent: 24,
      yPercent: -10,
      autoAlpha: 0,
      force3D: true,
    });

    gsap.set(slashAcid, {
      scaleY: 0,
      autoAlpha: 0,
      transformOrigin: '50% 0%',
      force3D: true,
    });

    gsap.set(slashLight, {
      xPercent: 18,
      autoAlpha: 0,
      force3D: true,
    });

    gsap.set(ground, {
      y: 26,
      scale: 1.025,
      autoAlpha: 0,
      transformOrigin: '50% 100%',
      force3D: true,
    });

    titleLines.forEach((line, index) => {
      gsap.set(line, {
        x: index === 0 ? -38 : index === 1 ? -58 : -28,
        y: index === 2 ? 20 : 0,
        autoAlpha: 0,
        force3D: true,
      });
    });

    gsap.set(copy, { y: 18, autoAlpha: 0, force3D: true });
    gsap.set(actions, { y: 18, autoAlpha: 0, force3D: true });

    gsap.set(mainItem, { autoAlpha: 0 });
    gsap.set(mainVisual, {
      x: 72,
      y: 34,
      scale: 0.94,
      rotation: 1.1,
      transformOrigin: '52% 74%',
      force3D: true,
    });

    sideItems.forEach((item) => {
      const direction = item.classList.contains('is-prev') ? -1 : 1;
      gsap.set(item, {
        x: direction * 34,
        y: 10,
        scale: 0.92,
        opacity: 0,
        visibility: 'hidden',
        force3D: true,
      });
    });

    gsap.set(benefits, { y: 15, autoAlpha: 0, force3D: true });
    gsap.set(progress, { y: 12, autoAlpha: 0, force3D: true });
    gsap.set(progressBars, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(tabs, { y: 28, autoAlpha: 0, force3D: true });
    gsap.set(tabButtons, { y: 12, autoAlpha: 0, force3D: true });
    gsap.set(manifest, { x: 14, autoAlpha: 0, force3D: true });

    arrows.forEach((arrow) => {
      gsap.set(arrow, {
        x: arrow.classList.contains('home-hero__arrow--prev') ? -12 : 12,
        autoAlpha: 0,
        force3D: true,
      });
    });
  };

  const revealWithoutMotion = () => {
    gsap.set(
      [
        background,
        slashDark,
        slashAcid,
        slashLight,
        ground,
        ...titleLines,
        copy,
        actions,
        mainItem,
        mainVisual,
        ...sideItems,
        ...benefits,
        progress,
        ...progressBars,
        tabs,
        ...tabButtons,
        manifest,
        ...arrows,
      ],
      { clearProps: 'transform,opacity,visibility,filter' },
    );

    finishIntro();
  };

  const resetParallax = () => {
    items.forEach((item) => {
      const visual = item.querySelector('img, .home-hero__parts-art');
      if (!visual) return;
      gsap.to(visual, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  };

  const startParallax = () => {
    if (reduceMotion.matches || !finePointer.matches) return;

    hero.addEventListener('pointermove', (event) => {
      const currentVisual = getMainVisual();
      if (!currentVisual) return;

      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(currentVisual, {
        x: nx * 4,
        y: ny * 2.5,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });

    hero.addEventListener('pointerleave', resetParallax);
    window.addEventListener('home:slide-change', resetParallax);
  };

  const playIntro = () => {
    if (reduceMotion.matches) {
      revealWithoutMotion();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        gsap.set(background, { clearProps: 'transform' });
        gsap.set([slashDark, slashAcid, slashLight], {
          clearProps: 'transform,opacity,visibility',
        });
        gsap.set(ground, { clearProps: 'transform,opacity,visibility' });
        gsap.set(titleLines, { clearProps: 'transform,opacity,visibility' });
        gsap.set([copy, actions], { clearProps: 'transform,opacity,visibility' });
        gsap.set(mainItem, { clearProps: 'opacity,visibility' });
        gsap.set(mainVisual, { clearProps: 'transform' });
        gsap.set(sideItems, { clearProps: 'transform,opacity,visibility' });
        gsap.set(benefits, { clearProps: 'transform,opacity,visibility' });
        gsap.set(progress, { clearProps: 'transform,opacity,visibility' });
        gsap.set(progressBars, { clearProps: 'transform' });
        gsap.set(tabs, { clearProps: 'transform,opacity,visibility' });
        gsap.set(tabButtons, { clearProps: 'transform,opacity,visibility' });
        gsap.set(manifest, { clearProps: 'transform,opacity,visibility' });
        gsap.set(arrows, { clearProps: 'transform,opacity,visibility' });

        finishIntro();
        startParallax();
      },
    });

    tl.to(background, { scale: 1, y: 0, duration: 2.8, ease: 'power2.out' }, 0);

    tl.to(slashDark, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.82 }, 0.12)
      .to(
        slashAcid,
        { scaleY: 1, autoAlpha: 1, duration: 0.72, ease: 'power2.out' },
        0.25,
      )
      .to(slashLight, { xPercent: 0, autoAlpha: 1, duration: 0.95 }, 0.34);

    tl.to(
      ground,
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.92, ease: 'power3.out' },
      0.72,
    );

    if (titleLines[0]) {
      tl.to(titleLines[0], { x: 0, y: 0, autoAlpha: 1, duration: 0.74 }, 0.4);
    }

    if (titleLines[1]) {
      tl.to(titleLines[1], { x: 0, y: 0, autoAlpha: 1, duration: 0.9 }, 0.48);
    }

    if (titleLines[2]) {
      tl.to(titleLines[2], { x: 0, y: 0, autoAlpha: 1, duration: 0.72 }, 0.66);
    }

    tl.to(mainItem, { autoAlpha: 1, duration: 0.36, ease: 'sine.out' }, 0.78);

    if (mainVisual) {
      tl.to(
        mainVisual,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 1.28,
          ease: 'power4.out',
        },
        0.82,
      );
    }

    sideItems.forEach((item, index) => {
      tl.to(
        item,
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: sideTargets.get(item),
          visibility: 'visible',
          duration: 0.78,
        },
        1.02 + index * 0.08,
      );
    });

    tl.to(copy, { y: 0, autoAlpha: 1, duration: 0.58 }, 1.18)
      .to(actions, { y: 0, autoAlpha: 1, duration: 0.56 }, 1.34)
      .to(
        benefits,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
        },
        1.52,
      )
      .to(progress, { y: 0, autoAlpha: 1, duration: 0.44 }, 1.62)
      .to(
        progressBars,
        {
          scaleX: 1,
          duration: 0.42,
          stagger: 0.055,
          ease: 'power2.out',
        },
        1.68,
      )
      .to(tabs, { y: 0, autoAlpha: 1, duration: 0.62 }, 1.72)
      .to(
        tabButtons,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.46,
          stagger: 0.065,
          ease: 'power2.out',
        },
        1.8,
      )
      .to(arrows, { x: 0, autoAlpha: 1, duration: 0.46, stagger: 0.08 }, 1.86)
      .to(manifest, { x: 0, autoAlpha: 1, duration: 0.5 }, 1.94);
  };

  setupInitialState();

  if (document.readyState === 'complete') {
    requestAnimationFrame(playIntro);
  } else {
    window.addEventListener('load', () => requestAnimationFrame(playIntro), {
      once: true,
    });
  }
})();

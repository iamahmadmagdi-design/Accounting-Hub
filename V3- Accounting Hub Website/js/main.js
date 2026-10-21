/* =====================================================================
   Accounting Hub — site behaviour
   Plain JavaScript, no framework. Each feature is a small function that
   bails out quietly if the elements it needs aren't on the current page,
   so the one file can be shared by every page.
     1. Mobile menu (hamburger) + its services sub-menu
     2. Desktop "services" dropdown
     3. Shadow on the header once the page is scrolled
     4. Scroll-reveal (fade/slide elements in as they enter the viewport)
     5. Count-up animation for the stats numbers
     6. Light parallax on decorative blobs (desktop only)
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- 1. Mobile menu ------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      if (open) menu.removeAttribute('hidden');
      else menu.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Services accordion inside the mobile menu
    var sToggle = menu.querySelector('.m-services-toggle');
    var sList = menu.querySelector('.m-services');
    if (sToggle && sList) {
      sToggle.addEventListener('click', function () {
        var open = sList.hasAttribute('hidden');
        if (open) sList.removeAttribute('hidden');
        else sList.setAttribute('hidden', '');
        sToggle.setAttribute('aria-expanded', String(open));
      });
    }

    // Close the menu again if the viewport grows to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && !menu.hasAttribute('hidden')) {
        menu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----- 2. Desktop services dropdown ----------------------------- */
  function initDropdown() {
    var dd = document.querySelector('.nav .dropdown');
    if (!dd) return;
    var toggle = dd.querySelector('.dropdown-toggle');
    var panel = dd.querySelector('.dropdown-panel');
    if (!toggle || !panel) return;

    function open() { dd.classList.add('open'); panel.removeAttribute('hidden'); toggle.setAttribute('aria-expanded', 'true'); }
    function close() { dd.classList.remove('open'); panel.setAttribute('hidden', ''); toggle.setAttribute('aria-expanded', 'false'); }

    // Open on hover (mouse) and toggle on click (keyboard / touch)
    dd.addEventListener('mouseenter', open);
    dd.addEventListener('mouseleave', close);
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (dd.classList.contains('open')) close();
      else open();
    });
    document.addEventListener('click', function (e) {
      if (dd.classList.contains('open') && !dd.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ----- 3. Header shadow on scroll ------------------------------- */
  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function update() { header.classList.toggle('scrolled', window.pageYOffset > 8); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----- 4. Scroll-reveal ----------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    // No IntersectionObserver (or reduced motion)? Just show everything.
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); runCount(el); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('visible');
        runCount(el);
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    items.forEach(function (el) {
      // Anything already on screen at load shows immediately (no wait for scroll)
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
        el.classList.add('visible');
        runCount(el);
      } else {
        observer.observe(el);
      }
    });
  }

  /* ----- 5. Count-up numbers -------------------------------------- */
  function runCount(el) {
    var counter = el.matches('[data-count]') ? el : el.querySelector('[data-count]');
    if (!counter || counter.dataset.counted) return;
    counter.dataset.counted = '1';

    var target = parseFloat(counter.getAttribute('data-count')) || 0;
    var prefix = counter.getAttribute('data-prefix') || '';
    var suffix = counter.getAttribute('data-suffix') || '';

    if (reduceMotion) { counter.textContent = prefix + target + suffix; return; }

    var duration = 1600;
    var start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);     // ease-out cubic
      counter.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----- 6. Parallax on decorative blobs -------------------------- */
  function initParallax() {
    var items = document.querySelectorAll('[data-parallax]');
    if (!items.length || reduceMotion) return;
    window.addEventListener('scroll', function () {
      if (window.innerWidth < 760) return;
      var y = window.pageYOffset || 0;
      items.forEach(function (el) {
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = 'translateY(' + (y * factor).toFixed(1) + 'px)';
      });
    }, { passive: true });
  }

  /* ----- Boot ----------------------------------------------------- */
  function init() {
    initMobileMenu();
    initDropdown();
    initHeaderShadow();
    initReveal();
    initParallax();
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

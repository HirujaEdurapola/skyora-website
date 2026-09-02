/* ==========================================================================
   SKYORA — Interaction & Animation System
   Vanilla JS only. No frameworks, no external UI dependencies.
   ========================================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav ---------- */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var onScrollNav = function () {
      if (window.scrollY > 12) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.nav-menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Before / after comparison slider ---------- */
  document.querySelectorAll('.compare').forEach(function (compare) {
    var beforeLayer = compare.querySelector('.before-layer');
    var divider = compare.querySelector('.divider-line');
    var handle = compare.querySelector('.handle');
    var dragging = false;

    function setPosition(percent) {
      percent = Math.max(2, Math.min(98, percent));
      beforeLayer.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
      divider.style.left = percent + '%';
      handle.style.left = percent + '%';
      compare.setAttribute('aria-valuenow', Math.round(percent));
    }

    function percentFromEvent(clientX) {
      var rect = compare.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onMove(clientX) { setPosition(percentFromEvent(clientX)); }

    compare.addEventListener('pointerdown', function (e) {
      dragging = true;
      compare.setPointerCapture(e.pointerId);
      onMove(e.clientX);
    });
    compare.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      onMove(e.clientX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      compare.addEventListener(ev, function () { dragging = false; });
    });

    // keyboard accessibility
    compare.setAttribute('tabindex', '0');
    compare.setAttribute('role', 'slider');
    compare.setAttribute('aria-label', 'Before and after image comparison');
    compare.setAttribute('aria-valuemin', '0');
    compare.setAttribute('aria-valuemax', '100');
    var current = 50;
    setPosition(current);
    compare.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { current = Math.max(2, current - 4); setPosition(current); }
      if (e.key === 'ArrowRight') { current = Math.min(98, current + 4); setPosition(current); }
    });
  });

  /* ---------- Pipeline scroll activation ---------- */
  var pipelineStages = document.querySelectorAll('.pipeline-stage');
  if (pipelineStages.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      pipelineStages.forEach(function (s) { s.classList.add('active'); });
    } else {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      }, { threshold: 0.6 });
      pipelineStages.forEach(function (s) { pio.observe(s); });
    }
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    var panel = item.querySelector('.accordion-panel');
    header.setAttribute('aria-expanded', 'false');
    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.maxHeight = '0px'; });
        item.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
        panel.addEventListener('transitionend', function handler() {
          if (item.classList.contains('open')) panel.style.maxHeight = 'none';
          panel.removeEventListener('transitionend', handler);
        });
      }
    });
  });

  /* ---------- Benchmark bar animation ---------- */
  var bars = document.querySelectorAll('.bar-fill');
  if (bars.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = b.dataset.value + '%'; });
    } else {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.value + '%';
            bio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      bars.forEach(function (b) { bio.observe(b); });
    }
  }

  /* ---------- Active nav link on scroll (index page only) ---------- */
  var sections = document.querySelectorAll('main [id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href*="index.html#"]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href').indexOf('#' + id) !== -1);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- Current year in footer ---------- */
  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });

})();

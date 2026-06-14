// OMNIA — shared site behaviors + motion system
(function () {
  var doc = document;
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Mobile menu ----
  function initMenu() {
    var toggle = doc.querySelector('[data-menu-toggle]');
    var panel = doc.querySelector('[data-menu-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      if (panel.hasAttribute('data-open')) panel.removeAttribute('data-open');
      else panel.setAttribute('data-open', '');
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { panel.removeAttribute('data-open'); });
    });
  }

  // ---- Nav settle on scroll ----
  function initNav() {
    var nav = doc.querySelector('.nav');
    if (!nav) return;
    var update = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ---- Enrich: opt extra elements into reveal motion ----
  function enrich() {
    var sel = [
      '.hero-copy > *', '.hero-media', '.page-hero > *',
      '.partner-logo', '.block-head', '.video-head',
      '.do-card', '.method', '.way', '.benefit', '.cred',
      '.reach', '.roster li', '.dt-row', '.pull',
      '.gallery image-slot', '.prog-gallery image-slot'
    ].join(', ');
    doc.querySelectorAll(sel).forEach(function (el) { el.classList.add('reveal'); });
  }

  // ---- Stagger siblings within the same parent ----
  function stagger() {
    var groups = new Map();
    doc.querySelectorAll('.reveal').forEach(function (el) {
      var p = el.parentNode;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach(function (list) {
      if (list.length < 2) return;
      list.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
      });
    });
  }

  // ---- Reveal on scroll ----
  function initReveal() {
    var els = doc.querySelectorAll('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  // ---- Count-up for figures ----
  function animateCount(el) {
    if (el.dataset.counted) return;
    var raw = el.textContent.trim();
    el.dataset.counted = '1';
    if (/\bof\b/i.test(raw)) return;                 // skip "1 of 5"
    var m = raw.match(/^(\D*)([\d.,]+)(\D*)$/);
    if (!m) return;
    var prefix = m[1] || '', numStr = m[2], suffix = m[3] || '';
    var hasComma = numStr.indexOf(',') > -1;
    var target = parseInt(numStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;
    el.classList.add('count-soft');
    var fmt = function (n) { return hasComma ? n.toLocaleString('en-US') : String(n); };
    var render = function (n) {
      el.innerHTML = prefix + fmt(n) + (suffix ? '<span class="u">' + suffix + '</span>' : '');
    };
    if (REDUCED) { render(target); return; }
    var dur = 1150, start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      render(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame); else render(target);
    }
    requestAnimationFrame(frame);
  }

  function initCounts() {
    var nums = doc.querySelectorAll('.metric-num, .reach-num, .dt-num');
    if (!nums.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      nums.forEach(animateCount);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function init() {
    initMenu();
    initNav();
    enrich();
    stagger();
    initReveal();
    initCounts();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();

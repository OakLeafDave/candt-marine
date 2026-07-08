(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function setNav() {
    if (window.scrollY > window.innerHeight * 0.75) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', setNav, { passive: true });
  setNav();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
    toggle.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

  /* ---------- Split headings into rising words ---------- */
  document.querySelectorAll('.split').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var wrap = document.createElement('span');
      wrap.className = 'word';
      var inner = document.createElement('span');
      inner.textContent = w;
      inner.style.transitionDelay = (i * 0.045) + 's';
      wrap.appendChild(inner);
      el.appendChild(wrap);
      el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal], .reveal-img, .split');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    // stagger siblings that share a parent (stats, steps, reviews, gallery, feature list)
    revealEls.forEach(function (el) {
      if (el.hasAttribute('data-reveal') && el.parentElement) {
        var sibs = Array.prototype.filter.call(
          el.parentElement.children,
          function (c) { return c.hasAttribute && c.hasAttribute('data-reveal'); }
        );
        if (sibs.length > 1) {
          el.style.transitionDelay = (sibs.indexOf(el) * 0.09) + 's';
        }
      }
      io.observe(el);
    });
  }

  /* ---------- Parallax ---------- */
  var pEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var queued = false;
  function applyParallax() {
    queued = false;
    var vh = window.innerHeight;
    for (var i = 0; i < pEls.length; i++) {
      var el = pEls[i];
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var center = r.top + r.height / 2;
      var offset = (center - vh / 2) * speed;
      var extra = el.tagName === 'IMG' ? ' scale(1.08)' : '';
      el.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)' + extra;
    }
  }
  // Schedule via rAF when available (smooth), but always fall back to a direct
  // call so parallax still tracks scroll in environments that throttle rAF.
  function onScrollParallax() {
    applyParallax();
    if (!queued && window.requestAnimationFrame) {
      queued = true;
      window.requestAnimationFrame(applyParallax);
    }
  }
  if (!reduce && pEls.length) {
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    window.addEventListener('resize', applyParallax);
    applyParallax();
  }

  /* ---------- Video slideshow ---------- */
  (function () {
    var slider = document.getElementById('vslider');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.vslide'));
    var dotsWrap = document.getElementById('vsDots');
    var i = 0, timer = null;

    slides.forEach(function (s, idx) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Show ' + (s.getAttribute('data-label') || ('slide ' + (idx + 1))));
      if (idx === 0) b.className = 'is-active';
      b.addEventListener('click', function () { go(idx); reset(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function go(n) {
      slides[i].classList.remove('is-active');
      dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      dots[i].classList.add('is-active');
    }
    function reset() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(function () { go(i + 1); }, 5000);
    }
    document.getElementById('vsNext').addEventListener('click', function () { go(i + 1); reset(); });
    document.getElementById('vsPrev').addEventListener('click', function () { go(i - 1); reset(); });
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', reset);
    reset();
  })();

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Form (demo handler) ---------- */
  window.handleSubmit = function (e) {
    e.preventDefault();
    var note = document.getElementById('formNote');
    note.textContent = 'Thanks — your request is ready to send to candtmarine2023@gmail.com. We’ll be in touch shortly.';
    e.target.querySelector('button[type="submit"] span').textContent = 'Request Sent';
    return false;
  };
})();

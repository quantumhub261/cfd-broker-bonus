/* CFD Bonus Ratgeber — main.js
   Live EUR/USD rate, mobile navigation, cookie consent, FAQ accordion,
   scroll-in animation, active TOC highlighting, contact form. */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     EUR/USD live rate
     -------------------------------------------------------------------- */

  var FALLBACK_RATE = 1.0850;
  var lastRate = null;

  function paintRate(rate, isLive) {
    var rateEls = document.querySelectorAll('[data-eurusd-rate]');
    var changeEls = document.querySelectorAll('[data-eurusd-change]');
    var converterRateEls = document.querySelectorAll('[data-current-rate]');

    rateEls.forEach(function (el) {
      el.textContent = rate.toFixed(4);
    });

    if (lastRate !== null && isLive) {
      var diff = rate - lastRate;
      var pct = (diff / lastRate) * 100;
      var sign = pct >= 0 ? '+' : '';
      changeEls.forEach(function (el) {
        el.textContent = (pct >= 0 ? '▲ ' : '▼ ') + sign + pct.toFixed(2) + '%';
        el.classList.toggle('is-up', pct >= 0);
        el.classList.toggle('is-down', pct < 0);
      });
    }

    converterRateEls.forEach(function (el) {
      el.textContent = rate.toFixed(4);
    });

    lastRate = rate;
  }

  function fetchEURUSD() {
    fetch('https://api.frankfurter.app/latest?from=EUR&to=USD')
      .then(function (response) {
        if (!response.ok) throw new Error('rate fetch failed');
        return response.json();
      })
      .then(function (data) {
        var rate = data && data.rates && data.rates.USD;
        if (typeof rate === 'number' && rate > 0) {
          paintRate(rate, true);
        } else {
          throw new Error('malformed rate payload');
        }
      })
      .catch(function () {
        if (lastRate === null) paintRate(FALLBACK_RATE, false);
      });
  }

  if (document.querySelector('[data-eurusd-rate], [data-current-rate]')) {
    fetchEURUSD();
    setInterval(fetchEURUSD, 30000);
  }

  /* --------------------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------------------- */

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------------------
     FAQ accordion
     -------------------------------------------------------------------- */

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var trigger = item.querySelector('.faq-trigger');
    var answer = item.querySelector('.faq-answer');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  /* --------------------------------------------------------------------
     Cookie consent banner
     -------------------------------------------------------------------- */

  var COOKIE_KEY = 'cfd-bonus-ratgeber-cookie-consent';
  var banner = document.querySelector('[data-cookie-banner]');

  function getConsent() {
    try {
      return window.localStorage.getItem(COOKIE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(COOKIE_KEY, value);
    } catch (e) { /* storage unavailable — banner will simply reappear */ }
  }

  if (banner && !getConsent()) {
    banner.classList.add('is-visible');
  }

  document.querySelectorAll('[data-cookie-accept]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setConsent('accepted');
      if (banner) banner.classList.remove('is-visible');
    });
  });

  document.querySelectorAll('[data-cookie-decline]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setConsent('declined');
      if (banner) banner.classList.remove('is-visible');
    });
  });

  document.querySelectorAll('[data-cookie-open]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (banner) banner.classList.add('is-visible');
    });
  });

  /* --------------------------------------------------------------------
     Scroll-in animation (headings & cards only, per design constraints)
     -------------------------------------------------------------------- */

  var animatable = document.querySelectorAll('.section-head, .card, .figure, .verdict, .calculator');

  if ('IntersectionObserver' in window && animatable.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    animatable.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------------------
     Active TOC link highlighting
     -------------------------------------------------------------------- */

  var tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var headingIds = Array.prototype.map.call(tocLinks, function (link) {
      return link.getAttribute('href').replace('#', '');
    });
    var headings = headingIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var tocObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('id');
          var link = document.querySelector('.toc-link[href="#' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-96px 0px -70% 0px' }
    );
    headings.forEach(function (h) { tocObserver.observe(h); });
  }

  /* --------------------------------------------------------------------
     Contact form (no backend — client-side confirmation only)
     -------------------------------------------------------------------- */

  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      contactForm.querySelectorAll('[required]').forEach(function (field) {
        var errorEl = contactForm.querySelector('[data-error-for="' + field.name + '"]');
        var isEmpty = !field.value || !field.value.trim();
        var isBadEmail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);

        if (isEmpty || isBadEmail) {
          valid = false;
          if (errorEl) errorEl.classList.add('is-visible');
        } else if (errorEl) {
          errorEl.classList.remove('is-visible');
        }
      });

      var statusEl = contactForm.querySelector('[data-form-status]');
      if (valid) {
        contactForm.reset();
        if (statusEl) {
          statusEl.textContent = 'Vielen Dank für Ihre Nachricht. Wir melden uns innerhalb von 48 Stunden.';
          statusEl.classList.add('is-visible');
        }
      } else if (statusEl) {
        statusEl.classList.remove('is-visible');
      }
    });
  }
})();

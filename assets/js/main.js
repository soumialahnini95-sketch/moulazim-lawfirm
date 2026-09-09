/* Moulazim Law Firm — interactions */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initYear();
    initNav();
    initHeaderState();
    initAccordion();
    initReveal();
    initContactForm();
    initActiveLink();
  });

  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHeaderState() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initAccordion() {
    document.querySelectorAll('.acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.classList.toggle('is-open', !open);
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initActiveLink() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === current || (current === 'index.html' && href === 'index.html')) {
        a.classList.add('is-active');
      }
    });
  }

  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('.form-status');

    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = true;

      form.querySelectorAll('[data-required]').forEach(function (input) {
        var field = input.closest('.field');
        var value = (input.type === 'checkbox') ? input.checked : String(input.value || '').trim();
        var ok = input.type === 'checkbox' ? value === true : value.length > 0;

        if (ok && input.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        }
        if (ok && input.type === 'tel') {
          ok = /^[+0-9 ().-]{8,20}$/.test(value);
        }
        if (field) field.classList.toggle('has-error', !ok);
        if (!ok && valid) { input.focus(); }
        if (!ok) valid = false;
      });

      if (!valid) {
        if (status) { status.classList.remove('is-visible'); }
        return;
      }

      var name = (form.querySelector('#nom') || {}).value || '';
      if (status) {
        status.textContent = 'Merci ' + name.trim() + '. Votre demande a bien été enregistrée : un avocat du cabinet vous rappelle sous 24 heures ouvrées. Pour une urgence, appelez le +212 5 22 00 00 00.';
        status.classList.add('is-visible');
      }
      form.reset();
    });

    form.querySelectorAll('[data-required]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('has-error');
      });
    });
  }
})();

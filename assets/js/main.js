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
    initTracking();
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
    var whatsapp = form.getAttribute('data-whatsapp') || '';

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

      var name = value('nom');
      var reference = createReference();
      saveDossier({
        ref: reference,
        nom: name,
        domaine: value('domaine'),
        urgence: value('urgence'),
        date: new Date().toISOString()
      });

      if (whatsapp) {
        window.open('https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(buildMessage(reference)), '_blank', 'noopener');
      }
      if (status) {
        status.innerHTML = 'Merci ' + escapeHtml(name) + '. Votre numéro de dossier est <strong>' + reference + '</strong> — conservez-le. WhatsApp s\'ouvre dans un nouvel onglet avec votre demande : il ne reste qu\'à appuyer sur « Envoyer ». Vous pouvez suivre l\'avancement sur la page <a href="suivi.html?ref=' + encodeURIComponent(reference) + '">Suivi de dossier</a>.';
        status.classList.add('is-visible');
      }
      form.reset();

      function value(id) {
        var el = form.querySelector('#' + id);
        return el ? String(el.value || '').trim() : '';
      }

      function buildMessage(reference) {
        var lines = [
          'Demande de rendez-vous — Moulazim Law Firm',
          'Dossier n° ' + reference,
          '',
          'Nom : ' + value('nom'),
          'Société : ' + (value('societe') || 'non renseignée'),
          'E-mail : ' + value('email'),
          'Téléphone : ' + value('tel'),
          'Domaine : ' + value('domaine'),
          'Urgence : ' + value('urgence'),
          '',
          'Situation :',
          value('message')
        ];
        return lines.join('\n');
      }
    });

    form.querySelectorAll('[data-required]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('has-error');
      });
    });
  }

  var STORAGE_KEY = 'mlf-dossiers';

  function createReference() {
    var digits = String(Math.floor(Math.random() * 9000) + 1000);
    return 'MLF-' + new Date().getFullYear() + '-' + digits;
  }

  function readDossiers() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveDossier(entry) {
    try {
      var all = readDossiers();
      all.unshift(entry);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 20)));
    } catch (err) { /* stockage indisponible : la référence reste dans le message WhatsApp */ }
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initTracking() {
    var form = document.querySelector('[data-track-form]');
    if (!form) return;

    var input = form.querySelector('#ref');
    var status = form.querySelector('[data-track-status]');
    var result = document.querySelector('[data-track-result]');
    var pattern = /^MLF-\d{4}-\d{4}$/i;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      lookup(String(input.value || '').trim().toUpperCase());
    });

    var fromUrl = new URLSearchParams(window.location.search).get('ref');
    if (fromUrl) {
      input.value = fromUrl.toUpperCase();
      lookup(input.value);
    }

    function lookup(ref) {
      var field = input.closest('.field');
      var valid = pattern.test(ref);
      if (field) field.classList.toggle('has-error', !valid);
      if (!valid) {
        hide();
        return;
      }

      var found = readDossiers().filter(function (d) { return d.ref === ref; })[0];
      if (!found) {
        hide();
        show(status, 'Aucun dossier enregistré sous la référence ' + ref + ' sur cet appareil. Si ce numéro vous a été communiqué par le cabinet, demandez la mise à jour par WhatsApp au +212 669 02 62 10.');
        return;
      }

      set('[data-track-ref]', found.ref);
      set('[data-track-date]', formatDate(found.date));
      set('[data-track-domaine]', found.domaine || 'à qualifier');
      set('[data-track-urgence]', found.urgence || 'Standard');
      set('[data-track-etat]', 'Demande reçue — en attente de qualification par le cabinet');

      var steps = result.querySelectorAll('[data-track-steps] li');
      steps.forEach(function (li, index) {
        li.classList.toggle('is-current', index === 0);
        li.classList.toggle('is-done', index < 0);
      });

      var wa = result.querySelector('[data-track-wa]');
      if (wa) {
        wa.setAttribute('href', 'https://wa.me/212669026210?text=' + encodeURIComponent('Bonjour, je souhaite une mise à jour sur le dossier n° ' + found.ref + '.'));
      }

      result.hidden = false;
      show(status, 'Dossier ' + found.ref + ' trouvé.');
    }

    function hide() {
      if (result) result.hidden = true;
      if (status) { status.textContent = ''; status.classList.remove('is-visible'); }
    }

    function show(el, text) {
      if (!el) return;
      el.textContent = text;
      el.classList.add('is-visible');
    }

    function set(selector, text) {
      var el = result.querySelector(selector);
      if (el) el.textContent = text;
    }

    function formatDate(iso) {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
})();

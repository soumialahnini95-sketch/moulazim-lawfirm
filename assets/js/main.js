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
    initAdmin();
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
      var payload = {
        nom: name,
        societe: value('societe'),
        email: value('email'),
        tel: value('tel'),
        domaine: value('domaine'),
        urgence: value('urgence'),
        message: value('message')
      };
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      registerDossier(payload).then(function (reference) {
        saveDossier({
          ref: reference,
          nom: name,
          domaine: payload.domaine,
          urgence: payload.urgence,
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
      }).catch(function () {
        if (status) {
          status.innerHTML = 'L\'enregistrement du dossier a échoué. Contactez directement le cabinet sur <a href="https://wa.me/212669026210" target="_blank" rel="noopener">WhatsApp</a> ou au +212&nbsp;669&nbsp;02&nbsp;62&nbsp;10.';
          status.classList.add('is-visible');
        }
      }).then(function () {
        if (submitBtn) submitBtn.disabled = false;
      });

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

  function apiBase() {
    return (window.MLF_API_BASE || '').replace(/\/$/, '');
  }

  function localReference() {
    var year = new Date().getFullYear();
    return 'MLF-' + year + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }

  function registerDossier(payload) {
    var base = apiBase();
    if (!base) return Promise.resolve(localReference());
    return fetch(base + '/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function (data) {
      return data.ref;
    });
  }

  function fetchDossier(ref) {
    var base = apiBase();
    if (!base) return Promise.resolve(null);
    return fetch(base + '/api/dossiers/' + encodeURIComponent(ref)).then(function (response) {
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
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

  function initAdmin() {
    var root = document.querySelector('[data-admin]');
    if (!root) return;

    var loginForm = root.querySelector('[data-admin-login]');
    var passwordInput = root.querySelector('#admin-pass');
    var loginStatus = root.querySelector('[data-admin-login-status]');
    var panel = root.querySelector('[data-admin-panel]');
    var tbody = root.querySelector('[data-admin-rows]');
    var panelStatus = root.querySelector('[data-admin-status]');
    var password = '';

    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      password = String(passwordInput.value || '');
      load();
    });

    root.querySelector('[data-admin-refresh]').addEventListener('click', load);
    root.querySelector('[data-admin-logout]').addEventListener('click', function () {
      password = '';
      passwordInput.value = '';
      panel.hidden = true;
      loginForm.hidden = false;
      tbody.innerHTML = '';
    });

    function load() {
      var base = apiBase();
      if (!base) { setText(loginStatus, 'API non configurée.'); return; }
      setText(loginStatus, 'Connexion…');
      fetch(base + '/api/admin/dossiers', { headers: { 'X-Admin-Password': password } })
        .then(function (response) {
          if (response.status === 401) throw new Error('unauthorized');
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (data) {
          loginForm.hidden = true;
          panel.hidden = false;
          setText(loginStatus, '');
          setText(panelStatus, data.dossiers.length + ' dossier(s).');
          renderRows(data.dossiers);
        })
        .catch(function (err) {
          setText(loginStatus, err.message === 'unauthorized' ? 'Mot de passe incorrect.' : 'Service indisponible, réessayez.');
        });
    }

    function renderRows(dossiers) {
      tbody.innerHTML = '';
      dossiers.forEach(function (d) {
        var tr = document.createElement('tr');
        tr.appendChild(cell(d.ref));
        tr.appendChild(cell(formatDateShort(d.created_at)));
        tr.appendChild(cell(d.nom + (d.societe ? ' — ' + d.societe : '')));
        tr.appendChild(cell(d.tel + ' · ' + d.email));
        tr.appendChild(cell(d.domaine + (d.urgence ? ' · ' + d.urgence : '')));
        tr.appendChild(cell(d.message, 'admin-message'));

        var etapeCell = document.createElement('td');
        var select = document.createElement('select');
        ['1 — Demande reçue', '2 — Qualification', '3 — Mandat validé', '4 — Dossier en cours', '5 — Clôturé'].forEach(function (label, i) {
          var option = document.createElement('option');
          option.value = String(i + 1);
          option.textContent = label;
          if (d.etape === i + 1) option.selected = true;
          select.appendChild(option);
        });
        etapeCell.appendChild(select);
        tr.appendChild(etapeCell);

        var noteCell = document.createElement('td');
        var note = document.createElement('input');
        note.type = 'text';
        note.value = d.note || '';
        note.placeholder = 'Message visible par le client';
        noteCell.appendChild(note);
        tr.appendChild(noteCell);

        var actionCell = document.createElement('td');
        var save = document.createElement('button');
        save.type = 'button';
        save.className = 'btn btn--gold btn--sm';
        save.textContent = 'Enregistrer';
        save.addEventListener('click', function () {
          save.disabled = true;
          fetch(apiBase() + '/api/admin/dossiers/' + encodeURIComponent(d.ref), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
            body: JSON.stringify({ etape: Number(select.value), note: note.value })
          }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            setText(panelStatus, 'Dossier ' + d.ref + ' mis à jour.');
          }).catch(function () {
            setText(panelStatus, 'Échec de la mise à jour du dossier ' + d.ref + '.');
          }).then(function () { save.disabled = false; });
        });
        actionCell.appendChild(save);
        tr.appendChild(actionCell);

        tbody.appendChild(tr);
      });
    }

    function cell(text, className) {
      var td = document.createElement('td');
      td.textContent = text || '—';
      if (className) td.className = className;
      return td;
    }

    function setText(el, text) {
      if (!el) return;
      el.textContent = text;
      el.classList.toggle('is-visible', Boolean(text));
    }

    function formatDateShort(iso) {
      var d = new Date(iso);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
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

      show(status, 'Recherche du dossier ' + ref + '…');

      fetchDossier(ref).then(function (data) {
        if (data) {
          render({
            ref: data.ref,
            date: data.created_at,
            domaine: data.domaine,
            urgence: data.urgence,
            etat: data.etat,
            etape: data.etape,
            note: data.note
          });
          return;
        }
        var local = readDossiers().filter(function (d) { return d.ref === ref; })[0];
        if (local) {
          render({ ref: local.ref, date: local.date, domaine: local.domaine, urgence: local.urgence, etape: 1, note: '' });
          return;
        }
        hide();
        show(status, 'Aucun dossier enregistré sous la référence ' + ref + '. Vérifiez le numéro reçu lors de votre demande ou contactez le cabinet par WhatsApp au +212 669 02 62 10.');
      }).catch(function () {
        hide();
        show(status, 'Service de suivi momentanément indisponible. Réessayez dans quelques minutes ou contactez le cabinet par WhatsApp au +212 669 02 62 10.');
      });
    }

    function render(found) {
      var etape = Number(found.etape) || 1;
      set('[data-track-ref]', found.ref);
      set('[data-track-date]', formatDate(found.date));
      set('[data-track-domaine]', found.domaine || 'à qualifier');
      set('[data-track-urgence]', found.urgence || 'Standard');
      set('[data-track-etat]', found.etat || 'Demande reçue — en attente de qualification par le cabinet');

      var noteEl = result.querySelector('[data-track-note]');
      if (noteEl) {
        noteEl.textContent = found.note || '';
        noteEl.hidden = !found.note;
      }

      var steps = result.querySelectorAll('[data-track-steps] li');
      steps.forEach(function (li, index) {
        li.classList.toggle('is-current', index === etape - 1);
        li.classList.toggle('is-done', index < etape - 1);
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

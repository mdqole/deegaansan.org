/* ============================================
   DEEGANSAN — dashboard.js
   The course browser students land on after
   logging in: search with suggestions, filter
   pills (Topic / Format / Status / Sort), course
   cards, and one-click enrollment.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const gridEl = document.getElementById('browseGrid');
  if (!gridEl) return;

  const greetingEl = document.getElementById('dashboardGreeting');
  const searchBoxEl = document.getElementById('browseSearchBox');
  const searchEl = document.getElementById('browseSearch');
  const searchBtnEl = document.getElementById('browseSearchBtn');
  const suggestEl = document.getElementById('browseSuggest');
  const filtersEl = document.getElementById('browseFilters');
  const resultsEl = document.getElementById('browseResults');
  const statusEl = document.getElementById('browseStatus');
  const courses = (typeof COURSES !== 'undefined' ? COURSES : []);

  function unique(list) {
    return list.filter(function (v, i) { return v && list.indexOf(v) === i; });
  }
  const topics = unique(courses.map(function (c) { return c.category; }));
  const formats = unique(courses.map(function (c) { return c.format; }));

  const state = { status: 'all', topics: [], formats: [], sort: 'default', query: '' };
  let openMenu = null;
  let me = null;
  const enrolledAt = {}; // courseSlug -> ISO date string

  function isEnrolled(course) {
    return Object.prototype.hasOwnProperty.call(enrolledAt, course.slug);
  }

  function setStatus(message, kind) {
    statusEl.textContent = message || '';
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  /* ---------- filtering ---------- */

  function visibleCourses() {
    const query = state.query.trim().toLowerCase();
    let list = courses.filter(function (c) {
      if (state.status === 'mine' && !isEnrolled(c)) return false;
      if (state.status === 'available' && isEnrolled(c)) return false;
      if (state.topics.length && state.topics.indexOf(c.category) === -1) return false;
      if (state.formats.length && state.formats.indexOf(c.format) === -1) return false;
      if (!query) return true;
      return [c.title, c.summary, c.category, c.format, (c.skills || []).join(' ')]
        .join(' ').toLowerCase().indexOf(query) !== -1;
    });

    if (state.sort === 'az') {
      list = list.slice().sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (state.sort === 'recent') {
      list = list.slice().sort(function (a, b) {
        return (enrolledAt[b.slug] || '').localeCompare(enrolledAt[a.slug] || '');
      });
    }
    return list;
  }

  /* ---------- filter pills ---------- */

  const ICON_SLIDERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';

  function option(type, group, value, label, checked, count) {
    return '<label class="filter-opt">' +
      '<input type="' + type + '" name="' + group + '" data-group="' + group + '" value="' + escapeHtml(value) + '"' + (checked ? ' checked' : '') + ' />' +
      '<span>' + escapeHtml(label) + '</span>' +
      (count !== undefined ? '<span class="filter-opt-count">' + count + '</span>' : '') +
    '</label>';
  }

  function pill(key, label, activeCount, menuHtml, icon) {
    const isOpen = openMenu === key;
    return '<div class="filter-wrap">' +
      '<button type="button" class="filter-pill' + (activeCount ? ' active' : '') + '" data-menu="' + key + '" aria-expanded="' + isOpen + '">' +
        (icon || '') + escapeHtml(label) + (activeCount ? ' · ' + activeCount : '') + '<span class="filter-caret"></span>' +
      '</button>' +
      (isOpen ? '<div class="filter-menu">' + menuHtml + '</div>' : '') +
    '</div>';
  }

  function anyFilterActive() {
    return state.status !== 'all' || state.topics.length || state.formats.length || state.sort !== 'default';
  }

  function renderFilters() {
    const mine = courses.filter(isEnrolled).length;

    const sortMenu = '<h4>Sort by</h4>' +
      option('radio', 'sort', 'default', 'Recommended', state.sort === 'default') +
      option('radio', 'sort', 'az', 'Title A–Z', state.sort === 'az') +
      option('radio', 'sort', 'recent', 'Recently enrolled', state.sort === 'recent');

    const topicMenu = topics.map(function (t) {
      const n = courses.filter(function (c) { return c.category === t; }).length;
      return option('checkbox', 'topic', t, t, state.topics.indexOf(t) !== -1, n);
    }).join('');

    const formatMenu = formats.map(function (f) {
      const n = courses.filter(function (c) { return c.format === f; }).length;
      return option('checkbox', 'format', f, f, state.formats.indexOf(f) !== -1, n);
    }).join('');

    const statusMenu =
      option('radio', 'status', 'all', 'All courses', state.status === 'all', courses.length) +
      option('radio', 'status', 'mine', 'My courses', state.status === 'mine', mine) +
      option('radio', 'status', 'available', 'Not enrolled yet', state.status === 'available', courses.length - mine);

    filtersEl.innerHTML =
      pill('sort', 'Filter & Sort', state.sort !== 'default' ? 1 : 0, sortMenu, ICON_SLIDERS) +
      '<span class="filter-divider"></span>' +
      pill('topic', 'Topic', state.topics.length, topicMenu) +
      pill('format', 'Format', state.formats.length, formatMenu) +
      pill('status', 'Status', state.status !== 'all' ? 1 : 0, statusMenu) +
      (anyFilterActive() ? '<button type="button" class="filter-clear" data-clear="1">Clear all</button>' : '');
  }

  /* ---------- cards ---------- */

  function cardHtml(course) {
    const enrolled = isEnrolled(course);
    const url = 'course.html?course=' + encodeURIComponent(course.slug);
    const image = course.image ? ' style="background-image: url(\'' + escapeHtml(course.image) + '\');"' : '';

    const skills = course.skills && course.skills.length
      ? '<p class="browse-card-skills"><span>Skills you\'ll gain:</span> ' + escapeHtml(course.skills.join(', ')) + '</p>'
      : '';

    const materials = enrolled && course.materials && course.materials.length
      ? '<ul class="browse-card-materials">' + course.materials.map(function (m) {
          return '<li><a class="topic-download" href="' + escapeHtml(m.file) + '" download>' + escapeHtml(m.label) + '</a></li>';
        }).join('') + '</ul>'
      : '';

    const actions = enrolled
      ? '<span class="browse-enrolled">Enrolled</span><a class="course-view-link" href="' + url + '">Open course →</a>'
      : '<button type="button" class="course-enroll-btn" data-slug="' + escapeHtml(course.slug) + '">Enroll</button>' +
        '<a class="course-view-link" href="' + url + '">Details →</a>';

    return (
      '<article class="browse-card">' +
        '<a class="browse-card-img" href="' + url + '"' + image + ' aria-label="' + escapeHtml(course.title) + '">' +
          (enrolled ? '<span class="browse-badge" title="Enrolled">✓</span>' : '') +
        '</a>' +
        '<div class="browse-card-by"><span class="browse-card-avatar">D</span><span>Deegansan</span></div>' +
        '<a class="browse-card-title" href="' + url + '">' + escapeHtml(course.title) + '</a>' +
        skills +
        '<div class="browse-card-pills">' +
          '<span class="browse-pill">' + escapeHtml(course.format) + '</span>' +
          (course.duration ? '<span class="browse-pill">' + escapeHtml(course.duration) + '</span>' : '') +
          (course.category ? '<span class="browse-pill">' + escapeHtml(course.category) + '</span>' : '') +
          (enrolled ? '<span class="browse-pill green">Enrolled</span>' : '') +
        '</div>' +
        materials +
        '<div class="browse-card-actions">' + actions + '</div>' +
      '</article>'
    );
  }

  function render() {
    renderFilters();

    const list = visibleCourses();
    const q = state.query.trim();
    resultsEl.textContent = list.length + (list.length === 1 ? ' course' : ' courses') + (q ? ' for “' + q + '”' : '');

    if (!list.length) {
      gridEl.innerHTML = '<p class="topics-empty">' + (
        state.status === 'mine' && !q && !state.topics.length && !state.formats.length
          ? 'You haven\'t enrolled in any courses yet — set Status to “Not enrolled yet” to find one.'
          : 'No courses match those filters.'
      ) + '</p>';
      return;
    }
    gridEl.innerHTML = list.map(cardHtml).join('');
  }

  /* ---------- search suggestions ---------- */

  function buildSuggestions() {
    document.getElementById('suggestChips').innerHTML = topics.concat(formats).map(function (t) {
      return '<button type="button" class="browse-suggest-chip" data-term="' + escapeHtml(t) + '">' + escapeHtml(t) + '</button>';
    }).join('');

    document.getElementById('suggestCards').innerHTML = courses.slice(0, 2).map(function (c) {
      const style = c.image ? ' style="background-image: url(\'' + escapeHtml(c.image) + '\');"' : '';
      return '<a class="browse-suggest-card" href="course.html?course=' + encodeURIComponent(c.slug) + '">' +
        '<div class="thumb"' + style + '></div>' +
        '<strong>' + escapeHtml(c.title) + '</strong>' +
        '<small>Deegansan · ' + escapeHtml(c.format) + '</small>' +
      '</a>';
    }).join('');
  }

  function showSuggest() { if (!searchEl.value) suggestEl.hidden = false; }
  function hideSuggest() { suggestEl.hidden = true; }

  searchEl.addEventListener('focus', showSuggest);
  searchEl.addEventListener('click', showSuggest);
  searchEl.addEventListener('input', function () {
    state.query = searchEl.value;
    if (searchEl.value) hideSuggest(); else showSuggest();
    render();
  });
  searchBtnEl.addEventListener('click', function () {
    state.query = searchEl.value;
    hideSuggest();
    render();
  });
  suggestEl.addEventListener('click', function (e) {
    const chip = e.target.closest('.browse-suggest-chip');
    if (!chip) return;
    searchEl.value = chip.dataset.term;
    state.query = chip.dataset.term;
    hideSuggest();
    render();
  });

  /* ---------- filter interactions ---------- */

  filtersEl.addEventListener('click', function (e) {
    const trigger = e.target.closest('.filter-pill');
    if (trigger) {
      openMenu = openMenu === trigger.dataset.menu ? null : trigger.dataset.menu;
      renderFilters();
      return;
    }
    if (e.target.closest('[data-clear]')) {
      state.status = 'all';
      state.topics = [];
      state.formats = [];
      state.sort = 'default';
      openMenu = null;
      render();
    }
  });

  filtersEl.addEventListener('change', function (e) {
    const input = e.target;
    const group = input.dataset.group;
    if (group === 'topic' || group === 'format') {
      const key = group === 'topic' ? 'topics' : 'formats';
      const at = state[key].indexOf(input.value);
      if (input.checked && at === -1) state[key].push(input.value);
      if (!input.checked && at !== -1) state[key].splice(at, 1);
    } else if (group === 'status') {
      state.status = input.value;
    } else if (group === 'sort') {
      state.sort = input.value;
    }
    render();
  });

  document.addEventListener('click', function (e) {
    if (openMenu && !e.target.closest('.filter-wrap')) {
      openMenu = null;
      renderFilters();
    }
    if (!e.target.closest('#browseSearchBox')) hideSuggest();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    hideSuggest();
    if (openMenu) { openMenu = null; renderFilters(); }
  });

  /* ---------- enrollment ---------- */

  function notifyFormspree(course) {
    // Best-effort org notification; the enrollment itself is already saved.
    fetch('https://formspree.io/f/mljdeapa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: me.name,
        email: me.email,
        course: course.title,
        _subject: 'New Course Enrollment: ' + course.title
      })
    }).catch(function () {});
  }

  gridEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.course-enroll-btn');
    if (!btn) return;

    const course = courses.filter(function (c) { return c.slug === btn.dataset.slug; })[0];
    if (!course) return;

    btn.textContent = 'Enrolling…';
    btn.disabled = true;
    setStatus('');

    fetch('/api/enroll', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: course.title, courseSlug: course.slug })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error(data && data.error ? data.error : 'Enrollment failed.');
          if (!data.alreadyEnrolled) notifyFormspree(course);
          enrolledAt[course.slug] = new Date().toISOString();
          setStatus('You\'re enrolled in ' + course.title + '.', 'success');
          render();
        });
      })
      .catch(function (err) {
        btn.textContent = 'Enroll';
        btn.disabled = false;
        setStatus(err.message || 'Something went wrong — please try again.', 'error');
      });
  });

  /* ---------- load ---------- */

  buildSuggestions();
  renderFilters();

  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.loggedIn) {
        window.location.href = 'login.html?next=dashboard.html';
        return;
      }
      me = data;
      if (greetingEl) greetingEl.textContent = 'Welcome, ' + me.name.split(' ')[0];

      return fetch('/api/my-enrollments', { credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          if (result.ok) {
            (result.enrollments || []).forEach(function (enr) {
              enrolledAt[enr.courseSlug] = enr.createdAt;
            });
          } else {
            setStatus(result.error || 'Couldn\'t load your enrollments.', 'error');
          }
          render();
        });
    })
    .catch(function () {
      gridEl.innerHTML = '<p class="topics-empty">Something went wrong loading courses — please try again.</p>';
    });

});

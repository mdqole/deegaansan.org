/* ============================================
   DEEGANSAN — dashboard.js
   The course browser students land on after
   logging in: every course as a card, with
   filters (All / My Courses / Available),
   search, sort, and one-click enrollment.
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
  const searchEl = document.getElementById('browseSearch');
  const sortEl = document.getElementById('browseSort');
  const chipsEl = document.getElementById('browseChips');
  const statusEl = document.getElementById('browseStatus');
  const courses = (typeof COURSES !== 'undefined' ? COURSES : []);

  let me = null;
  let filter = 'all';
  const enrolledAt = {}; // courseSlug -> ISO date string

  function isEnrolled(course) {
    return Object.prototype.hasOwnProperty.call(enrolledAt, course.slug);
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  function updateCounts() {
    const mine = courses.filter(isEnrolled).length;
    document.getElementById('countAll').textContent = courses.length;
    document.getElementById('countMine').textContent = mine;
    document.getElementById('countAvailable').textContent = courses.length - mine;
  }

  function cardHtml(course) {
    const enrolled = isEnrolled(course);
    const url = 'course.html?course=' + encodeURIComponent(course.slug);
    const image = course.image ? ' style="background-image: url(\'' + escapeHtml(course.image) + '\');"' : '';

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
      '<div class="browse-card">' +
        '<a class="browse-card-img" href="' + url + '"' + image + ' aria-label="' + escapeHtml(course.title) + '">' +
          (enrolled ? '<span class="browse-badge" title="Enrolled">✓</span>' : '') +
        '</a>' +
        '<div class="browse-card-body">' +
          '<a class="browse-card-title" href="' + url + '">' + escapeHtml(course.title) + '</a>' +
          '<div class="browse-card-by"><span class="browse-card-avatar">D</span><span>Deegansan</span></div>' +
          '<div class="browse-card-meta">' +
            '<span>' + escapeHtml(course.format) + '</span>' +
            (course.duration ? '<span>' + escapeHtml(course.duration) + '</span>' : '') +
            (course.category ? '<span>' + escapeHtml(course.category) + '</span>' : '') +
          '</div>' +
          materials +
          '<div class="browse-card-actions">' + actions + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function render() {
    updateCounts();

    const query = (searchEl ? searchEl.value : '').trim().toLowerCase();
    let list = courses.filter(function (c) {
      if (filter === 'mine' && !isEnrolled(c)) return false;
      if (filter === 'available' && isEnrolled(c)) return false;
      if (!query) return true;
      return [c.title, c.summary, c.category, c.format].join(' ').toLowerCase().indexOf(query) !== -1;
    });

    const sort = sortEl ? sortEl.value : 'default';
    if (sort === 'az') {
      list = list.slice().sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (sort === 'recent') {
      list = list.slice().sort(function (a, b) {
        return (enrolledAt[b.slug] || '').localeCompare(enrolledAt[a.slug] || '');
      });
    }

    if (!list.length) {
      gridEl.innerHTML = '<p class="topics-empty">' + (
        filter === 'mine' && !query
          ? 'You haven\'t enrolled in any courses yet — switch to <strong>Available</strong> to find one.'
          : 'No courses match that.'
      ) + '</p>';
      return;
    }

    gridEl.innerHTML = list.map(cardHtml).join('');
  }

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

  chipsEl.addEventListener('click', function (e) {
    const chip = e.target.closest('.browse-chip');
    if (!chip) return;
    filter = chip.dataset.filter;
    chipsEl.querySelectorAll('.browse-chip').forEach(function (c) {
      c.classList.toggle('active', c === chip);
    });
    render();
  });

  if (searchEl) searchEl.addEventListener('input', render);
  if (sortEl) sortEl.addEventListener('change', render);

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

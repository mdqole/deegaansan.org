/* ============================================
   DEEGANSAN — course.js
   Renders a single course page (course.html?course=<slug>)
   from js/courses-data.js, and handles that page's own
   enrollment form.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function textToHtml(text) {
    return String(text || '')
      .split(/\n\s*\n/)
      .map(function (block) { return block.trim(); })
      .filter(Boolean)
      .map(function (block) {
        return '<p>' + escapeHtml(block).replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  function list(items, cls) {
    return '<ul class="' + cls + '">' +
      items.map(function (i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') +
    '</ul>';
  }

  // Optional sections for full courses — each only renders if the course
  // defines the matching field (see courses-data.js).
  function buildExtras(c) {
    let html = '';

    if (c.audience && c.audience.length) {
      html += '<section class="course-section"><h3>Who It\'s For</h3>' + list(c.audience, 'pill-list') + '</section>';
    }

    if (c.delivery && c.delivery.length) {
      html += '<section class="course-section"><h3>How the Course Runs</h3>' + list(c.delivery, 'course-highlights') + '</section>';
    }

    if (c.outcomes && c.outcomes.length) {
      html += '<section class="course-section"><h3>Learning Outcomes</h3>' +
        '<p>By the end of the course, participants should be able to:</p>' + list(c.outcomes, 'course-highlights') + '</section>';
    }

    if (c.weeks && c.weeks.length) {
      html += '<section class="course-section"><h3>Syllabus</h3>' + c.weeks.map(function (w, i) {
        const modules = (w.modules || []).map(function (m) {
          return '<div class="syllabus-module"><h4>Module ' + m.n + ' — ' + escapeHtml(m.title) + '</h4>' + list(m.topics || [], 'syllabus-topics') + '</div>';
        }).join('');
        const assignments = (w.assignments || []).map(function (a) {
          return '<div class="syllabus-assign"><strong>' + escapeHtml(a.title) + '</strong><span>' + escapeHtml(a.brief) + '</span></div>';
        }).join('');
        return '<details class="syllabus-week"' + (i === 0 ? ' open' : '') + '>' +
          '<summary><span class="syllabus-week-num">Week ' + w.week + '</span>' + escapeHtml(w.title) + '</summary>' +
          '<div class="syllabus-week-body">' + modules + assignments + '</div>' +
        '</details>';
      }).join('') + '</section>';
    }

    if (c.assessment && c.assessment.length) {
      html += '<section class="course-section"><h3>Assessment</h3><table class="assess-table"><tbody>' +
        c.assessment.map(function (a) {
          return '<tr><td>' + escapeHtml(a.label) + '</td><td>' + a.weight + '%</td></tr>';
        }).join('') +
        '</tbody></table>' +
        (c.passMark ? '<p>Recommended passing score: <strong>' + c.passMark + '%</strong>.</p>' : '') +
        (c.certificate ? '<p>' + escapeHtml(c.certificate) + '</p>' : '') +
      '</section>';
    }

    if (c.finalProject && c.finalProject.sections) {
      html += '<section class="course-section"><h3>Final Project</h3>' +
        '<p><strong>' + escapeHtml(c.finalProject.title) + '</strong></p>' +
        (c.finalProject.intro ? '<p>' + escapeHtml(c.finalProject.intro) + '</p>' : '') +
        '<ol class="course-highlights numbered">' +
          c.finalProject.sections.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') +
        '</ol></section>';
    }

    if (c.tools && c.tools.length) {
      html += '<section class="course-section"><h3>Tools &amp; Platforms</h3>' + list(c.tools, 'course-highlights') + '</section>';
    }

    return html;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('course');
  const enrolled = params.get('enrolled') === '1';

  const courses = (typeof COURSES !== 'undefined' ? COURSES : []);
  const course = courses.filter(function (c) { return c.slug === slug; })[0];

  const notFoundEl = document.getElementById('courseNotFound');
  const articleEl = document.getElementById('courseArticle');

  if (!course) {
    if (notFoundEl) notFoundEl.hidden = false;
    if (articleEl) articleEl.hidden = true;
    return;
  }

  document.title = course.title + ' – Deegansan Courses';

  const categoryEl = document.getElementById('courseCategory');
  const metaEl = document.getElementById('courseMeta');
  const titleEl = document.getElementById('courseTitle');
  const summaryEl = document.getElementById('courseSummary');
  const highlightsEl = document.getElementById('courseHighlights');
  const contentEl = document.getElementById('courseContent');

  if (categoryEl) categoryEl.textContent = course.category || '';
  if (metaEl) metaEl.textContent = course.format + (course.duration ? ' · ' + course.duration : '');
  if (titleEl) titleEl.textContent = course.title;
  if (summaryEl) summaryEl.textContent = course.summary || '';

  if (highlightsEl) {
    highlightsEl.innerHTML = (course.highlights || [])
      .map(function (h) { return '<li>' + escapeHtml(h) + '</li>'; })
      .join('');
  }

  if (contentEl) {
    contentEl.innerHTML = course.content ? textToHtml(course.content) : '';
  }

  if (articleEl) articleEl.hidden = false;

  /* -- Enrolled confirmation banner + hide the form once enrolled -- */
  const bannerEl = document.getElementById('courseEnrolledBanner');
  const enrolledMsgEl = document.getElementById('courseEnrolledMsg');
  const enrollPanelEl = document.getElementById('courseEnrollPanel');

  const roomLinkEl = document.getElementById('courseRoomLink');

  // justEnrolled = they've only just registered (vs. coming back later).
  function showEnrolled(justEnrolled) {
    DeegansanReg.markRegistered(course.slug);

    if (enrolledMsgEl) {
      enrolledMsgEl.innerHTML = justEnrolled
        ? 'You\'re enrolled in <strong>' + escapeHtml(course.title) + '</strong> — we\'ll be in touch about dates, cost, and how to get started.'
        : 'Welcome back — you\'re registered for <strong>' + escapeHtml(course.title) + '</strong>.';
    }
    if (bannerEl) bannerEl.hidden = false;
    if (enrollPanelEl) enrollPanelEl.hidden = true;

    if (roomLinkEl && course.weeks && course.weeks.length) {
      const progress = DeegansanReg.getProgress(course.slug);
      roomLinkEl.textContent = progress ? 'Pick up where you left off →' : 'Start the course →';
      roomLinkEl.href = 'learn.html?course=' + encodeURIComponent(course.slug) + (progress ? '#' + progress.step : '#welcome');
      roomLinkEl.hidden = false;
    }
  }

  if (enrolled) showEnrolled(true);
  else if (DeegansanReg.isRegistered(course.slug)) showEnrolled(false);

  /* -- Full-course sections (only for courses that define them) -- */
  const extrasEl = document.getElementById('courseExtras');
  if (extrasEl) extrasEl.innerHTML = buildExtras(course);

  /* -- Start-date countdown -- */
  const countdownEl = document.getElementById('courseCountdown');
  if (countdownEl && course.startDate) {
    const target = new Date(course.startDate + 'T00:00:00+03:00');
    const labelEl = document.getElementById('courseCountdownLabel');
    const unitsEl = document.getElementById('courseCountdownUnits');

    document.getElementById('courseStartDate').textContent = target.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Mogadishu'
    });
    countdownEl.hidden = false;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function tick() {
      const ms = target - Date.now();
      if (ms <= 0) {
        labelEl.textContent = 'Course started on';
        unitsEl.hidden = true;
        return false;
      }
      const s = Math.floor(ms / 1000);
      document.getElementById('cdcDays').textContent = Math.floor(s / 86400);
      document.getElementById('cdcHours').textContent = pad(Math.floor(s % 86400 / 3600));
      document.getElementById('cdcMinutes').textContent = pad(Math.floor(s % 3600 / 60));
      document.getElementById('cdcSeconds').textContent = pad(s % 60);
      return true;
    }

    if (tick()) {
      const timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
    }
  }

  /* -- This page's own enrollment form (login optional) -- */
  const form = document.getElementById('courseEnrollForm');
  const nameEmailRow = document.getElementById('courseEnrollNameEmail');
  const enrollAsLine = document.getElementById('courseEnrollAsLine');

  if (form && !enrolled) {
    const statusEl = document.getElementById('courseEnrollStatus');
    const btn = form.querySelector('.btn-send');
    let currentUser = null;

    function notifyFormspree(name, email) {
      fetch('https://formspree.io/f/mljdeapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          course: course.title,
          _subject: 'New Course Enrollment: ' + course.title
        })
      }).catch(function () {});
    }

    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (me) {
        if (me.loggedIn) {
          currentUser = me;
          if (nameEmailRow) nameEmailRow.hidden = true;
          if (enrollAsLine) {
            enrollAsLine.hidden = false;
            enrollAsLine.textContent = 'Enrolling as ' + me.name + ' (' + me.email + ')';
          }

          // Already enrolled? Show that instead of the form.
          fetch('/api/my-enrollments', { credentials: 'include' })
            .then(function (r) { return r.json(); })
            .then(function (result) {
              const already = result.ok && (result.enrollments || []).some(function (enr) {
                return enr.courseSlug === course.slug;
              });
              if (already) showEnrolled(false);
            })
            .catch(function () {});
        }
      });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = currentUser ? currentUser.name : form.querySelector('[name="name"]').value.trim();
      const email = currentUser ? currentUser.email : form.querySelector('[name="email"]').value.trim();

      if (!currentUser && (!name || !email)) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in your name and email.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      btn.textContent = 'Submitting…';
      btn.disabled = true;

      fetch('/api/enroll', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: form.querySelector('[name="phone"]').value.trim(),
          course: course.title,
          courseSlug: course.slug,
          message: form.querySelector('[name="message"]').value.trim()
        })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              throw new Error(data && data.error ? data.error : 'Submission failed');
            }
            if (!data.alreadyEnrolled) notifyFormspree(name, email);
            showEnrolled(true);
          });
        })
        .catch(function (err) {
          btn.textContent = 'Submit Enrollment →';
          btn.disabled = false;
          if (statusEl) {
            statusEl.textContent = err.message || 'Something went wrong — please try again or email us directly.';
            statusEl.className = 'form-status error';
          }
        })
        .finally(function () {
          setTimeout(function () {
            btn.textContent = 'Submit Enrollment →';
            btn.disabled = false;
          }, 3000);
        });
    });
  }

});

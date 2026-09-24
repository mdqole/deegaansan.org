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
  const enrolledNameEl = document.getElementById('enrolledCourseName');
  const enrollPanelEl = document.getElementById('courseEnrollPanel');

  if (enrolled) {
    if (enrolledNameEl) enrolledNameEl.textContent = course.title;
    if (bannerEl) bannerEl.hidden = false;
    if (enrollPanelEl) enrollPanelEl.hidden = true;
  }

  /* -- Auth gate + this page's own enrollment form -- */
  const form = document.getElementById('courseEnrollForm');
  const authPrompt = document.getElementById('courseAuthPrompt');
  const enrollAsLine = document.getElementById('courseEnrollAsLine');
  const loginLink = document.getElementById('courseLoginLink');
  const signupLink = document.getElementById('courseSignupLink');
  const nextParam = encodeURIComponent('course.html?course=' + slug);

  if (loginLink) loginLink.href = 'login.html?next=' + nextParam;
  if (signupLink) signupLink.href = 'signup.html?next=' + nextParam;

  if (form && !enrolled) {
    const statusEl = document.getElementById('courseEnrollStatus');
    const btn = form.querySelector('.btn-send');
    let currentUser = null;

    function notifyFormspree() {
      fetch('https://formspree.io/f/mljdeapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
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
          form.hidden = false;
          if (authPrompt) authPrompt.hidden = true;
          if (enrollAsLine) {
            enrollAsLine.hidden = false;
            enrollAsLine.textContent = 'Enrolling as ' + me.name + ' (' + me.email + ')';
          }
        } else {
          form.hidden = true;
          if (authPrompt) authPrompt.hidden = false;
        }
      });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!currentUser) {
        if (authPrompt) authPrompt.hidden = false;
        return;
      }

      btn.textContent = 'Submitting…';
      btn.disabled = true;

      fetch('/api/enroll', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
            if (!data.alreadyEnrolled) notifyFormspree();
            if (enrolledNameEl) enrolledNameEl.textContent = course.title;
            if (bannerEl) bannerEl.hidden = false;
            if (enrollPanelEl) enrollPanelEl.hidden = true;
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

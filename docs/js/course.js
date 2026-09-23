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

  /* -- This page's own enrollment form -- */
  const form = document.getElementById('courseEnrollForm');
  if (form) {
    const statusEl = document.getElementById('courseEnrollStatus');
    const btn = form.querySelector('.btn-send');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();

      if (!name || !email) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: form.querySelector('[name="phone"]').value.trim(),
          course: course.title,
          message: form.querySelector('[name="message"]').value.trim(),
          _gotcha: form.querySelector('[name="_gotcha"]').value
        })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              throw new Error(data && data.error ? data.error : 'Submission failed');
            }
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

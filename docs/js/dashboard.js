/* ============================================
   DEEGANSAN — dashboard.js
   Loads the logged-in student's enrolled courses
   (My Courses page).
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const gridEl = document.getElementById('dashboardEnrollments');
  const greetingEl = document.getElementById('dashboardGreeting');
  if (!gridEl) return;

  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (!me.loggedIn) {
        window.location.href = 'login.html?next=dashboard.html';
        return;
      }

      if (greetingEl) greetingEl.textContent = 'My Courses — ' + me.name;

      return fetch('/api/my-enrollments', { credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) {
            gridEl.innerHTML = '<p class="topics-empty">' + escapeHtml(data.error || 'Something went wrong loading your courses.') + '</p>';
            return;
          }

          const enrollments = data.enrollments || [];
          if (!enrollments.length) {
            gridEl.innerHTML = '<p class="topics-empty">You haven\'t enrolled in any courses yet — <a href="index.html#courses">browse courses</a>.</p>';
            return;
          }

          const courses = (typeof COURSES !== 'undefined' ? COURSES : []);

          gridEl.innerHTML = enrollments.map(function (enr) {
            const course = courses.filter(function (c) { return c.slug === enr.courseSlug; })[0];
            const title = course ? course.title : enr.course;
            const summary = course && course.summary ? '<p>' + escapeHtml(course.summary) + '</p>' : '';
            const link = course
              ? '<a class="course-view-link" href="course.html?course=' + encodeURIComponent(course.slug) + '">View Course →</a>'
              : '';

            const materials = course && course.materials && course.materials.length
              ? '<ul class="course-highlights">' + course.materials.map(function (m) {
                  return '<li><a class="topic-download" href="' + m.file + '" download>' + escapeHtml(m.label) + '</a></li>';
                }).join('') + '</ul>'
              : '<p class="topics-empty" style="padding: 0;">No materials posted yet — check back soon.</p>';

            return (
              '<div class="course-card">' +
                '<div class="course-card-top"><span></span><span class="course-meta">Enrolled ' + new Date(enr.createdAt).toLocaleDateString() + '</span></div>' +
                '<h3>' + escapeHtml(title) + '</h3>' +
                summary +
                materials +
                link +
              '</div>'
            );
          }).join('');
        });
    })
    .catch(function () {
      gridEl.innerHTML = '<p class="topics-empty">Something went wrong loading your courses — please try again.</p>';
    });

});

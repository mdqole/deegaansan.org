/* ============================================
   DEEGANSAN — learn.js
   The Course Room (learn.html?course=<slug>): for
   an enrolled student, one card per week with
   modules, live sessions, recorded lessons,
   materials, the weekly quiz and assignments.
   Anything not filled in yet in courses-data.js
   shows a "coming soon" placeholder.

   NOTE: the room is gated by login + enrollment,
   but the content itself is static data shipped
   with the site — don't put anything in it that
   must stay private until real server-side
   content delivery is added.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const messageEl = document.getElementById('roomMessage');
  const contentEl = document.getElementById('roomContent');
  if (!contentEl) return;

  function showMessage(title, text, linkHref, linkLabel) {
    document.getElementById('roomMessageTitle').textContent = title;
    document.getElementById('roomMessageText').textContent = text;
    const link = document.getElementById('roomMessageLink');
    link.href = linkHref;
    link.textContent = linkLabel;
    messageEl.hidden = false;
    contentEl.hidden = true;
  }

  const slug = new URLSearchParams(window.location.search).get('course');
  const courses = (typeof COURSES !== 'undefined' ? COURSES : []);
  const course = courses.filter(function (c) { return c.slug === slug; })[0];

  if (!course || !course.weeks || !course.weeks.length) {
    showMessage('No Course Room Yet', 'This course doesn\'t have a course room. You can find it in the course catalog.', 'dashboard.html', 'Back to Courses →');
    return;
  }

  document.title = course.title + ' – Course Room';

  function statusText() {
    if (!course.startDate) return '';
    const start = new Date(course.startDate + 'T00:00:00+03:00');
    const dateLabel = start.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Mogadishu'
    });
    const msLeft = start - Date.now();
    if (msLeft > 0) {
      const days = Math.floor(msLeft / 86400000);
      const togo = days >= 1 ? days + (days === 1 ? ' day' : ' days') + ' to go' : 'less than a day to go';
      return 'The course starts on ' + dateLabel + ' — ' + togo + '. Live session links and materials will appear here before then.';
    }
    return 'The course started on ' + dateLabel + '.';
  }

  function sessionsHtml(week) {
    const sessions = week.sessions && week.sessions.length
      ? week.sessions
      : [{ label: 'Live session 1' }, { label: 'Live session 2' }];
    return '<ul class="room-list">' + sessions.map(function (s) {
      const when = s.when ? '<span>' + escapeHtml(s.when) + '</span>' : '';
      const action = s.link
        ? '<a class="course-view-link" href="' + escapeHtml(s.link) + '" target="_blank" rel="noopener">Join →</a>'
        : '<span class="room-soon">Date and join link to be announced</span>';
      return '<li><strong>' + escapeHtml(s.label) + '</strong>' + when + action + '</li>';
    }).join('') + '</ul>';
  }

  function videosHtml(week) {
    if (!week.videos || !week.videos.length) {
      return '<p class="room-soon">Recorded lessons coming soon.</p>';
    }
    return '<ul class="room-list">' + week.videos.map(function (v) {
      return '<li><a class="course-view-link" href="' + escapeHtml(v.link) + '" target="_blank" rel="noopener">' + escapeHtml(v.label) + ' →</a></li>';
    }).join('') + '</ul>';
  }

  function materialsHtml(week) {
    if (!week.materials || !week.materials.length) {
      return '<p class="room-soon">Materials coming soon.</p>';
    }
    return '<ul class="room-list">' + week.materials.map(function (m) {
      return '<li><a class="topic-download" href="' + escapeHtml(m.file) + '" download>' + escapeHtml(m.label) + '</a></li>';
    }).join('') + '</ul>';
  }

  function quizHtml(week) {
    if (week.quiz && week.quiz.link) {
      return '<p><a class="course-enroll-btn" href="' + escapeHtml(week.quiz.link) + '" target="_blank" rel="noopener">' +
        escapeHtml(week.quiz.label || 'Take the weekly quiz') + '</a></p>';
    }
    return '<p class="room-soon">Weekly quiz — link coming soon.</p>';
  }

  function assignmentsHtml(week) {
    if (!week.assignments || !week.assignments.length) {
      return '<p class="room-soon">No assignment this week.</p>';
    }
    return week.assignments.map(function (a) {
      return '<div class="syllabus-assign"><strong>' + escapeHtml(a.title) + '</strong><span>' + escapeHtml(a.brief) + '</span></div>';
    }).join('') + '<p class="room-soon">How to submit (WhatsApp or the learning platform) will be shared before the course starts.</p>';
  }

  function weekHtml(week) {
    const modules = (week.modules || []).map(function (m) {
      return '<details class="room-module"><summary>Module ' + m.n + ' — ' + escapeHtml(m.title) + '</summary>' +
        '<ul class="syllabus-topics">' + (m.topics || []).map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') + '</ul>' +
      '</details>';
    }).join('');

    return (
      '<section class="room-week">' +
        '<header><span class="syllabus-week-num">Week ' + week.week + '</span><h2>' + escapeHtml(week.title) + '</h2></header>' +
        '<div class="room-modules">' + modules + '</div>' +
        '<div class="room-grid">' +
          '<div class="room-block"><h4>Live sessions</h4>' + sessionsHtml(week) + '</div>' +
          '<div class="room-block"><h4>Recorded lessons</h4>' + videosHtml(week) + '</div>' +
          '<div class="room-block"><h4>Materials</h4>' + materialsHtml(week) + '</div>' +
          '<div class="room-block"><h4>Weekly quiz</h4>' + quizHtml(week) + '</div>' +
        '</div>' +
        '<div class="room-block room-assign"><h4>Assignments</h4>' + assignmentsHtml(week) + '</div>' +
      '</section>'
    );
  }

  function render() {
    document.getElementById('roomTitle').textContent = course.title;
    const status = statusText();
    const statusEl = document.getElementById('roomStatus');
    statusEl.textContent = status;
    statusEl.hidden = !status;

    document.getElementById('roomWeeks').innerHTML = course.weeks.map(weekHtml).join('');

    const assessmentEl = document.getElementById('roomAssessment');
    if (course.assessment && course.assessment.length) {
      assessmentEl.innerHTML = '<h3>How You\'re Assessed</h3><table class="assess-table"><tbody>' +
        course.assessment.map(function (a) {
          return '<tr><td>' + escapeHtml(a.label) + '</td><td>' + a.weight + '%</td></tr>';
        }).join('') + '</tbody></table>' +
        (course.passMark ? '<p>Recommended passing score: <strong>' + course.passMark + '%</strong>.</p>' : '') +
        (course.certificate ? '<p>' + escapeHtml(course.certificate) + '</p>' : '');
    } else {
      assessmentEl.hidden = true;
    }

    messageEl.hidden = true;
    contentEl.hidden = false;
  }

  const returnTo = 'learn.html?course=' + encodeURIComponent(slug);

  fetch('/api/auth/me', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (!me.loggedIn) {
        window.location.href = 'login.html?next=' + encodeURIComponent(returnTo);
        return;
      }
      return fetch('/api/my-enrollments', { credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (result) {
          const enrolled = result.ok && (result.enrollments || []).some(function (enr) {
            return enr.courseSlug === slug;
          });
          if (!enrolled) {
            showMessage('You\'re Not Enrolled Yet', 'Enroll in this course to open its course room.', 'course.html?course=' + encodeURIComponent(slug), 'View the Course →');
            return;
          }
          render();
        });
    })
    .catch(function () {
      showMessage('Something Went Wrong', 'We couldn\'t load the course room. Please try again in a moment.', 'dashboard.html', 'Back to Courses →');
    });

});

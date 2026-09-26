/* ============================================
   DEEGANSAN — learn.js
   The Course Room (learn.html?course=<slug>): a
   step-by-step view for a registered learner —
   "Welcome to the course" (welcome message + the
   pre-course survey), then one step per week — with
   Previous / Next buttons at the bottom. The last
   step opened is remembered so "Pick up where you
   left off" can return to it.

   The room is soft-gated: it opens for anyone who
   registered for the course on this device, or on
   their account if logged in. Anyone else is asked
   to register first (or to confirm they already
   have, e.g. from another device).

   NOTE: the content is static data shipped with the
   site — don't put anything in it that must stay
   private until real server-side delivery exists.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function textToHtml(text) {
    return String(text || '')
      .split(/\n\s*\n/)
      .map(function (block) { return block.trim(); })
      .filter(Boolean)
      .map(function (block) { return '<p>' + escapeHtml(block).replace(/\n/g, '<br>') + '</p>'; })
      .join('');
  }

  const messageEl = document.getElementById('roomMessage');
  const contentEl = document.getElementById('roomContent');
  if (!contentEl) return;

  function showMessage(title, text, linkHref, linkLabel, alt) {
    document.getElementById('roomMessageTitle').textContent = title;
    document.getElementById('roomMessageText').textContent = text;
    const link = document.getElementById('roomMessageLink');
    link.href = linkHref;
    link.textContent = linkLabel;

    const altBtn = document.getElementById('roomMessageAlt');
    altBtn.hidden = !alt;
    altBtn.onclick = alt ? alt.onClick : null;
    if (alt) altBtn.textContent = alt.label;

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

  /* ---------- steps ---------- */

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

  function embedUrl(u) {
    try {
      const url = new URL(u);
      if (/(^|\.)forms\.(office|microsoft)\.com$|(^|\.)forms\.cloud\.microsoft$/.test(url.hostname) && !url.searchParams.has('embed')) {
        url.searchParams.set('embed', 'true');
      }
      return url.toString();
    } catch (e) {
      return u;
    }
  }

  function surveyHtml() {
    const s = course.preSurvey;
    if (!s) return '';
    const body = s.url
      ? '<iframe class="room-survey-frame" src="' + escapeHtml(embedUrl(s.url)) + '" title="' + escapeHtml(s.title || 'Pre-course survey') + '" loading="lazy" allowfullscreen></iframe>' +
        '<p class="room-soon">Trouble seeing the form? <a class="course-view-link" href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">Open the survey in a new tab →</a></p>'
      : '<div class="room-survey-placeholder">The pre-course survey will appear here soon.</div>';
    return '<section class="room-survey">' +
      '<h2>' + escapeHtml(s.title || 'Pre-course survey') + '</h2>' +
      (s.intro ? '<p>' + escapeHtml(s.intro) + '</p>' : '') +
      body +
    '</section>';
  }

  function assessmentHtml() {
    if (!course.assessment || !course.assessment.length) return '';
    return '<section class="course-section"><h3>How You\'re Assessed</h3><table class="assess-table"><tbody>' +
      course.assessment.map(function (a) {
        return '<tr><td>' + escapeHtml(a.label) + '</td><td>' + a.weight + '%</td></tr>';
      }).join('') + '</tbody></table>' +
      (course.passMark ? '<p>Recommended passing score: <strong>' + course.passMark + '%</strong>.</p>' : '') +
      (course.certificate ? '<p>' + escapeHtml(course.certificate) + '</p>' : '') +
    '</section>';
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

  const steps = [];
  if (course.welcome || course.preSurvey) {
    steps.push({
      id: 'welcome',
      label: 'Welcome',
      title: 'Welcome to the course',
      html: function () {
        return '<section class="room-welcome"><h2>Welcome to the course</h2>' +
          '<div class="room-welcome-msg">' + textToHtml(course.welcome) + '</div></section>' +
          surveyHtml() + assessmentHtml();
      }
    });
  }
  course.weeks.forEach(function (w) {
    steps.push({ id: 'week-' + w.week, label: 'Week ' + w.week, title: 'Week ' + w.week + ' — ' + w.title, html: function () { return weekHtml(w); } });
  });

  function stepIndex(id) {
    for (let i = 0; i < steps.length; i++) if (steps[i].id === id) return i;
    return -1;
  }

  function currentStepId() {
    const fromHash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (stepIndex(fromHash) !== -1) return fromHash;
    const saved = DeegansanReg.getProgress(slug);
    if (saved && stepIndex(saved.step) !== -1) return saved.step;
    return steps[0].id;
  }

  function renderStep() {
    const id = currentStepId();
    const i = stepIndex(id);
    const visited = (DeegansanReg.getProgress(slug) || { visited: [] }).visited;

    document.getElementById('roomSteps').innerHTML = steps.map(function (s) {
      const cls = 'room-step' + (s.id === id ? ' active' : '') + (visited.indexOf(s.id) !== -1 && s.id !== id ? ' done' : '');
      return '<a class="' + cls + '" href="#' + s.id + '"' + (s.id === id ? ' aria-current="step"' : '') + '>' + escapeHtml(s.label) + '</a>';
    }).join('');

    document.getElementById('roomStepBody').innerHTML = steps[i].html();

    const prev = steps[i - 1];
    const next = steps[i + 1];
    document.getElementById('roomNav').innerHTML =
      (prev
        ? '<a class="room-nav-btn prev" href="#' + prev.id + '"><span class="room-nav-dir">← Previous</span><span class="room-nav-title">' + escapeHtml(prev.label) + '</span></a>'
        : '<span class="room-nav-btn prev disabled"><span class="room-nav-dir">← Previous</span><span class="room-nav-title">You\'re at the start</span></span>') +
      (next
        ? '<a class="room-nav-btn next" href="#' + next.id + '"><span class="room-nav-dir">Next →</span><span class="room-nav-title">' + escapeHtml(next.label) + '</span></a>'
        : '<span class="room-nav-btn next disabled"><span class="room-nav-dir">Next →</span><span class="room-nav-title">End of the course outline</span></span>');

    DeegansanReg.saveProgress(slug, id);
  }

  function openRoom() {
    document.getElementById('roomTitle').textContent = course.title;
    const status = statusText();
    const statusEl = document.getElementById('roomStatus');
    statusEl.textContent = status;
    statusEl.hidden = !status;

    messageEl.hidden = true;
    contentEl.hidden = false;
    renderStep();
  }

  window.addEventListener('hashchange', function () {
    if (contentEl.hidden) return;
    renderStep();
    window.scrollTo({ top: contentEl.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  });

  /* ---------- who may open the room ---------- */

  // Registered on this device, or (if logged in) on their account.
  function accountEnrollment() {
    return fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (me) {
        if (!me.loggedIn) return false;
        return fetch('/api/my-enrollments', { credentials: 'include' })
          .then(function (r) { return r.json(); })
          .then(function (result) {
            return result.ok && (result.enrollments || []).some(function (enr) { return enr.courseSlug === slug; });
          });
      })
      .catch(function () { return false; });
  }

  if (DeegansanReg.isRegistered(slug)) {
    openRoom();
    return;
  }

  accountEnrollment().then(function (enrolled) {
    if (enrolled) {
      DeegansanReg.markRegistered(slug);
      openRoom();
      return;
    }
    showMessage(
      'Register to Open the Course Room',
      'We don\'t have a registration for this course on this device yet. Register to get started — or, if you already registered from another device, you can continue anyway.',
      'course.html?course=' + encodeURIComponent(slug) + '#courseEnrollPanel',
      'Register for the Course →',
      {
        label: 'I\'ve already registered — continue',
        onClick: function () {
          DeegansanReg.markRegistered(slug);
          openRoom();
        }
      }
    );
  });

});

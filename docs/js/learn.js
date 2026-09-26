/* ============================================
   DEEGANSAN — learn.js
   The Course Room (learn.html?course=<slug>), laid
   out like an edX course: a header with the overall
   progress %, tabs (Course · Progress · Dates ·
   Overview · Assessments & Certificates), and on the
   Course tab an outline on the left with one unit at
   a time on the right.

   The course is strictly linear (see course-model.js):
   a unit opens only when every unit before it is
   complete, quizzes must be passed, and weeks that
   haven't been reached yet are hidden entirely.

   The room opens for anyone who registered for the
   course on this device, or on their account if logged
   in. Anyone else is asked to register first.

   NOTE: content and quiz answers are static data
   shipped with the site, and progress lives in the
   learner's browser — so this is a learning guide, not
   a security control. Anything that must stay private
   or be enforced needs server-side delivery.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(str) {
    return String(str == null ? '' : str)
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

  const TABS = [
    { id: 'course', label: 'Course' },
    { id: 'progress', label: 'Progress' },
    { id: 'dates', label: 'Dates' },
    { id: 'overview', label: 'Overview' },
    { id: 'assessments', label: 'Assessments & Certificates' }
  ];

  let S = CourseModel.state(course, slug); // where the learner is — recomputed after every change

  /* ---------- small helpers ---------- */

  function longDate(d) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Mogadishu' });
  }

  function startDateObj() {
    return course.startDate ? new Date(course.startDate + 'T00:00:00+03:00') : null;
  }

  function statusText() {
    const start = startDateObj();
    if (!start) return '';
    const msLeft = start - Date.now();
    if (msLeft > 0) {
      const days = Math.floor(msLeft / 86400000);
      const togo = days >= 1 ? days + (days === 1 ? ' day' : ' days') + ' to go' : 'less than a day to go';
      return 'The course starts on ' + longDate(start) + ' — ' + togo + '. Live session links and materials will appear here before then.';
    }
    return 'The course started on ' + longDate(start) + '.';
  }

  function pct(score, max) {
    return max ? Math.round((score / max) * 100) : 0;
  }

  const ICON_DONE = '<svg class="lx-ico done" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_OPEN = '<svg class="lx-ico open" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const ICON_LOCK = '<svg class="lx-ico lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  /* ---------- pieces reused inside units ---------- */

  function embedUrl(u) {
    try {
      const url = new URL(u);
      if (/(^|\.)forms\.(office|microsoft)\.com$|(^|\.)forms\.cloud\.microsoft$/.test(url.hostname) && !url.searchParams.has('embed')) {
        url.searchParams.set('embed', 'true');
      } else if (url.hostname === 'docs.google.com' && url.pathname.indexOf('/forms/') === 0 && !url.searchParams.has('embedded')) {
        url.searchParams.set('embedded', 'true');
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
      '<h3>' + escapeHtml(s.title || 'Pre-course survey') + '</h3>' +
      (s.intro ? '<p>' + escapeHtml(s.intro) + '</p>' : '') +
      body +
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

  function weeklyQuizHtml(week) {
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

  function assessmentHtml() {
    if (!course.assessment || !course.assessment.length) return '';
    return '<table class="assess-table"><tbody>' +
      course.assessment.map(function (a) {
        return '<tr><td>' + escapeHtml(a.label) + '</td><td>' + a.weight + '%</td></tr>';
      }).join('') + '</tbody></table>';
  }

  /* ---------- unit bodies ---------- */

  function notesKey(m) { return 'deegaansan.notes.' + slug + '.m' + m.n; }

  function readNotes(m) {
    try { return localStorage.getItem(notesKey(m)) || ''; } catch (e) { return ''; }
  }

  function welcomeHtml(u) {
    const s = course.preSurvey;
    const confirm = s && s.url
      ? '<div class="lx-confirm" id="lxSurveyConfirm">' + (u.done
          ? '<p class="lx-ok">' + ICON_DONE + ' Survey confirmed — the first week is now open.</p>'
          : '<p>Once you have submitted the survey above, confirm here to unlock Week 1.</p>' +
            '<button type="button" class="lx-btn" data-act="survey-done">I\'ve completed the survey</button>') +
        '</div>'
      : '';
    return '<div class="lx-prose">' + textToHtml(course.welcome) + '</div>' + surveyHtml() + confirm;
  }

  function overviewHtml(u) {
    const week = u.week;
    const modules = (week.modules || []).map(function (m) {
      return '<li><strong>Module ' + m.n + ' — ' + escapeHtml(m.title) + '</strong>' +
        (m.lesson ? '' : '<span class="room-soon"> · content coming soon</span>') + '</li>';
    }).join('');
    return '<p class="lx-lead">This week you will work through the modules below, then take part in the live sessions and complete the assignment.</p>' +
      '<ul class="lx-modlist">' + modules + '</ul>' +
      '<div class="room-grid">' +
        '<div class="room-block"><h4>Live sessions</h4>' + sessionsHtml(week) + '</div>' +
        '<div class="room-block"><h4>Recorded lessons</h4>' + videosHtml(week) + '</div>' +
        '<div class="room-block"><h4>Materials</h4>' + materialsHtml(week) + '</div>' +
        '<div class="room-block"><h4>Weekly quiz</h4>' + weeklyQuizHtml(week) + '</div>' +
      '</div>' +
      '<div class="room-block room-assign"><h4>Assignments</h4>' + assignmentsHtml(week) + '</div>';
  }

  function sectionHtml(u) {
    const l = u.module.lesson;
    const s = l.sections[u.sectionIndex];
    const terms = s.terms && s.terms.length
      ? '<ul class="lesson-terms">' + s.terms.map(function (t) {
          return '<li><strong>' + escapeHtml(t.term) + ':</strong> ' + escapeHtml(t.text) + '</li>';
        }).join('') + '</ul>'
      : '';
    const groups = s.groups && s.groups.length
      ? '<ol class="lesson-groups">' + s.groups.map(function (g) {
          return '<li><strong>' + escapeHtml(g.title) + '</strong>' +
            (g.text ? '<p>' + escapeHtml(g.text) + '</p>' : '') +
            (g.items && g.items.length ? '<ul>' + g.items.map(function (it) { return '<li>' + escapeHtml(it) + '</li>'; }).join('') + '</ul>' : '') +
          '</li>';
        }).join('') + '</ol>'
      : '';
    const image = s.image && s.image.src
      ? '<figure class="lesson-figure"><img src="' + escapeHtml(s.image.src) + '" alt="' + escapeHtml(s.image.alt || '') + '" loading="lazy">' +
        (s.image.caption ? '<figcaption>' + escapeHtml(s.image.caption) + '</figcaption>' : '') + '</figure>'
      : '';
    return (u.sectionIndex === 0 && l.intro ? '<p class="lx-lead">' + escapeHtml(l.intro) + '</p>' : '') +
      (s.intro ? '<p>' + escapeHtml(s.intro) + '</p>' : '') + image + terms + groups;
  }

  function quizBannerHtml(u, rec) {
    const quiz = u.module.lesson.quiz;
    const max = CourseModel.quizMax(quiz);
    const pass = CourseModel.passMark(course, quiz);
    if (!rec) return '';
    return rec.passed
      ? '<p class="lx-banner ok">' + ICON_DONE + ' Passed — your best score is ' + rec.best + ' / ' + max + ' (' + pct(rec.best, max) + '%).</p>'
      : '<p class="lx-banner warn">Your best score so far is ' + rec.best + ' / ' + max + ' (' + pct(rec.best, max) + '%). You need ' + pass + '% to pass and unlock the next unit — have another go.</p>';
  }

  function quizHtml(u) {
    const quiz = u.module.lesson.quiz;
    const pts = CourseModel.quizPoints(quiz);
    const max = CourseModel.quizMax(quiz);
    const pass = CourseModel.passMark(course, quiz);
    const rec = DeegansanReg.getQuizzes(slug)[u.id];

    return '<div class="lx-quiz" data-unit="' + u.id + '">' +
      (quiz.intro ? '<p class="lx-lead">' + escapeHtml(quiz.intro) + '</p>' : '') +
      '<ul class="lx-rules">' +
        '<li>Each question is worth <strong>' + pts + ' points</strong> — ' + max + ' points in total.</li>' +
        '<li>You need <strong>' + pass + '%</strong> to pass and unlock the next unit.</li>' +
        '<li>You can retake the quiz as many times as you need.</li>' +
      '</ul>' +
      '<div id="lxQuizBanner">' + quizBannerHtml(u, rec) + '</div>' +
      quiz.questions.map(function (q, qi) {
        return '<fieldset class="lx-q" data-q="' + qi + '"><legend>Question ' + (qi + 1) + ' <span class="lx-q-pts">' + pts + ' points</span></legend>' +
          '<p class="lx-q-text">' + escapeHtml(q.q) + '</p>' +
          q.options.map(function (o, oi) {
            return '<label class="lx-opt"><input type="radio" name="q' + qi + '" value="' + oi + '"> ' +
              '<span><b>' + String.fromCharCode(65 + oi) + ')</b> ' + escapeHtml(o) + '</span></label>';
          }).join('') +
          '<p class="lx-q-result" hidden></p>' +
        '</fieldset>';
      }).join('') +
      '<div class="lx-actions">' +
        '<button type="button" class="lx-btn" data-act="quiz-submit">Submit answers</button>' +
        '<button type="button" class="lx-btn ghost" data-act="quiz-retry" hidden>Try again</button>' +
      '</div>' +
      '<p class="lx-quiz-msg" role="status" hidden></p>' +
    '</div>';
  }

  function exerciseHtml(u) {
    const m = u.module;
    const ex = m.lesson.exercise;
    const notes = readNotes(m);
    return (ex.intro ? '<p class="lx-lead">' + escapeHtml(ex.intro) + '</p>' : '') +
      (ex.prompts && ex.prompts.length
        ? '<h3 class="lx-h3">' + escapeHtml(ex.promptsTitle || 'Reflection Prompts') + '</h3><ol class="lesson-groups">' +
          ex.prompts.map(function (p) { return '<li><strong>' + escapeHtml(p.label) + ':</strong> ' + escapeHtml(p.text) + '</li>'; }).join('') + '</ol>'
        : '') +
      (ex.closing ? '<p>' + escapeHtml(ex.closing) + '</p>' : '') +
      '<label class="lesson-notes-label" for="notes-m' + m.n + '">Your course notebook</label>' +
      '<textarea class="lesson-notes" id="notes-m' + m.n + '" data-module="' + m.n + '" rows="7" placeholder="Jot down your observations here…">' + escapeHtml(notes) + '</textarea>' +
      '<p class="room-soon">Saved automatically in this browser only — it isn\'t sent anywhere.</p>' +
      '<div class="lx-actions" id="lxExActions">' + (u.done
        ? '<p class="lx-ok">' + ICON_DONE + ' Exercise completed.</p>'
        : '<button type="button" class="lx-btn" data-act="ex-done"' + (notes.trim() ? '' : ' disabled') + '>Mark as complete</button>' +
          '<span class="room-soon">Write a few notes to enable this button.</span>') +
      '</div>';
  }

  function soonHtml(u) {
    const m = u.module;
    return '<p class="lx-lead">The lessons for this module haven\'t been published yet. The next units unlock once they are added and you have completed them.</p>' +
      '<h3 class="lx-h3">What this module will cover</h3>' +
      '<ul class="syllabus-topics">' + (m.topics || []).map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') + '</ul>';
  }

  function unitBodyHtml(u) {
    switch (u.type) {
      case 'welcome': return welcomeHtml(u);
      case 'overview': return overviewHtml(u);
      case 'section': return sectionHtml(u);
      case 'quiz': return quizHtml(u);
      case 'exercise': return exerciseHtml(u);
      default: return soonHtml(u);
    }
  }

  // Units completed just by opening them.
  function completesOnView(u) {
    return u.type === 'overview' || u.type === 'section' ||
      (u.type === 'welcome' && !(course.preSurvey && course.preSurvey.url));
  }

  /* ---------- routing ---------- */

  function routeFromHash() {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    for (let i = 0; i < TABS.length; i++) {
      if (TABS[i].id === hash && hash !== 'course') return { tab: hash };
    }
    return { tab: 'course', unitId: hash };
  }

  function unitIndex(id) {
    for (let i = 0; i < S.units.length; i++) if (S.units[i].id === id) return i;
    return -1;
  }

  // Which unit to show: the one asked for if it's open, else where they left off, else the next one due.
  function resolveUnit(asked) {
    let i = unitIndex(asked);
    if (i !== -1 && S.units[i].open) return i;
    if (i === -1) {
      const saved = DeegansanReg.getProgress(slug);
      const j = saved ? unitIndex(saved.step) : -1;
      if (j !== -1 && S.units[j].open) return j;
    }
    return S.current;
  }

  /* ---------- header, tabs, outline, navigation ---------- */

  function renderHeader() {
    document.getElementById('lxPercent').textContent = S.percent + '%';
    document.getElementById('lxBarFill').style.width = S.percent + '%';
    document.getElementById('lxBar').setAttribute('aria-valuenow', S.percent);
    document.getElementById('lxPercentNote').textContent = 'complete · ' + S.doneCount + ' of ' + S.total + ' units';
  }

  let lastUnitIndex = 0; // the unit currently open on the Course tab

  function renderTabs(activeTab) {
    // The Course tab returns to the unit last opened (or the next one due).
    const courseHref = '#' + S.units[resolveUnit('')].id;
    document.getElementById('lxTabs').innerHTML = TABS.map(function (t) {
      const href = t.id === 'course' ? courseHref : '#' + t.id;
      return '<a class="lx-tab' + (t.id === activeTab ? ' active' : '') + '" href="' + href + '"' +
        (t.id === activeTab ? ' aria-current="page"' : '') + '>' + escapeHtml(t.label) + '</a>';
    }).join('');
  }

  function unitRow(u, viewIndex) {
    const idx = S.units.indexOf(u);
    const icon = u.done ? ICON_DONE : (u.open ? ICON_OPEN : ICON_LOCK);
    const cls = 'lx-unit' + (u.done ? ' done' : '') + (idx === viewIndex ? ' active' : '') + (!u.open ? ' locked' : '');
    return u.open
      ? '<a class="' + cls + '" href="#' + u.id + '"' + (idx === viewIndex ? ' aria-current="true"' : '') + '>' + icon + '<span>' + escapeHtml(u.title) + '</span></a>'
      : '<span class="' + cls + '" aria-disabled="true" title="Complete the earlier units to unlock this">' + icon + '<span>' + escapeHtml(u.title) + '</span></span>';
  }

  function renderOutline(viewIndex) {
    const parts = [];
    const welcome = S.units.filter(function (u) { return u.weekN === null; });
    if (welcome.length) parts.push('<div class="lx-week-group">' + welcome.map(function (u) { return unitRow(u, viewIndex); }).join('') + '</div>');

    let hiddenWeeks = 0;
    course.weeks.forEach(function (week) {
      const units = S.units.filter(function (u) { return u.weekN === week.week; });
      if (!units.length) return;
      if (!units[0].visible) { hiddenWeeks++; return; }

      const complete = units.every(function (u) { return u.done; });
      const holdsView = units.some(function (u) { return S.units.indexOf(u) === viewIndex; });
      const holdsCurrent = units.some(function (u) { return S.units.indexOf(u) === S.current; });

      let lastModule = null;
      const rows = units.map(function (u) {
        let label = '';
        if (u.module && u.moduleTitle !== lastModule) {
          lastModule = u.moduleTitle;
          label = '<p class="lx-module-label">' + escapeHtml(u.moduleTitle) + '</p>';
        }
        return label + unitRow(u, viewIndex);
      }).join('');

      parts.push(
        '<details class="lx-week"' + (holdsView || holdsCurrent ? ' open' : '') + '>' +
          '<summary>' + (complete ? ICON_DONE : ICON_OPEN) + '<span>Week ' + week.week + ' — ' + escapeHtml(week.title) + '</span></summary>' +
          rows +
        '</details>'
      );
    });

    if (hiddenWeeks) {
      parts.push('<p class="lx-outline-note">' + ICON_LOCK + ' Later weeks appear here as you complete each one, including passing its quizzes.</p>');
    }
    document.getElementById('lxOutline').innerHTML = '<p class="lx-outline-head">Course outline</p>' + parts.join('');
  }

  function navHtml(i) {
    const u = S.units[i];
    const prev = S.units[i - 1];
    const next = S.units[i + 1];

    let lockedMsg = 'Complete this unit to unlock the next one';
    if (u.type === 'quiz') lockedMsg = 'Pass the quiz to unlock the next unit';
    if (u.type === 'soon') lockedMsg = 'The next unit opens once this content is published';
    if (u.type === 'welcome') lockedMsg = 'Confirm the survey to unlock Week 1';

    const prevHtml = prev
      ? '<a class="lx-nav-btn prev" href="#' + prev.id + '"><span class="lx-nav-dir">← Previous</span><span class="lx-nav-title">' + escapeHtml(prev.title) + '</span></a>'
      : '<span class="lx-nav-btn prev disabled"><span class="lx-nav-dir">← Previous</span><span class="lx-nav-title">You\'re at the start</span></span>';

    let nextHtml;
    if (!next) {
      nextHtml = '<span class="lx-nav-btn next disabled"><span class="lx-nav-dir">Next →</span><span class="lx-nav-title">End of the course outline</span></span>';
    } else if (next.open) {
      nextHtml = '<a class="lx-nav-btn next" href="#' + next.id + '"><span class="lx-nav-dir">Next →</span><span class="lx-nav-title">' + escapeHtml(next.title) + '</span></a>';
    } else {
      nextHtml = '<span class="lx-nav-btn next disabled" aria-disabled="true"><span class="lx-nav-dir">Next →</span><span class="lx-nav-title">' + lockedMsg + '</span></span>';
    }

    const arrows =
      (prev ? '<a class="lx-arrow" href="#' + prev.id + '" aria-label="Previous unit">←</a>' : '<span class="lx-arrow off">←</span>') +
      (next && next.open ? '<a class="lx-arrow" href="#' + next.id + '" aria-label="Next unit">→</a>' : '<span class="lx-arrow off" title="' + escapeHtml(lockedMsg) + '">→</span>');

    document.getElementById('lxArrows').innerHTML = arrows;
    document.getElementById('roomNav').innerHTML = prevHtml + nextHtml;
  }

  // Refresh everything that depends on progress, without touching the unit body
  // (so a half-answered quiz isn't wiped).
  function refreshChrome(viewIndex) {
    S = CourseModel.state(course, slug);
    renderHeader();
    renderTabs('course');
    renderOutline(viewIndex);
    navHtml(viewIndex);
  }

  /* ---------- course tab ---------- */

  function renderUnit(i) {
    lastUnitIndex = i;
    let u = S.units[i];

    document.getElementById('lxUnitKicker').textContent = u.moduleTitle || (u.weekN ? 'Week ' + u.weekN + ' — ' + u.week.title : 'Getting started');
    document.getElementById('lxUnitTitle').textContent = u.title;
    document.getElementById('roomStepBody').innerHTML = unitBodyHtml(u);

    DeegansanReg.saveProgress(slug, u.id);
    if (completesOnView(u)) DeegansanReg.markDone(slug, u.id);
    refreshChrome(i);
  }

  function showCourseTab(unitId) {
    document.getElementById('lxCourse').hidden = false;
    document.getElementById('lxTabPage').hidden = true;
    const i = resolveUnit(unitId);
    if (S.units[i].id !== unitId && window.location.hash !== '#' + S.units[i].id) {
      history.replaceState(null, '', '#' + S.units[i].id); // e.g. asked for a locked unit
    }
    renderUnit(i);
  }

  /* ---------- other tabs ---------- */

  function progressPage() {
    const quizUnits = S.units.filter(function (u) { return u.type === 'quiz'; });
    const recs = DeegansanReg.getQuizzes(slug);
    let got = 0, max = 0;
    quizUnits.forEach(function (u) {
      const q = u.module.lesson.quiz;
      max += CourseModel.quizMax(q);
      if (recs[u.id]) got += recs[u.id].best;
    });
    const pass = course.passMark || 70;
    const score = pct(got, max);

    const rows = quizUnits.map(function (u) {
      const q = u.module.lesson.quiz;
      const qmax = CourseModel.quizMax(q);
      const r = recs[u.id];
      const status = !r ? 'Not attempted'
        : (r.passed ? 'Passed' : 'Not passed yet') + ' · best ' + r.best + ' / ' + qmax + ' (' + pct(r.best, qmax) + '%) · ' + r.attempts + (r.attempts === 1 ? ' attempt' : ' attempts');
      return '<li><strong>' + escapeHtml(u.moduleTitle) + ' — quiz</strong><span>' + status + '</span></li>';
    }).join('');

    return '<h2>Your progress</h2>' +
      '<div class="lx-cards">' +
        '<div class="lx-card lx-completion">' +
          '<div><h3>Course completion</h3><p>This represents how much of the course content you have completed. Some content is not published yet, so the percentage grows as new material is added.</p>' +
          '<p class="lx-muted">' + S.doneCount + ' of ' + S.total + ' units completed.</p></div>' +
          '<div class="lx-donut" style="--p:' + S.percent + '"><div><strong>' + S.percent + '%</strong><span>completed</span></div></div>' +
        '</div>' +
        '<div class="lx-card">' +
          '<h3>Quiz score</h3>' +
          '<p>Your best quiz results against the ' + pass + '% pass mark.</p>' +
          '<div class="lx-grade"><div class="lx-grade-bar"><span style="width:' + score + '%"></span><i style="left:' + pass + '%"></i></div>' +
            '<div class="lx-grade-labels"><b class="' + (score >= pass ? 'ok' : '') + '">Your score: ' + score + '%</b><b class="mark">Pass mark: ' + pass + '%</b></div></div>' +
          '<p class="lx-banner warn">A score of ' + pass + '% is required to pass each quiz and move on to the next unit.</p>' +
        '</div>' +
        '<div class="lx-card">' +
          '<h3>Detailed scores</h3>' +
          (rows ? '<ul class="lx-scores">' + rows + '</ul>' : '<p class="lx-muted">No quizzes have been published yet.</p>') +
          '<p class="lx-muted">Each question is worth 0.5 points. Quizzes count towards your final grade together with the assignments and the final project, which the course team marks.</p>' +
        '</div>' +
      '</div>';
  }

  function datesPage() {
    const items = [];
    const reg = DeegansanReg.registeredSlugs()[slug];
    if (reg) items.push({ when: new Date(reg), label: 'Enrollment date', note: '' });
    const start = startDateObj();
    if (start) items.push({ when: start, label: 'Course starts', note: 'Live sessions, recorded lessons and materials are shared in each week\'s overview.' });
    items.push({ when: new Date(), label: 'Today', today: true, note: '' });
    items.sort(function (a, b) { return a.when - b.when; });

    return '<h2>Important dates</h2>' +
      '<ol class="lx-timeline">' + items.map(function (it) {
        return '<li class="' + (it.today ? 'today' : '') + '"><span class="lx-tl-date">' + longDate(it.when) +
          (it.today ? ' <em>Today</em>' : '') + '</span>' +
          (it.today ? '' : '<strong>' + escapeHtml(it.label) + '</strong>') +
          (it.note ? '<p>' + escapeHtml(it.note) + '</p>' : '') + '</li>';
      }).join('') + '</ol>' +
      '<p class="lx-muted">Weeks are not released by date: each week opens as soon as you finish the one before it.</p>';
  }

  function listHtml(title, list) {
    if (!list || !list.length) return '';
    return '<h3 class="lx-h3">' + title + '</h3><ul class="lx-bullets">' + list.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') + '</ul>';
  }

  function overviewPage() {
    return '<h2>About the course</h2>' +
      (course.summary ? '<p class="lx-lead">' + escapeHtml(course.summary) + '</p>' : '') +
      '<div class="lx-prose">' + textToHtml(course.content) + '</div>' +
      listHtml('Learning outcomes', course.outcomes) +
      listHtml('Who it\'s for', course.audience) +
      listHtml('How the course runs', course.delivery) +
      listHtml('Tools we\'ll use', course.tools);
  }

  function assessmentsPage() {
    return '<h2>Assessments &amp; Certificates</h2>' +
      '<h3 class="lx-h3">Assessment and grading</h3>' + assessmentHtml() +
      (course.passMark ? '<p>Recommended passing score: <strong>' + course.passMark + '%</strong>.</p>' : '') +
      '<h3 class="lx-h3">How the quizzes work</h3>' +
      '<ul class="lx-bullets">' +
        '<li>Every quiz question is worth 0.5 points.</li>' +
        '<li>You must pass a quiz (' + (course.passMark || 70) + '% or more) before the next unit opens.</li>' +
        '<li>You can retake a quiz as often as you like; your best score counts.</li>' +
        '<li>Units and weeks open in order — you can\'t skip ahead.</li>' +
      '</ul>' +
      (course.certificate ? '<h3 class="lx-h3">Certificate</h3><p>' + escapeHtml(course.certificate) + '</p>' : '');
  }

  function showOtherTab(tab) {
    document.getElementById('lxCourse').hidden = true;
    const page = document.getElementById('lxTabPage');
    page.hidden = false;
    S = CourseModel.state(course, slug);
    renderHeader();
    renderTabs(tab);
    page.innerHTML = { progress: progressPage, dates: datesPage, overview: overviewPage, assessments: assessmentsPage }[tab]();
  }

  function render() {
    S = CourseModel.state(course, slug);
    const r = routeFromHash();
    if (r.tab === 'course') showCourseTab(r.unitId);
    else showOtherTab(r.tab);
  }

  /* ---------- interactions inside a unit ---------- */

  const stepBody = document.getElementById('roomStepBody');

  function viewedUnit() { return S.units[lastUnitIndex]; }

  stepBody.addEventListener('click', function (e) {
    const act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (!act) return;
    const u = viewedUnit();

    if (act === 'survey-done') {
      DeegansanReg.markDone(slug, u.id);
      S = CourseModel.state(course, slug);
      document.getElementById('lxSurveyConfirm').innerHTML = '<p class="lx-ok">' + ICON_DONE + ' Survey confirmed — the first week is now open.</p>';
      refreshChrome(lastUnitIndex);
    }

    if (act === 'ex-done') {
      DeegansanReg.markDone(slug, u.id);
      document.getElementById('lxExActions').innerHTML = '<p class="lx-ok">' + ICON_DONE + ' Exercise completed.</p>';
      refreshChrome(lastUnitIndex);
    }

    if (act === 'quiz-retry') {
      document.getElementById('roomStepBody').innerHTML = unitBodyHtml(u);
    }

    if (act === 'quiz-submit') submitQuiz(u, e.target.closest('.lx-quiz'));
  });

  function submitQuiz(u, wrap) {
    const quiz = u.module.lesson.quiz;
    const pts = CourseModel.quizPoints(quiz);
    const max = CourseModel.quizMax(quiz);
    const pass = CourseModel.passMark(course, quiz);
    const msg = wrap.querySelector('.lx-quiz-msg');

    const picks = quiz.questions.map(function (q, qi) {
      const el = wrap.querySelector('input[name="q' + qi + '"]:checked');
      return el ? Number(el.value) : -1;
    });
    if (picks.indexOf(-1) !== -1) {
      msg.hidden = false;
      msg.className = 'lx-quiz-msg warn';
      msg.textContent = 'Please answer all ' + quiz.questions.length + ' questions before submitting.';
      return;
    }

    const perQ = quiz.questions.map(function (q, qi) { return picks[qi] === q.answer ? pts : 0; });
    const score = perQ.reduce(function (a, b) { return a + b; }, 0);
    const passed = (score / max) * 100 >= pass - 1e-9; // exact, not the rounded % shown to the learner

    // Show what each question earned — never which option was right.
    quiz.questions.forEach(function (q, qi) {
      const box = wrap.querySelector('.lx-q[data-q="' + qi + '"]');
      const res = box.querySelector('.lx-q-result');
      const ok = perQ[qi] > 0;
      box.classList.toggle('ok', ok);
      box.classList.toggle('bad', !ok);
      res.hidden = false;
      res.textContent = (ok ? '✓ Correct — ' : '✗ Incorrect — ') + perQ[qi] + ' / ' + pts + ' points';
      box.querySelectorAll('input').forEach(function (inp) { inp.disabled = true; });
    });

    const rec = DeegansanReg.saveQuiz(slug, u.id, { score: score, max: max, passed: passed, perQ: perQ });

    wrap.querySelector('[data-act="quiz-submit"]').hidden = true;
    const retry = wrap.querySelector('[data-act="quiz-retry"]');
    retry.hidden = false;
    retry.textContent = passed ? 'Retake quiz' : 'Try again';
    msg.hidden = false;
    msg.className = 'lx-quiz-msg ' + (passed ? 'ok' : 'warn');
    msg.textContent = passed
      ? 'You scored ' + score + ' / ' + max + ' (' + pct(score, max) + '%). You passed — the next unit is unlocked.'
      : 'You scored ' + score + ' / ' + max + ' (' + pct(score, max) + '%). You need ' + pass + '% to pass. Try again to unlock the next unit.';
    wrap.querySelector('#lxQuizBanner').innerHTML = quizBannerHtml(u, rec);

    if (passed) DeegansanReg.markDone(slug, u.id);
    refreshChrome(lastUnitIndex);
  }

  stepBody.addEventListener('input', function (e) {
    if (!e.target.classList.contains('lesson-notes')) return;
    const u = viewedUnit();
    try { localStorage.setItem(notesKey(u.module), e.target.value); } catch (err) { /* private mode: ignore */ }
    const btn = document.querySelector('[data-act="ex-done"]');
    if (btn) btn.disabled = !e.target.value.trim();
  });

  document.getElementById('lxOutlineToggle').addEventListener('click', function () {
    const outline = document.getElementById('lxOutline');
    const open = outline.classList.toggle('open');
    this.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('hashchange', function () {
    if (contentEl.hidden) return;
    document.getElementById('lxOutline').classList.remove('open');
    render();
    window.scrollTo({ top: contentEl.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  });

  function openRoom() {
    document.getElementById('roomTitle').textContent = course.title;
    const status = statusText();
    const statusEl = document.getElementById('roomStatus');
    statusEl.textContent = status;
    statusEl.hidden = !status;

    messageEl.hidden = true;
    contentEl.hidden = false;
    render();
  }

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

/* ============================================
   DEEGANSAN — course-model.js
   Turns a course from courses-data.js into a flat,
   ordered list of "units" (welcome, each week's
   overview, each module's lesson pages, quiz and
   exercise) and works out, from what the learner has
   completed, which units are open, which are still
   locked and how far through the course they are.

   The course is strictly linear: a unit opens only
   once every unit before it is complete, so week 2
   stays hidden until week 1 is finished — including
   passing its quizzes. A module with no lesson written
   yet counts as one unit that can't be completed, so
   it holds back what comes after it until its
   content is added.

   Used by learn.js (the Course Room) and dashboard.js
   (the progress % on course cards).
   ============================================ */

window.CourseModel = (function () {

  const DEFAULT_POINTS = 0.5; // points per quiz question unless the quiz says otherwise
  const DEFAULT_PASS = 70;    // percent

  function quizPoints(quiz) {
    return quiz.pointsPerQuestion || DEFAULT_POINTS;
  }

  function quizMax(quiz) {
    return quiz.questions.length * quizPoints(quiz);
  }

  function passMark(course, quiz) {
    return (quiz && quiz.passMark) || course.passMark || DEFAULT_PASS;
  }

  function unitsFor(course) {
    const units = [];

    if (course.welcome || course.preSurvey) {
      units.push({ id: 'welcome', type: 'welcome', weekN: null, title: 'Welcome to the course' });
    }

    (course.weeks || []).forEach(function (week) {
      units.push({
        id: 'week-' + week.week, type: 'overview', weekN: week.week, week: week,
        title: 'Overview and action points'
      });

      (week.modules || []).forEach(function (m) {
        const base = { weekN: week.week, week: week, module: m, moduleTitle: 'Module ' + m.n + ' — ' + m.title };

        if (!m.lesson) {
          units.push(Object.assign({ id: 'm' + m.n + '-soon', type: 'soon', title: 'Content coming soon' }, base));
          return;
        }

        (m.lesson.sections || []).forEach(function (s, i) {
          units.push(Object.assign({ id: 'm' + m.n + '-s' + (i + 1), type: 'section', sectionIndex: i, title: s.title.replace(/^\d+\.\s*/, '') }, base));
        });
        if (m.lesson.quiz && m.lesson.quiz.questions && m.lesson.quiz.questions.length) {
          units.push(Object.assign({ id: 'm' + m.n + '-quiz', type: 'quiz', title: 'Knowledge check quiz' }, base));
        }
        if (m.lesson.exercise) {
          units.push(Object.assign({ id: 'm' + m.n + '-ex', type: 'exercise', title: (m.lesson.exercise.title || 'Exercise').replace(/^\d+\.\s*/, '') }, base));
        }
      });
    });

    return units;
  }

  // Everything the room needs to know about where this learner is.
  function state(course, slug) {
    const units = unitsFor(course);
    const doneMap = DeegansanReg.getDone(slug);

    units.forEach(function (u) { u.done = !!doneMap[u.id] && u.type !== 'soon'; });

    let current = units.findIndex(function (u) { return !u.done; });
    const finished = current === -1;
    if (finished) current = units.length - 1;

    const doneCount = units.filter(function (u) { return u.done; }).length;
    // Week 1 is always listed (locked until the welcome step is done); later weeks stay hidden.
    const currentWeek = (units[current] && units[current].weekN) || 1;

    units.forEach(function (u, i) {
      u.open = i <= current;                                   // may be opened now
      u.visible = u.weekN === null || u.weekN <= currentWeek || finished; // weeks ahead stay hidden
    });

    return {
      units: units,
      current: current,
      finished: finished,
      doneCount: doneCount,
      total: units.length,
      // floor so 99.6% never reads as "complete"
      percent: units.length ? Math.floor((doneCount / units.length) * 100) : 0
    };
  }

  return { unitsFor: unitsFor, state: state, quizMax: quizMax, quizPoints: quizPoints, passMark: passMark };
})();

/* ============================================
   DEEGANSAN — registration.js
   Remembers, in this browser only, which courses
   the visitor has registered for, which unit of a
   course they last opened, which units they have
   completed and their best quiz scores. This is what
   powers "Pick up where you left off", the progress
   percentage and the week-by-week unlocking while
   login is optional. If accounts return, the same
   calls can be backed by the server instead.

   Loaded on every page that shows or enrolls in
   courses; everything degrades gracefully if the
   browser blocks storage.

   NOTE: this is stored on the learner's own device,
   so it is a guide, not a security control — anyone
   determined can edit it. Real enforcement (and
   certificates) need server-side tracking.
   ============================================ */

window.DeegansanReg = (function () {
  const KEY = 'deegaansan.courses.v1';

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return { registered: (data && data.registered) || {}, progress: (data && data.progress) || {} };
    } catch (e) {
      return { registered: {}, progress: {} };
    }
  }

  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage blocked — carry on */ }
  }

  // The progress record for a course, created (and filled in) if missing.
  function ensure(data, slug) {
    const p = data.progress[slug] || {};
    p.visited = p.visited || [];
    p.done = p.done || {};
    p.quiz = p.quiz || {};
    data.progress[slug] = p;
    return p;
  }

  return {
    isRegistered: function (slug) {
      return Object.prototype.hasOwnProperty.call(read().registered, slug);
    },

    registeredSlugs: function () {
      return read().registered; // { slug: ISO date }
    },

    markRegistered: function (slug) {
      const data = read();
      if (!data.registered[slug]) data.registered[slug] = new Date().toISOString();
      write(data);
    },

    getProgress: function (slug) {
      const p = read().progress[slug];
      return p && p.step ? p : null; // { step, visited: [], done: {}, quiz: {}, at }
    },

    saveProgress: function (slug, stepId) {
      const data = read();
      const p = ensure(data, slug);
      if (p.visited.indexOf(stepId) === -1) p.visited.push(stepId);
      p.step = stepId;
      p.at = new Date().toISOString();
      write(data);
    },

    // { unitId: ISO date } of the units this learner has completed.
    getDone: function (slug) {
      const p = read().progress[slug];
      return (p && p.done) || {};
    },

    markDone: function (slug, unitId) {
      const data = read();
      const p = ensure(data, slug);
      if (!p.done[unitId]) {
        p.done[unitId] = new Date().toISOString();
        write(data);
      }
    },

    // { unitId: { best, last, max, attempts, passed, perQ: [], at } }
    getQuizzes: function (slug) {
      const p = read().progress[slug];
      return (p && p.quiz) || {};
    },

    // Records an attempt; the best score is kept, and a pass is never lost.
    saveQuiz: function (slug, unitId, attempt) {
      const data = read();
      const p = ensure(data, slug);
      const prev = p.quiz[unitId];
      p.quiz[unitId] = {
        best: Math.max(prev ? prev.best : 0, attempt.score),
        last: attempt.score,
        max: attempt.max,
        attempts: (prev ? prev.attempts : 0) + 1,
        passed: !!((prev && prev.passed) || attempt.passed),
        perQ: attempt.perQ,
        at: new Date().toISOString()
      };
      write(data);
      return p.quiz[unitId];
    }
  };
})();

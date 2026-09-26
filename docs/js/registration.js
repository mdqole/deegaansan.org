/* ============================================
   DEEGANSAN — registration.js
   Remembers, in this browser only, which courses
   the visitor has registered for and which step of
   a course they last opened. This is what powers
   "Pick up where you left off" while login is
   optional. If accounts return, the same calls can
   be backed by the server instead.

   Loaded on every page that shows or enrolls in
   courses; everything degrades gracefully if the
   browser blocks storage.
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
      return p && p.step ? p : null; // { step, visited: [], at }
    },

    saveProgress: function (slug, stepId) {
      const data = read();
      const p = data.progress[slug] || { visited: [] };
      if (p.visited.indexOf(stepId) === -1) p.visited.push(stepId);
      p.step = stepId;
      p.at = new Date().toISOString();
      data.progress[slug] = p;
      write(data);
    }
  };
})();

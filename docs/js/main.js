/* ============================================
   DEEGANSAN — main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------
     SMOOTH SCROLL for all anchor links
     ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ------------------------------------------
     STICKY NAV — add shadow on scroll
     ------------------------------------------ */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });


  /* ------------------------------------------
     MOBILE NAV — hamburger toggle
     ------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ------------------------------------------
     SCROLL REVEAL ANIMATION
     Adds .visible class to elements as they
     enter the viewport
     ------------------------------------------ */
  const revealEls = document.querySelectorAll(
    '.prog-card, .mission-card, .day-card, .donate-card, .g-cell'
  );

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease ' + i * 0.07 + 's, transform 0.5s ease ' + i * 0.07 + 's';
    observer.observe(el);
  });

  document.addEventListener('animationend', function () {}, { once: true });

  /* When .visible is added, animate in */
  const styleTag = document.createElement('style');
  styleTag.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(styleTag);


  /* ------------------------------------------
     CONTACT FORM — submits to Formspree (see
     the form's action= in index.html) using
     fetch() so the page never redirects and we
     can show a status message in place.
     ------------------------------------------ */
  const form = document.querySelector('.contact-form');
  if (form) {
    const statusEl = form.querySelector('#formStatus');
    const btn = form.querySelector('.btn-send');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = form.querySelector('[name="name"]').value.trim();
      const email   = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in all required fields.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
        if (statusEl) {
          statusEl.textContent = 'Form is not connected yet — add your Formspree form ID in index.html.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            btn.textContent = 'Message Sent ✓';
            if (statusEl) {
              statusEl.textContent = "Thanks — we'll get back to you soon.";
              statusEl.className = 'form-status success';
            }
            form.reset();
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          btn.textContent = 'Send Message →';
          btn.disabled = false;
          if (statusEl) {
            statusEl.textContent = 'Something went wrong — please try again or email us directly.';
            statusEl.className = 'form-status error';
          }
        })
        .finally(function () {
          setTimeout(function () {
            btn.textContent = 'Send Message →';
            btn.disabled = false;
          }, 3000);
        });
    });
  }


  /* ------------------------------------------
     TOPICS — renders cards from js/topics-data.js
     (the file you edit to post something new)
     ------------------------------------------ */
  const topicsGrid = document.getElementById('topicsGrid');

  if (topicsGrid) {
    const topics = (typeof TOPICS !== 'undefined' ? TOPICS : []).slice();

    topics.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    /* Plain text -> HTML paragraphs. Blank lines separate
       paragraphs; single line breaks within a paragraph
       become <br>. */
    function textToHtml(text) {
      return String(text || '')
        .split(/\n\s*\n/)
        .map(function (block) {
          return block.trim();
        })
        .filter(Boolean)
        .map(function (block) {
          return '<p>' + escapeHtml(block).replace(/\n/g, '<br>') + '</p>';
        })
        .join('');
    }

    if (!topics.length) {
      topicsGrid.innerHTML = '<p class="topics-empty">No topics posted yet — check back soon.</p>';
    } else {
      topicsGrid.innerHTML = topics.map(function (topic) {
        const dateLabel = new Date(topic.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const downloadHtml = topic.file
          ? '<a class="topic-download" href="' + topic.file + '" download>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>' +
              escapeHtml(topic.fileLabel || 'Download') +
            '</a>'
          : '';

        const bodyHtml = topic.body
          ? '<div class="topic-full">' + textToHtml(topic.body) + '</div>' +
            '<button type="button" class="topic-toggle">Read Full Report</button>'
          : '';

        return (
          '<div class="topic-card">' +
            '<div class="topic-card-top">' +
              (topic.category ? '<span class="topic-tag">' + escapeHtml(topic.category) + '</span>' : '<span></span>') +
              '<span class="topic-date">' + dateLabel + '</span>' +
            '</div>' +
            '<h3>' + escapeHtml(topic.title) + '</h3>' +
            (topic.summary ? '<p>' + escapeHtml(topic.summary) + '</p>' : '') +
            bodyHtml +
            downloadHtml +
          '</div>'
        );
      }).join('');

      /* Expand / collapse full report text */
      topicsGrid.querySelectorAll('.topic-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const card = btn.closest('.topic-card');
          const isOpen = card.classList.toggle('open');
          btn.textContent = isOpen ? 'Show Less' : 'Read Full Report';
        });
      });
    }
  }


  /* ------------------------------------------
     COURSES — renders cards from js/courses-data.js
     and wires up the enrollment form's course
     dropdown + submission to POST /api/enroll
     ------------------------------------------ */
  const coursesGrid = document.getElementById('coursesGrid');
  const enrollCourseSelect = document.getElementById('enrollCourse');

  if (coursesGrid) {
    const courses = (typeof COURSES !== 'undefined' ? COURSES : []).slice();

    function escapeHtmlCourse(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    if (!courses.length) {
      coursesGrid.innerHTML = '<p class="topics-empty">No courses posted yet — check back soon.</p>';
    } else {
      coursesGrid.innerHTML = courses.map(function (course) {
        const highlightsHtml = (course.highlights && course.highlights.length)
          ? '<ul class="course-highlights">' +
              course.highlights.map(function (h) { return '<li>' + escapeHtmlCourse(h) + '</li>'; }).join('') +
            '</ul>'
          : '';

        return (
          '<div class="course-card">' +
            '<div class="course-card-top">' +
              (course.category ? '<span class="course-tag">' + escapeHtmlCourse(course.category) + '</span>' : '<span></span>') +
              '<span class="course-meta">' + escapeHtmlCourse(course.format) + (course.duration ? ' · ' + escapeHtmlCourse(course.duration) : '') + '</span>' +
            '</div>' +
            '<h3>' + escapeHtmlCourse(course.title) + '</h3>' +
            (course.summary ? '<p>' + escapeHtmlCourse(course.summary) + '</p>' : '') +
            (course.startDate
              ? '<p class="course-starts">Starts ' + new Date(course.startDate + 'T00:00:00+03:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Mogadishu' }) + '</p>'
              : '') +
            '<div class="course-full">' + highlightsHtml + '</div>' +
            '<div class="course-card-actions">' +
              '<button type="button" class="topic-toggle course-toggle">View Details</button>' +
              '<a class="course-view-link" href="course.html?course=' + encodeURIComponent(course.slug) + '">View Full Course →</a>' +
            '</div>' +
            '<button type="button" class="course-enroll-btn" data-slug="' + escapeHtmlCourse(course.slug) + '">Enroll in This Course</button>' +
          '</div>'
        );
      }).join('');

      coursesGrid.querySelectorAll('.course-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const card = btn.closest('.course-card');
          const isOpen = card.classList.toggle('open');
          btn.textContent = isOpen ? 'Show Less' : 'View Details';
        });
      });

      coursesGrid.querySelectorAll('.course-enroll-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (enrollCourseSelect) {
            enrollCourseSelect.value = btn.dataset.slug;
          }
          const enrollSection = document.getElementById('enroll');
          if (enrollSection) {
            enrollSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  }

  const allCourses = (typeof COURSES !== 'undefined' ? COURSES : []);

  if (enrollCourseSelect) {
    allCourses.forEach(function (course) {
      const opt = document.createElement('option');
      opt.value = course.slug;
      opt.textContent = course.title;
      enrollCourseSelect.appendChild(opt);
    });
  }

  const enrollForm = document.getElementById('enrollForm');
  const enrollAuthPrompt = document.getElementById('enrollAuthPrompt');
  const enrollAsLine = document.getElementById('enrollAsLine');

  if (enrollForm) {
    const enrollStatusEl = document.getElementById('enrollStatus');
    const enrollBtn = enrollForm.querySelector('.btn-send');
    let currentUser = null;

    function notifyFormspree(course) {
      // Best-effort org notification alongside the real enrollment record —
      // failures here are ignored, the enrollment itself already succeeded.
      fetch('https://formspree.io/f/mljdeapa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          course: course,
          _subject: 'New Course Enrollment: ' + course
        })
      }).catch(function () {});
    }

    fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (me) {
        if (me.loggedIn) {
          currentUser = me;
          enrollForm.hidden = false;
          if (enrollAuthPrompt) enrollAuthPrompt.hidden = true;
          if (enrollAsLine) {
            enrollAsLine.hidden = false;
            enrollAsLine.textContent = 'Enrolling as ' + me.name + ' (' + me.email + ')';
          }
        } else {
          enrollForm.hidden = true;
          if (enrollAuthPrompt) enrollAuthPrompt.hidden = false;
        }
      });

    enrollForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!currentUser) {
        if (enrollAuthPrompt) enrollAuthPrompt.hidden = false;
        return;
      }

      const slug = enrollForm.querySelector('[name="course"]').value.trim();
      const matchedCourse = allCourses.filter(function (c) { return c.slug === slug; })[0];

      if (!slug) {
        if (enrollStatusEl) {
          enrollStatusEl.textContent = 'Please choose a course.';
          enrollStatusEl.className = 'form-status error';
        }
        return;
      }

      enrollBtn.textContent = 'Submitting…';
      enrollBtn.disabled = true;

      fetch('/api/enroll', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: enrollForm.querySelector('[name="phone"]').value.trim(),
          course: matchedCourse ? matchedCourse.title : slug,
          courseSlug: slug,
          message: enrollForm.querySelector('[name="message"]').value.trim()
        })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              throw new Error(data && data.error ? data.error : 'Submission failed');
            }
            if (!data.alreadyEnrolled) notifyFormspree(matchedCourse ? matchedCourse.title : slug);
            if (matchedCourse) {
              window.location.href = 'course.html?course=' + encodeURIComponent(matchedCourse.slug) + '&enrolled=1';
              return;
            }
            enrollBtn.textContent = 'Enrolled ✓';
            if (enrollStatusEl) {
              enrollStatusEl.textContent = "Thanks — check your dashboard for next steps.";
              enrollStatusEl.className = 'form-status success';
            }
            enrollForm.reset();
          });
        })
        .catch(function (err) {
          enrollBtn.textContent = 'Submit Enrollment →';
          enrollBtn.disabled = false;
          if (enrollStatusEl) {
            enrollStatusEl.textContent = err.message || 'Something went wrong — please try again or email us directly.';
            enrollStatusEl.className = 'form-status error';
          }
        })
        .finally(function () {
          setTimeout(function () {
            enrollBtn.textContent = 'Submit Enrollment →';
            enrollBtn.disabled = false;
          }, 3000);
        });
    });
  }


  /* ------------------------------------------
     GALLERY — placeholder click handler
     Replace with a lightbox if desired
     ------------------------------------------ */
  document.querySelectorAll('.g-cell').forEach(function (cell) {
    cell.addEventListener('click', function () {
      const label = cell.querySelector('.g-overlay');
      if (label) {
        console.log('Gallery item clicked:', label.textContent.trim());
        /* TODO: open lightbox here */
      }
    });
  });


  /* ------------------------------------------
     WORLD DAYS — next-observance countdown,
     category filters, and expandable cards
     ------------------------------------------ */
  const dayCards = document.querySelectorAll('.day-card');

  if (dayCards.length) {

    /* -- Next Observance banner: live countdown -- */
    const nameEl = document.getElementById('nextUpName');
    const dateEl = document.getElementById('nextUpDate');
    const cdMonths = document.getElementById('cdMonths');
    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function pad(n) {
      return n < 10 ? '0' + n : '' + n;
    }

    /* Next calendar occurrence of a given card's day, rolling into
       next year once that day has passed. */
    function occurrenceFor(card, now) {
      const month = parseInt(card.dataset.month, 10) - 1;
      const day = parseInt(card.dataset.day, 10);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let occurrence = new Date(now.getFullYear(), month, day);
      if (occurrence < startOfToday) {
        occurrence = new Date(now.getFullYear() + 1, month, day);
      }
      return occurrence;
    }

    /* Finds the day-card whose next occurrence is soonest overall */
    function findSoonest(now) {
      let soonest = null;
      dayCards.forEach(function (card) {
        const occurrence = occurrenceFor(card, now);
        if (!soonest || occurrence < soonest.date) {
          soonest = { date: occurrence, card: card };
        }
      });
      return soonest;
    }

    /* Calendar-accurate months + days remaining (handles different
       month lengths correctly), then hours/min/sec from what's left. */
    function breakdown(target, now) {
      let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
      let anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

      if (anchor > target) {
        months--;
        anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      }

      let remainder = target - anchor;
      if (remainder < 0) remainder = 0;
      if (months < 0) months = 0;

      const days = Math.floor(remainder / 86400000);
      remainder -= days * 86400000;
      const hours = Math.floor(remainder / 3600000);
      remainder -= hours * 3600000;
      const minutes = Math.floor(remainder / 60000);
      remainder -= minutes * 60000;
      const seconds = Math.floor(remainder / 1000);

      return { months: months, days: days, hours: hours, minutes: minutes, seconds: seconds };
    }

    function writeBreakdown(els, b) {
      if (els.months) els.months.textContent = b.months;
      if (els.days) els.days.textContent = b.days;
      if (els.hours) els.hours.textContent = pad(b.hours);
      if (els.minutes) els.minutes.textContent = pad(b.minutes);
      if (els.seconds) els.seconds.textContent = pad(b.seconds);
    }

    let cachedSoonest = null;
    let lastLabel = null;

    function tick() {
      const now = new Date();

      /* -- Next Observance banner -- */
      if (nameEl && dateEl && cdMonths) {
        if (!cachedSoonest || cachedSoonest.date <= now) {
          cachedSoonest = findSoonest(now);
        }

        const title = cachedSoonest.card.querySelector('h4');
        const label = title ? title.textContent : 'Upcoming World Day';

        if (label !== lastLabel) {
          nameEl.textContent = label;
          dateEl.textContent = MONTHS[cachedSoonest.date.getMonth()] + ' ' + cachedSoonest.date.getDate() + ', ' + cachedSoonest.date.getFullYear();
          lastLabel = label;
        }

        writeBreakdown(
          { months: cdMonths, days: cdDays, hours: cdHours, minutes: cdMinutes, seconds: cdSeconds },
          breakdown(cachedSoonest.date, now)
        );
      }

      /* -- Per-card countdown, revealed when a card is expanded -- */
      dayCards.forEach(function (card) {
        const target = occurrenceFor(card, now);
        writeBreakdown(
          {
            months: card.querySelector('.day-cd-months'),
            days: card.querySelector('.day-cd-days'),
            hours: card.querySelector('.day-cd-hours'),
            minutes: card.querySelector('.day-cd-minutes'),
            seconds: card.querySelector('.day-cd-seconds')
          },
          breakdown(target, now)
        );
      });
    }

    tick();
    setInterval(tick, 1000);

    /* -- Category filters -- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        dayCards.forEach(function (card) {
          const matches = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !matches);
        });
      });
    });

    /* -- Expand / collapse each card's detail -- */
    dayCards.forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('open');
      });
    });
  }

});

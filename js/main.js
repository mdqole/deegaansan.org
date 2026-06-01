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
     SCROLL REVEAL ANIMATION
     Adds .visible class to elements as they
     enter the viewport
     ------------------------------------------ */
  const revealEls = document.querySelectorAll(
    '.prog-card, .mission-card, .event-item, .donate-card, .g-cell'
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
     CONTACT FORM — basic submit handler
     Replace the console.log with your own
     form submission logic (e.g. EmailJS,
     Formspree, or a backend endpoint)
     ------------------------------------------ */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = form.querySelector('input[placeholder="Your Name"]').value.trim();
      const email   = form.querySelector('input[placeholder="Email Address"]').value.trim();
      const subject = form.querySelector('input[placeholder="Subject"]').value.trim();
      const message = form.querySelector('textarea').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
      }

      /* TODO: Replace this with your real form handler */
      console.log('Form submitted:', { name, email, subject, message });

      const btn = form.querySelector('.btn-send');
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#3e6b1f';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = 'Send Message →';
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
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

});

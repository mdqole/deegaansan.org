/* ============================================
   DEEGANSAN — auth.js
   Shared across every page: renders the nav's Log
   In / Sign Up / My Courses / Log Out area, and
   handles the login/signup forms when present.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  function getMe() {
    return fetch('/api/auth/me', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .catch(function () { return { loggedIn: false }; });
  }

  /* -- Nav auth area -- */
  const navAuthSlot = document.getElementById('navAuthSlot');
  if (navAuthSlot) {
    getMe().then(function (me) {
      if (me.loggedIn) {
        navAuthSlot.innerHTML =
          '<a href="dashboard.html">My Courses</a>' +
          '<a href="#" id="navLogoutLink">Log Out</a>';
        const logoutLink = document.getElementById('navLogoutLink');
        if (logoutLink) {
          logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
              .then(function () { window.location.href = 'index.html'; });
          });
        }
      } else {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        navAuthSlot.innerHTML =
          '<a href="login.html?next=' + next + '">Log In</a>' +
          '<a href="signup.html?next=' + next + '" class="nav-donate">Sign Up</a>';
      }
    });
  }

  /* -- Login form (login.html) -- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const statusEl = document.getElementById('authStatus');
    const btn = loginForm.querySelector('.btn-send');
    const params = new URLSearchParams(window.location.search);

    // After login, go to the course browser — unless the visitor was in the
    // middle of enrolling on a specific course page. Anything else (including
    // the homepage or an external URL) falls back to the browser, so ?next=
    // can't be used as an open redirect.
    function safeNext(raw) {
      if (raw && /^\/?course\.html\?course=[a-z0-9-]+$/i.test(raw)) return raw;
      return 'dashboard.html';
    }
    const next = safeNext(params.get('next'));

    if (params.get('verified') === '1' && statusEl) {
      statusEl.textContent = "Your email is verified — you can log in now.";
      statusEl.className = 'form-status success';
    } else if (params.get('verifyError') === '1' && statusEl) {
      statusEl.textContent = 'That verification link is invalid or expired. Request a new one below.';
      statusEl.className = 'form-status error';
    }

    function showResend(email) {
      const resendEl = document.getElementById('resendVerification');
      if (!resendEl) return;
      resendEl.hidden = false;
      resendEl.dataset.email = email;
    }

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = loginForm.querySelector('[name="email"]').value.trim();
      const password = loginForm.querySelector('[name="password"]').value;

      if (!email || !password) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in your email and password.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      btn.textContent = 'Logging in…';
      btn.disabled = true;

      fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              if (data && data.code === 'unverified') {
                showResend(email);
              }
              throw new Error(data && data.error ? data.error : 'Login failed.');
            }
            window.location.href = next;
          });
        })
        .catch(function (err) {
          btn.textContent = 'Log In →';
          btn.disabled = false;
          if (statusEl) {
            statusEl.textContent = err.message || 'Something went wrong — please try again.';
            statusEl.className = 'form-status error';
          }
        });
    });

    const resendBtn = document.getElementById('resendVerificationBtn');
    if (resendBtn) {
      resendBtn.addEventListener('click', function () {
        const email = document.getElementById('resendVerification').dataset.email;
        resendBtn.textContent = 'Sending…';
        resendBtn.disabled = true;
        fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (statusEl) {
              statusEl.textContent = data.message || "If that account needs verifying, we've sent a new link.";
              statusEl.className = 'form-status success';
            }
          })
          .finally(function () {
            resendBtn.textContent = 'Resend Verification Email';
            resendBtn.disabled = false;
          });
      });
    }
  }

  /* -- Signup form (signup.html) -- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const statusEl = document.getElementById('authStatus');
    const btn = signupForm.querySelector('.btn-send');

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = signupForm.querySelector('[name="name"]').value.trim();
      const email = signupForm.querySelector('[name="email"]').value.trim();
      const password = signupForm.querySelector('[name="password"]').value;

      if (!name || !email || !password) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in your name, email, and password.';
          statusEl.className = 'form-status error';
        }
        return;
      }
      if (password.length < 8) {
        if (statusEl) {
          statusEl.textContent = 'Password must be at least 8 characters.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      btn.textContent = 'Creating account…';
      btn.disabled = true;

      fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              throw new Error(data && data.error ? data.error : 'Signup failed.');
            }
            signupForm.hidden = true;
            if (statusEl) {
              statusEl.textContent = "Account created — check your email for a verification link before logging in.";
              statusEl.className = 'form-status success';
            }
          });
        })
        .catch(function (err) {
          btn.textContent = 'Create Account →';
          btn.disabled = false;
          if (statusEl) {
            statusEl.textContent = err.message || 'Something went wrong — please try again.';
            statusEl.className = 'form-status error';
          }
        });
    });
  }

});

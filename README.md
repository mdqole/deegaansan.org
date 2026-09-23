# Deegaansan.org

Node.js + Express backend serving the Deegansan website, with MongoDB-backed
student accounts, email verification, and course enrollment tracked per
account. The frontend is still plain HTML/CSS/JS (no build step) — it lives
in `docs/` and is served directly by Express.

> **Why `docs/` and not `public/`?** So GitHub Pages can serve this same
> folder as a stopgap. GitHub Pages' branch-source dropdown only offers
> `/(root)` or `/docs` — see "Currently on GitHub Pages" below. Note that
> **login/signup cannot run on GitHub Pages at all** — that stopgap only
> keeps the public marketing pages working; accounts need Render live.

## Project layout

```
server.js                  Express app entry point
db.js                       MongoDB connection (Mongoose)
models/User.js              Account schema (bcrypt password hash, email verification)
models/Enrollment.js        Enrollment schema, linked to a User
middleware/requireAuth.js   Gates a route behind a logged-in session
utils/mailer.js             Sends verification emails via Resend (or logs them if unset)
routes/auth.js              Signup, verify, login, logout, /api/auth/me
routes/enroll.js            POST /api/enroll, GET /api/my-enrollments (both require login)
docs/
  index.html                The site
  css/styles.css
  js/main.js                All frontend behavior, including rendering
                             Topics and Courses from the two data files below
  js/topics-data.js         Reports & Updates content — edit this to post
  js/courses-data.js        Online Courses catalog — edit this to add courses
  course.html + js/course.js      Single-course pages (course.html?course=<slug>)
  login.html, signup.html         Account pages
  dashboard.html + js/dashboard.js    "My Courses" page for logged-in students
  js/auth.js                 Shared nav auth state + login/signup form handling
  images/, documents/
```

## Run locally

```bash
npm install
cp .env.example .env
# edit .env — see the variables below
npm run dev
```

Open http://localhost:3000. Without `MONGODB_URI` set, the site still loads
normally — signup, login, and enrollment will show a friendly error until the
database is configured. Without `RESEND_API_KEY` set, verification emails are
logged to the server console (with the clickable link) instead of being sent
— enough to test the whole signup → verify → login flow locally without a
real email service.

## Editing content (no code changes needed)

- **Reports & Updates**: edit `docs/js/topics-data.js`.
- **Online Courses**: edit `docs/js/courses-data.js`. The three seed
  courses are placeholders — replace title/summary/highlights/content with
  real course details. Each course's `slug` is used in its page URL
  (`course.html?course=<slug>`). The `materials` array on each course is
  what shows up on a student's "My Courses" dashboard once enrolled.

## Currently on GitHub Pages (temporary)

`deegaansan.org` is still pointed at GitHub Pages for now. Since `index.html`
moved into `docs/`, GitHub Pages' source needs to be set to that folder or
the domain will show a 404 / the raw README instead of the site:

- Repo → **Settings → Pages** → under "Build and deployment", set **Branch**
  to `main` and the folder to **`/docs`** → Save.

This keeps the public marketing pages working. **Accounts, login, and
enrollment cannot work here at all** — GitHub Pages has no backend to run
sessions or hit the database, so those pages need Render live below.

## Deploying to Render (required for accounts to work)

1. **Database** — create a free MongoDB Atlas cluster (M0 tier):
   - https://www.mongodb.com/cloud/atlas/register
   - Create a database user and password.
   - Under Network Access, allow access from anywhere (`0.0.0.0/0`) so Render
     can connect.
   - Copy the connection string (Atlas → Connect → Drivers) → this is
     `MONGODB_URI`.

2. **Email** — create a free Resend account for verification emails:
   - https://resend.com/signup → API Keys → create one → this is
     `RESEND_API_KEY`.
   - Without verifying a sending domain in Resend, you can only send from
     their shared address (`onboarding@resend.dev`) and emails can only be
     **delivered to the Resend account's own email** — real students won't
     get theirs. To fix that, add and verify `deegaansan.org` under Resend →
     Domains (adds a few DNS records), then set `MAIL_FROM` to something like
     `Deegansan <no-reply@deegaansan.org>`.

3. **Session secret** — generate one and save it for the next step:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **App hosting** — create a Render Web Service:
   - https://render.com → New → Web Service → connect this GitHub repo
     (`mdqole/deegaansan.org`).
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `MONGODB_URI`, `RESEND_API_KEY`, `MAIL_FROM`,
     `SESSION_SECRET`, and `NODE_ENV=production` (so session cookies are
     marked secure).
   - Deploy. Render gives you a `https://<name>.onrender.com` URL — confirm
     the site loads, sign up, verify via the emailed link, log in, enroll in
     a course, and check it shows up on `dashboard.html` and as a document in
     the Atlas collection browser.

5. **Custom domain (deegaansan.org)** — once Render is live and verified:
   - In the Render service → Settings → Custom Domains, add `deegaansan.org`
     (and `www.deegaansan.org` if used). Render will show the DNS records to
     add.
   - At your domain registrar / DNS provider, replace the GitHub Pages
     records with the ones Render gives you.
   - Once DNS has propagated and Render shows the domain as verified, the
     site is fully cut over. At that point the GitHub Pages source setting
     above no longer matters — Render is serving the domain instead — and
     `docs/CNAME` can be left in place or removed.

## Known gap

There's no "forgot password" flow yet — a student who loses their password
currently has no self-service way to reset it. Worth adding once accounts are
live and in real use.

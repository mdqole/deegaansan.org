# Deegaansan.org

Node.js + Express backend serving the Deegansan website, with a MongoDB-backed
course enrollment form. The frontend is still plain HTML/CSS/JS (no build
step) — it lives in `docs/` and is served directly by Express.

> **Why `docs/` and not `public/`?** So GitHub Pages can serve this same
> folder as a stopgap. GitHub Pages' branch-source dropdown only offers
> `/(root)` or `/docs` — see "Currently on GitHub Pages" below.

## Project layout

```
server.js               Express app entry point
db.js                    MongoDB connection (Mongoose)
models/Enrollment.js     Enrollment document schema
routes/enroll.js         POST /api/enroll
docs/
  index.html             The site
  css/styles.css
  js/main.js             All frontend behavior, including rendering
                          Topics and Courses from the two data files below
  js/topics-data.js      Reports & Updates content — edit this to post
  js/courses-data.js     Online Courses catalog — edit this to add courses
  course.html + js/course.js   Single-course pages (course.html?course=<slug>)
  images/, documents/
```

## Run locally

```bash
npm install
cp .env.example .env
# edit .env and set MONGODB_URI to a MongoDB Atlas connection string
npm run dev
```

Open http://localhost:3000. Without `MONGODB_URI` set, the site still loads
normally — only the course enrollment form will show an error until the
database is configured.

## Editing content (no code changes needed)

- **Reports & Updates**: edit `docs/js/topics-data.js`.
- **Online Courses**: edit `docs/js/courses-data.js`. The three seed
  courses are placeholders — replace title/summary/highlights/content with
  real course details. Each course's `slug` is used in its page URL
  (`course.html?course=<slug>`).

## Currently on GitHub Pages (temporary)

`deegaansan.org` is still pointed at GitHub Pages for now. Since `index.html`
moved into `docs/`, GitHub Pages' source needs to be set to that folder or
the domain will show a 404 / the raw README instead of the site:

- Repo → **Settings → Pages** → under "Build and deployment", set **Branch**
  to `main` and the folder to **`/docs`** → Save.

This restores the real static site immediately. Everything works except the
course enrollment form, which will show a friendly error (there's no backend
running on GitHub Pages) — the rest of the site, including the Formspree
contact form, is unaffected. This is only a stopgap; GitHub Pages cannot run
the Express backend, so the real fix is cutting over to Render below.

## Deploying to Render (the real fix)

1. **Database** — create a free MongoDB Atlas cluster (M0 tier):
   - https://www.mongodb.com/cloud/atlas/register
   - Create a database user and password.
   - Under Network Access, allow access from anywhere (`0.0.0.0/0`) so Render
     can connect.
   - Copy the connection string (Atlas → Connect → Drivers).

2. **App hosting** — create a Render Web Service:
   - https://render.com → New → Web Service → connect this GitHub repo
     (`mdqole/deegaansan.org`).
   - Build command: `npm install`
   - Start command: `npm start`
   - Add an environment variable `MONGODB_URI` set to the Atlas connection
     string from step 1.
   - Deploy. Render gives you a `https://<name>.onrender.com` URL — confirm
     the site loads and a test enrollment submission succeeds (check the
     Atlas collection browser for the new document).

3. **Custom domain (deegaansan.org)** — once Render is live and verified:
   - In the Render service → Settings → Custom Domains, add `deegaansan.org`
     (and `www.deegaansan.org` if used). Render will show the DNS records to
     add.
   - At your domain registrar / DNS provider, replace the GitHub Pages
     records with the ones Render gives you.
   - Once DNS has propagated and Render shows the domain as verified, the
     site is fully cut over. At that point the GitHub Pages source setting
     above no longer matters — Render is serving the domain instead — and
     `docs/CNAME` can be left in place or removed.

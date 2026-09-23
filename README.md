# Deegaansan.org

Node.js + Express backend serving the Deegansan website, with a MongoDB-backed
course enrollment form. The frontend is still plain HTML/CSS/JS (no build
step) — it lives in `public/` and is served directly by Express.

## Project layout

```
server.js               Express app entry point
db.js                    MongoDB connection (Mongoose)
models/Enrollment.js     Enrollment document schema
routes/enroll.js         POST /api/enroll
public/
  index.html             The site
  css/styles.css
  js/main.js             All frontend behavior, including rendering
                          Topics and Courses from the two data files below
  js/topics-data.js      Reports & Updates content — edit this to post
  js/courses-data.js     Online Courses catalog — edit this to add courses
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

- **Reports & Updates**: edit `public/js/topics-data.js`.
- **Online Courses**: edit `public/js/courses-data.js`. The three seed
  courses are placeholders — replace title/summary/highlights with real
  course details.

## Deploying

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

3. **Custom domain (deegaansan.org)** — the site currently uses GitHub Pages
   for the `deegaansan.org` domain (see the `public/CNAME` file). GitHub
   Pages can't run this backend, so the domain needs to point at Render
   instead:
   - In the Render service → Settings → Custom Domains, add `deegaansan.org`
     (and `www.deegaansan.org` if used). Render will show the DNS records to
     add.
   - At your domain registrar / DNS provider, replace the existing GitHub
     Pages records with the ones Render gives you.
   - Once DNS has propagated and Render shows the domain as verified, the
     site is fully cut over. `public/CNAME` is a GitHub Pages-only file and
     can be left in place or removed — it has no effect once DNS points at
     Render.

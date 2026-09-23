require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectDB } = require('./db');
const enrollRouter = require('./routes/enroll');
const authRouter = require('./routes/auth');

const app = express();

// Needed so secure cookies work correctly behind Render's reverse proxy.
app.set('trust proxy', 1);

app.use(express.json());

if (!process.env.SESSION_SECRET) {
  console.warn('[server] SESSION_SECRET is not set — using an insecure dev-only default. Set it before deploying.');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: process.env.MONGODB_URI
    ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    : undefined,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Static assets live in docs/ (not public/) so GitHub Pages can serve this
// same folder as a fallback — its branch source dropdown only offers
// "/(root)" or "/docs". See README.md for the Render cutover.
app.use(express.static(path.join(__dirname, 'docs')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api', enrollRouter);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Deegansan site running at http://localhost:${PORT}`);
});

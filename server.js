require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectDB } = require('./db');
const enrollRouter = require('./routes/enroll');
const authRouter = require('./routes/auth');

// A transient MongoDB hiccup (network blip, TLS renegotiation, etc.) should
// degrade a single request, not take down the whole process. Without these,
// an unhandled rejection or an EventEmitter 'error' with no listener (see
// the sessionStore.on('error', ...) below) crashes the whole server.
process.on('unhandledRejection', (err) => {
  console.error('[server] Unhandled rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
});

const app = express();

// Needed so secure cookies work correctly behind Render's reverse proxy.
app.set('trust proxy', 1);

app.use(express.json());

if (!process.env.SESSION_SECRET) {
  console.warn('[server] SESSION_SECRET is not set — using an insecure dev-only default. Set it before deploying.');
}

let sessionStore;
if (process.env.MONGODB_URI) {
  sessionStore = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
  // Without this listener, a connection error here is an unhandled
  // EventEmitter 'error' — which Node treats as fatal and crashes the process.
  sessionStore.on('error', (err) => {
    console.error('[server] Session store error:', err.message);
  });
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
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

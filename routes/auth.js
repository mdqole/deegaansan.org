const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('../db');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

function verificationEmailHtml(link) {
  return `
    <p>Welcome to Deegansan!</p>
    <p>Click the link below to verify your email and activate your account:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 24 hours.</p>
  `;
}

router.post('/signup', authLimiter, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, email, and password.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
  }

  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ ok: false, error: 'Signup is temporarily unavailable — please try again shortly.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ ok: false, error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash,
      verified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + TOKEN_TTL_MS)
    });

    const link = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${verificationToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your Deegansan account',
      html: verificationEmailHtml(link)
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth/signup] Failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong creating your account — please try again.' });
  }
});

router.get('/verify', async (req, res) => {
  const token = String(req.query.token || '');

  const connected = await connectDB();
  if (!connected || !token) {
    return res.redirect('/login.html?verifyError=1');
  }

  try {
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: new Date() } });
    if (!user) {
      return res.redirect('/login.html?verifyError=1');
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.redirect('/login.html?verified=1');
  } catch (err) {
    console.error('[auth/verify] Failed:', err.message);
    return res.redirect('/login.html?verifyError=1');
  }
});

router.post('/resend-verification', authLimiter, async (req, res) => {
  const email = String((req.body || {}).email || '').trim().toLowerCase();

  // Always respond the same way, whether or not the email exists or is
  // already verified, so this can't be used to check who has an account.
  const genericResponse = { ok: true, message: "If that account needs verifying, we've sent a new link." };

  const connected = await connectDB();
  if (!connected || !EMAIL_RE.test(email)) {
    return res.json(genericResponse);
  }

  try {
    const user = await User.findOne({ email, verified: false });
    if (user) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationTokenExpires = new Date(Date.now() + TOKEN_TTL_MS);
      await user.save();

      const link = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${user.verificationToken}`;
      await sendMail({
        to: user.email,
        subject: 'Verify your Deegansan account',
        html: verificationEmailHtml(link)
      });
    }
  } catch (err) {
    console.error('[auth/resend-verification] Failed:', err.message);
  }

  return res.json(genericResponse);
});

router.post('/login', authLimiter, async (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const genericError = { ok: false, error: 'Invalid email or password.' };

  if (!email || !password) {
    return res.status(400).json(genericError);
  }

  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ ok: false, error: 'Login is temporarily unavailable — please try again shortly.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(genericError);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json(genericError);
    }

    if (!user.verified) {
      return res.status(403).json({ ok: false, error: 'Please verify your email before logging in.', code: 'unverified' });
    }

    req.session.userId = String(user._id);
    return res.json({ ok: true, name: user.name, email: user.email });
  } catch (err) {
    console.error('[auth/login] Failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong logging you in — please try again.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({ loggedIn: false });
  }

  const connected = await connectDB();
  if (!connected) {
    return res.json({ loggedIn: false });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({ loggedIn: false });
    }
    return res.json({ loggedIn: true, name: user.name, email: user.email });
  } catch (err) {
    return res.json({ loggedIn: false });
  }
});

module.exports = router;

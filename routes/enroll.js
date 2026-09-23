const express = require('express');
const { connectDB } = require('../db');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/enroll', async (req, res) => {
  const body = req.body || {};

  // Honeypot — real visitors never fill this hidden field.
  if (body._gotcha) {
    return res.json({ ok: true });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const course = String(body.course || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !course) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, email, and course.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ ok: false, error: 'Enrollment is temporarily unavailable — please try again shortly or email us directly.' });
  }

  try {
    await Enrollment.create({ name, email, phone, course, message });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[enroll] Failed to save enrollment:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong saving your enrollment — please try again or email us directly.' });
  }
});

module.exports = router;

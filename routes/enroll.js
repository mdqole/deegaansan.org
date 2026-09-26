const express = require('express');
const { connectDB } = require('../db');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login is optional here: a logged-in visitor's enrollment is linked to
// their account (and shows up on their dashboard); a logged-out visitor
// can still enroll by giving their name and email, same as before accounts
// existed — it's just not attached to anyone's "My Courses" list.
router.post('/enroll', async (req, res) => {
  const body = req.body || {};

  const phone = String(body.phone || '').trim();
  const course = String(body.course || '').trim();
  const courseSlug = String(body.courseSlug || '').trim();
  const message = String(body.message || '').trim();

  if (!course || !courseSlug) {
    return res.status(400).json({ ok: false, error: 'Please choose a course.' });
  }

  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ ok: false, error: 'Enrollment is temporarily unavailable — please try again shortly or email us directly.' });
  }

  try {
    let userId = null;
    let name;
    let email;

    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        userId = user._id;
        name = user.name;
        email = user.email;
      }
    }

    if (!userId) {
      name = String(body.name || '').trim();
      email = String(body.email || '').trim();
      if (!name || !email) {
        return res.status(400).json({ ok: false, error: 'Please fill in your name and email.' });
      }
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
      }
    }

    if (userId) {
      const existing = await Enrollment.findOne({ userId, courseSlug });
      if (existing) {
        return res.json({ ok: true, alreadyEnrolled: true });
      }
    }

    await Enrollment.create({ userId, name, email, phone, course, courseSlug, message });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[enroll] Failed to save enrollment:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong saving your enrollment — please try again or email us directly.' });
  }
});

router.get('/my-enrollments', requireAuth, async (req, res) => {
  const connected = await connectDB();
  if (!connected) {
    return res.status(503).json({ ok: false, error: 'Unavailable — please try again shortly.' });
  }

  try {
    const enrollments = await Enrollment.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .select('course courseSlug createdAt -_id');
    return res.json({ ok: true, enrollments });
  } catch (err) {
    console.error('[my-enrollments] Failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong loading your courses.' });
  }
});

module.exports = router;

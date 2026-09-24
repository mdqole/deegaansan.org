const express = require('express');
const { connectDB } = require('../db');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/enroll', requireAuth, async (req, res) => {
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
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Please log in to continue.' });
    }

    const existing = await Enrollment.findOne({ userId: user._id, courseSlug });
    if (existing) {
      return res.json({ ok: true, alreadyEnrolled: true });
    }

    await Enrollment.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone,
      course,
      courseSlug,
      message
    });
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

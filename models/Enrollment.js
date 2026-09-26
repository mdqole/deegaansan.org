const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Set when the visitor was logged in at the time of enrollment; null for
  // an anonymous enrollment (login isn't required to enroll).
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  course: { type: String, required: true, trim: true },
  courseSlug: { type: String, required: true, trim: true },
  message: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);

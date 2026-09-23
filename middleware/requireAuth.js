function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ ok: false, error: 'Please log in to continue.' });
  }
  next();
}

module.exports = requireAuth;

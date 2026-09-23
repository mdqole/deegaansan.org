const mongoose = require('mongoose');

let connectPromise = null;

// Connects lazily and only once. If MONGODB_URI isn't set, resolves to
// false instead of throwing, so the static site keeps working even before
// the database is configured.
function connectDB() {
  if (connectPromise) return connectPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI is not set — enrollment submissions will fail until it is configured.');
    connectPromise = Promise.resolve(false);
    return connectPromise;
  }

  connectPromise = mongoose
    .connect(uri)
    .then(() => {
      console.log('[db] Connected to MongoDB.');
      return true;
    })
    .catch((err) => {
      console.error('[db] MongoDB connection failed:', err.message);
      connectPromise = null; // allow a retry on the next request
      return false;
    });

  return connectPromise;
}

module.exports = { connectDB };

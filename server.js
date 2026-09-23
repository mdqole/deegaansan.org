require('dotenv').config();

const path = require('path');
const express = require('express');
const { connectDB } = require('./db');
const enrollRouter = require('./routes/enroll');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', enrollRouter);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Deegansan site running at http://localhost:${PORT}`);
});

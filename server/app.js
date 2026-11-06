const express = require('express');
const cors = require('cors');
const db = require('./lib/store');
const { optionalAuth } = require('./lib/auth');

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// make sure data is loaded before any route runs (serverless cold start)
app.use(async (req, res, next) => {
  try {
    await db.load();
    next();
  } catch (e) {
    next(e);
  }
});
app.use(optionalAuth);

app.get('/api/health', (req, res) => res.json({ ok: true, persistent: db.persistent, time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api', require('./routes/catalog'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api', require('./routes/misc'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;

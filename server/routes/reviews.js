const router = require('express').Router();
const db = require('../lib/store');

function recomputeRating(productId) {
  const approved = db.reviews.find((r) => r.productId === productId && r.status === 'approved');
  const count = approved.length;
  const avg = count ? approved.reduce((s, r) => s + r.rating, 0) / count : 0;
  db.products.update(productId, { rating: Math.round(avg * 10) / 10, reviewCount: count });
}

router.get('/', (req, res) => {
  const { productId } = req.query;
  let items = db.reviews.find((r) => r.status === 'approved');
  if (productId) items = items.filter((r) => r.productId === productId);
  res.json(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/', (req, res) => {
  const { productId, name, rating, title, body } = req.body || {};
  const product = db.products.byId(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const r = Number(rating);
  if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  if (!body || String(body).trim().length < 5) return res.status(400).json({ error: 'Please write a few words about the product.' });
  const verified = Boolean(req.user && db.orders.findOne((o) => o.userId === req.user.id && o.items.some((i) => i.productId === productId)));
  const review = db.reviews.insert({
    productId,
    userId: req.user ? req.user.id : null,
    name: String(name || (req.user && req.user.name) || 'Anonymous').trim(),
    rating: r,
    title: String(title || '').trim(),
    body: String(body).trim(),
    status: 'pending',
    verified,
  });
  res.status(201).json({ review, message: 'Thanks! Your review will appear once approved.' });
});

module.exports = router;
module.exports.recomputeRating = recomputeRating;

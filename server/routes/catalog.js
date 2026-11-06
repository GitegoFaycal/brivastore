const router = require('express').Router();
const db = require('../lib/store');
const { withComputed } = require('../lib/utils');

router.get('/categories', (req, res) => {
  const cats = db.categories.all().map((c) => ({
    ...c,
    productCount: db.products.find((p) => p.category === c.slug && p.status === 'active').length,
  }));
  res.json(cats.sort((a, b) => a.order - b.order));
});

router.get('/collections', (req, res) => {
  const cols = db.collections.all().map((c) => ({
    ...c,
    productCount: db.products.find((p) => p.collections.includes(c.slug) && p.status === 'active').length,
  }));
  res.json(cols);
});

router.get('/collections/:slug', (req, res) => {
  const col = db.collections.findOne((c) => c.slug === req.params.slug);
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  res.json(col);
});

router.get('/categories/:slug', (req, res) => {
  const cat = db.categories.findOne((c) => c.slug === req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  res.json(cat);
});

/** Public storefront config (store info, delivery zones, payment methods, homepage content) */
router.get('/storefront', (req, res) => {
  const settings = db.settings.get();
  const content = db.content.get();
  res.json({
    store: settings.store,
    delivery: settings.delivery,
    payments: settings.payments.filter((p) => p.active),
    content,
    categories: db.categories.all().sort((a, b) => a.order - b.order),
    collections: db.collections.all(),
  });
});

/** Homepage data: featured, new, best sellers, sale */
router.get('/home', (req, res) => {
  const active = db.products.find((p) => p.status === 'active').map(withComputed);
  const byNew = [...active].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const byBest = [...active].sort((a, b) => b.soldCount - a.soldCount);
  res.json({
    featured: active.filter((p) => p.featured).slice(0, 8),
    newArrivals: byNew.slice(0, 8),
    bestSellers: byBest.slice(0, 8),
    sale: active.filter((p) => p.discount > 0).slice(0, 8),
    men: byBest.filter((p) => p.gender === 'men').slice(0, 8),
    women: byBest.filter((p) => p.gender === 'women').slice(0, 8),
  });
});

module.exports = router;

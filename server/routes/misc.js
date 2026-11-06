const router = require('express').Router();
const db = require('../lib/store');

/** Newsletter signup */
router.post('/newsletter', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const existing = db.subscribers.findOne((s) => s.email === email);
  if (existing) return res.json({ message: 'You are already subscribed. Watch your inbox!' });
  db.subscribers.insert({ email, source: (req.body && req.body.source) || 'website' });
  res.status(201).json({ message: 'Welcome to Briva! Use code WELCOME10 for 10% off your first order.' });
});

/** Validate a promo code against a subtotal */
router.post('/promo/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  const promo = db.promos.findOne((p) => p.code.toUpperCase() === String(code || '').toUpperCase());
  if (!promo || !promo.active) return res.status(404).json({ error: 'This promo code is not valid.' });
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return res.status(400).json({ error: 'This promo code has expired.' });
  if (promo.usageLimit && promo.used >= promo.usageLimit) return res.status(400).json({ error: 'This promo code has reached its usage limit.' });
  if (Number(subtotal) < (promo.minSubtotal || 0)) {
    return res.status(400).json({ error: `Minimum order of ${promo.minSubtotal.toLocaleString()} RWF required.` });
  }
  res.json({ code: promo.code, type: promo.type, value: promo.value, description: promo.description });
});

/** Contact form */
router.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });
  const content = db.content.get();
  const messages = [...(content.messages || []), { id: db.uid('m'), name, email: email || '', phone: phone || '', message, createdAt: new Date().toISOString(), read: false }];
  db.content.set({ messages });
  res.status(201).json({ message: 'Thanks! We will get back to you on WhatsApp or email within a few hours.' });
});

/** Back-in-stock notification request */
router.post('/notify', (req, res) => {
  const { productId, email, size, color } = req.body || {};
  if (!productId || !email) return res.status(400).json({ error: 'Email is required.' });
  const content = db.content.get();
  const notify = [...(content.notify || []), { id: db.uid('n'), productId, email, size, color, createdAt: new Date().toISOString() }];
  db.content.set({ notify });
  res.status(201).json({ message: 'We will email you as soon as it is back.' });
});

module.exports = router;

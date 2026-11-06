const router = require('express').Router();
const db = require('../lib/store');
const { sign, hash, verify, publicUser, requireAuth } = require('../lib/auth');

router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  const existing = db.users.findOne((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = db.users.insert({
    name: String(name).trim(),
    email: String(email).toLowerCase().trim(),
    phone: phone ? String(phone).trim() : '',
    role: 'customer',
    passwordHash: hash(password),
    addresses: [],
    wishlist: [],
  });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.findOne((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !verify(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.put('/me', requireAuth, (req, res) => {
  const { name, phone, password, currentPassword } = req.body || {};
  const patch = {};
  if (name) patch.name = String(name).trim();
  if (phone !== undefined) patch.phone = String(phone).trim();
  if (password) {
    if (!currentPassword || !verify(currentPassword, req.user.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    patch.passwordHash = hash(password);
  }
  const user = db.users.update(req.user.id, patch);
  res.json({ user: publicUser(user) });
});

// Addresses
router.post('/me/addresses', requireAuth, (req, res) => {
  const a = req.body || {};
  if (!a.line1 || !a.district) return res.status(400).json({ error: 'Address line and district are required.' });
  const addresses = [...(req.user.addresses || [])];
  const addr = {
    id: db.uid('a'),
    label: a.label || 'Home',
    line1: a.line1,
    sector: a.sector || '',
    district: a.district,
    city: a.city || 'Kigali',
    phone: a.phone || req.user.phone,
    default: Boolean(a.default) || addresses.length === 0,
  };
  if (addr.default) addresses.forEach((x) => { x.default = false; });
  addresses.push(addr);
  const user = db.users.update(req.user.id, { addresses });
  res.status(201).json({ user: publicUser(user) });
});

router.delete('/me/addresses/:id', requireAuth, (req, res) => {
  const addresses = (req.user.addresses || []).filter((a) => a.id !== req.params.id);
  if (addresses.length && !addresses.some((a) => a.default)) addresses[0].default = true;
  const user = db.users.update(req.user.id, { addresses });
  res.json({ user: publicUser(user) });
});

// Wishlist
router.get('/me/wishlist', requireAuth, (req, res) => {
  res.json({ wishlist: req.user.wishlist || [] });
});

router.put('/me/wishlist', requireAuth, (req, res) => {
  const wishlist = Array.isArray(req.body.wishlist) ? req.body.wishlist.filter((id) => db.products.byId(id)) : [];
  const user = db.users.update(req.user.id, { wishlist });
  res.json({ wishlist: user.wishlist });
});

module.exports = router;

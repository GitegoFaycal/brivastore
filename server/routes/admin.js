const router = require('express').Router();
const db = require('../lib/store');
const { requireAdmin, publicUser, hash } = require('../lib/auth');
const { slugify, paginate, withComputed } = require('../lib/utils');
const { recomputeRating } = require('./reviews');
const { STATUS_FLOW } = require('./orders');

router.use(requireAdmin);

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

// ---------------------------------------------------------------- DASHBOARD
router.get('/dashboard', (req, res) => {
  const days = Math.min(365, Number(req.query.days) || 30);
  const since = Date.now() - days * 86400000;
  const prevSince = since - days * 86400000;
  const orders = db.orders.all();
  const inRange = orders.filter((o) => new Date(o.createdAt).getTime() >= since);
  const prevRange = orders.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= prevSince && t < since; });
  const valid = (list) => list.filter((o) => o.status !== 'cancelled');
  const revenue = (list) => valid(list).reduce((s, o) => s + o.total, 0);

  const rev = revenue(inRange);
  const prevRev = revenue(prevRange);
  const customers = db.users.find((u) => u.role === 'customer');
  const newCustomers = customers.filter((u) => new Date(u.createdAt).getTime() >= since).length;
  const prevNewCustomers = customers.filter((u) => { const t = new Date(u.createdAt).getTime(); return t >= prevSince && t < since; }).length;

  // revenue by day
  const byDay = {};
  for (let i = days - 1; i >= 0; i -= 1) byDay[dayKey(Date.now() - i * 86400000)] = { date: dayKey(Date.now() - i * 86400000), revenue: 0, orders: 0 };
  valid(inRange).forEach((o) => { const k = dayKey(o.createdAt); if (byDay[k]) { byDay[k].revenue += o.total; byDay[k].orders += 1; } });

  // top products
  const sold = {};
  valid(inRange).forEach((o) => o.items.forEach((i) => { sold[i.productId] = sold[i.productId] || { productId: i.productId, name: i.name, image: i.image, qty: 0, revenue: 0 }; sold[i.productId].qty += i.qty; sold[i.productId].revenue += i.qty * i.price; }));
  const topProducts = Object.values(sold).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // status breakdown
  const statusCounts = {};
  inRange.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  // payment method breakdown
  const payCounts = {};
  valid(inRange).forEach((o) => { payCounts[o.payment.method] = (payCounts[o.payment.method] || 0) + o.total; });

  // category revenue
  const catRev = {};
  valid(inRange).forEach((o) => o.items.forEach((i) => {
    const p = db.products.byId(i.productId);
    const cat = p ? p.category : 'other';
    catRev[cat] = (catRev[cat] || 0) + i.qty * i.price;
  }));
  const categories = db.categories.all();
  const byCategory = Object.entries(catRev).map(([slug, revenue]) => ({ slug, name: (categories.find((c) => c.slug === slug) || {}).name || slug, revenue })).sort((a, b) => b.revenue - a.revenue);

  const lowStock = db.products.find((p) => p.status === 'active').map(withComputed).filter((p) => p.stock <= 8).sort((a, b) => a.stock - b.stock).slice(0, 8)
    .map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.images[0], stock: p.stock }));

  const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : cur ? 100 : 0);
  res.json({
    days,
    kpis: {
      revenue: rev, revenueChange: pct(rev, prevRev),
      orders: valid(inRange).length, ordersChange: pct(valid(inRange).length, valid(prevRange).length),
      aov: valid(inRange).length ? Math.round(rev / valid(inRange).length) : 0,
      aovChange: pct(valid(inRange).length ? rev / valid(inRange).length : 0, valid(prevRange).length ? prevRev / valid(prevRange).length : 0),
      customers: customers.length, newCustomers, newCustomersChange: pct(newCustomers, prevNewCustomers),
      pendingOrders: orders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length,
      pendingReviews: db.reviews.find((r) => r.status === 'pending').length,
      itemsSold: valid(inRange).reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0),
    },
    revenueByDay: Object.values(byDay),
    topProducts,
    statusCounts,
    paymentBreakdown: Object.entries(payCounts).map(([method, revenue]) => ({ method, revenue })),
    byCategory,
    lowStock,
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
  });
});

// ---------------------------------------------------------------- PRODUCTS
router.get('/products', (req, res) => {
  const { q, status, category, gender, stock, sort = 'newest', page, limit = 20 } = req.query;
  let items = db.products.all().map(withComputed);
  if (q) { const t = String(q).toLowerCase(); items = items.filter((p) => p.name.toLowerCase().includes(t) || p.slug.includes(t) || p.id.includes(t)); }
  if (status) items = items.filter((p) => p.status === status);
  if (category) items = items.filter((p) => p.category === category);
  if (gender) items = items.filter((p) => p.gender === gender);
  if (stock === 'low') items = items.filter((p) => p.stock > 0 && p.stock <= 8);
  if (stock === 'out') items = items.filter((p) => p.stock === 0);
  const sorts = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name),
    price: (a, b) => b.price - a.price,
    stock: (a, b) => a.stock - b.stock,
    sold: (a, b) => b.soldCount - a.soldCount,
  };
  items.sort(sorts[sort] || sorts.newest);
  res.json(paginate(items, page, limit));
});

router.get('/products/:id', (req, res) => {
  const p = db.products.byId(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(withComputed(p));
});

function sanitizeProduct(body, existing) {
  const p = { ...(existing || {}), ...body };
  const name = String(p.name || '').trim();
  if (!name) throw Object.assign(new Error('Product name is required.'), { status: 400 });
  if (!(Number(p.price) > 0)) throw Object.assign(new Error('Price must be greater than zero.'), { status: 400 });
  const colors = (Array.isArray(p.colors) && p.colors.length ? p.colors : [{ name: 'Default', hex: '#111111' }]).map((c) => ({ name: String(c.name || '').trim() || 'Default', hex: c.hex || '#111111' }));
  const sizes = (Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['One Size']).map((s) => String(s).trim()).filter(Boolean);
  // rebuild variants, keeping stock for existing combos
  const oldVariants = (existing && existing.variants) || [];
  const provided = Array.isArray(body.variants) ? body.variants : [];
  const variants = [];
  colors.forEach((c) => sizes.forEach((s) => {
    const prov = provided.find((v) => v.color === c.name && v.size === s);
    const old = oldVariants.find((v) => v.color === c.name && v.size === s);
    const stock = prov ? Number(prov.stock) || 0 : old ? old.stock : Number(p.defaultStock) || 0;
    variants.push({ sku: (prov && prov.sku) || (old && old.sku) || `${slugify(name).slice(0, 12).toUpperCase()}-${c.name.slice(0, 3).toUpperCase()}-${s}`.replace(/\s+/g, ''), color: c.name, size: s, stock });
  }));
  let slug = slugify(p.slug || name);
  const clash = db.products.findOne((x) => x.slug === slug && (!existing || x.id !== existing.id));
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  return {
    name,
    slug,
    brand: String(p.brand || 'Briva'),
    gender: ['men', 'women', 'unisex'].includes(p.gender) ? p.gender : 'unisex',
    category: String(p.category || ''),
    collections: Array.isArray(p.collections) ? p.collections : [],
    description: String(p.description || ''),
    details: Array.isArray(p.details) ? p.details.map(String).filter(Boolean) : String(p.details || '').split('\n').map((s) => s.trim()).filter(Boolean),
    materials: String(p.materials || ''),
    care: String(p.care || ''),
    price: Math.round(Number(p.price)),
    compareAtPrice: p.compareAtPrice ? Math.round(Number(p.compareAtPrice)) : null,
    images: (Array.isArray(p.images) ? p.images : String(p.images || '').split('\n')).map((s) => String(s).trim()).filter(Boolean),
    video: p.video ? String(p.video).trim() : null,
    colors,
    sizes,
    sizeType: p.sizeType || 'tops',
    variants,
    tags: (Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',')).map((s) => String(s).trim()).filter(Boolean),
    featured: Boolean(p.featured),
    status: ['active', 'draft', 'archived'].includes(p.status) ? p.status : 'draft',
    rating: existing ? existing.rating : 0,
    reviewCount: existing ? existing.reviewCount : 0,
    soldCount: existing ? existing.soldCount : 0,
  };
}

router.post('/products', (req, res, next) => {
  try {
    const data = sanitizeProduct(req.body);
    if (!data.images.length) data.images = ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=900'];
    const p = db.products.insert(data);
    res.status(201).json(withComputed(p));
  } catch (e) { next(e); }
});

router.put('/products/:id', (req, res, next) => {
  try {
    const existing = db.products.byId(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const data = sanitizeProduct(req.body, existing);
    const p = db.products.update(existing.id, data);
    res.json(withComputed(p));
  } catch (e) { next(e); }
});

/** Quick inline updates (status, featured, price, single variant stock) */
router.patch('/products/:id', (req, res) => {
  const existing = db.products.byId(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  const patch = {};
  const b = req.body || {};
  if (b.status) patch.status = b.status;
  if (b.featured !== undefined) patch.featured = Boolean(b.featured);
  if (b.price) patch.price = Math.round(Number(b.price));
  if (b.compareAtPrice !== undefined) patch.compareAtPrice = b.compareAtPrice ? Math.round(Number(b.compareAtPrice)) : null;
  if (b.variantStock) {
    patch.variants = existing.variants.map((v) => (v.sku === b.variantStock.sku ? { ...v, stock: Math.max(0, Number(b.variantStock.stock) || 0) } : v));
  }
  if (b.setAllStock !== undefined) patch.variants = existing.variants.map((v) => ({ ...v, stock: Math.max(0, Number(b.setAllStock) || 0) }));
  res.json(withComputed(db.products.update(existing.id, patch)));
});

router.delete('/products/:id', (req, res) => {
  if (!db.products.remove(req.params.id)) return res.status(404).json({ error: 'Product not found' });
  db.reviews.find((r) => r.productId === req.params.id).forEach((r) => db.reviews.remove(r.id));
  res.json({ ok: true });
});

router.post('/products/bulk', (req, res) => {
  const { ids = [], action, value } = req.body || {};
  let n = 0;
  ids.forEach((id) => {
    const p = db.products.byId(id);
    if (!p) return;
    if (action === 'delete') { db.products.remove(id); n += 1; }
    else if (action === 'status') { db.products.update(id, { status: value }); n += 1; }
    else if (action === 'featured') { db.products.update(id, { featured: Boolean(value) }); n += 1; }
    else if (action === 'collection') { db.products.update(id, { collections: [...new Set([...(p.collections || []), value])] }); n += 1; }
  });
  res.json({ ok: true, affected: n });
});

// ---------------------------------------------------------------- ORDERS
router.get('/orders', (req, res) => {
  const { q, status, payment, method, page, limit = 20, from, to } = req.query;
  let items = db.orders.all();
  if (q) { const t = String(q).toLowerCase(); items = items.filter((o) => o.number.toLowerCase().includes(t) || o.customer.name.toLowerCase().includes(t) || (o.customer.email || '').includes(t) || (o.customer.phone || '').includes(t)); }
  if (status) items = items.filter((o) => o.status === status);
  if (payment) items = items.filter((o) => o.payment.status === payment);
  if (method) items = items.filter((o) => o.payment.method === method);
  if (from) items = items.filter((o) => new Date(o.createdAt) >= new Date(from));
  if (to) items = items.filter((o) => new Date(o.createdAt) <= new Date(`${to}T23:59:59`));
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const counts = {};
  db.orders.all().forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  res.json({ ...paginate(items, page, limit), counts });
});

router.get('/orders/:id', (req, res) => {
  const o = db.orders.byId(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const customer = o.userId ? publicUser(db.users.byId(o.userId)) : null;
  const history = o.userId ? db.orders.find((x) => x.userId === o.userId).length : 1;
  res.json({ order: o, customer, customerOrderCount: history });
});

router.put('/orders/:id/status', (req, res) => {
  const o = db.orders.byId(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const { status, note } = req.body || {};
  if (![...STATUS_FLOW, 'cancelled', 'refunded'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const patch = { status, timeline: [...o.timeline, { status, at: new Date().toISOString(), note: note || '', by: req.user.name }] };
  if (status === 'delivered' && o.payment.method === 'cod') patch.payment = { ...o.payment, status: 'paid' };
  if (status === 'cancelled' || status === 'refunded') {
    for (const l of o.items) {
      const p = db.products.byId(l.productId);
      if (!p) continue;
      db.products.update(p.id, { variants: p.variants.map((v) => (v.sku === l.sku ? { ...v, stock: v.stock + l.qty } : v)) });
    }
    patch.payment = { ...o.payment, status: status === 'refunded' ? 'refunded' : o.payment.status === 'paid' ? 'refund_pending' : 'cancelled' };
  }
  res.json({ order: db.orders.update(o.id, patch) });
});

router.put('/orders/:id/payment', (req, res) => {
  const o = db.orders.byId(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const { status, reference } = req.body || {};
  res.json({ order: db.orders.update(o.id, { payment: { ...o.payment, status: status || o.payment.status, reference: reference || o.payment.reference } }) });
});

router.post('/orders/:id/notes', (req, res) => {
  const o = db.orders.byId(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const text = String((req.body && req.body.text) || '').trim();
  if (!text) return res.status(400).json({ error: 'Note cannot be empty' });
  res.json({ order: db.orders.update(o.id, { notes: [...(o.notes || []), { id: db.uid('n'), text, by: req.user.name, at: new Date().toISOString() }] }) });
});

// ---------------------------------------------------------------- CUSTOMERS
router.get('/customers', (req, res) => {
  const { q, page, limit = 20, sort = 'newest' } = req.query;
  let items = db.users.find((u) => u.role !== 'admin').map((u) => {
    const orders = db.orders.find((o) => o.userId === u.id && o.status !== 'cancelled');
    return { ...publicUser(u), orderCount: orders.length, totalSpent: orders.reduce((s, o) => s + o.total, 0), lastOrderAt: orders.length ? orders.map((o) => o.createdAt).sort().slice(-1)[0] : null };
  });
  if (q) { const t = String(q).toLowerCase(); items = items.filter((u) => u.name.toLowerCase().includes(t) || u.email.includes(t) || (u.phone || '').includes(t)); }
  const sorts = { newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), spent: (a, b) => b.totalSpent - a.totalSpent, orders: (a, b) => b.orderCount - a.orderCount, name: (a, b) => a.name.localeCompare(b.name) };
  items.sort(sorts[sort] || sorts.newest);
  res.json(paginate(items, page, limit));
});

router.get('/customers/:id', (req, res) => {
  const u = db.users.byId(req.params.id);
  if (!u) return res.status(404).json({ error: 'Customer not found' });
  const orders = db.orders.find((o) => o.userId === u.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ customer: publicUser(u), orders, wishlist: (u.wishlist || []).map((id) => db.products.byId(id)).filter(Boolean).map((p) => ({ id: p.id, name: p.name, slug: p.slug, image: p.images[0], price: p.price })) });
});

router.put('/customers/:id', (req, res) => {
  const u = db.users.byId(req.params.id);
  if (!u) return res.status(404).json({ error: 'Customer not found' });
  const { name, phone, role, password } = req.body || {};
  const patch = {};
  if (name) patch.name = name;
  if (phone !== undefined) patch.phone = phone;
  if (role && ['customer', 'admin'].includes(role) && u.id !== req.user.id) patch.role = role;
  if (password) patch.passwordHash = hash(password);
  res.json({ customer: publicUser(db.users.update(u.id, patch)) });
});

router.delete('/customers/:id', (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  if (!db.users.remove(req.params.id)) return res.status(404).json({ error: 'Customer not found' });
  res.json({ ok: true });
});

// ---------------------------------------------------------------- REVIEWS
router.get('/reviews', (req, res) => {
  const { status, page, limit = 20 } = req.query;
  let items = db.reviews.all();
  if (status) items = items.filter((r) => r.status === status);
  items = items.map((r) => { const p = db.products.byId(r.productId); return { ...r, product: p ? { id: p.id, name: p.name, slug: p.slug, image: p.images[0] } : null }; });
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(paginate(items, page, limit));
});

router.put('/reviews/:id', (req, res) => {
  const r = db.reviews.byId(req.params.id);
  if (!r) return res.status(404).json({ error: 'Review not found' });
  const { status, reply } = req.body || {};
  const patch = {};
  if (status) patch.status = status;
  if (reply !== undefined) patch.reply = reply ? { text: reply, by: req.user.name, at: new Date().toISOString() } : null;
  const updated = db.reviews.update(r.id, patch);
  recomputeRating(r.productId);
  res.json(updated);
});

router.delete('/reviews/:id', (req, res) => {
  const r = db.reviews.byId(req.params.id);
  if (!r) return res.status(404).json({ error: 'Review not found' });
  db.reviews.remove(r.id);
  recomputeRating(r.productId);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- PROMOS
router.get('/promos', (req, res) => res.json(db.promos.all()));
router.post('/promos', (req, res) => {
  const b = req.body || {};
  const code = String(b.code || '').toUpperCase().replace(/\s+/g, '');
  if (!code) return res.status(400).json({ error: 'Code is required' });
  if (db.promos.findOne((p) => p.code === code)) return res.status(409).json({ error: 'That code already exists' });
  res.status(201).json(db.promos.insert({ code, type: b.type || 'percent', value: Number(b.value) || 0, minSubtotal: Number(b.minSubtotal) || 0, usageLimit: b.usageLimit ? Number(b.usageLimit) : null, used: 0, active: b.active !== false, expiresAt: b.expiresAt || null, description: b.description || '' }));
});
router.put('/promos/:id', (req, res) => {
  const p = db.promos.byId(req.params.id);
  if (!p) return res.status(404).json({ error: 'Promo not found' });
  const b = req.body || {};
  res.json(db.promos.update(p.id, { ...b, code: b.code ? String(b.code).toUpperCase().replace(/\s+/g, '') : p.code, value: b.value !== undefined ? Number(b.value) : p.value, minSubtotal: b.minSubtotal !== undefined ? Number(b.minSubtotal) : p.minSubtotal, usageLimit: b.usageLimit === '' || b.usageLimit === null ? null : b.usageLimit !== undefined ? Number(b.usageLimit) : p.usageLimit }));
});
router.delete('/promos/:id', (req, res) => { db.promos.remove(req.params.id); res.json({ ok: true }); });

// ---------------------------------------------------------------- CATEGORIES & COLLECTIONS
router.get('/categories', (req, res) => res.json(db.categories.all().sort((a, b) => a.order - b.order)));
router.post('/categories', (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: 'Name is required' });
  const slug = slugify(b.slug || `${b.gender || ''}-${b.name}`);
  if (db.categories.findOne((c) => c.slug === slug)) return res.status(409).json({ error: 'Slug already exists' });
  res.status(201).json(db.categories.insert({ name: b.name, slug, gender: b.gender || 'unisex', image: b.image || '', order: Number(b.order) || 99 }));
});
router.put('/categories/:id', (req, res) => {
  const c = db.categories.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const updated = db.categories.update(c.id, { name: b.name || c.name, gender: b.gender || c.gender, image: b.image !== undefined ? b.image : c.image, order: b.order !== undefined ? Number(b.order) : c.order });
  res.json(updated);
});
router.delete('/categories/:id', (req, res) => {
  const c = db.categories.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (db.products.findOne((p) => p.category === c.slug)) return res.status(400).json({ error: 'Move products out of this category first.' });
  db.categories.remove(c.id);
  res.json({ ok: true });
});

router.get('/collections', (req, res) => res.json(db.collections.all()));
router.post('/collections', (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: 'Name is required' });
  const slug = slugify(b.slug || b.name);
  if (db.collections.findOne((c) => c.slug === slug)) return res.status(409).json({ error: 'Slug already exists' });
  res.status(201).json(db.collections.insert({ name: b.name, slug, description: b.description || '', image: b.image || '', featured: Boolean(b.featured) }));
});
router.put('/collections/:id', (req, res) => {
  const c = db.collections.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  res.json(db.collections.update(c.id, { name: b.name || c.name, description: b.description !== undefined ? b.description : c.description, image: b.image !== undefined ? b.image : c.image, featured: b.featured !== undefined ? Boolean(b.featured) : c.featured }));
});
router.delete('/collections/:id', (req, res) => {
  const c = db.collections.byId(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  db.products.find((p) => p.collections.includes(c.slug)).forEach((p) => db.products.update(p.id, { collections: p.collections.filter((s) => s !== c.slug) }));
  db.collections.remove(c.id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- CONTENT & SETTINGS
router.get('/content', (req, res) => res.json(db.content.get()));
router.put('/content', (req, res) => res.json(db.content.set(req.body || {})));
router.get('/settings', (req, res) => res.json(db.settings.get()));
router.put('/settings', (req, res) => {
  const b = req.body || {};
  const current = db.settings.get();
  res.json(db.settings.set({
    store: { ...current.store, ...(b.store || {}) },
    delivery: b.delivery ? { ...current.delivery, ...b.delivery } : current.delivery,
    payments: Array.isArray(b.payments) ? b.payments : current.payments,
  }));
});

// ---------------------------------------------------------------- SUBSCRIBERS & MESSAGES
router.get('/subscribers', (req, res) => res.json(db.subscribers.all().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
router.delete('/subscribers/:id', (req, res) => { db.subscribers.remove(req.params.id); res.json({ ok: true }); });
router.get('/messages', (req, res) => res.json((db.content.get().messages || []).slice().reverse()));
router.put('/messages/:id', (req, res) => {
  const messages = (db.content.get().messages || []).map((m) => (m.id === req.params.id ? { ...m, read: true } : m));
  db.content.set({ messages });
  res.json({ ok: true });
});

// ---------------------------------------------------------------- DEMO RESET
router.post('/reset-demo', async (req, res) => {
  await db.reset();
  res.json({ ok: true, message: 'Demo data restored.' });
});

module.exports = router;

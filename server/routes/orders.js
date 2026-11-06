const router = require('express').Router();
const db = require('../lib/store');
const { requireAuth } = require('../lib/auth');

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function applyPromo(code, subtotal, deliveryFee) {
  if (!code) return { discount: 0, deliveryFee, promo: null, error: null };
  const promo = db.promos.findOne((p) => p.code.toUpperCase() === String(code).toUpperCase());
  if (!promo || !promo.active) return { discount: 0, deliveryFee, promo: null, error: 'This promo code is not valid.' };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { discount: 0, deliveryFee, promo: null, error: 'This promo code has expired.' };
  if (promo.usageLimit && promo.used >= promo.usageLimit) return { discount: 0, deliveryFee, promo: null, error: 'This promo code has reached its usage limit.' };
  if (subtotal < (promo.minSubtotal || 0)) {
    return { discount: 0, deliveryFee, promo: null, error: `Minimum order of ${promo.minSubtotal.toLocaleString()} RWF required for this code.` };
  }
  if (promo.type === 'percent') return { discount: Math.round(subtotal * promo.value / 100), deliveryFee, promo, error: null };
  if (promo.type === 'fixed') return { discount: Math.min(subtotal, promo.value), deliveryFee, promo, error: null };
  if (promo.type === 'free_delivery') return { discount: 0, deliveryFee: 0, promo, error: null };
  return { discount: 0, deliveryFee, promo: null, error: 'Unknown promo type' };
}

/** Price a cart server-side: validates items, stock, delivery, promo. */
function quote({ items = [], deliveryMethod, promoCode }) {
  const settings = db.settings.get();
  const errors = [];
  const lines = [];
  for (const it of items) {
    const p = db.products.byId(it.productId);
    if (!p || p.status !== 'active') { errors.push(`${it.name || 'An item'} is no longer available.`); continue; }
    const variant = p.variants.find((v) => v.color === it.color && v.size === it.size);
    if (!variant) { errors.push(`${p.name}: selected size/colour is unavailable.`); continue; }
    const qty = Math.max(1, Math.min(10, Number(it.qty) || 1));
    if (variant.stock < qty) { errors.push(`${p.name} (${it.color}, ${it.size}): only ${variant.stock} left in stock.`); continue; }
    lines.push({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], color: it.color, size: it.size, price: p.price, qty, sku: variant.sku });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const zone = settings.delivery.zones.find((z) => z.id === deliveryMethod && z.active) || settings.delivery.zones[0];
  let deliveryFee = zone.fee;
  if (zone.id !== 'pickup' && zone.id !== 'upcountry' && subtotal >= settings.delivery.freeThreshold) deliveryFee = 0;
  const promoResult = applyPromo(promoCode, subtotal, deliveryFee);
  const total = Math.max(0, subtotal - promoResult.discount + promoResult.deliveryFee);
  return {
    lines, subtotal, deliveryFee: promoResult.deliveryFee, discount: promoResult.discount, total, zone,
    promo: promoResult.promo ? { code: promoResult.promo.code, description: promoResult.promo.description } : null,
    promoError: promoResult.error, errors,
    freeThreshold: settings.delivery.freeThreshold,
  };
}

/** POST /api/orders/quote - price the cart (used by cart drawer + checkout) */
router.post('/quote', (req, res) => {
  res.json(quote(req.body || {}));
});

/** POST /api/orders - place an order */
router.post('/', (req, res) => {
  const body = req.body || {};
  const q = quote(body);
  if (q.errors.length) return res.status(400).json({ error: q.errors[0], errors: q.errors });
  if (!q.lines.length) return res.status(400).json({ error: 'Your cart is empty.' });
  if (body.promoCode && q.promoError) return res.status(400).json({ error: q.promoError });

  const customer = body.customer || {};
  if (!customer.name || !customer.phone) return res.status(400).json({ error: 'Name and phone number are required.' });
  const needsAddress = q.zone.id !== 'pickup';
  const address = body.address || {};
  if (needsAddress && (!address.line1 || !address.district)) return res.status(400).json({ error: 'Please enter a delivery address and district.' });

  const settings = db.settings.get();
  const payment = settings.payments.find((p) => p.id === body.paymentMethod && p.active);
  if (!payment) return res.status(400).json({ error: 'Please choose a payment method.' });
  if (payment.id === 'cod' && q.zone.id === 'upcountry') return res.status(400).json({ error: 'Cash on delivery is only available in Kigali.' });

  // decrement stock
  for (const l of q.lines) {
    const p = db.products.byId(l.productId);
    const variants = p.variants.map((v) => (v.sku === l.sku ? { ...v, stock: v.stock - l.qty } : v));
    db.products.update(p.id, { variants, soldCount: (p.soldCount || 0) + l.qty });
  }
  if (q.promo) {
    const promo = db.promos.findOne((p) => p.code === q.promo.code);
    db.promos.update(promo.id, { used: (promo.used || 0) + 1 });
  }

  const seq = (settings.orderSeq || 0) + 1;
  db.settings.set({ orderSeq: seq });
  const now = new Date().toISOString();
  const paymentStatus = payment.id === 'cod' ? 'pending' : 'paid'; // demo: online payments are simulated as successful
  const order = db.orders.insert({
    number: `BRV-${10000 + seq}`,
    userId: req.user ? req.user.id : null,
    customer: { name: String(customer.name).trim(), email: String(customer.email || '').trim().toLowerCase(), phone: String(customer.phone).trim() },
    items: q.lines,
    subtotal: q.subtotal,
    discount: q.discount,
    deliveryFee: q.deliveryFee,
    total: q.total,
    promoCode: q.promo ? q.promo.code : null,
    delivery: {
      method: q.zone.id,
      methodName: q.zone.name,
      eta: q.zone.eta,
      address: needsAddress ? { line1: address.line1, sector: address.sector || '', district: address.district, city: address.city || 'Kigali' } : null,
      instructions: body.instructions || '',
    },
    payment: {
      method: payment.id,
      methodName: payment.name,
      status: paymentStatus,
      reference: `${payment.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      phone: body.paymentPhone || customer.phone,
    },
    status: 'pending',
    timeline: [{ status: 'pending', at: now, note: 'Order placed' }],
    notes: [],
  });

  // save address to the account for next time
  if (req.user && needsAddress && body.saveAddress) {
    const addresses = [...(req.user.addresses || [])];
    if (!addresses.some((a) => a.line1 === address.line1 && a.district === address.district)) {
      addresses.push({ id: db.uid('a'), label: 'Home', ...order.delivery.address, phone: customer.phone, default: addresses.length === 0 });
      db.users.update(req.user.id, { addresses });
    }
  }
  res.status(201).json({ order });
});

/** GET /api/orders/mine - the signed-in customer's orders */
router.get('/mine', requireAuth, (req, res) => {
  const orders = db.orders.find((o) => o.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

/** GET /api/orders/track?number=BRV-10001&phone=... - public tracking */
router.get('/track', (req, res) => {
  const number = String(req.query.number || '').trim().toUpperCase();
  const contact = String(req.query.contact || '').trim().toLowerCase().replace(/\s+/g, '');
  const order = db.orders.findOne((o) => o.number.toUpperCase() === number);
  if (!order) return res.status(404).json({ error: 'We could not find an order with that number.' });
  const phone = (order.customer.phone || '').replace(/\s+/g, '').toLowerCase();
  const email = (order.customer.email || '').toLowerCase();
  const match = contact && (email === contact || phone.endsWith(contact.replace(/^\+?250/, '').replace(/^0/, '')) || phone === contact);
  if (!match && !(req.user && (req.user.id === order.userId || req.user.role === 'admin'))) {
    return res.status(403).json({ error: 'The phone number or email does not match this order.' });
  }
  res.json({ order });
});

/** GET /api/orders/:id - customer can view own order; guests via number+contact handled by /track */
router.get('/:id', (req, res) => {
  const order = db.orders.byId(req.params.id) || db.orders.findOne((o) => o.number === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const owner = req.user && (req.user.id === order.userId || req.user.role === 'admin');
  // guests may view the order right after placing it using the token-less id (ids are unguessable)
  if (!owner && order.userId && !req.query.guest) return res.status(403).json({ error: 'Please sign in to view this order.' });
  res.json({ order });
});

/** POST /api/orders/:id/cancel - customer cancels a pending order */
router.post('/:id/cancel', requireAuth, (req, res) => {
  const order = db.orders.byId(req.params.id);
  if (!order || order.userId !== req.user.id) return res.status(404).json({ error: 'Order not found' });
  if (!['pending', 'confirmed'].includes(order.status)) return res.status(400).json({ error: 'This order can no longer be cancelled. Please contact us on WhatsApp.' });
  // restore stock
  for (const l of order.items) {
    const p = db.products.byId(l.productId);
    if (!p) continue;
    const variants = p.variants.map((v) => (v.sku === l.sku ? { ...v, stock: v.stock + l.qty } : v));
    db.products.update(p.id, { variants });
  }
  const updated = db.orders.update(order.id, {
    status: 'cancelled',
    payment: { ...order.payment, status: order.payment.status === 'paid' ? 'refund_pending' : 'cancelled' },
    timeline: [...order.timeline, { status: 'cancelled', at: new Date().toISOString(), note: 'Cancelled by customer' }],
  });
  res.json({ order: updated });
});

module.exports = router;
module.exports.STATUS_FLOW = STATUS_FLOW;
module.exports.quote = quote;

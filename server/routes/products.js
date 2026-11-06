const router = require('express').Router();
const db = require('../lib/store');
const { paginate, withComputed } = require('../lib/utils');

const SORTS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount,
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'best-selling': (a, b) => b.soldCount - a.soldCount,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

function parseList(v) {
  if (!v) return [];
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
}

/** GET /api/products - list with filters */
router.get('/', (req, res) => {
  const q = req.query;
  let items = db.products.find((p) => p.status === 'active').map(withComputed);

  if (q.gender) items = items.filter((p) => p.gender === q.gender || p.gender === 'unisex');
  const cats = parseList(q.category);
  if (cats.length) items = items.filter((p) => cats.includes(p.category));
  const cols = parseList(q.collection);
  if (cols.length) items = items.filter((p) => p.collections.some((c) => cols.includes(c)));
  const sizes = parseList(q.size);
  if (sizes.length) items = items.filter((p) => p.variants.some((v) => sizes.includes(v.size) && v.stock > 0));
  const colors = parseList(q.color).map((c) => c.toLowerCase());
  if (colors.length) items = items.filter((p) => p.colors.some((c) => colors.includes(c.name.toLowerCase())));
  if (q.minPrice) items = items.filter((p) => p.price >= Number(q.minPrice));
  if (q.maxPrice) items = items.filter((p) => p.price <= Number(q.maxPrice));
  if (q.onSale === 'true') items = items.filter((p) => p.discount > 0);
  if (q.inStock === 'true') items = items.filter((p) => p.inStock);
  if (q.featured === 'true') items = items.filter((p) => p.featured);
  if (q.tag) items = items.filter((p) => p.tags.includes(q.tag));
  if (q.ids) {
    const ids = parseList(q.ids);
    items = items.filter((p) => ids.includes(p.id));
  }
  if (q.q) {
    const term = String(q.q).toLowerCase();
    const words = term.split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = `${p.name} ${p.description} ${p.category} ${p.gender} ${p.tags.join(' ')} ${p.colors.map((c) => c.name).join(' ')} ${p.brand}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }

  const sort = SORTS[q.sort] || SORTS.featured;
  items.sort(sort);

  // facets computed from the filtered set (before pagination)
  const facets = {
    sizes: [...new Set(items.flatMap((p) => p.sizes))],
    colors: [...new Map(items.flatMap((p) => p.colors).map((c) => [c.name, c])).values()],
    categories: [...new Set(items.map((p) => p.category))],
    priceRange: items.length ? [Math.min(...items.map((p) => p.price)), Math.max(...items.map((p) => p.price))] : [0, 0],
  };

  const page = paginate(items, q.page, q.limit);
  res.json({ ...page, facets });
});

/** GET /api/products/suggest?q= - quick search suggestions */
router.get('/suggest', (req, res) => {
  const term = String(req.query.q || '').toLowerCase().trim();
  if (!term) return res.json({ products: [], categories: [] });
  const products = db.products
    .find((p) => p.status === 'active' && `${p.name} ${p.tags.join(' ')}`.toLowerCase().includes(term))
    .slice(0, 6)
    .map((p) => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0], gender: p.gender }));
  const categories = db.categories.find((c) => c.name.toLowerCase().includes(term)).slice(0, 4);
  res.json({ products, categories });
});

/** GET /api/products/:slug */
router.get('/:slug', (req, res) => {
  const p = db.products.findOne((x) => x.slug === req.params.slug || x.id === req.params.slug);
  if (!p || (p.status !== 'active' && (!req.user || req.user.role !== 'admin'))) return res.status(404).json({ error: 'Product not found' });
  const product = withComputed(p);
  const reviews = db.reviews.find((r) => r.productId === p.id && r.status === 'approved').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const related = db.products
    .find((x) => x.id !== p.id && x.status === 'active' && (x.category === p.category || x.collections.some((c) => p.collections.includes(c))))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 8)
    .map(withComputed);
  const category = db.categories.findOne((c) => c.slug === p.category) || null;
  res.json({ product, reviews, related, category });
});

module.exports = router;

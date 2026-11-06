function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function paginate(items, page = 1, limit = 24) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(96, Math.max(1, parseInt(limit, 10) || 24));
  const start = (p - 1) * l;
  return {
    items: items.slice(start, start + l),
    page: p,
    limit: l,
    total: items.length,
    pages: Math.max(1, Math.ceil(items.length / l)),
  };
}

function productStock(p) {
  return (p.variants || []).reduce((n, v) => n + (Number(v.stock) || 0), 0);
}

function withComputed(p) {
  const stock = productStock(p);
  const discount = p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round((1 - p.price / p.compareAtPrice) * 100)
    : 0;
  return { ...p, stock, inStock: stock > 0, discount };
}

function orderNumber(seq) {
  return `BRV-${String(10000 + seq)}`;
}

/** Simple error wrapper for async handlers */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { slugify, paginate, productStock, withComputed, orderNumber, wrap };

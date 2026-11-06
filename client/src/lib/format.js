export function money(n, { compact = false } = {}) {
  const v = Number(n) || 0;
  if (compact && Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M RWF`;
  if (compact && Math.abs(v) >= 1000) return `${Math.round(v / 1000)}K RWF`;
  return `${v.toLocaleString('en-US')} RWF`;
}

export function date(d, opts = {}) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

export function dateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date(d);
}

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-800 border-sky-200',
  processing: 'bg-violet-50 text-violet-800 border-violet-200',
  shipped: 'bg-blue-50 text-blue-800 border-blue-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  refunded: 'bg-ink-100 text-ink-700 border-ink-200',
  paid: 'bg-green-50 text-green-800 border-green-200',
  refund_pending: 'bg-amber-50 text-amber-800 border-amber-200',
  active: 'bg-green-50 text-green-800 border-green-200',
  draft: 'bg-ink-100 text-ink-700 border-ink-200',
  archived: 'bg-red-50 text-red-800 border-red-200',
  approved: 'bg-green-50 text-green-800 border-green-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
};

export const PAYMENT_LABELS = { momo: 'MTN MoMo', airtel: 'Airtel Money', card: 'Card', cod: 'Cash on delivery' };

export function imgUrl(url, w) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    const u = new URL(url);
    if (w) u.searchParams.set('w', String(w));
    return u.toString();
  }
  return url;
}

export function clsx(...args) {
  return args.flat().filter(Boolean).join(' ');
}

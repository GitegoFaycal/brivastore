import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Plus } from 'lucide-react';
import { money, imgUrl, clsx } from '../../lib/format';
import { Badge, Stars } from '../ui';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

function isNew(p) {
  return p.tags?.includes('new') || (Date.now() - new Date(p.createdAt).getTime()) < 14 * 86400000;
}

export default function ProductCard({ product: p, onQuickView, compact }) {
  const wishlist = useWishlist();
  const cart = useCart();
  const toast = useToast();
  const [hover, setHover] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const leaveTimer = useRef(null);
  const liked = wishlist.has(p.id);
  const onEnter = () => { clearTimeout(leaveTimer.current); setHover(true); };
  // Closing the size picker on a delay keeps it open when the DOM under the cursor changes (button -> panel)
  const onLeave = () => { setHover(false); clearTimeout(leaveTimer.current); leaveTimer.current = setTimeout(() => setSizeOpen(false), 800); };
  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  const inStockSizes = p.sizes.filter((s) => p.variants.some((v) => v.size === s && v.stock > 0));
  const quickAdd = (size) => {
    const color = p.colors.find((c) => p.variants.some((v) => v.color === c.name && v.size === size && v.stock > 0))?.name || p.colors[0].name;
    cart.add(p, { color, size, qty: 1 });
    toast.success(`${p.name} (${size}) added to bag`);
    setSizeOpen(false);
  };

  return (
    <div className="group relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-200">
        <Link to={`/products/${p.slug}`} aria-label={p.name}>
          <img src={imgUrl(p.images[0], 600)} alt={p.name} loading="lazy" className={clsx('h-full w-full object-cover transition duration-700', hover && p.images[1] ? 'opacity-0' : 'opacity-100 group-hover:scale-105')} />
          {p.images[1] && (
            <img src={imgUrl(p.images[1], 600)} alt="" loading="lazy" className={clsx('absolute inset-0 h-full w-full object-cover transition duration-700', hover ? 'opacity-100 scale-105' : 'opacity-0')} />
          )}
        </Link>
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {p.discount > 0 && <Badge tone="sale">-{p.discount}%</Badge>}
          {isNew(p) && <Badge>New</Badge>}
          {!p.inStock && <Badge tone="light">Sold out</Badge>}
          {p.inStock && p.stock <= 5 && <Badge tone="brass">Only {p.stock} left</Badge>}
        </div>
        <button
          onClick={() => { wishlist.toggle(p.id); toast.info(liked ? 'Removed from wishlist' : 'Saved to wishlist'); }}
          className={clsx('absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow-sm transition hover:bg-white', liked ? 'text-brick' : 'text-ink-600')}
          aria-label="Wishlist"
        >
          <Heart size={16} className={liked ? 'fill-brick' : ''} />
        </button>

        {/* Quick actions */}
        {!compact && (
          <div className={clsx('absolute inset-x-2.5 bottom-2.5 flex flex-col gap-1.5 transition', hover || sizeOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 lg:opacity-0', 'max-lg:translate-y-0 max-lg:opacity-100')}>
            {sizeOpen ? (
              <div className="rounded-lg bg-white/95 p-2 shadow-lift backdrop-blur">
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-ink-500">Select size</p>
                <div className="flex flex-wrap gap-1">
                  {p.sizes.map((s) => {
                    const ok = inStockSizes.includes(s);
                    return (
                      <button key={s} disabled={!ok} onClick={() => quickAdd(s)} className={clsx('min-w-[2.2rem] rounded-md border px-2 py-1 text-xs font-semibold', ok ? 'border-ink-200 hover:border-ink hover:bg-ink hover:text-white' : 'border-ink-100 text-ink-300 line-through')}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button disabled={!p.inStock} onClick={() => setSizeOpen(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lift hover:bg-ink-700 disabled:opacity-50">
                  <Plus size={14} /> Quick add
                </button>
                {onQuickView && (
                  <button onClick={() => onQuickView(p)} className="rounded-lg bg-white px-3 py-2.5 text-ink shadow-lift hover:bg-cream-200" aria-label="Quick view"><Eye size={16} /></button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${p.slug}`} className="line-clamp-2 text-sm font-semibold leading-snug hover:underline">{p.name}</Link>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={clsx('font-bold', p.discount > 0 && 'text-brick')}>{money(p.price)}</span>
          {p.compareAtPrice > p.price && <span className="text-ink-400 line-through">{money(p.compareAtPrice)}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {p.colors.slice(0, 5).map((c) => (
              <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-ink-200" style={{ background: c.hex }} />
            ))}
            {p.colors.length > 5 && <span className="text-[10px] text-ink-400">+{p.colors.length - 5}</span>}
          </div>
          {p.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-ink-500"><Stars value={p.rating} size={11} /> ({p.reviewCount})</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/4] rounded-xl" />
      <div className="skeleton mt-3 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/3" />
    </div>
  );
}

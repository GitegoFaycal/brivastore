import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Modal, Stars, QtyInput, Badge } from '../ui';
import { ColorSwatches, SizeSelector } from './VariantPicker';
import { money, imgUrl, clsx } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export default function QuickView({ product: p, onClose }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);

  useEffect(() => {
    if (!p) return;
    setColor(p.colors[0]?.name || 'Default');
    setSize(p.sizes.length === 1 ? p.sizes[0] : '');
    setQty(1);
    setImg(0);
  }, [p]);

  if (!p) return null;
  const variant = p.variants.find((v) => v.color === color && v.size === size);
  const canAdd = variant && variant.stock > 0;

  const add = () => {
    if (!size) { toast.error('Please select a size'); return; }
    cart.add(p, { color, size, qty });
    toast.success(`${p.name} added to bag`);
    onClose();
  };

  return (
    <Modal open={Boolean(p)} onClose={onClose} size="lg">
      <div className="grid md:grid-cols-2">
        <div className="relative bg-cream-200">
          <img src={imgUrl(p.images[img], 900)} alt={p.name} className="aspect-[3/4] w-full object-cover md:h-full" />
          {p.images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} className={clsx('h-12 w-9 overflow-hidden rounded border-2', i === img ? 'border-ink' : 'border-white/70')}><img src={imgUrl(src, 120)} alt="" className="h-full w-full object-cover" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <div className="mb-2 flex gap-1.5">{p.discount > 0 && <Badge tone="sale">-{p.discount}%</Badge>}{p.featured && <Badge tone="brass">Best seller</Badge>}</div>
            <h3 className="font-display text-3xl">{p.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-ink-500"><Stars value={p.rating} /> {p.reviewCount} reviews</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={clsx('text-xl font-bold', p.discount > 0 && 'text-brick')}>{money(p.price)}</span>
              {p.compareAtPrice > p.price && <span className="text-sm text-ink-400 line-through">{money(p.compareAtPrice)}</span>}
            </div>
          </div>
          <p className="text-sm text-ink-600 line-clamp-2">{p.description}</p>
          <ColorSwatches product={p} value={color} onChange={(c) => { setColor(c); setSize(''); }} />
          <SizeSelector product={p} color={color} value={size} onChange={setSize} />
          <div className="flex items-center gap-3">
            <QtyInput value={qty} onChange={setQty} />
            <button onClick={add} disabled={size && !canAdd} className="btn-primary flex-1"><ShoppingBag size={16} /> {size && !canAdd ? 'Out of stock' : 'Add to bag'}</button>
            <button onClick={() => wishlist.toggle(p.id)} className={clsx('rounded-full border border-ink-200 p-3 hover:border-ink', wishlist.has(p.id) && 'text-brick')} aria-label="Wishlist"><Heart size={18} className={wishlist.has(p.id) ? 'fill-brick' : ''} /></button>
          </div>
          <Link to={`/products/${p.slug}`} onClick={onClose} className="text-center text-sm font-semibold underline underline-offset-4">View full details</Link>
        </div>
      </div>
    </Modal>
  );
}

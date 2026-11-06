import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useTitle, useFetch } from '../lib/hooks';
import { api } from '../lib/api';
import { money, imgUrl } from '../lib/format';
import { QtyInput, EmptyState, SectionHeader } from '../components/ui';
import { FreeDeliveryBar } from '../components/layout/CartDrawer';
import { ProductRow } from '../components/product/ProductGrid';

export default function Cart() {
  useTitle('Your bag');
  const cart = useCart();
  const { delivery } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState(cart.promoCode || '');
  const { data: suggestions } = useFetch('/products?collection=best-sellers&limit=4');

  const applyPromo = async (e) => {
    e.preventDefault();
    if (!code.trim()) { cart.setPromo(''); return; }
    try {
      const d = await api.post('/promo/validate', { code: code.trim(), subtotal: cart.subtotal });
      cart.setPromo(d.code);
      toast.success(`${d.code} applied: ${d.description}`);
    } catch (err) { toast.error(err.message); }
  };

  if (!cart.items.length) {
    return (
      <div className="container-x">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" body="Add a suit, a tee or a pair of sneakers and come back." action="Shop now" actionTo="/shop" />
        {suggestions?.items && <section className="pb-10"><SectionHeader eyebrow="Popular" title="Start with a best seller" /><ProductRow products={suggestions.items} /></section>}
      </div>
    );
  }
  const q = cart.quote;

  return (
    <div className="container-x py-8">
      <h1 className="h-display text-5xl">Your bag <span className="text-ink-400">({cart.count})</span></h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <FreeDeliveryBar subtotal={cart.subtotal} threshold={delivery.freeThreshold} />
          <ul className="mt-4 divide-y divide-ink-100 border-y border-ink-100">
            {cart.items.map((item) => {
              const err = q?.errors?.find((e) => e.startsWith(item.name));
              return (
                <li key={cart.keyOf(item)} className="flex gap-4 py-5 sm:gap-6">
                  <Link to={`/products/${item.slug}`}><img src={imgUrl(item.image, 300)} alt="" className="h-36 w-28 rounded-xl object-cover" /></Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/products/${item.slug}`} className="font-semibold hover:underline">{item.name}</Link>
                        <p className="mt-0.5 text-sm text-ink-500">{item.color} · Size {item.size}</p>
                        <p className="mt-1 text-sm font-bold sm:hidden">{money(item.price)}</p>
                      </div>
                      <p className="hidden text-sm font-bold sm:block">{money(item.price)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-4">
                        <QtyInput value={item.qty} onChange={(n) => cart.setQty(item, n)} />
                        <button onClick={() => cart.remove(item)} className="flex items-center gap-1 text-xs text-ink-500 hover:text-brick"><Trash2 size={14} /> Remove</button>
                      </div>
                      <p className="font-bold">{money(item.price * item.qty)}</p>
                    </div>
                    {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-between text-sm">
            <Link to="/shop" className="font-semibold underline underline-offset-4">Continue shopping</Link>
            <button onClick={cart.clear} className="text-ink-500 hover:text-brick">Clear bag</button>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="card sticky top-24 p-6">
            <h2 className="font-display text-2xl">Summary</h2>
            <form onSubmit={applyPromo} className="mt-4 flex gap-2">
              <div className="relative flex-1"><Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo code" className="input pl-8 uppercase" /></div>
              <button className="btn-secondary btn-sm">Apply</button>
            </form>
            {q?.promoError && cart.promoCode && <p className="mt-1 text-xs text-red-600">{q.promoError}</p>}
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{money(cart.subtotal)}</dd></div>
              {q?.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount ({q.promo?.code})</dt><dd>-{money(q.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery</dt><dd className="text-ink-500">{q ? (q.deliveryFee === 0 ? 'Free' : `from ${money(q.deliveryFee)}`) : '—'}</dd></div>
              <div className="flex justify-between border-t border-ink-100 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-bold">{money(q?.total ?? cart.subtotal)}</dd></div>
            </dl>
            <button onClick={() => navigate('/checkout')} className="btn-primary mt-5 w-full text-base">Checkout</button>
            <p className="mt-3 text-center text-xs text-ink-500">MTN MoMo · Airtel Money · Visa/Mastercard · Cash on delivery</p>
          </div>
        </aside>
      </div>
      {suggestions?.items && <section className="mt-20"><SectionHeader eyebrow="Pairs well" title="Complete the look" /><ProductRow products={suggestions.items} /></section>}
    </div>
  );
}

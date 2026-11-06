import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Drawer, QtyInput, EmptyState } from '../ui';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { money, imgUrl } from '../../lib/format';

export function FreeDeliveryBar({ subtotal, threshold }) {
  const left = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="rounded-xl bg-cream-100 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold">
        <Truck size={14} className="text-brass" />
        {left > 0 ? <>Add <span className="text-brass">{money(left)}</span> more for free Kigali delivery</> : <span className="text-green-700">You have unlocked free Kigali delivery!</span>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200"><div className="h-full bg-brass transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function CartDrawer() {
  const cart = useCart();
  const { delivery } = useStore();
  const navigate = useNavigate();
  const lineError = (item) => cart.quote?.errors?.find((e) => e.startsWith(item.name));

  return (
    <Drawer open={cart.open} onClose={cart.closeCart} title={`Your bag (${cart.count})`}>
      {!cart.items.length ? (
        <EmptyState icon={ShoppingBag} title="Your bag is empty" body="Fill it with suits, tees and sneakers made for Kigali." action="Start shopping" onAction={() => { cart.closeCart(); navigate('/shop'); }} />
      ) : (
        <>
          <div className="px-5 pt-4"><FreeDeliveryBar subtotal={cart.subtotal} threshold={delivery.freeThreshold} /></div>
          <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
            {cart.items.map((item) => (
              <li key={cart.keyOf(item)} className="flex gap-4 py-4">
                <Link to={`/products/${item.slug}`} onClick={cart.closeCart} className="shrink-0"><img src={imgUrl(item.image, 200)} alt="" className="h-24 w-20 rounded-lg object-cover" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.slug}`} onClick={cart.closeCart} className="text-sm font-semibold leading-tight hover:underline">{item.name}</Link>
                      <p className="mt-0.5 text-xs text-ink-500">{item.color} · {item.size}</p>
                    </div>
                    <button onClick={() => cart.remove(item)} className="text-ink-400 hover:text-brick" aria-label="Remove"><Trash2 size={16} /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QtyInput small value={item.qty} onChange={(q) => cart.setQty(item, q)} />
                    <span className="text-sm font-bold">{money(item.price * item.qty)}</span>
                  </div>
                  {lineError(item) && <p className="mt-1 text-xs text-red-600">{lineError(item)}</p>}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-ink-100 px-5 py-4">
            <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span className="font-bold">{money(cart.subtotal)}</span></div>
            {cart.quote?.discount > 0 && <div className="mt-1 flex items-center justify-between text-sm text-green-700"><span>Promo {cart.quote.promo?.code}</span><span>-{money(cart.quote.discount)}</span></div>}
            <p className="mt-1 text-xs text-ink-500">Delivery calculated at checkout. Pay with MoMo, Airtel, card or cash.</p>
            <div className="mt-4 grid gap-2">
              <button onClick={() => { cart.closeCart(); navigate('/checkout'); }} className="btn-primary w-full">Checkout · {money(cart.quote?.total ?? cart.subtotal)}</button>
              <button onClick={() => { cart.closeCart(); navigate('/cart'); }} className="btn-secondary w-full">View bag</button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}

import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Printer, MapPin, Package, Truck, Home, XCircle, Clock } from 'lucide-react';
import { useFetch, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { money, imgUrl, dateTime, PAYMENT_LABELS, clsx, STATUS_LABELS } from '../lib/format';
import { StatusBadge, Skeleton } from '../components/ui';

const FLOW = [
  { s: 'pending', l: 'Order placed', i: Clock },
  { s: 'confirmed', l: 'Confirmed', i: CheckCircle2 },
  { s: 'processing', l: 'Being prepared', i: Package },
  { s: 'shipped', l: 'Out for delivery', i: Truck },
  { s: 'delivered', l: 'Delivered', i: Home },
];

export function OrderTimeline({ order }) {
  const cancelled = order.status === 'cancelled' || order.status === 'refunded';
  const idx = FLOW.findIndex((f) => f.s === order.status);
  const at = (s) => order.timeline?.find((t) => t.status === s)?.at;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between"><h3 className="font-display text-2xl">Order {order.number}</h3><StatusBadge status={order.status} /></div>
      {cancelled ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-red-700"><XCircle size={18} /> This order was {STATUS_LABELS[order.status].toLowerCase()} on {dateTime(at(order.status))}.</p>
      ) : (
        <ol className="mt-6 grid gap-4 sm:grid-cols-5">
          {FLOW.map((f, i) => {
            const Icon = f.i;
            const done = i <= idx;
            return (
              <li key={f.s} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                {i < FLOW.length - 1 && <span className={clsx('absolute left-4 top-8 h-full w-px sm:left-auto sm:right-0 sm:top-4 sm:h-px sm:w-full', done && i < idx ? 'bg-green-600' : 'bg-ink-200')} />}
                <span className={clsx('relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 bg-white', done ? 'border-green-600 text-green-700' : 'border-ink-200 text-ink-300', i === idx && 'ring-4 ring-green-100')}><Icon size={15} /></span>
                <div><p className={clsx('text-xs font-bold', done ? 'text-ink' : 'text-ink-400')}>{f.l}</p>{at(f.s) && <p className="text-[11px] text-ink-500">{dateTime(at(f.s))}</p>}</div>
              </li>
            );
          })}
        </ol>
      )}
      {order.delivery?.eta && !cancelled && order.status !== 'delivered' && <p className="mt-5 text-sm text-ink-600"><b>Estimated:</b> {order.delivery.eta}</p>}
    </div>
  );
}

export function OrderSummary({ order }) {
  return (
    <div className="card overflow-hidden">
      <ul className="divide-y divide-ink-100">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <img src={imgUrl(it.image, 120)} alt="" className="h-16 w-[52px] rounded-lg object-cover" />
            <div className="flex-1"><Link to={`/products/${it.slug}`} className="text-sm font-semibold hover:underline">{it.name}</Link><p className="text-xs text-ink-500">{it.color} · {it.size} · Qty {it.qty}</p></div>
            <p className="text-sm font-semibold">{money(it.price * it.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 border-t border-ink-100 bg-cream-50 p-5 sm:grid-cols-2">
        <div className="space-y-3 text-sm">
          <div><p className="label">Delivery</p><p>{order.delivery.methodName}</p>{order.delivery.address ? <p className="text-ink-600">{order.delivery.address.line1}, {order.delivery.address.sector} {order.delivery.address.district}, {order.delivery.address.city}</p> : <p className="text-ink-600">Pick up at Unif House</p>}{order.delivery.instructions && <p className="text-xs text-ink-500">“{order.delivery.instructions}”</p>}</div>
          <div><p className="label">Payment</p><p>{PAYMENT_LABELS[order.payment.method] || order.payment.methodName} · <StatusBadge status={order.payment.status} /></p><p className="text-xs text-ink-500">Ref {order.payment.reference}</p></div>
          <div><p className="label">Customer</p><p>{order.customer.name} · {order.customer.phone}</p>{order.customer.email && <p className="text-ink-600">{order.customer.email}</p>}</div>
        </div>
        <dl className="space-y-1.5 text-sm sm:text-right">
          <div className="flex justify-between sm:justify-end sm:gap-8"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-green-700 sm:justify-end sm:gap-8"><dt>Discount {order.promoCode}</dt><dd>-{money(order.discount)}</dd></div>}
          <div className="flex justify-between sm:justify-end sm:gap-8"><dt>Delivery</dt><dd>{order.deliveryFee ? money(order.deliveryFee) : 'Free'}</dd></div>
          <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold sm:justify-end sm:gap-8"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const isNew = sp.get('new') === '1';
  const { data, loading, error } = useFetch(`/orders/${id}?guest=1`);
  const { waLink, store } = useStore();
  const order = data?.order;
  useTitle(order ? `Order ${order.number}` : 'Order');

  if (error) return <div className="container-x py-24 text-center"><h1 className="h-display text-5xl">Order not found</h1><Link to="/track" className="btn-primary mt-6">Track an order</Link></div>;
  if (loading || !order) return <div className="container-x space-y-4 py-10"><Skeleton className="h-10 w-72" /><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {isNew && (
          <div className="rounded-2xl bg-ink p-8 text-center text-white">
            <CheckCircle2 size={44} className="mx-auto text-green-400" />
            <h1 className="h-display mt-3 text-5xl">Murakoze, {order.customer.name.split(' ')[0]}!</h1>
            <p className="mt-2 text-ink-300">Your order <b className="text-white">{order.number}</b> is confirmed. {order.payment.method === 'cod' ? 'Have the cash ready for the rider.' : 'Payment received.'} We will WhatsApp you updates on <b className="text-white">{order.customer.phone}</b>.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 no-print">
              <a href={waLink(`Hi Briva! I just placed order ${order.number}.`)} target="_blank" rel="noreferrer" className="btn-light"><MessageCircle size={16} /> Chat on WhatsApp</a>
              <button onClick={() => window.print()} className="btn border border-white text-white hover:bg-white hover:text-ink"><Printer size={16} /> Print receipt</button>
            </div>
          </div>
        )}
        <OrderTimeline order={order} />
        <OrderSummary order={order} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm no-print">
          <p className="flex items-center gap-2 text-ink-500"><MapPin size={14} /> {store.address}</p>
          <div className="flex gap-3"><Link to="/track" className="font-semibold underline underline-offset-4">Track order</Link><Link to="/shop" className="btn-primary btn-sm">Continue shopping</Link></div>
        </div>
      </div>
    </div>
  );
}

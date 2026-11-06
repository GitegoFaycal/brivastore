import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Printer, MessageCircle, ArrowLeft } from 'lucide-react';
import { useFetch, useDebounce } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { money, dateTime, timeAgo, imgUrl, PAYMENT_LABELS, STATUS_LABELS, clsx } from '../lib/format';
import { StatusBadge, Skeleton, Field, Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { PageHeader, SearchInput, TablePager } from './components';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function Orders() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const dq = useDebounce(q, 250);
  const get = (k) => sp.get(k) || '';
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const { data, loading } = useFetch(`/admin/orders${qs({ q: dq, status: get('status'), method: get('method'), payment: get('payment'), from: get('from'), to: get('to'), page: get('page') || 1, limit: 20 })}`);
  const counts = data?.counts || {};
  const exportCsv = () => {
    if (!data) return;
    const rows = [['Number', 'Date', 'Customer', 'Phone', 'Items', 'Total', 'Payment', 'Payment status', 'Status']].concat(data.items.map((o) => [o.number, o.createdAt, o.customer.name, o.customer.phone, o.items.map((i) => `${i.qty}x ${i.name} (${i.color}/${i.size})`).join('; '), o.total, o.payment.method, o.payment.status, o.status]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'briva-orders.csv'; a.click();
  };
  return (
    <div>
      <PageHeader title="Orders" subtitle={data ? `${data.total} orders` : ''}><button onClick={exportCsv} className="btn-secondary btn-sm">Export CSV</button></PageHeader>
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        <button onClick={() => set('status', '')} className={clsx('shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold', !get('status') ? 'border-ink bg-ink text-white' : 'border-ink-200 bg-white')}>All</button>
        {STATUSES.map((s) => <button key={s} onClick={() => set('status', s)} className={clsx('shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold', get('status') === s ? 'border-ink bg-ink text-white' : 'border-ink-200 bg-white')}>{STATUS_LABELS[s]} {counts[s] ? <span className="opacity-60">({counts[s]})</span> : null}</button>)}
      </div>
      <div className="admin-card mb-4 grid gap-2 p-3 md:grid-cols-5">
        <div className="md:col-span-2"><SearchInput value={q} onChange={setQ} placeholder="Order #, name, phone or email" /></div>
        <select className="admin-input" value={get('method')} onChange={(e) => set('method', e.target.value)}><option value="">All payment methods</option>{Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input type="date" className="admin-input" value={get('from')} onChange={(e) => set('from', e.target.value)} />
        <input type="date" className="admin-input" value={get('to')} onChange={(e) => set('to', e.target.value)} />
      </div>
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Delivery</th><th>Status</th></tr></thead>
            <tbody>
              {loading && !data ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={8}><Skeleton className="h-8" /></td></tr>) : data.items.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50">
                  <td><Link to={`/admin/orders/${o.id}`} className="font-semibold hover:underline">{o.number}</Link></td>
                  <td className="text-xs text-ink-500">{dateTime(o.createdAt)}</td>
                  <td><p className="font-medium">{o.customer.name}</p><p className="text-xs text-ink-500">{o.customer.phone}</p></td>
                  <td><div className="flex -space-x-2">{o.items.slice(0, 3).map((it, i) => <img key={i} src={imgUrl(it.image, 60)} alt="" className="h-9 w-7 rounded border border-white object-cover" />)}{o.items.length > 3 && <span className="grid h-9 w-7 place-items-center rounded bg-ink-100 text-[10px] font-bold">+{o.items.length - 3}</span>}</div></td>
                  <td className="font-semibold">{money(o.total)}</td>
                  <td className="text-xs">{PAYMENT_LABELS[o.payment.method]}<br /><StatusBadge status={o.payment.status} /></td>
                  <td className="text-xs">{o.delivery.methodName?.split(' (')[0]}<br /><span className="text-ink-500">{o.delivery.address ? `${o.delivery.address.sector || ''} ${o.delivery.address.district}` : 'Pickup'}</span></td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && <TablePager page={data.page} pages={data.pages} total={data.total} onChange={(p) => set('page', String(p))} />}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/admin/orders/${id}`);
  const toast = useToast();
  const { waLink, store } = useStore();
  const [note, setNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading || !data) return <Skeleton className="h-96" />;
  const o = data.order;
  const setStatus = async (status) => {
    if (['cancelled', 'refunded'].includes(status) && !window.confirm(`Mark ${o.number} as ${status}? Stock will be restored.`)) return;
    setBusy(true);
    try { await api.put(`/admin/orders/${o.id}/status`, { status, note: statusNote }); setStatusNote(''); toast.success(`Order marked ${STATUS_LABELS[status].toLowerCase()}`); refetch(); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const setPayment = async (status) => { try { await api.put(`/admin/orders/${o.id}/payment`, { status }); toast.success('Payment updated'); refetch(); } catch (e) { toast.error(e.message); } };
  const addNote = async (e) => { e.preventDefault(); if (!note.trim()) return; try { await api.post(`/admin/orders/${o.id}/notes`, { text: note }); setNote(''); refetch(); } catch (err) { toast.error(err.message); } };
  const nextStatus = { pending: 'confirmed', confirmed: 'processing', processing: 'shipped', shipped: 'delivered' }[o.status];
  const waMsg = { confirmed: `Hi ${o.customer.name.split(' ')[0]}! Your Briva order ${o.number} is confirmed. We will deliver ${o.delivery.eta || 'soon'}.`, shipped: `Hi ${o.customer.name.split(' ')[0]}! Your Briva order ${o.number} is on its way. The rider will call you shortly.`, delivered: `Hi ${o.customer.name.split(' ')[0]}! Thanks for shopping at Briva. Enjoy your ${o.items[0].name}!` }[o.status] || `Hi ${o.customer.name.split(' ')[0]}, this is Briva Store about your order ${o.number}.`;

  return (
    <div>
      <PageHeader title={o.number} subtitle={`Placed ${dateTime(o.createdAt)} (${timeAgo(o.createdAt)})`}>
        <Link to="/admin/orders" className="btn-ghost btn-sm no-print"><ArrowLeft size={14} /> Orders</Link>
        <a href={`https://wa.me/${o.customer.phone.replace(/[^\d]/g, '').replace(/^0/, '250')}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer" className="btn-secondary btn-sm no-print"><MessageCircle size={14} /> WhatsApp customer</a>
        <button onClick={() => window.print()} className="btn-secondary btn-sm no-print"><Printer size={14} /> Print</button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card p-0">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3"><h3 className="font-bold">Items ({o.items.reduce((n, i) => n + i.qty, 0)})</h3><StatusBadge status={o.status} /></div>
            <ul className="divide-y divide-ink-100">{o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-3"><img src={imgUrl(it.image, 100)} alt="" className="h-16 w-12 rounded object-cover" /><div className="flex-1"><Link to={`/admin/products/${it.productId}`} className="font-semibold hover:underline">{it.name}</Link><p className="text-xs text-ink-500">{it.color} · {it.size} · SKU {it.sku || '—'}</p></div><p className="text-sm">{it.qty} × {money(it.price)}</p><p className="w-28 text-right font-semibold">{money(it.qty * it.price)}</p></li>
            ))}</ul>
            <dl className="space-y-1 border-t border-ink-100 bg-ink-50 px-5 py-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount ({o.promoCode})</dt><dd>-{money(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{o.deliveryFee ? money(o.deliveryFee) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
            </dl>
          </div>
          <div className="admin-card no-print">
            <h3 className="font-bold">Update status</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {nextStatus && <button disabled={busy} onClick={() => setStatus(nextStatus)} className="btn-primary btn-sm">{busy ? <Spinner className="h-3 w-3" /> : `Mark as ${STATUS_LABELS[nextStatus].toLowerCase()}`}</button>}
              <select value="" onChange={(e) => e.target.value && setStatus(e.target.value)} className="admin-input w-auto"><option value="">Set status…</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
              <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Note for timeline (optional)" className="admin-input flex-1" />
            </div>
            <ol className="mt-5 space-y-3 border-l-2 border-ink-100 pl-4">
              {[...o.timeline].reverse().map((t, i) => <li key={i} className="relative text-sm"><span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-ink" /><b>{STATUS_LABELS[t.status]}</b> <span className="text-xs text-ink-500">{dateTime(t.at)}{t.by ? ` · ${t.by}` : ''}</span>{t.note && <p className="text-ink-600">{t.note}</p>}</li>)}
            </ol>
          </div>
          <div className="admin-card no-print">
            <h3 className="font-bold">Internal notes</h3>
            <ul className="mt-3 space-y-2">{(o.notes || []).map((n) => <li key={n.id} className="rounded-lg bg-cream-100 p-3 text-sm"><p>{n.text}</p><p className="mt-1 text-xs text-ink-500">{n.by} · {dateTime(n.at)}</p></li>)}{!o.notes?.length && <p className="text-sm text-ink-500">No notes yet.</p>}</ul>
            <form onSubmit={addNote} className="mt-3 flex gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} className="admin-input" placeholder="Add a note visible only to staff" /><button className="btn-secondary btn-sm">Add</button></form>
          </div>
        </div>
        <div className="space-y-6">
          <div className="admin-card text-sm">
            <h3 className="font-bold">Customer</h3>
            <p className="mt-2 font-semibold">{o.customer.name}</p><p>{o.customer.phone}</p>{o.customer.email && <p className="text-ink-600">{o.customer.email}</p>}
            {data.customer ? <Link to={`/admin/customers/${data.customer.id}`} className="mt-2 inline-block text-xs font-semibold underline">View profile · {data.customerOrderCount} order{data.customerOrderCount > 1 ? 's' : ''}</Link> : <p className="mt-2 text-xs text-ink-500">Guest checkout</p>}
          </div>
          <div className="admin-card text-sm">
            <h3 className="font-bold">Delivery</h3>
            <p className="mt-2 font-semibold">{o.delivery.methodName}</p>
            {o.delivery.address ? <p className="text-ink-700">{o.delivery.address.line1}<br />{o.delivery.address.sector} {o.delivery.address.district}, {o.delivery.address.city}</p> : <p className="text-ink-700">Customer picks up at {store.address}</p>}
            {o.delivery.instructions && <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">“{o.delivery.instructions}”</p>}
          </div>
          <div className="admin-card text-sm">
            <h3 className="font-bold">Payment</h3>
            <p className="mt-2">{PAYMENT_LABELS[o.payment.method]} · <StatusBadge status={o.payment.status} /></p>
            <p className="text-xs text-ink-500">Ref {o.payment.reference}{o.payment.phone ? ` · ${o.payment.phone}` : ''}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 no-print">
              {o.payment.status !== 'paid' && <button onClick={() => setPayment('paid')} className="btn-secondary btn-sm">Mark paid</button>}
              {o.payment.status === 'refund_pending' && <button onClick={() => setPayment('refunded')} className="btn-secondary btn-sm">Mark refunded</button>}
            </div>
          </div>
          <div className="hidden print:block text-xs text-ink-500"><p>{store.name} · {store.address} · {store.phone}</p></div>
        </div>
      </div>
    </div>
  );
}

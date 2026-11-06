import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import { api } from '../lib/api';
import { useTitle } from '../lib/hooks';
import { useToast } from '../context/ToastContext';
import { Field, Spinner } from '../components/ui';
import { OrderSummary, OrderTimeline } from './OrderConfirmation';

export default function TrackOrder() {
  useTitle('Track your order');
  const [sp] = useSearchParams();
  const [number, setNumber] = useState(sp.get('number') || '');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const d = await api.get(`/orders/track?number=${encodeURIComponent(number.trim())}&contact=${encodeURIComponent(contact.trim())}`); setOrder(d.order); } catch (err) { toast.error(err.message); setOrder(null); } finally { setBusy(false); }
  };
  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-brass-50 text-brass"><PackageSearch size={26} /></div>
          <h1 className="h-display text-5xl">Track your order</h1>
          <p className="mt-2 text-sm text-ink-500">Enter your order number (e.g. BRV-10042) and the phone number or email used at checkout.</p>
        </div>
        <form onSubmit={submit} className="card mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Order number"><input className="input uppercase" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="BRV-10042" /></Field>
          <Field label="Phone or email"><input className="input" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="078… or you@email.com" /></Field>
          <button disabled={busy} className="btn-primary self-end">{busy ? <Spinner /> : 'Track'}</button>
        </form>
        {order && (
          <div className="mt-8 space-y-6">
            <OrderTimeline order={order} />
            <OrderSummary order={order} />
          </div>
        )}
      </div>
    </div>
  );
}

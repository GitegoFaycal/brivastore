import { useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../ui';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api.post('/newsletter', { email, source: 'footer' });
      setDone(d.message);
      setEmail('');
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="border-b border-ink-700">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
        <div>
          <p className="eyebrow">Join the list</p>
          <h3 className="h-display mt-2 text-4xl text-white sm:text-5xl">Get 10% off your first order</h3>
          <p className="mt-2 max-w-md text-sm text-ink-300">New drops, Kigali-only promos and early access to sales. No spam, unsubscribe anytime.</p>
        </div>
        {done ? (
          <p className="rounded-xl border border-brass/40 bg-brass/10 px-5 py-4 text-sm text-brass-100">{done}</p>
        ) : (
          <form onSubmit={submit} className="flex w-full max-w-md gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email or phone" className="input flex-1 border-ink-600 bg-ink-800 text-white placeholder:text-ink-400 focus:border-brass focus:ring-brass/20" />
            <button disabled={busy} className="btn-brass shrink-0">{busy ? <Spinner /> : 'Sign up'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

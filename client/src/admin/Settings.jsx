import { useEffect, useState } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Field, Spinner, Skeleton } from '../components/ui';
import { PageHeader, Toggle, ConfirmButton } from './components';

export default function SettingsPage() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { refresh } = useStore();
  useEffect(() => { api.get('/admin/settings').then(setS).catch((e) => toast.error(e.message)); }, [toast]);
  if (!s) return <Skeleton className="h-96" />;
  const save = async () => { setBusy(true); try { await api.put('/admin/settings', s); toast.success('Settings saved'); refresh(); } catch (e) { toast.error(e.message); } finally { setBusy(false); } };
  const store = (k) => (e) => setS({ ...s, store: { ...s.store, [k]: e.target.value } });
  const zone = (i, patch) => setS({ ...s, delivery: { ...s.delivery, zones: s.delivery.zones.map((z, j) => (j === i ? { ...z, ...patch } : z)) } });
  const resetDemo = async () => { await api.post('/admin/reset-demo'); toast.success('Demo data restored. Reloading…'); setTimeout(() => window.location.reload(), 800); };
  return (
    <div>
      <PageHeader title="Settings" subtitle="Store details, delivery zones and payment methods."><button onClick={save} disabled={busy} className="btn-primary btn-sm min-w-[100px]">{busy ? <Spinner className="h-4 w-4" /> : 'Save changes'}</button></PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card space-y-3">
          <h3 className="font-bold">Store information</h3>
          <Field label="Store name"><input className="admin-input" value={s.store.name} onChange={store('name')} /></Field>
          <Field label="Tagline"><input className="admin-input" value={s.store.tagline} onChange={store('tagline')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone (display)"><input className="admin-input" value={s.store.phone} onChange={store('phone')} /></Field>
            <Field label="WhatsApp number (digits, with 250)"><input className="admin-input" value={s.store.whatsapp} onChange={store('whatsapp')} /></Field>
          </div>
          <Field label="Email"><input className="admin-input" value={s.store.email} onChange={store('email')} /></Field>
          <Field label="Address"><input className="admin-input" value={s.store.address} onChange={store('address')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><input className="admin-input" value={s.store.city} onChange={store('city')} /></Field>
            <Field label="Map search query"><input className="admin-input" value={s.store.mapQuery} onChange={store('mapQuery')} /></Field>
          </div>
          <Field label="Opening hours"><input className="admin-input" value={s.store.hours} onChange={store('hours')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram URL"><input className="admin-input" value={s.store.instagram} onChange={store('instagram')} /></Field>
            <Field label="TikTok URL"><input className="admin-input" value={s.store.tiktok} onChange={store('tiktok')} /></Field>
          </div>
        </section>
        <div className="space-y-6">
          <section className="admin-card space-y-3">
            <h3 className="font-bold">Delivery</h3>
            <Field label="Free Kigali delivery threshold (RWF)"><input type="number" className="admin-input" value={s.delivery.freeThreshold} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, freeThreshold: Number(e.target.value) || 0 } })} /></Field>
            <Field label="Kigali districts (comma separated)"><input className="admin-input" value={s.delivery.districts.join(', ')} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, districts: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } })} /></Field>
            <span className="label">Delivery zones</span>
            {s.delivery.zones.map((z, i) => (
              <div key={z.id} className="grid gap-2 rounded-lg border border-ink-100 p-3 sm:grid-cols-[2fr_1fr_2fr_auto_auto]">
                <input className="admin-input" value={z.name} onChange={(e) => zone(i, { name: e.target.value })} placeholder="Name" />
                <input type="number" className="admin-input" value={z.fee} onChange={(e) => zone(i, { fee: Number(e.target.value) || 0 })} placeholder="Fee" />
                <input className="admin-input" value={z.eta} onChange={(e) => zone(i, { eta: e.target.value })} placeholder="ETA" />
                <Toggle checked={z.active} onChange={(v) => zone(i, { active: v })} />
                <button onClick={() => setS({ ...s, delivery: { ...s.delivery, zones: s.delivery.zones.filter((_, j) => j !== i) } })} className="rounded p-2 text-ink-400 hover:text-red-600" disabled={['pickup'].includes(z.id)}><X size={16} /></button>
              </div>
            ))}
            <button onClick={() => setS({ ...s, delivery: { ...s.delivery, zones: [...s.delivery.zones, { id: `zone-${Date.now().toString(36)}`, name: '', fee: 0, eta: '', active: true }] } })} className="btn-ghost btn-sm"><Plus size={14} /> Add zone</button>
          </section>
          <section className="admin-card space-y-3">
            <h3 className="font-bold">Payment methods</h3>
            {s.payments.map((p, i) => (
              <div key={p.id} className="flex items-start gap-3 rounded-lg border border-ink-100 p-3">
                <Toggle checked={p.active} onChange={(v) => setS({ ...s, payments: s.payments.map((x, j) => (j === i ? { ...x, active: v } : x)) })} />
                <div className="flex-1"><p className="text-sm font-semibold">{p.name}</p><input className="admin-input mt-1" value={p.description} onChange={(e) => setS({ ...s, payments: s.payments.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} /></div>
              </div>
            ))}
            <p className="text-xs text-ink-500">Online payments are simulated in this demo. To go live, connect MTN MoMo API / Flutterwave in the server's order route.</p>
          </section>
          <section className="admin-card">
            <h3 className="font-bold">Demo data</h3>
            <p className="mb-3 text-xs text-ink-500">Restore all products, orders and settings to the original demo state.</p>
            <ConfirmButton onConfirm={resetDemo} message="Reset ALL data to the demo seed? Your changes will be lost." icon={false}><RotateCcw size={14} /> Reset demo data</ConfirmButton>
          </section>
        </div>
      </div>
    </div>
  );
}

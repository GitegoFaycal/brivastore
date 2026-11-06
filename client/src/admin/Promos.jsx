import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '../lib/hooks';
import { api } from '../lib/api';
import { money, date, clsx } from '../lib/format';
import { Modal, Field, Spinner, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { PageHeader, Toggle, ConfirmButton } from './components';

const EMPTY = { code: '', type: 'percent', value: 10, minSubtotal: 0, usageLimit: '', expiresAt: '', active: true, description: '' };

export default function Promos() {
  const { data, loading, refetch } = useFetch('/admin/promos');
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const body = { ...edit, expiresAt: edit.expiresAt ? new Date(edit.expiresAt).toISOString() : null };
      if (edit.id) await api.put(`/admin/promos/${edit.id}`, body); else await api.post('/admin/promos', body);
      toast.success('Discount saved'); setEdit(null); refetch();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const toggle = async (p) => { try { await api.put(`/admin/promos/${p.id}`, { active: !p.active }); refetch(); } catch (e) { toast.error(e.message); } };
  const remove = async (id) => { await api.del(`/admin/promos/${id}`); toast.success('Deleted'); refetch(); };
  const describe = (p) => (p.type === 'percent' ? `${p.value}% off` : p.type === 'fixed' ? `${money(p.value)} off` : 'Free delivery');
  return (
    <div>
      <PageHeader title="Discounts" subtitle="Promo codes customers enter at checkout."><button onClick={() => setEdit({ ...EMPTY })} className="btn-primary btn-sm"><Plus size={14} /> New code</button></PageHeader>
      <div className="admin-card overflow-hidden p-0"><div className="overflow-x-auto"><table className="table-base">
        <thead><tr><th>Code</th><th>Discount</th><th>Min. order</th><th>Used</th><th>Expires</th><th>Active</th><th /></tr></thead>
        <tbody>{loading && !data ? <tr><td colSpan={7}><Skeleton className="h-10" /></td></tr> : data.map((p) => {
          const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
          const exhausted = p.usageLimit && p.used >= p.usageLimit;
          return (
            <tr key={p.id} className="hover:bg-ink-50">
              <td><button onClick={() => setEdit({ ...p, usageLimit: p.usageLimit ?? '', expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '' })} className="font-mono font-bold hover:underline">{p.code}</button><p className="text-xs text-ink-500">{p.description}</p></td>
              <td className="font-semibold">{describe(p)}</td><td>{p.minSubtotal ? money(p.minSubtotal) : '—'}</td>
              <td><span className={clsx(exhausted && 'text-red-600 font-semibold')}>{p.used}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</span></td>
              <td className={clsx('text-xs', expired && 'text-red-600 font-semibold')}>{p.expiresAt ? date(p.expiresAt) : 'Never'}</td>
              <td><Toggle checked={p.active} onChange={() => toggle(p)} /></td>
              <td className="text-right"><ConfirmButton onConfirm={() => remove(p.id)} message={`Delete code ${p.code}?`}>Delete</ConfirmButton></td>
            </tr>
          );
        })}</tbody>
      </table></div></div>
      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title={edit?.id ? `Edit ${edit.code}` : 'New discount code'} size="sm">
        {edit && (
          <form onSubmit={save} className="space-y-3 p-5">
            <Field label="Code"><input className="admin-input font-mono uppercase" required value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} placeholder="SUMMER15" /></Field>
            <Field label="Description (shown to customer)"><input className="admin-input" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select className="admin-input" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}><option value="percent">Percentage off</option><option value="fixed">Fixed amount off</option><option value="free_delivery">Free delivery</option></select></Field>
              {edit.type !== 'free_delivery' && <Field label={edit.type === 'percent' ? 'Percent' : 'Amount (RWF)'}><input type="number" min="0" className="admin-input" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} /></Field>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minimum order (RWF)"><input type="number" min="0" className="admin-input" value={edit.minSubtotal} onChange={(e) => setEdit({ ...edit, minSubtotal: e.target.value })} /></Field>
              <Field label="Usage limit" hint="Blank = unlimited"><input type="number" min="0" className="admin-input" value={edit.usageLimit} onChange={(e) => setEdit({ ...edit, usageLimit: e.target.value })} /></Field>
            </div>
            <Field label="Expires on" hint="Blank = never"><input type="date" className="admin-input" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} /></Field>
            <Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Active" />
            <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Save'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
}

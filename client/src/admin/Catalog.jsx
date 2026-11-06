import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '../lib/hooks';
import { api } from '../lib/api';
import { imgUrl } from '../lib/format';
import { Modal, Field, Spinner, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { PageHeader, Toggle, ConfirmButton } from './components';

export default function Catalog() {
  return (
    <div className="space-y-10">
      <Section kind="categories" title="Categories" subtitle="Shown in the menu and used to organise products. Each belongs to men, women or unisex." fields={['name', 'gender', 'image', 'order']} />
      <Section kind="collections" title="Collections" subtitle="Curated edits like New Arrivals, Sale or The Formal Shop. Featured collections appear in the Collections menu." fields={['name', 'description', 'image', 'featured']} />
    </div>
  );
}

function Section({ kind, title, subtitle, fields }) {
  const { data, loading, refetch } = useFetch(`/admin/${kind}`);
  const { data: counts } = useFetch(`/${kind}`);
  const { refresh } = useStore();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const count = (slug) => counts?.find((c) => c.slug === slug)?.productCount ?? '';
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { if (edit.id) await api.put(`/admin/${kind}/${edit.id}`, edit); else await api.post(`/admin/${kind}`, edit); toast.success('Saved'); setEdit(null); refetch(); refresh(); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const remove = async (id) => { try { await api.del(`/admin/${kind}/${id}`); toast.success('Deleted'); refetch(); refresh(); } catch (e) { toast.error(e.message); } };
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}><button onClick={() => setEdit({ name: '', gender: 'men', image: '', order: 99, description: '', featured: false })} className="btn-primary btn-sm"><Plus size={14} /> New</button></PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !data ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />) : data.map((c) => (
          <div key={c.id} className="admin-card overflow-hidden p-0">
            <button onClick={() => setEdit({ ...c })} className="block w-full"><div className="aspect-[16/9] bg-ink-100">{c.image && <img src={imgUrl(c.image, 500)} alt="" className="h-full w-full object-cover" />}</div></button>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2"><div><button onClick={() => setEdit({ ...c })} className="font-semibold hover:underline">{c.name}</button><p className="text-xs text-ink-500">/{c.slug} · {count(c.slug)} products{c.gender ? ` · ${c.gender}` : ''}{c.featured ? ' · featured' : ''}</p></div><ConfirmButton onConfirm={() => remove(c.id)} message={`Delete ${c.name}?`} /></div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title={edit?.id ? `Edit ${edit.name}` : `New ${title.toLowerCase().slice(0, -1)}`} size="sm">
        {edit && (
          <form onSubmit={save} className="space-y-3 p-5">
            <Field label="Name"><input className="admin-input" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            {fields.includes('gender') && <Field label="Gender"><select className="admin-input" value={edit.gender} onChange={(e) => setEdit({ ...edit, gender: e.target.value })}><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></Field>}
            {fields.includes('description') && <Field label="Description"><textarea className="admin-input" rows={2} value={edit.description || ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>}
            <Field label="Image URL"><input className="admin-input" value={edit.image || ''} onChange={(e) => setEdit({ ...edit, image: e.target.value })} /></Field>
            {fields.includes('order') && <Field label="Menu order"><input type="number" className="admin-input" value={edit.order} onChange={(e) => setEdit({ ...edit, order: e.target.value })} /></Field>}
            {fields.includes('featured') && <Toggle checked={Boolean(edit.featured)} onChange={(v) => setEdit({ ...edit, featured: v })} label="Featured in menu" />}
            <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Save'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
}

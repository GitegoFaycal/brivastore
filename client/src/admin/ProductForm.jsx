import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Field, Spinner, Skeleton } from '../components/ui';
import { money, clsx } from '../lib/format';
import { ImageListInput, Toggle, ConfirmButton, PageHeader } from './components';

const SIZE_PRESETS = {
  tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  dresses: ['XS', 'S', 'M', 'L', 'XL'],
  suits: ['46', '48', '50', '52', '54', '56'],
  bottoms: ['28', '30', '32', '34', '36', '38'],
  wbottoms: ['24', '26', '28', '30', '32'],
  shoes: ['39', '40', '41', '42', '43', '44', '45'],
  wshoes: ['36', '37', '38', '39', '40', '41'],
  one: ['One Size'],
};
const PRESET_LABELS = { tops: "Men's tops", dresses: "Women's", suits: 'Suits (EU)', bottoms: "Men's trousers", wbottoms: "Women's jeans", shoes: "Men's shoes", wshoes: "Women's shoes", one: 'One size' };

const EMPTY = { name: '', slug: '', brand: 'Briva', gender: 'men', category: '', collections: [], description: '', details: [], materials: '', care: 'Dry clean or gentle machine wash cold. Do not tumble dry.', price: '', compareAtPrice: '', images: [], video: '', colors: [{ name: 'Black', hex: '#0a0a0a' }], sizes: SIZE_PRESETS.tops, sizeType: 'tops', variants: [], tags: [], featured: false, status: 'active', defaultStock: 10 };

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { categories, collections, refresh } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [detailDraft, setDetailDraft] = useState('');

  useEffect(() => {
    if (isNew) { setForm(EMPTY); return; }
    api.get(`/admin/products/${id}`).then((p) => setForm({ ...EMPTY, ...p, compareAtPrice: p.compareAtPrice || '', video: p.video || '' })).catch((e) => { toast.error(e.message); navigate('/admin/products'); }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const stockOf = (color, size) => form.variants.find((v) => v.color === color && v.size === size)?.stock ?? form.defaultStock ?? 0;
  const setStock = (color, size, stock) => setForm((f) => {
    const exists = f.variants.some((v) => v.color === color && v.size === size);
    const variants = exists ? f.variants.map((v) => (v.color === color && v.size === size ? { ...v, stock } : v)) : [...f.variants, { color, size, stock }];
    return { ...f, variants };
  });
  const setAllStock = (stock) => setForm((f) => ({ ...f, defaultStock: stock, variants: f.colors.flatMap((c) => f.sizes.map((s) => ({ ...(f.variants.find((v) => v.color === c.name && v.size === s) || {}), color: c.name, size: s, stock }))) }));

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { ...form, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null, variants: form.colors.flatMap((c) => form.sizes.map((s) => ({ color: c.name, size: s, stock: Number(stockOf(c.name, s)) || 0 }))) };
      const saved = isNew ? await api.post('/admin/products', payload) : await api.put(`/admin/products/${id}`, payload);
      toast.success(isNew ? 'Product created' : 'Product saved');
      refresh();
      if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true });
      else setForm({ ...EMPTY, ...saved, compareAtPrice: saved.compareAtPrice || '', video: saved.video || '' });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const remove = async () => { await api.del(`/admin/products/${id}`); toast.success('Product deleted'); navigate('/admin/products'); };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  const totalStock = form.colors.reduce((s, c) => s + form.sizes.reduce((t, sz) => t + (Number(stockOf(c.name, sz)) || 0), 0), 0);
  const discount = form.compareAtPrice && Number(form.compareAtPrice) > Number(form.price) ? Math.round((1 - form.price / form.compareAtPrice) * 100) : 0;

  return (
    <form onSubmit={save}>
      <PageHeader title={isNew ? 'New product' : form.name} subtitle={isNew ? 'Fill in the details and publish.' : `${form.id} · ${totalStock} in stock`}>
        <Link to="/admin/products" className="btn-ghost btn-sm"><ArrowLeft size={14} /> Back</Link>
        {!isNew && <Link to={`/products/${form.slug}`} target="_blank" className="btn-secondary btn-sm">View on store</Link>}
        <button disabled={busy} className="btn-primary btn-sm min-w-[110px]">{busy ? <Spinner className="h-4 w-4" /> : isNew ? 'Publish' : 'Save changes'}</button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="admin-card space-y-4">
            <h3 className="font-bold">Basics</h3>
            <Field label="Product name"><input className="admin-input" required value={form.name} onChange={set('name')} placeholder="Navy Slim Fit Suit" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="URL slug" hint="Leave blank to generate from name"><input className="admin-input" value={form.slug} onChange={set('slug')} placeholder="navy-slim-fit-suit" /></Field>
              <Field label="Brand"><input className="admin-input" value={form.brand} onChange={set('brand')} /></Field>
            </div>
            <Field label="Description"><textarea className="admin-input" rows={5} value={form.description} onChange={set('description')} placeholder="Describe the fit, fabric and when to wear it." /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Materials"><input className="admin-input" value={form.materials} onChange={set('materials')} placeholder="70% wool, 30% polyester" /></Field>
              <Field label="Care"><input className="admin-input" value={form.care} onChange={set('care')} /></Field>
            </div>
            <div>
              <span className="label">Detail bullets</span>
              <ul className="mb-2 space-y-1">{form.details.map((d, i) => <li key={i} className="flex items-center justify-between rounded bg-ink-50 px-3 py-1.5 text-sm">{d}<button type="button" onClick={() => setForm({ ...form, details: form.details.filter((_, j) => j !== i) })}><X size={14} /></button></li>)}</ul>
              <div className="flex gap-2"><input className="admin-input" value={detailDraft} onChange={(e) => setDetailDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (detailDraft.trim()) { setForm({ ...form, details: [...form.details, detailDraft.trim()] }); setDetailDraft(''); } } }} placeholder="e.g. Two-button closure" /><button type="button" onClick={() => { if (detailDraft.trim()) { setForm({ ...form, details: [...form.details, detailDraft.trim()] }); setDetailDraft(''); } }} className="btn-secondary btn-sm"><Plus size={14} /></button></div>
            </div>
          </section>

          <section className="admin-card space-y-4">
            <h3 className="font-bold">Media</h3>
            <ImageListInput value={form.images} onChange={(images) => setForm({ ...form, images })} />
            <Field label="Product video URL (optional, .mp4)"><input className="admin-input" value={form.video} onChange={set('video')} placeholder="https://…/video.mp4" /></Field>
          </section>

          <section className="admin-card space-y-4">
            <h3 className="font-bold">Colours, sizes & stock</h3>
            <div>
              <span className="label">Colours</span>
              <div className="space-y-2">
                {form.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="color" value={c.hex} onChange={(e) => setForm({ ...form, colors: form.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) })} className="h-9 w-10 cursor-pointer rounded border border-ink-200" />
                    <input className="admin-input" value={c.name} onChange={(e) => setForm({ ...form, colors: form.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} placeholder="Colour name" />
                    <button type="button" onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })} disabled={form.colors.length === 1} className="rounded p-2 text-ink-400 hover:text-red-600 disabled:opacity-30"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, colors: [...form.colors, { name: '', hex: '#888888' }] })} className="btn-ghost btn-sm"><Plus size={14} /> Add colour</button>
              </div>
            </div>
            <div>
              <span className="label">Sizes</span>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {Object.keys(SIZE_PRESETS).map((k) => <button key={k} type="button" onClick={() => setForm({ ...form, sizeType: k, sizes: SIZE_PRESETS[k] })} className={clsx('rounded-full border px-2.5 py-1 text-xs font-semibold', form.sizeType === k ? 'border-ink bg-ink text-white' : 'border-ink-200')}>{PRESET_LABELS[k]}</button>)}
              </div>
              <input className="admin-input" value={form.sizes.join(', ')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="S, M, L" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><span className="label mb-0">Stock per variant</span><label className="flex items-center gap-2 text-xs">Set all to <input type="number" min="0" className="admin-input w-20 py-1" defaultValue={form.defaultStock} onBlur={(e) => setAllStock(Number(e.target.value) || 0)} /></label></div>
              <div className="overflow-x-auto rounded-lg border border-ink-100">
                <table className="table-base">
                  <thead><tr><th>Colour</th>{form.sizes.map((s) => <th key={s} className="text-center">{s}</th>)}</tr></thead>
                  <tbody>{form.colors.map((c) => (
                    <tr key={c.name}><td className="font-semibold"><span className="mr-2 inline-block h-3 w-3 rounded-full border border-ink-200 align-middle" style={{ background: c.hex }} />{c.name || '(unnamed)'}</td>{form.sizes.map((s) => <td key={s} className="p-1 text-center"><input type="number" min="0" value={stockOf(c.name, s)} onChange={(e) => setStock(c.name, s, Number(e.target.value) || 0)} className="w-16 rounded border border-ink-200 px-1.5 py-1 text-center text-sm" /></td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card space-y-4">
            <h3 className="font-bold">Pricing</h3>
            <Field label="Price (RWF)"><input type="number" min="0" className="admin-input" required value={form.price} onChange={set('price')} /></Field>
            <Field label="Compare-at price (RWF)" hint={discount ? `Shows as ${discount}% off` : 'Original price, to show a discount'}><input type="number" min="0" className="admin-input" value={form.compareAtPrice} onChange={set('compareAtPrice')} /></Field>
            {form.price && <p className="text-sm">Shown as <b>{money(form.price)}</b>{discount ? <> <span className="line-through text-ink-400">{money(form.compareAtPrice)}</span> <span className="rounded bg-brick-50 px-1.5 text-xs font-bold text-brick">-{discount}%</span></> : null}</p>}
          </section>
          <section className="admin-card space-y-4">
            <h3 className="font-bold">Organisation</h3>
            <Field label="Status"><select className="admin-input" value={form.status} onChange={set('status')}><option value="active">Active (visible)</option><option value="draft">Draft (hidden)</option><option value="archived">Archived</option></select></Field>
            <Field label="Gender"><select className="admin-input" value={form.gender} onChange={set('gender')}><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></Field>
            <Field label="Category"><select className="admin-input" required value={form.category} onChange={set('category')}><option value="">Select…</option>{categories.filter((c) => c.gender === form.gender || c.gender === 'unisex' || form.gender === 'unisex').map((c) => <option key={c.id} value={c.slug}>{c.name} ({c.gender})</option>)}</select></Field>
            <div>
              <span className="label">Collections</span>
              <div className="flex flex-wrap gap-1.5">{collections.map((c) => { const on = form.collections.includes(c.slug); return <button key={c.id} type="button" onClick={() => setForm({ ...form, collections: on ? form.collections.filter((s) => s !== c.slug) : [...form.collections, c.slug] })} className={clsx('rounded-full border px-2.5 py-1 text-xs font-semibold', on ? 'border-ink bg-ink text-white' : 'border-ink-200')}>{c.name}</button>; })}</div>
            </div>
            <div>
              <span className="label">Tags</span>
              <div className="mb-1.5 flex flex-wrap gap-1">{form.tags.map((t) => <span key={t} className="flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-xs">{t}<button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}><X size={12} /></button></span>)}</div>
              <input className="admin-input" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const t = tagDraft.trim().toLowerCase(); if (t && !form.tags.includes(t)) setForm({ ...form, tags: [...form.tags, t] }); setTagDraft(''); } }} placeholder="new, wedding, limited (Enter to add)" />
            </div>
            <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Featured on homepage (For you tab)" />
          </section>
          {!isNew && <section className="admin-card"><h3 className="font-bold text-red-700">Danger zone</h3><p className="mb-3 text-xs text-ink-500">Deleting removes the product and its reviews. Prefer “Archived” to hide it instead.</p><ConfirmButton onConfirm={remove} message={`Delete "${form.name}" permanently?`}>Delete product</ConfirmButton></section>}
        </div>
      </div>
    </form>
  );
}

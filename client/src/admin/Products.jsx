import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { useFetch, useDebounce } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { money, imgUrl, clsx } from '../lib/format';
import { StatusBadge, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { PageHeader, SearchInput, TablePager, ConfirmButton } from './components';

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const dq = useDebounce(q, 250);
  const [selected, setSelected] = useState([]);
  const toast = useToast();
  const { categories, collections } = useStore();
  const get = (k) => sp.get(k) || '';
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const path = `/admin/products${qs({ q: dq, status: get('status'), category: get('category'), gender: get('gender'), stock: get('stock'), sort: get('sort') || 'newest', page: get('page') || 1, limit: 20 })}`;
  const { data, loading, refetch } = useFetch(path);

  const patch = async (id, body) => { try { await api.patch(`/admin/products/${id}`, body); refetch(); } catch (e) { toast.error(e.message); } };
  const remove = async (id) => { try { await api.del(`/admin/products/${id}`); toast.success('Product deleted'); refetch(); } catch (e) { toast.error(e.message); } };
  const bulk = async (action, value) => {
    if (!selected.length) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} products?`)) return;
    try { const d = await api.post('/admin/products/bulk', { ids: selected, action, value }); toast.success(`${d.affected} products updated`); setSelected([]); refetch(); } catch (e) { toast.error(e.message); }
  };
  const allIds = data?.items?.map((p) => p.id) || [];
  const allSelected = allIds.length && allIds.every((id) => selected.includes(id));

  return (
    <div>
      <PageHeader title="Products" subtitle={data ? `${data.total} products` : ''}>
        <Link to="/admin/products/new" className="btn-primary btn-sm"><Plus size={14} /> New product</Link>
      </PageHeader>
      <div className="admin-card mb-4 grid gap-2 p-3 md:grid-cols-6">
        <div className="md:col-span-2"><SearchInput value={q} onChange={setQ} placeholder="Search name, slug or ID" /></div>
        <select className="admin-input" value={get('status')} onChange={(e) => set('status', e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
        <select className="admin-input" value={get('gender')} onChange={(e) => set('gender', e.target.value)}><option value="">Men & women</option><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select>
        <select className="admin-input" value={get('category')} onChange={(e) => set('category', e.target.value)}><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name} ({c.gender})</option>)}</select>
        <select className="admin-input" value={get('stock')} onChange={(e) => set('stock', e.target.value)}><option value="">Any stock</option><option value="low">Low stock (≤8)</option><option value="out">Out of stock</option></select>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm text-white">
          <span className="font-semibold">{selected.length} selected</span>
          <button onClick={() => bulk('status', 'active')} className="rounded bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20">Set active</button>
          <button onClick={() => bulk('status', 'draft')} className="rounded bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20">Set draft</button>
          <button onClick={() => bulk('featured', true)} className="rounded bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20">Feature</button>
          <select className="rounded bg-white/10 px-2 py-1 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) bulk('collection', e.target.value); e.target.value = ''; }}><option value="">Add to collection…</option>{collections.map((c) => <option key={c.id} value={c.slug} className="text-ink">{c.name}</option>)}</select>
          <button onClick={() => bulk('delete')} className="rounded bg-red-500/80 px-2.5 py-1 text-xs hover:bg-red-500">Delete</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs underline">Clear</button>
        </div>
      )}

      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr>
              <th className="w-8"><input type="checkbox" checked={Boolean(allSelected)} onChange={(e) => setSelected(e.target.checked ? allIds : [])} className="accent-ink" /></th>
              <th>Product</th><th>Category</th>
              <th><button onClick={() => set('sort', 'price')} className="hover:underline">Price</button></th>
              <th><button onClick={() => set('sort', 'stock')} className="hover:underline">Stock</button></th>
              <th><button onClick={() => set('sort', 'sold')} className="hover:underline">Sold</button></th>
              <th>Rating</th><th>Status</th><th>Featured</th><th />
            </tr></thead>
            <tbody>
              {loading && !data ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={10}><Skeleton className="h-10" /></td></tr>) : data.items.map((p) => (
                <tr key={p.id} className={clsx('hover:bg-ink-50', selected.includes(p.id) && 'bg-brass-50')}>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))} className="accent-ink" /></td>
                  <td>
                    <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3"><img src={imgUrl(p.images[0], 80)} alt="" className="h-12 w-10 rounded object-cover" /><div><p className="font-semibold hover:underline">{p.name}</p><p className="text-xs text-ink-500">{p.id} · {p.gender} · {p.colors.length} colour{p.colors.length > 1 ? 's' : ''}</p></div></Link>
                  </td>
                  <td className="text-xs">{categories.find((c) => c.slug === p.category)?.name || p.category}</td>
                  <td><p className="font-semibold">{money(p.price)}</p>{p.compareAtPrice && <p className="text-xs text-ink-400 line-through">{money(p.compareAtPrice)}</p>}</td>
                  <td><span className={clsx('rounded-full px-2 py-0.5 text-xs font-bold', p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 8 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')}>{p.stock}</span></td>
                  <td>{p.soldCount}</td>
                  <td className="text-xs">{p.rating ? `${p.rating} ★ (${p.reviewCount})` : '—'}</td>
                  <td>
                    <select value={p.status} onChange={(e) => patch(p.id, { status: e.target.value })} className="rounded border border-ink-200 bg-white px-1.5 py-1 text-xs"><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
                  </td>
                  <td><button onClick={() => patch(p.id, { featured: !p.featured })} className={clsx('rounded p-1', p.featured ? 'text-brass' : 'text-ink-300 hover:text-ink')} aria-label="Toggle featured"><Star size={16} className={p.featured ? 'fill-brass' : ''} /></button></td>
                  <td className="whitespace-nowrap text-right"><Link to={`/products/${p.slug}`} target="_blank" className="mr-3 text-xs font-semibold underline">View</Link><ConfirmButton onConfirm={() => remove(p.id)} message={`Delete "${p.name}"? This cannot be undone.`}>Delete</ConfirmButton></td>
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

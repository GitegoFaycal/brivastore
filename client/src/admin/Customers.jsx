import { useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFetch, useDebounce } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { money, date, dateTime, imgUrl } from '../lib/format';
import { StatusBadge, Skeleton, Field } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { PageHeader, SearchInput, TablePager, ConfirmButton, StatCard } from './components';

export default function Customers() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 250);
  const get = (k) => sp.get(k) || '';
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const { data, loading } = useFetch(`/admin/customers${qs({ q: dq, sort: get('sort') || 'newest', page: get('page') || 1, limit: 20 })}`);
  return (
    <div>
      <PageHeader title="Customers" subtitle={data ? `${data.total} registered customers` : ''} />
      <div className="admin-card mb-4 grid gap-2 p-3 md:grid-cols-4">
        <div className="md:col-span-3"><SearchInput value={q} onChange={setQ} placeholder="Name, email or phone" /></div>
        <select className="admin-input" value={get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value)}><option value="newest">Newest</option><option value="spent">Highest spend</option><option value="orders">Most orders</option><option value="name">Name A-Z</option></select>
      </div>
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto"><table className="table-base">
          <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total spent</th><th>Last order</th><th>Joined</th></tr></thead>
          <tbody>{loading && !data ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6}><Skeleton className="h-8" /></td></tr>) : data.items.map((c) => (
            <tr key={c.id} className="hover:bg-ink-50">
              <td><Link to={`/admin/customers/${c.id}`} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-brass-100 text-sm font-bold text-brass-700">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span><div><p className="font-semibold hover:underline">{c.name}</p><p className="text-xs text-ink-500">{c.email}</p></div></Link></td>
              <td className="text-sm">{c.phone || '—'}</td><td>{c.orderCount}</td><td className="font-semibold">{money(c.totalSpent)}</td><td className="text-xs text-ink-500">{c.lastOrderAt ? date(c.lastOrderAt) : '—'}</td><td className="text-xs text-ink-500">{date(c.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table></div>
        {data && <TablePager page={data.page} pages={data.pages} total={data.total} onChange={(p) => set('page', String(p))} />}
      </div>
    </div>
  );
}

export function CustomerDetail() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/admin/customers/${id}`);
  const toast = useToast();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(null);
  if (loading || !data) return <Skeleton className="h-96" />;
  const c = data.customer;
  const valid = data.orders.filter((o) => o.status !== 'cancelled');
  const spent = valid.reduce((s, o) => s + o.total, 0);
  const save = async (e) => { e.preventDefault(); try { await api.put(`/admin/customers/${c.id}`, edit); toast.success('Customer updated'); setEdit(null); refetch(); } catch (err) { toast.error(err.message); } };
  const remove = async () => { await api.del(`/admin/customers/${c.id}`); toast.success('Customer deleted'); navigate('/admin/customers'); };
  return (
    <div>
      <PageHeader title={c.name} subtitle={`Customer since ${date(c.createdAt)}`}><Link to="/admin/customers" className="btn-ghost btn-sm"><ArrowLeft size={14} /> Customers</Link><button onClick={() => setEdit({ name: c.name, phone: c.phone || '', role: c.role, password: '' })} className="btn-secondary btn-sm">Edit</button></PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Orders" value={valid.length} /><StatCard label="Total spent" value={money(spent, { compact: true })} /><StatCard label="Average order" value={money(valid.length ? Math.round(spent / valid.length) : 0, { compact: true })} /></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="admin-card p-0"><h3 className="border-b border-ink-100 px-5 py-3 font-bold">Orders</h3>
            {!data.orders.length ? <p className="p-5 text-sm text-ink-500">No orders yet.</p> : <table className="table-base"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>{data.orders.map((o) => <tr key={o.id} className="hover:bg-ink-50"><td><Link to={`/admin/orders/${o.id}`} className="font-semibold hover:underline">{o.number}</Link></td><td className="text-xs text-ink-500">{dateTime(o.createdAt)}</td><td>{o.items.reduce((n, i) => n + i.qty, 0)}</td><td className="font-semibold">{money(o.total)}</td><td><StatusBadge status={o.status} /></td></tr>)}</tbody></table>}
          </div>
        </div>
        <div className="space-y-6">
          {edit ? (
            <form onSubmit={save} className="admin-card space-y-3">
              <h3 className="font-bold">Edit customer</h3>
              <Field label="Name"><input className="admin-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Phone"><input className="admin-input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
              <Field label="Role"><select className="admin-input" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}><option value="customer">Customer</option><option value="admin">Admin (staff)</option></select></Field>
              <Field label="Reset password" hint="Leave blank to keep"><input className="admin-input" type="password" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} /></Field>
              <div className="flex gap-2"><button className="btn-primary btn-sm">Save</button><button type="button" onClick={() => setEdit(null)} className="btn-ghost btn-sm">Cancel</button></div>
            </form>
          ) : (
            <div className="admin-card text-sm"><h3 className="font-bold">Contact</h3><p className="mt-2">{c.email}</p><p>{c.phone || 'No phone'}</p><p className="mt-1 text-xs uppercase tracking-wider text-ink-500">{c.role}</p>
              {c.addresses?.length > 0 && <div className="mt-4"><p className="label">Addresses</p>{c.addresses.map((a) => <p key={a.id} className="text-ink-700">{a.label}: {a.line1}, {a.sector} {a.district}</p>)}</div>}
            </div>
          )}
          <div className="admin-card"><h3 className="font-bold">Wishlist ({data.wishlist.length})</h3><ul className="mt-3 space-y-2">{data.wishlist.map((p) => <li key={p.id} className="flex items-center gap-3 text-sm"><img src={imgUrl(p.image, 60)} alt="" className="h-10 w-8 rounded object-cover" /><Link to={`/admin/products/${p.id}`} className="flex-1 hover:underline">{p.name}</Link><span className="text-xs">{money(p.price)}</span></li>)}{!data.wishlist.length && <p className="text-sm text-ink-500">Empty.</p>}</ul></div>
          <div className="admin-card"><ConfirmButton onConfirm={remove} message={`Delete ${c.name}'s account?`}>Delete customer</ConfirmButton></div>
        </div>
      </div>
    </div>
  );
}

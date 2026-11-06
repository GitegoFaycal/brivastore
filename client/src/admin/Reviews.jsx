import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { date, imgUrl, clsx } from '../lib/format';
import { Stars, StatusBadge, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { PageHeader, TablePager, ConfirmButton } from './components';

export default function Reviews() {
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || '';
  const page = sp.get('page') || 1;
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const { data, loading, refetch } = useFetch(`/admin/reviews${qs({ status, page, limit: 20 })}`);
  const toast = useToast();
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');
  const update = async (id, body, msg) => { try { await api.put(`/admin/reviews/${id}`, body); toast.success(msg); refetch(); } catch (e) { toast.error(e.message); } };
  const remove = async (id) => { try { await api.del(`/admin/reviews/${id}`); toast.success('Review deleted'); refetch(); } catch (e) { toast.error(e.message); } };
  return (
    <div>
      <PageHeader title="Reviews" subtitle="Approve, reply to or remove customer reviews. Only approved reviews are shown on the store." />
      <div className="mb-4 flex gap-1.5">{[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([v, l]) => <button key={v} onClick={() => set('status', v)} className={clsx('rounded-full border px-3 py-1.5 text-xs font-semibold', status === v ? 'border-ink bg-ink text-white' : 'border-ink-200 bg-white')}>{l}</button>)}</div>
      <div className="space-y-3">
        {loading && !data ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : data.items.map((r) => (
          <div key={r.id} className="admin-card">
            <div className="flex flex-wrap items-start gap-4">
              {r.product && <Link to={`/admin/products/${r.product.id}`}><img src={imgUrl(r.product.image, 100)} alt="" className="h-20 w-16 rounded object-cover" /></Link>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><Stars value={r.rating} /><b className="text-sm">{r.title}</b><StatusBadge status={r.status} />{r.verified && <span className="text-xs text-green-700">Verified buyer</span>}</div>
                <p className="mt-1 text-sm text-ink-700">{r.body}</p>
                <p className="mt-1 text-xs text-ink-500">{r.name} · {date(r.createdAt)} · on <Link to={r.product ? `/products/${r.product.slug}` : '#'} className="underline">{r.product?.name || 'deleted product'}</Link></p>
                {r.reply && <p className="mt-2 rounded bg-cream-100 p-2 text-xs"><b>Reply:</b> {r.reply.text}</p>}
                {replying === r.id && <form onSubmit={(e) => { e.preventDefault(); update(r.id, { reply }, 'Reply posted'); setReplying(null); setReply(''); }} className="mt-2 flex gap-2"><input autoFocus value={reply} onChange={(e) => setReply(e.target.value)} className="admin-input" placeholder="Reply as Briva Store" /><button className="btn-primary btn-sm">Post</button></form>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {r.status !== 'approved' && <button onClick={() => update(r.id, { status: 'approved' }, 'Review approved')} className="btn-primary btn-sm">Approve</button>}
                {r.status !== 'rejected' && <button onClick={() => update(r.id, { status: 'rejected' }, 'Review rejected')} className="btn-secondary btn-sm">Reject</button>}
                <button onClick={() => { setReplying(r.id); setReply(r.reply?.text || ''); }} className="btn-ghost btn-sm">Reply</button>
                <ConfirmButton onConfirm={() => remove(r.id)} message="Delete this review?">Delete</ConfirmButton>
              </div>
            </div>
          </div>
        ))}
        {data && !data.items.length && <p className="admin-card text-sm text-ink-500">No reviews here.</p>}
      </div>
      {data && <div className="admin-card mt-3 p-0"><TablePager page={data.page} pages={data.pages} total={data.total} onChange={(p) => set('page', String(p))} /></div>}
    </div>
  );
}

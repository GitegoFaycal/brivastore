import { useFetch } from '../lib/hooks';
import { api } from '../lib/api';
import { dateTime } from '../lib/format';
import { Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { PageHeader, ConfirmButton, StatCard } from './components';

export default function Marketing() {
  const subs = useFetch('/admin/subscribers');
  const msgs = useFetch('/admin/messages');
  const toast = useToast();
  const exportCsv = () => {
    const csv = ['email,subscribed_at', ...(subs.data || []).map((s) => `${s.email},${s.createdAt}`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'briva-subscribers.csv'; a.click();
  };
  const markRead = async (id) => { await api.put(`/admin/messages/${id}`); msgs.refetch(); };
  const unread = (msgs.data || []).filter((m) => !m.read).length;
  return (
    <div>
      <PageHeader title="Subscribers & messages" subtitle="Newsletter signups and contact-form messages."><button onClick={exportCsv} className="btn-secondary btn-sm">Export subscribers CSV</button></PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Subscribers" value={subs.data?.length ?? '–'} /><StatCard label="Messages" value={msgs.data?.length ?? '–'} /><StatCard label="Unread" value={unread} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card p-0"><h3 className="border-b border-ink-100 px-5 py-3 font-bold">Newsletter subscribers</h3>
          {!subs.data ? <Skeleton className="m-4 h-40" /> : <table className="table-base"><thead><tr><th>Email</th><th>Source</th><th>Date</th><th /></tr></thead><tbody>{subs.data.map((s) => <tr key={s.id}><td className="font-medium">{s.email}</td><td className="text-xs text-ink-500">{s.source || 'website'}</td><td className="text-xs text-ink-500">{dateTime(s.createdAt)}</td><td className="text-right"><ConfirmButton onConfirm={async () => { await api.del(`/admin/subscribers/${s.id}`); toast.success('Removed'); subs.refetch(); }} message="Remove subscriber?" /></td></tr>)}</tbody></table>}
        </div>
        <div className="admin-card p-0"><h3 className="border-b border-ink-100 px-5 py-3 font-bold">Contact messages</h3>
          {!msgs.data ? <Skeleton className="m-4 h-40" /> : !msgs.data.length ? <p className="p-5 text-sm text-ink-500">No messages yet. Messages from the Contact page appear here.</p> : (
            <ul className="divide-y divide-ink-100">{msgs.data.map((m) => (
              <li key={m.id} className={`p-4 text-sm ${m.read ? '' : 'bg-brass-50'}`}>
                <div className="flex items-center justify-between"><p className="font-semibold">{m.name} <span className="font-normal text-ink-500">· {m.email || m.phone}</span></p><span className="text-xs text-ink-500">{dateTime(m.createdAt)}</span></div>
                <p className="mt-1 text-ink-700">{m.message}</p>
                <div className="mt-2 flex gap-3 text-xs">{m.phone && <a href={`https://wa.me/${m.phone.replace(/[^\d]/g, '').replace(/^0/, '250')}`} target="_blank" rel="noreferrer" className="font-semibold underline">Reply on WhatsApp</a>}{m.email && <a href={`mailto:${m.email}`} className="font-semibold underline">Reply by email</a>}{!m.read && <button onClick={() => markRead(m.id)} className="underline">Mark read</button>}</div>
              </li>
            ))}</ul>
          )}
        </div>
      </div>
    </div>
  );
}

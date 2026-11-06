import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Search, Trash2 } from 'lucide-react';
import { money, clsx } from '../lib/format';
import { Spinner } from '../components/ui';

/* Validated categorical palette (dataviz reference instance, light mode) */
export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
export const SEQ_BLUE = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'];

export function StatCard({ label, value, change, hint, icon: Icon, tone }) {
  const up = change > 0; const down = change < 0;
  return (
    <div className="admin-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        {Icon && <span className={clsx('rounded-md p-1.5', tone || 'bg-ink-100 text-ink-600')}><Icon size={16} /></span>}
      </div>
      <p className="mt-2 font-display text-4xl leading-none">{value}</p>
      {(change !== undefined || hint) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
          {change !== undefined && <span className={clsx('inline-flex items-center gap-0.5 font-semibold', up && 'text-green-700', down && 'text-red-700')}>{up ? <TrendingUp size={12} /> : down ? <TrendingDown size={12} /> : null}{change > 0 ? '+' : ''}{change}%</span>}
          {hint && <span>{hint}</span>}
        </p>
      )}
    </div>
  );
}

const tooltipStyle = { borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,.08)' };

export function RevenueChart({ data, height = 260 }) {
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.25} /><stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#efefef" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tickFormatter={(v) => money(v, { compact: true }).replace(' RWF', '')} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtDate} formatter={(v, n) => [n === 'revenue' ? money(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
        <Area type="monotone" dataKey="revenue" stroke={SERIES[0]} strokeWidth={2} fill="url(#rev)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data, height = 200 }) {
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke="#efefef" />
        <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={fmtDate} formatter={(v) => [v, 'Orders']} cursor={{ fill: '#f2f2f2' }} />
        <Bar dataKey="orders" fill={SERIES[2]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars for a category breakdown; one series so no legend. */
export function HBarChart({ data, nameKey = 'name', valueKey = 'revenue', height = 260, format = (v) => money(v) }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} stroke="#efefef" />
        <XAxis type="number" tickFormatter={(v) => money(v, { compact: true }).replace(' RWF', '')} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} width={120} tick={{ fontSize: 11, fill: '#2b2b2b' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [format(v), 'Revenue']} cursor={{ fill: '#f2f2f2' }} />
        <Bar dataKey={valueKey} fill={SERIES[0]} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={SEQ_BLUE[Math.max(1, SEQ_BLUE.length - 1 - Math.min(i, SEQ_BLUE.length - 2))]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Stacked single bar as a "share" figure with legend + direct labels */
export function ShareBar({ data, nameKey = 'name', valueKey = 'value', labels = {} }) {
  const total = data.reduce((s, d) => s + d[valueKey], 0) || 1;
  return (
    <div>
      <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-md">
        {data.map((d, i) => <div key={d[nameKey]} title={`${labels[d[nameKey]] || d[nameKey]}: ${Math.round((d[valueKey] / total) * 100)}%`} style={{ width: `${(d[valueKey] / total) * 100}%`, background: SERIES[i % SERIES.length] }} />)}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d[nameKey]} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} /><span className="flex-1 truncate text-ink-600">{labels[d[nameKey]] || d[nameKey]}</span><span className="font-semibold">{Math.round((d[valueKey] / total) * 100)}%</span></li>
        ))}
      </ul>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="admin-input pl-9" /></div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={clsx('relative h-5 w-9 rounded-full transition', checked ? 'bg-green-600' : 'bg-ink-300')}><span className={clsx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-[18px]' : 'left-0.5')} /></button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

export function ConfirmButton({ onConfirm, children, className, message = 'Are you sure?', icon = true }) {
  const [busy, setBusy] = useState(false);
  const go = async () => { if (!window.confirm(message)) return; setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return <button type="button" onClick={go} disabled={busy} className={clsx('inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50', className)}>{busy ? <Spinner className="h-3 w-3" /> : icon ? <Trash2 size={14} /> : null}{children}</button>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="font-display text-4xl">{title}</h2>{subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}</div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function TablePager({ page, pages, total, onChange }) {
  if (!pages || pages <= 1) return <p className="px-4 py-3 text-xs text-ink-500">{total} total</p>;
  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-ink-500">
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-1"><button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded border border-ink-200 px-2.5 py-1 font-semibold disabled:opacity-40">Prev</button><button disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded border border-ink-200 px-2.5 py-1 font-semibold disabled:opacity-40">Next</button></div>
    </div>
  );
}

export function ImageListInput({ value = [], onChange }) {
  const [draft, setDraft] = useState('');
  const add = () => { const u = draft.trim(); if (!u) return; onChange([...value, u]); setDraft(''); };
  return (
    <div>
      <div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Paste image URL and press Enter" className="admin-input" /><button type="button" onClick={add} className="btn-secondary btn-sm">Add</button></div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((u, i) => (
          <div key={u + i} className="group relative h-24 w-[72px] overflow-hidden rounded-md border border-ink-200 bg-ink-50">
            <img src={u} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 px-1 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => i > 0 && onChange([...value.slice(0, i - 1), u, value[i - 1], ...value.slice(i + 1)])}>◀</button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
              <button type="button" onClick={() => i < value.length - 1 && onChange([...value.slice(0, i), value[i + 1], u, ...value.slice(i + 2)])}>▶</button>
            </div>
            {i === 0 && <span className="absolute left-0 top-0 bg-ink px-1 text-[9px] font-bold uppercase text-white">Main</span>}
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-400">Tip: upload photos to Instagram, Google Drive (public) or any image host and paste the link. First image is the main photo.</p>
    </div>
  );
}

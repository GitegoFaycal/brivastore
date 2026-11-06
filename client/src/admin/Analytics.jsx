import { useState } from 'react';
import { useFetch } from '../lib/hooks';
import { money, PAYMENT_LABELS, STATUS_LABELS } from '../lib/format';
import { Skeleton } from '../components/ui';
import { PageHeader, StatCard, RevenueChart, OrdersChart, HBarChart, ShareBar } from './components';

export default function Analytics() {
  const [days, setDays] = useState(90);
  const { data, loading } = useFetch(`/admin/dashboard?days=${days}`);
  if (loading || !data) return <Skeleton className="h-96" />;
  const k = data.kpis;
  const weekly = [];
  data.revenueByDay.forEach((d, i) => { const w = Math.floor(i / 7); weekly[w] = weekly[w] || { date: d.date, revenue: 0, orders: 0 }; weekly[w].revenue += d.revenue; weekly[w].orders += d.orders; });
  const best = [...data.revenueByDay].sort((a, b) => b.revenue - a.revenue)[0];
  const byDow = Array.from({ length: 7 }, (_, i) => ({ name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], revenue: 0 }));
  data.revenueByDay.forEach((d) => { byDow[new Date(d.date).getDay()].revenue += d.revenue; });
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Sales performance over time.">
        <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-semibold">{[30, 90, 180, 365].map((d) => <button key={d} onClick={() => setDays(d)} className={`rounded-md px-3 py-1.5 ${days === d ? 'bg-ink text-white' : 'hover:bg-ink-100'}`}>{d}d</button>)}</div>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={money(k.revenue, { compact: true })} change={k.revenueChange} hint="vs previous period" />
        <StatCard label="Orders" value={k.orders} change={k.ordersChange} hint={`${k.itemsSold} items`} />
        <StatCard label="Average order value" value={money(k.aov, { compact: true })} change={k.aovChange} />
        <StatCard label="Best day" value={best ? money(best.revenue, { compact: true }) : '–'} hint={best ? new Date(best.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} />
      </div>
      <div className="admin-card"><h3 className="mb-3 font-bold">Revenue per week</h3><RevenueChart data={weekly} height={240} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card"><h3 className="mb-3 font-bold">Orders per day</h3><OrdersChart data={data.revenueByDay} height={220} /></div>
        <div className="admin-card"><h3 className="mb-3 font-bold">Revenue by day of week</h3><HBarChart data={byDow} height={220} /></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card"><h3 className="mb-3 font-bold">Revenue by category</h3><HBarChart data={data.byCategory} height={320} /></div>
        <div className="admin-card"><h3 className="mb-3 font-bold">Payment methods</h3><ShareBar data={data.paymentBreakdown.map((p) => ({ name: p.method, value: p.revenue }))} labels={PAYMENT_LABELS} /><h3 className="mb-3 mt-6 font-bold">Order statuses</h3><ShareBar data={Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }))} labels={STATUS_LABELS} /></div>
        <div className="admin-card"><h3 className="mb-3 font-bold">Top products by revenue</h3><table className="table-base"><thead><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>{data.topProducts.map((p) => <tr key={p.productId}><td className="text-sm">{p.name}</td><td>{p.qty}</td><td className="font-semibold">{money(p.revenue, { compact: true })}</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, ShoppingCart, Users, Receipt, AlertTriangle, Star } from 'lucide-react';
import { useFetch } from '../lib/hooks';
import { money, timeAgo, imgUrl, PAYMENT_LABELS, STATUS_LABELS } from '../lib/format';
import { StatusBadge, Skeleton } from '../components/ui';
import { StatCard, RevenueChart, OrdersChart, HBarChart, ShareBar, PageHeader } from './components';

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const { data, loading } = useFetch(`/admin/dashboard?days=${days}`);
  if (loading || !data) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const k = data.kpis;
  const statusData = Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }));
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Overview of the last ${days} days vs the previous ${days}.`}>
        <div className="flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-semibold">
          {[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} className={`rounded-md px-3 py-1.5 ${days === d ? 'bg-ink text-white' : 'hover:bg-ink-100'}`}>{d}d</button>)}
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={money(k.revenue, { compact: true })} change={k.revenueChange} hint="vs previous period" icon={Banknote} tone="bg-green-50 text-green-700" />
        <StatCard label="Orders" value={k.orders} change={k.ordersChange} hint={`${k.itemsSold} items sold`} icon={ShoppingCart} tone="bg-sky-50 text-sky-700" />
        <StatCard label="Average order" value={money(k.aov, { compact: true })} change={k.aovChange} hint="per order" icon={Receipt} tone="bg-violet-50 text-violet-700" />
        <StatCard label="Customers" value={k.customers} change={k.newCustomersChange} hint={`${k.newCustomers} new`} icon={Users} tone="bg-amber-50 text-amber-700" />
      </div>

      {(k.pendingOrders > 0 || k.pendingReviews > 0 || data.lowStock.length > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          {k.pendingOrders > 0 && <Link to="/admin/orders?status=pending" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm"><ShoppingCart size={18} className="text-amber-700" /><span><b>{k.pendingOrders}</b> order{k.pendingOrders > 1 ? 's' : ''} waiting for confirmation</span></Link>}
          {k.pendingReviews > 0 && <Link to="/admin/reviews?status=pending" className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm"><Star size={18} className="text-sky-700" /><span><b>{k.pendingReviews}</b> review{k.pendingReviews > 1 ? 's' : ''} to moderate</span></Link>}
          {data.lowStock.length > 0 && <Link to="/admin/products?stock=low" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm"><AlertTriangle size={18} className="text-red-700" /><span><b>{data.lowStock.length}</b> product{data.lowStock.length > 1 ? 's' : ''} low or out of stock</span></Link>}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Revenue</h3><span className="text-xs text-ink-500">RWF per day</span></div>
          <RevenueChart data={data.revenueByDay} />
          <h3 className="mb-2 mt-6 font-bold">Orders per day</h3>
          <OrdersChart data={data.revenueByDay} height={160} />
        </div>
        <div className="space-y-4">
          <div className="admin-card">
            <h3 className="mb-3 font-bold">Orders by status</h3>
            <ShareBar data={statusData} labels={STATUS_LABELS} />
          </div>
          <div className="admin-card">
            <h3 className="mb-3 font-bold">Revenue by payment method</h3>
            <ShareBar data={data.paymentBreakdown.map((p) => ({ name: p.method, value: p.revenue }))} labels={PAYMENT_LABELS} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card lg:col-span-1">
          <h3 className="mb-3 font-bold">Top products</h3>
          <ul className="space-y-3">
            {data.topProducts.map((p, i) => (
              <li key={p.productId} className="flex items-center gap-3"><span className="w-4 text-xs font-bold text-ink-400">{i + 1}</span><img src={imgUrl(p.image, 80)} alt="" className="h-12 w-10 rounded object-cover" /><div className="min-w-0 flex-1"><Link to={`/admin/products/${p.productId}`} className="truncate text-sm font-semibold hover:underline">{p.name}</Link><p className="text-xs text-ink-500">{p.qty} sold</p></div><span className="text-sm font-bold">{money(p.revenue, { compact: true })}</span></li>
            ))}
          </ul>
        </div>
        <div className="admin-card lg:col-span-1">
          <h3 className="mb-3 font-bold">Revenue by category</h3>
          <HBarChart data={data.byCategory.slice(0, 7)} height={280} />
        </div>
        <div className="admin-card lg:col-span-1">
          <h3 className="mb-3 font-bold">Low stock</h3>
          {!data.lowStock.length && <p className="text-sm text-ink-500">All products are well stocked.</p>}
          <ul className="space-y-2.5">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3"><img src={imgUrl(p.image, 80)} alt="" className="h-10 w-8 rounded object-cover" /><Link to={`/admin/products/${p.id}`} className="flex-1 truncate text-sm font-semibold hover:underline">{p.name}</Link><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-card p-0">
        <div className="flex items-center justify-between px-5 py-4"><h3 className="font-bold">Recent orders</h3><Link to="/admin/orders" className="text-xs font-semibold underline">View all</Link></div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>When</th></tr></thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-ink-50">
                  <td><Link to={`/admin/orders/${o.id}`} className="font-semibold hover:underline">{o.number}</Link></td>
                  <td>{o.customer.name}</td>
                  <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td className="font-semibold">{money(o.total)}</td>
                  <td className="text-xs">{PAYMENT_LABELS[o.payment.method]} · <span className="capitalize">{o.payment.status.replace('_', ' ')}</span></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-xs text-ink-500">{timeAgo(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

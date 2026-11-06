import { useState } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Star, Ticket, Layers, LayoutTemplate, Settings, Mail, LogOut, Menu, X, ExternalLink, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTitle } from '../lib/hooks';
import { clsx } from '../lib/format';
import { Field, Spinner } from '../components/ui';
import Dashboard from './Dashboard';
import Products from './Products';
import ProductForm from './ProductForm';
import Orders, { OrderDetail } from './Orders';
import Customers, { CustomerDetail } from './Customers';
import Reviews from './Reviews';
import Promos from './Promos';
import Catalog from './Catalog';
import Content from './Content';
import SettingsPage from './Settings';
import Marketing from './Marketing';
import Analytics from './Analytics';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/catalog', label: 'Categories & collections', icon: Layers },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/promos', label: 'Discounts', icon: Ticket },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/content', label: 'Homepage & content', icon: LayoutTemplate },
  { to: '/admin/marketing', label: 'Subscribers & messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner className="h-8 w-8 text-ink" /></div>;
  if (!user || user.role !== 'admin') return <AdminLogin />;
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="promos" element={<Promos />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="content" element={<Content />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const current = NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  useTitle(current ? `${current.label} · Admin` : 'Admin');

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/admin" className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-brass font-display text-xl text-ink">B</span><span className="font-display text-xl tracking-wider text-white">BRIVA ADMIN</span></Link>
        <button onClick={() => setOpen(false)} className="text-ink-400 lg:hidden"><X size={20} /></button>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={({ isActive }) => clsx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white')}>
            <n.icon size={17} />{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" className="flex items-center gap-2 text-xs text-ink-300 hover:text-white"><ExternalLink size={14} /> View storefront</Link>
        <div className="mt-3 flex items-center justify-between">
          <div><p className="text-sm font-semibold text-white">{user.name}</p><p className="text-xs text-ink-400">{user.email}</p></div>
          <button onClick={() => { logout(); navigate('/'); }} className="rounded-md p-2 text-ink-300 hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut size={16} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:flex">
      <aside className="hidden w-64 shrink-0 bg-ink lg:fixed lg:inset-y-0 lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72 bg-ink animate-slideInLeft">{sidebar}</aside></div>}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-ink-100 bg-white px-4 lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-ink-100 lg:hidden"><Menu size={20} /></button>
          <h1 className="text-sm font-bold uppercase tracking-wider text-ink-600">{current?.label || 'Admin'}</h1>
          <div className="ml-auto flex items-center gap-2"><Link to="/admin/products/new" className="btn-primary btn-sm">+ Product</Link></div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function AdminLogin() {
  const { login, user, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: 'admin@brivastore.rw', password: '' });
  const [busy, setBusy] = useState(false);
  useTitle('Admin sign in');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role !== 'admin') { toast.error('This account does not have admin access.'); logout(); }
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift">
        <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-md bg-ink font-display text-xl text-brass">B</span><span className="font-display text-2xl tracking-wider">BRIVA ADMIN</span></div>
        <p className="mt-3 text-sm text-ink-500">{user ? `Signed in as ${user.email}, which is not an admin.` : 'Sign in to manage the store.'}</p>
        <div className="mt-6 space-y-4">
          <Field label="Email"><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password"><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoFocus /></Field>
          <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Sign in'}</button>
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">Demo: admin@brivastore.rw / <button type="button" className="underline" onClick={() => setForm({ email: 'admin@brivastore.rw', password: 'Admin@123' })}>Admin@123</button></p>
        <Link to="/" className="mt-4 block text-center text-xs font-semibold underline">← Back to store</Link>
      </form>
    </div>
  );
}

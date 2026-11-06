import { useState } from 'react';
import { Link, NavLink, Navigate, Routes, Route, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Package, MapPin, Heart, User, LogOut, Trash2, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { useFetch, useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { money, date, imgUrl, clsx } from '../lib/format';
import { Field, Spinner, StatusBadge, EmptyState, Modal, Skeleton } from '../components/ui';
import { OrderSummary, OrderTimeline } from './OrderConfirmation';

export default function Account({ mode }) {
  const { user } = useAuth();
  if (mode === 'login' || mode === 'register') {
    if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/account'} replace />;
    return <AuthForm mode={mode} />;
  }
  return (
    <div className="container-x py-8">
      <h1 className="h-display text-5xl">My account</h1>
      <p className="mt-1 text-sm text-ink-500">Welcome back, {user.name.split(' ')[0]}.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <AccountNav />
        <div className="lg:col-span-9">
          <Routes>
            <Route index element={<Orders />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/account" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AccountNav() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const items = [
    { to: '/account/orders', label: 'Orders', icon: Package },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account/profile', label: 'Profile', icon: User },
  ];
  return (
    <nav className="lg:col-span-3">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((it) => (
          <li key={it.to}><NavLink to={it.to} className={({ isActive }) => clsx('flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold', isActive || (it.to === '/account/orders' && window.location.pathname === '/account') ? 'bg-ink text-white' : 'hover:bg-ink-100')}><it.icon size={16} />{it.label}</NavLink></li>
        ))}
        {user.role === 'admin' && <li><Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brass hover:bg-brass-50">Admin dashboard</Link></li>}
        <li><button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-500 hover:bg-ink-100"><LogOut size={16} />Sign out</button></li>
      </ul>
    </nav>
  );
}

function AuthForm({ mode }) {
  useTitle(mode === 'login' ? 'Sign in' : 'Create account');
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const u = mode === 'login' ? await login(form.email, form.password) : await register(form);
      toast.success(mode === 'login' ? `Welcome back, ${u.name.split(' ')[0]}!` : 'Account created. Welcome to Briva!');
      navigate(sp.get('next') || (u.role === 'admin' ? '/admin' : '/account'));
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="container-x grid min-h-[70vh] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden aspect-[4/5] overflow-hidden rounded-3xl bg-cream-200 lg:block">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mx-auto w-full max-w-md">
        <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join Briva'}</p>
        <h1 className="h-display mt-2 text-5xl">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <p className="mt-2 text-sm text-ink-500">{mode === 'login' ? 'Track orders, save addresses and keep your wishlist.' : 'Faster checkout, order history and 10% off your first order with WELCOME10.'}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && <Field label="Full name"><input className="input" required value={form.name} onChange={set('name')} autoComplete="name" /></Field>}
          <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
          {mode === 'register' && <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} placeholder="078 000 0000" autoComplete="tel" /></Field>}
          <Field label="Password"><input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></Field>
          <button disabled={busy} className="btn-primary w-full text-base">{busy ? <Spinner /> : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-600">
          {mode === 'login' ? <>New here? <Link to={`/account/register${sp.get('next') ? `?next=${sp.get('next')}` : ''}`} className="font-semibold underline">Create an account</Link></> : <>Already have an account? <Link to="/account/login" className="font-semibold underline">Sign in</Link></>}
        </p>
        {mode === 'login' && (
          <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-cream-50 p-4 text-xs text-ink-600">
            <p className="font-bold uppercase tracking-wider">Demo accounts</p>
            <p className="mt-1">Customer: <button type="button" onClick={() => setForm({ ...form, email: 'aline@example.com', password: 'password123' })} className="font-mono underline">aline@example.com / password123</button></p>
            <p>Admin: <button type="button" onClick={() => setForm({ ...form, email: 'admin@brivastore.rw', password: 'Admin@123' })} className="font-mono underline">admin@brivastore.rw / Admin@123</button></p>
          </div>
        )}
      </div>
    </div>
  );
}

function Orders() {
  useTitle('My orders');
  const { data, loading } = useFetch('/orders/mine');
  if (loading) return <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>;
  if (!data?.length) return <EmptyState icon={Package} title="No orders yet" body="Your orders will show up here once you check out." action="Start shopping" actionTo="/shop" />;
  return (
    <ul className="space-y-3">
      {data.map((o) => (
        <li key={o.id}>
          <Link to={`/account/orders/${o.id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-lift">
            <div className="flex -space-x-3">{o.items.slice(0, 3).map((it, i) => <img key={i} src={imgUrl(it.image, 100)} alt="" className="h-14 w-11 rounded-md border-2 border-white object-cover" />)}</div>
            <div className="flex-1"><p className="font-bold">{o.number}</p><p className="text-xs text-ink-500">{date(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} item(s)</p></div>
            <div className="text-right"><p className="font-bold">{money(o.total)}</p><StatusBadge status={o.status} /></div>
            <ChevronRight size={18} className="text-ink-400" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/orders/${id}`);
  const toast = useToast();
  const { waLink } = useStore();
  const [busy, setBusy] = useState(false);
  const order = data?.order;
  useTitle(order ? `Order ${order.number}` : 'Order');
  if (loading || !order) return <Skeleton className="h-64" />;
  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try { await api.post(`/orders/${order.id}/cancel`); toast.success('Order cancelled'); refetch(); } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-5">
      <Link to="/account/orders" className="text-sm font-semibold underline">← All orders</Link>
      <OrderTimeline order={order} />
      <OrderSummary order={order} />
      <div className="flex flex-wrap gap-3">
        <a href={waLink(`Hi Briva! Question about my order ${order.number}.`)} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">Ask on WhatsApp</a>
        {['pending', 'confirmed'].includes(order.status) && <button onClick={cancel} disabled={busy} className="btn-ghost btn-sm text-red-600">{busy ? <Spinner /> : 'Cancel order'}</button>}
      </div>
    </div>
  );
}

function Addresses() {
  useTitle('Addresses');
  const { user, setUser } = useAuth();
  const { delivery } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: 'Home', line1: '', sector: '', district: 'Gasabo', city: 'Kigali', phone: user.phone || '', default: false });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const add = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const d = await api.post('/auth/me/addresses', form); setUser(d.user); setOpen(false); toast.success('Address saved'); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const remove = async (id) => { try { const d = await api.del(`/auth/me/addresses/${id}`); setUser(d.user); } catch (err) { toast.error(err.message); } };
  return (
    <div>
      <div className="flex items-center justify-between"><h2 className="font-display text-3xl">Saved addresses</h2><button onClick={() => setOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> Add address</button></div>
      {!user.addresses?.length ? <EmptyState icon={MapPin} title="No addresses yet" body="Save your home or office for one-tap checkout." /> : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {user.addresses.map((a) => (
            <li key={a.id} className="card relative p-4 text-sm">
              <p className="font-bold">{a.label} {a.default && <span className="ml-1 rounded bg-ink px-1.5 py-0.5 text-[10px] uppercase text-white">Default</span>}</p>
              <p className="mt-1">{a.line1}</p><p className="text-ink-600">{a.sector}, {a.district}, {a.city}</p><p className="text-ink-600">{a.phone}</p>
              <button onClick={() => remove(a.id)} className="absolute right-3 top-3 text-ink-400 hover:text-brick" aria-label="Delete"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New address" size="sm">
        <form onSubmit={add} className="space-y-3 p-5">
          <Field label="Label"><input className="input" value={form.label} onChange={set('label')} /></Field>
          <Field label="Street / house / landmark"><input className="input" required value={form.line1} onChange={set('line1')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sector"><input className="input" value={form.sector} onChange={set('sector')} /></Field>
            <Field label="District"><select className="input" value={form.district} onChange={set('district')}>{delivery.districts.map((d) => <option key={d}>{d}</option>)}<option>Other</option></select></Field>
          </div>
          <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.default} onChange={set('default')} className="accent-ink" /> Make default</label>
          <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Save address'}</button>
        </form>
      </Modal>
    </div>
  );
}

function Profile() {
  useTitle('Profile');
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', currentPassword: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await updateProfile(form); toast.success('Profile updated'); setForm({ ...form, currentPassword: '', password: '' }); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card max-w-lg space-y-4 p-6">
      <h2 className="font-display text-3xl">Profile</h2>
      <Field label="Full name"><input className="input" value={form.name} onChange={set('name')} /></Field>
      <Field label="Email"><input className="input" value={user.email} disabled /></Field>
      <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
      <div className="border-t border-ink-100 pt-4"><p className="label">Change password (optional)</p>
        <div className="grid gap-3 sm:grid-cols-2"><input className="input" type="password" placeholder="Current password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" /><input className="input" type="password" placeholder="New password" value={form.password} onChange={set('password')} autoComplete="new-password" /></div>
      </div>
      <button disabled={busy} className="btn-primary">{busy ? <Spinner /> : 'Save changes'}</button>
    </form>
  );
}

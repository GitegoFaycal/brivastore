import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { clsx, imgUrl } from '../../lib/format';
import SearchOverlay from './SearchOverlay';
import { Drawer } from '../ui';

const NAV = [
  { label: 'Women', to: '/women', gender: 'women' },
  { label: 'Men', to: '/men', gender: 'men' },
  { label: 'New In', to: '/new' },
  { label: 'Collections', to: '/shop', mega: 'collections' },
  { label: 'Lookbook', to: '/lookbook' },
  { label: 'Sale', to: '/sale', accent: true },
];

export function Logo({ className }) {
  return (
    <Link to="/" className={clsx('flex items-center gap-2', className)} aria-label="Briva Store home">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-ink font-display text-xl leading-none text-brass">B</span>
      <span className="font-display text-2xl tracking-wider">BRIVA <span className="text-brass">STORE</span></span>
    </Link>
  );
}

export default function Header() {
  const { categories, collections } = useStore();
  const cart = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const [mega, setMega] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const closeTimer = useRef(null);

  useEffect(() => { setMega(null); setMobileOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openMega = (key) => { clearTimeout(closeTimer.current); setMega(key); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMega(null), 120); };

  const megaCats = (gender) => categories.filter((c) => c.gender === gender || c.gender === 'unisex');
  const featuredCols = collections.filter((c) => c.featured);

  return (
    <header className={clsx('sticky top-0 z-50 bg-white transition-shadow', scrolled && 'shadow-soft')} onMouseLeave={scheduleClose}>
      <div className="container-x flex h-16 items-center gap-4 lg:h-[72px]">
        <button className="rounded-full p-2 hover:bg-ink-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu size={22} /></button>
        <Logo />

        <nav className="ml-6 hidden h-full items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <div key={item.label} className="h-full" onMouseEnter={() => (item.gender || item.mega ? openMega(item.gender || item.mega) : setMega(null))}>
              <NavLink
                to={item.to}
                className={({ isActive }) => clsx('flex h-full items-center border-b-2 px-3 text-[13px] font-bold uppercase tracking-[0.12em] transition', isActive || mega === (item.gender || item.mega) ? 'border-ink' : 'border-transparent', item.accent && 'text-brick')}
              >
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-full border border-ink-200 px-3.5 py-2 text-sm text-ink-500 hover:border-ink md:flex" aria-label="Search">
            <Search size={16} /> <span className="pr-6">Search suits, tees, dresses…</span><kbd className="hidden rounded border border-ink-200 px-1.5 text-[10px] lg:inline">⌘K</kbd>
          </button>
          <button onClick={() => setSearchOpen(true)} className="rounded-full p-2 hover:bg-ink-100 md:hidden" aria-label="Search"><Search size={21} /></button>
          <Link to={user ? '/account' : '/account/login'} className="rounded-full p-2 hover:bg-ink-100" aria-label="Account"><User size={21} /></Link>
          <Link to="/wishlist" className="relative rounded-full p-2 hover:bg-ink-100" aria-label="Wishlist">
            <Heart size={21} />
            {wishlist.count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-[18px] place-items-center rounded-full bg-brick px-1 text-[10px] font-bold text-white">{wishlist.count}</span>}
          </Link>
          <button onClick={cart.openCart} className="relative rounded-full p-2 hover:bg-ink-100" aria-label="Bag">
            <ShoppingBag size={21} />
            {cart.count > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{cart.count}</span>}
          </button>
        </div>
      </div>

      {/* Mega menu */}
      {mega && (
        <div className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white shadow-lift lg:block" onMouseEnter={() => openMega(mega)}>
          <div className="container-x grid grid-cols-12 gap-8 py-8">
            {mega === 'collections' ? (
              <>
                <div className="col-span-3">
                  <p className="eyebrow mb-3">Shop by edit</p>
                  <ul className="space-y-2 text-sm">
                    {collections.map((c) => <li key={c.id}><Link to={`/collections/${c.slug}`} className="hover:underline">{c.name}</Link></li>)}
                    <li><Link to="/shop" className="font-semibold hover:underline">Shop everything</Link></li>
                  </ul>
                </div>
                <div className="col-span-9 grid grid-cols-4 gap-4">
                  {featuredCols.slice(0, 4).map((c) => (
                    <Link key={c.id} to={`/collections/${c.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200">
                      <img src={imgUrl(c.image, 500)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                      <span className="absolute bottom-3 left-3 font-display text-2xl text-white">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="col-span-3">
                  <p className="eyebrow mb-3">Categories</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to={`/${mega}`} className="font-semibold hover:underline">All {mega === 'men' ? "men's" : "women's"}</Link></li>
                    {megaCats(mega).map((c) => <li key={c.id}><Link to={`/category/${c.slug}`} className="hover:underline">{c.name}</Link></li>)}
                  </ul>
                </div>
                <div className="col-span-3">
                  <p className="eyebrow mb-3">Featured</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link to={`/${mega}?collection=new-arrivals`} className="hover:underline">New arrivals</Link></li>
                    <li><Link to={`/${mega}?collection=best-sellers`} className="hover:underline">Best sellers</Link></li>
                    <li><Link to={`/${mega}?onSale=true`} className="text-brick hover:underline">Sale</Link></li>
                    <li><Link to={`/${mega}?collection=${mega === 'men' ? 'formal-shop' : 'wedding-guest'}`} className="hover:underline">{mega === 'men' ? 'The Formal Shop' : 'Wedding Guest'}</Link></li>
                    <li><Link to={`/${mega}?collection=street-edit`} className="hover:underline">Street Edit</Link></li>
                  </ul>
                </div>
                <div className="col-span-6 grid grid-cols-3 gap-4">
                  {megaCats(mega).filter((c) => c.gender === mega).slice(0, 3).map((c) => (
                    <Link key={c.id} to={`/category/${c.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200">
                      <img src={imgUrl(c.image, 500)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                      <span className="absolute bottom-3 left-3 font-display text-2xl text-white">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} collections={collections} user={user} />
    </header>
  );
}

function MobileMenu({ open, onClose, categories, collections, user }) {
  const [tab, setTab] = useState('women');
  const navigate = useNavigate();
  const cats = categories.filter((c) => c.gender === tab || c.gender === 'unisex');
  return (
    <Drawer open={open} onClose={onClose} side="left" width="max-w-sm">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
        <Logo />
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100" aria-label="Close"><X size={22} /></button>
      </div>
      <div className="flex border-b border-ink-100">
        {['women', 'men'].map((g) => (
          <button key={g} onClick={() => setTab(g)} className={clsx('flex-1 border-b-2 py-3 text-sm font-bold uppercase tracking-wider', tab === g ? 'border-ink' : 'border-transparent text-ink-500')}>{g}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-ink-100">
          <li><button onClick={() => { navigate(`/${tab}`); onClose(); }} className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-bold">All {tab} <ChevronRight size={16} /></button></li>
          {cats.map((c) => (
            <li key={c.id}><Link to={`/category/${c.slug}`} onClick={onClose} className="flex items-center gap-3 px-5 py-3 text-sm"><img src={imgUrl(c.image, 80)} alt="" className="h-10 w-10 rounded-md object-cover" />{c.name}</Link></li>
          ))}
        </ul>
        <div className="border-t border-ink-100 px-5 py-4">
          <p className="eyebrow mb-2">Collections</p>
          <ul className="space-y-2 text-sm">
            {collections.map((c) => <li key={c.id}><Link to={`/collections/${c.slug}`} onClick={onClose}>{c.name}</Link></li>)}
            <li><Link to="/lookbook" onClick={onClose}>Lookbook</Link></li>
            <li><Link to="/sale" onClick={onClose} className="font-bold text-brick">Sale</Link></li>
          </ul>
        </div>
        <div className="border-t border-ink-100 px-5 py-4 text-sm">
          <ul className="space-y-2">
            <li><Link to={user ? '/account' : '/account/login'} onClick={onClose}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in / Register'}</Link></li>
            <li><Link to="/track" onClick={onClose}>Track order</Link></li>
            <li><Link to="/stores" onClick={onClose}>Visit Unif House</Link></li>
            <li><Link to="/contact" onClick={onClose}>Contact</Link></li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
}

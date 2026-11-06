import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Clock, Mail } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import Newsletter from '../home/Newsletter';
import { Logo } from './Header';

const TikTok = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}><path d="M12.5 2h3.1c.2 1.8 1.3 3.3 3.1 3.9.6.2 1.2.3 1.8.3v3.1c-1.7 0-3.3-.5-4.7-1.4v6.9c0 3.8-3.1 6.9-6.9 6.9S2 18.6 2 14.8s3.1-6.9 6.9-6.9c.4 0 .8 0 1.2.1v3.3c-.4-.1-.8-.2-1.2-.2-2 0-3.7 1.7-3.7 3.7s1.7 3.7 3.7 3.7 3.7-1.7 3.7-3.7V2z" /></svg>
);

export default function Footer() {
  const { store, categories } = useStore();
  const women = categories.filter((c) => c.gender === 'women').slice(0, 6);
  const men = categories.filter((c) => c.gender === 'men').slice(0, 6);
  return (
    <footer className="no-print mt-20 bg-ink text-white">
      <Newsletter />
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="text-white [&_span:last-child]:text-white"><Logo /></div>
          <p className="mt-4 max-w-sm text-sm text-ink-300">{store.tagline || 'All kinds of clothes for men and women.'} Fitted at Unif House, delivered across Kigali the same day.</p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink-300">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brass" />{store.address}, {store.city}</li>
            <li className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-brass" /><a href={`tel:${store.phone}`} className="hover:text-white">{store.phone}</a> (Call / WhatsApp)</li>
            {store.email && <li className="flex items-center gap-2"><Mail size={16} className="shrink-0 text-brass" /><a href={`mailto:${store.email}`} className="hover:text-white">{store.email}</a></li>}
            <li className="flex items-start gap-2"><Clock size={16} className="mt-0.5 shrink-0 text-brass" />{store.hours}</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <a href={store.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-ink-600 p-2.5 hover:border-white" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={store.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-ink-600 p-2.5 hover:border-white" aria-label="TikTok"><TikTok /></a>
          </div>
        </div>
        <FooterCol title="Women" links={[{ label: 'All women', to: '/women' }, ...women.map((c) => ({ label: c.name, to: `/category/${c.slug}` }))]} />
        <FooterCol title="Men" links={[{ label: 'All men', to: '/men' }, ...men.map((c) => ({ label: c.name, to: `/category/${c.slug}` }))]} />
        <FooterCol title="Help" links={[
          { label: 'Track order', to: '/track' }, { label: 'Delivery info', to: '/shipping' }, { label: 'Returns & exchanges', to: '/returns' }, { label: 'Size guide', to: '/size-guide' }, { label: 'FAQ', to: '/faq' }, { label: 'Contact us', to: '/contact' }, { label: 'Our story', to: '/about' }, { label: 'Visit the store', to: '/stores' },
        ]} />
      </div>
      <div className="border-t border-ink-700">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-400 md:flex-row">
          <p>© {new Date().getFullYear()} {store.name} Rwanda. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><span className="rounded bg-[#ffcc00] px-1.5 py-0.5 text-[10px] font-bold text-ink">MoMo</span><span className="rounded bg-[#e40000] px-1.5 py-0.5 text-[10px] font-bold text-white">Airtel</span><span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink">VISA</span><span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-bold text-white">Cash</span></span>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/admin" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="font-display text-xl tracking-wider">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-ink-300">
        {links.map((l) => <li key={l.to + l.label}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>)}
      </ul>
    </div>
  );
}

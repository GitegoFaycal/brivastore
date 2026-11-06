import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import { useDebounce, useLockBody } from '../../lib/hooks';
import { money, imgUrl } from '../../lib/format';

const TRENDING = ['Navy suit', 'Tracksuit', 'Sneakers', 'Dress', 'Leather jacket', 'Blazer'];

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 200);
  const [res, setRes] = useState({ products: [], categories: [] });
  const input = useRef(null);
  const navigate = useNavigate();
  useLockBody(open);

  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 50); else setQ(''); }, [open]);
  useEffect(() => {
    if (!dq.trim()) { setRes({ products: [], categories: [] }); return; }
    api.get(`/products/suggest?q=${encodeURIComponent(dq)}`).then(setRes).catch(() => {});
  }, [dq]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const go = (term) => { navigate(`/search?q=${encodeURIComponent(term)}`); onClose(); };

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 bg-white shadow-lift animate-fadeUp">
        <div className="container-x py-4">
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} className="flex items-center gap-3">
            <Search size={22} className="text-ink-400" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for suits, tees, dresses, sneakers…" className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink-400" />
            <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-100" aria-label="Close"><X size={22} /></button>
          </form>
          <div className="mt-4 grid gap-6 border-t border-ink-100 pt-4 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-3">{q ? 'Categories' : 'Trending'}</p>
              {q ? (
                <ul className="space-y-1.5 text-sm">
                  {res.categories.map((c) => <li key={c.id}><Link to={`/category/${c.slug}`} onClick={onClose} className="hover:underline">{c.name}</Link></li>)}
                  <li><button onClick={() => go(q)} className="flex items-center gap-1 font-semibold">Search “{q}” <ArrowRight size={14} /></button></li>
                </ul>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {TRENDING.map((t) => <li key={t}><button onClick={() => go(t)} className="flex items-center gap-2 hover:underline"><TrendingUp size={14} className="text-ink-400" />{t}</button></li>)}
                </ul>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="eyebrow mb-3">Products</p>
              {q && !res.products.length && <p className="text-sm text-ink-500">No products match “{q}” yet. Try “suit”, “jacket” or “dress”.</p>}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(q ? res.products : []).map((p) => (
                  <Link key={p.id} to={`/products/${p.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-ink-50">
                    <img src={imgUrl(p.image, 120)} alt="" className="h-14 w-11 rounded object-cover" />
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-ink-500">{money(p.price)}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useFetch, useTitle } from '../lib/hooks';
import { imgUrl, money, clsx } from '../lib/format';

export default function Lookbook() {
  useTitle('Lookbook');
  const { content, store } = useStore();
  const ids = (content.lookbook || []).map((l) => l.productId).filter(Boolean);
  const { data } = useFetch(ids.length ? `/products?ids=${ids.join(',')}&limit=48` : null, { enabled: ids.length > 0 });
  const find = (id) => data?.items?.find((p) => p.id === id);
  return (
    <div className="container-x py-10">
      <div className="max-w-2xl">
        <p className="eyebrow">Lookbook</p>
        <h1 className="h-display mt-2 text-6xl sm:text-7xl">Kigali, styled by Briva</h1>
        <p className="mt-3 text-ink-600">Real outfits from the store and from you. Tap any look to shop it. Follow <a href={store.instagram} target="_blank" rel="noreferrer" className="font-semibold underline">@briva_store_rwanda</a> for daily drops.</p>
      </div>
      <div className="mt-10 columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {(content.lookbook || []).map((l, i) => {
          const p = find(l.productId);
          return (
            <Link key={l.id} to={p ? `/products/${p.slug}` : '/shop'} className={clsx('group relative block overflow-hidden rounded-xl bg-cream-200 break-inside-avoid', i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]')}>
              <img src={imgUrl(l.image, 800)} alt={l.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <Instagram size={16} className="absolute right-3 top-3 text-white drop-shadow" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 text-white">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">{l.caption}</p>
                {p && <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">{p.name} · {money(p.price)} <ArrowRight size={14} className="transition group-hover:translate-x-1" /></p>}
              </div>
            </Link>
          );
        })}
      </div>
      {content.videos?.length > 0 && (
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {content.videos.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-2xl bg-ink">
              <video src={v.src} poster={imgUrl(v.poster, 800)} muted loop playsInline controls preload="none" className="aspect-[4/5] w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

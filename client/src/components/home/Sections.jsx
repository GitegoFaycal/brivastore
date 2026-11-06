import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Check, Play, Quote, Instagram } from 'lucide-react';
import { SectionHeader, Stars } from '../ui';
import { ProductRow } from '../product/ProductGrid';
import { imgUrl, clsx } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';

/* ------------------------------------------------ Category tiles (Allbirds-style 4-up) */
export function CategoryTiles({ categories }) {
  const tiles = [
    { label: 'New Arrivals', to: '/new', image: categories.find((c) => c.slug === 'women-dresses')?.image },
    { label: "Men's", to: '/men', image: categories.find((c) => c.slug === 'men-suits')?.image },
    { label: "Women's", to: '/women', image: categories.find((c) => c.slug === 'women-coats')?.image },
    { label: 'Best Sellers', to: '/collections/best-sellers', image: categories.find((c) => c.slug === 'men-shoes')?.image },
  ];
  return (
    <section className="container-x -mt-10 relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {tiles.map((t) => (
        <Link key={t.label} to={t.to} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-cream-200 shadow-soft md:aspect-[3/4]">
          {t.image && <img src={imgUrl(t.image, 600)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 flex items-center gap-2 font-display text-2xl text-white sm:text-3xl">{t.label} <ArrowRight size={18} className="transition group-hover:translate-x-1" /></span>
        </Link>
      ))}
    </section>
  );
}

/* ------------------------------------------------ Shop by category chips (Fashion Nova trend tiles) */
export function CategoryStrip({ categories, gender }) {
  const list = categories.filter((c) => c.gender === gender);
  return (
    <section className="container-x">
      <SectionHeader eyebrow="Shop by category" title={gender === 'men' ? "Men's edit" : "Women's edit"} action={`All ${gender}`} actionTo={`/${gender}`} />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {list.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="group w-36 shrink-0 sm:w-44">
            <div className="aspect-square overflow-hidden rounded-full border-4 border-white bg-cream-200 shadow-soft">
              <img src={imgUrl(c.image, 300)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            </div>
            <p className="mt-3 text-center text-sm font-semibold group-hover:underline">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------ Tabbed "Shop the latest" */
export function ShopLatest({ home, loading }) {
  const tabs = [
    { key: 'featured', label: 'For you' },
    { key: 'newArrivals', label: 'New in' },
    { key: 'bestSellers', label: 'Best sellers' },
    { key: 'sale', label: 'Sale' },
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
  ];
  const [tab, setTab] = useState('featured');
  const linkFor = { featured: '/shop', newArrivals: '/new', bestSellers: '/collections/best-sellers', sale: '/sale', men: '/men', women: '/women' };
  return (
    <section className="container-x">
      <SectionHeader eyebrow="Shop the latest" title="Fresh on the rack" action="View all" actionTo={linkFor[tab]} />
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={clsx('shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition', tab === t.key ? 'border-ink bg-ink text-white' : 'border-ink-200 hover:border-ink')}>{t.label}</button>
        ))}
      </div>
      <ProductRow products={(home && home[tab]) || []} loading={loading} />
    </section>
  );
}

/* ------------------------------------------------ Promo banners (3-up) */
export function BannerGrid({ banners }) {
  if (!banners?.length) return null;
  return (
    <section className="container-x grid gap-4 md:grid-cols-3">
      {banners.map((b, i) => (
        <Link key={b.id} to={b.to} className={clsx('group relative overflow-hidden rounded-2xl bg-cream-200', i === 0 ? 'aspect-[4/5] md:row-span-2 md:aspect-auto' : 'aspect-[16/9] md:aspect-[16/8]')}>
          <img src={imgUrl(b.image, 1000)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className={clsx('absolute inset-0', b.theme === 'light' ? 'bg-gradient-to-t from-white/80 to-transparent' : 'bg-gradient-to-t from-ink/80 to-transparent')} />
          <div className={clsx('absolute inset-x-0 bottom-0 p-6', b.theme === 'light' ? 'text-ink' : 'text-white')}>
            {b.badge && <span className="mb-2 inline-block rounded-sm bg-brick px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{b.badge}</span>}
            <h3 className="h-display text-4xl sm:text-5xl">{b.title}</h3>
            <p className="mt-1 text-sm opacity-90">{b.subtitle}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider underline underline-offset-4">Shop now <ArrowRight size={14} /></span>
          </div>
        </Link>
      ))}
    </section>
  );
}

/* ------------------------------------------------ Promo code strip */
export function PromoCodeBanner({ promo }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  if (!promo?.code) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(promo.code); setCopied(true); toast.success(`Code ${promo.code} copied`); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <section className="container-x">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-brass/30 bg-brass-50 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div>
          <p className="eyebrow">Limited offer</p>
          <h3 className="h-display mt-1 text-3xl sm:text-4xl">{promo.title}</h3>
          <p className="mt-1 text-sm text-ink-600">{promo.subtitle}</p>
        </div>
        <button onClick={copy} className="flex items-center gap-3 rounded-xl border-2 border-dashed border-brass bg-white px-5 py-3 font-mono text-lg font-bold tracking-widest">
          {promo.code} {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-brass" />}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Story (Allbirds "Materials from the earth"-style) */
export function Story({ story }) {
  if (!story) return null;
  return (
    <section className="bg-ink text-white">
      <div className="container-x grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-800 lg:aspect-[4/5]">
          {story.video ? (
            <video src={story.video} poster={imgUrl(story.image, 1000)} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={imgUrl(story.image, 1000)} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="eyebrow text-brass-200">Our story</p>
          <h2 className="h-display mt-3 text-5xl sm:text-6xl">{story.title}</h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-300">{story.body}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {story.points?.map((pt, i) => (
              <div key={i} className="border-l-2 border-brass pl-4">
                <h4 className="font-bold">{pt.title}</h4>
                <p className="mt-1 text-sm text-ink-300">{pt.body}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn-light mt-8">Read our story <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ Video strip */
export function VideoStrip({ videos }) {
  const [playing, setPlaying] = useState(null);
  if (!videos?.length) return null;
  return (
    <section className="container-x">
      <SectionHeader eyebrow="Watch" title="Briva in motion" action="Follow on Instagram" actionTo="/lookbook" />
      <div className="grid gap-4 md:grid-cols-3">
        {videos.map((v) => (
          <div key={v.id} className="group relative aspect-[9/12] overflow-hidden rounded-2xl bg-ink md:aspect-[4/5]">
            {playing === v.id ? (
              <video src={v.src} poster={v.poster} autoPlay muted loop playsInline controls className="h-full w-full object-cover" />
            ) : (
              <button onClick={() => setPlaying(v.id)} className="absolute inset-0" aria-label={`Play ${v.title}`}>
                <img src={imgUrl(v.poster, 800)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-ink/20" />
                <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lift transition group-hover:scale-110"><Play size={24} className="ml-1 fill-ink" /></span>
                <span className="absolute bottom-4 left-4 font-display text-2xl text-white">{v.title}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------ Lookbook / Instagram grid */
export function LookbookGrid({ items, products }) {
  const { store } = useStore();
  if (!items?.length) return null;
  return (
    <section className="container-x">
      <SectionHeader eyebrow="@briva_store_rwanda" title="Shop the look" action="Full lookbook" actionTo="/lookbook" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.slice(0, 8).map((l) => {
          const p = products?.find((x) => x.id === l.productId);
          return (
            <Link key={l.id} to={p ? `/products/${p.slug}` : '/lookbook'} className="group relative aspect-square overflow-hidden rounded-lg bg-cream-200">
              <img src={imgUrl(l.image, 600)} alt={l.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex flex-col justify-end bg-ink/60 p-3 opacity-0 transition group-hover:opacity-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{l.caption}</p>
                {p && <p className="text-sm font-bold text-white">{p.name}</p>}
              </div>
              <Instagram size={16} className="absolute right-2 top-2 text-white drop-shadow" />
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-ink-500">Tag <a href={store.instagram} target="_blank" rel="noreferrer" className="font-semibold text-ink underline">@briva_store_rwanda</a> to be featured.</p>
    </section>
  );
}

/* ------------------------------------------------ Testimonials */
export function Testimonials({ items }) {
  if (!items?.length) return null;
  return (
    <section className="container-x">
      <SectionHeader eyebrow="Kigali loves Briva" title="What customers say" center />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((t, i) => (
          <figure key={i} className="card p-6">
            <Quote size={22} className="text-brass" />
            <Stars value={5} className="mt-3" />
            <blockquote className="mt-3 text-sm leading-relaxed text-ink-700">“{t.body}”</blockquote>
            <figcaption className="mt-4 text-xs"><span className="font-bold">{t.name}</span> <span className="text-ink-500">· {t.role}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------ Value props (icons row) */
export function ValueProps() {
  const items = [
    { t: 'Same-day Kigali delivery', b: 'Order before 2pm, wear it tonight.' },
    { t: 'Try before you buy', b: 'Visit Unif House and get fitted by our team.' },
    { t: 'Pay your way', b: 'MTN MoMo, Airtel Money, card or cash on delivery.' },
    { t: '7-day exchanges', b: 'Wrong size? Swap it, tags on, no stress.' },
  ];
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.t} className="flex gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass" />
            <div><p className="text-sm font-bold">{i.t}</p><p className="text-xs text-ink-500">{i.b}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

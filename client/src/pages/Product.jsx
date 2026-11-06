import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, Store, RefreshCcw, Share2, MessageCircle, ChevronLeft, ChevronRight, Check, Ruler, ShieldCheck } from 'lucide-react';
import { useFetch, useTitle, useRecentlyViewed } from '../lib/hooks';
import { api } from '../lib/api';
import { money, imgUrl, clsx, date } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs, Badge, Stars, QtyInput, Accordion, Modal, Skeleton, Field, Spinner, SectionHeader } from '../components/ui';
import { ColorSwatches, SizeSelector } from '../components/product/VariantPicker';
import { ProductRow } from '../components/product/ProductGrid';
import { SizeGuideTable } from './Info';

export default function Product() {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useFetch(`/products/${slug}`);
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const { store, delivery, waLink } = useStore();
  const recent = useRecentlyViewed();
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [guide, setGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [notify, setNotify] = useState(false);

  const p = data?.product;
  useTitle(p?.name);

  useEffect(() => {
    if (!p) return;
    setColor(p.colors[0]?.name || 'Default');
    setSize(p.sizes.length === 1 ? p.sizes[0] : '');
    setQty(1); setImg(0); setSizeError(false);
    recent.push(p.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  const variant = useMemo(() => p?.variants.find((v) => v.color === color && v.size === size), [p, color, size]);
  const colorStock = useMemo(() => (p ? p.variants.filter((v) => v.color === color).reduce((s, v) => s + v.stock, 0) : 0), [p, color]);

  const recentIds = recent.ids.filter((id) => id !== p?.id).slice(0, 8);
  const { data: recentData } = useFetch(recentIds.length ? `/products?ids=${recentIds.join(',')}&limit=8` : null, { enabled: recentIds.length > 0 });

  if (error) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="h-display text-5xl">Product not found</h1>
        <p className="mt-2 text-ink-500">It may have sold out or been removed.</p>
        <Link to="/shop" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }
  if (loading || !p) return <ProductSkeleton />;

  const addToBag = () => {
    if (!size) { setSizeError(true); toast.error('Please select a size'); return; }
    if (!variant || variant.stock <= 0) { toast.error('This size is out of stock'); return; }
    cart.add(p, { color, size, qty });
    toast.success(`${p.name} added to bag`);
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
    } catch { /* cancelled */ }
  };
  const waText = `Hello Briva Store! I want to order: ${p.name}${color ? ` (${color}` : ''}${size ? `, size ${size})` : color ? ')' : ''} - ${money(p.price)}. ${window.location.href}`;
  const liked = wishlist.has(p.id);
  const breadcrumbs = [{ label: p.gender === 'men' ? 'Men' : p.gender === 'women' ? 'Women' : 'Shop', to: p.gender === 'unisex' ? '/shop' : `/${p.gender}` }];
  if (data.category) breadcrumbs.push({ label: data.category.name, to: `/category/${data.category.slug}` });
  breadcrumbs.push({ label: p.name });

  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="flex gap-3">
            <div className="hidden w-20 shrink-0 flex-col gap-2 md:flex">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} className={clsx('aspect-[3/4] overflow-hidden rounded-lg border-2 transition', i === img ? 'border-ink' : 'border-transparent hover:border-ink-300')}>
                  <img src={imgUrl(src, 160)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              {p.video && <button onClick={() => setImg('video')} className={clsx('grid aspect-[3/4] place-items-center rounded-lg border-2 bg-ink text-xs font-bold text-white', img === 'video' ? 'border-brass' : 'border-transparent')}>VIDEO</button>}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-2xl bg-cream-200">
              {img === 'video' ? (
                <video src={p.video} poster={imgUrl(p.images[0], 900)} autoPlay muted loop playsInline controls className="aspect-[3/4] w-full object-cover" />
              ) : (
                <img src={imgUrl(p.images[img], 1200)} alt={p.name} className="aspect-[3/4] w-full object-cover animate-fadeUp" key={img} />
              )}
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {p.discount > 0 && <Badge tone="sale">-{p.discount}%</Badge>}
                {p.tags?.includes('new') && <Badge>New</Badge>}
                {p.tags?.includes('limited') && <Badge tone="brass">Limited</Badge>}
              </div>
              {p.images.length > 1 && (
                <>
                  <button onClick={() => setImg((i) => (typeof i !== 'number' ? 0 : (i - 1 + p.images.length) % p.images.length))} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Previous"><ChevronLeft size={18} /></button>
                  <button onClick={() => setImg((i) => (typeof i !== 'number' ? 0 : (i + 1) % p.images.length))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Next"><ChevronRight size={18} /></button>
                </>
              )}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 md:hidden">
                {p.images.map((_, i) => <span key={i} className={clsx('h-1.5 w-1.5 rounded-full', i === img ? 'bg-ink' : 'bg-white/80')} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">{p.brand} · {data.category?.name}</p>
            <h1 className="h-display mt-2 text-4xl sm:text-5xl">{p.name}</h1>
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-xs text-ink-600"><Stars value={p.rating} /> {p.rating} ({p.reviewCount} review{p.reviewCount === 1 ? '' : 's'})</a>
            <div className="mt-3 flex items-baseline gap-3">
              <span className={clsx('text-2xl font-bold', p.discount > 0 && 'text-brick')}>{money(p.price)}</span>
              {p.compareAtPrice > p.price && <span className="text-ink-400 line-through">{money(p.compareAtPrice)}</span>}
              {p.discount > 0 && <span className="rounded bg-brick-50 px-2 py-0.5 text-xs font-bold text-brick">Save {money(p.compareAtPrice - p.price)}</span>}
            </div>
            {p.soldCount > 50 && <p className="mt-2 text-xs text-ink-500">🔥 {p.soldCount}+ sold in Kigali</p>}

            <div className="mt-6 space-y-5">
              <ColorSwatches product={p} value={color} onChange={(c) => { setColor(c); setSize(''); }} large />
              <div className={clsx(sizeError && !size && 'rounded-lg ring-2 ring-brick/50 ring-offset-4')}>
                <SizeSelector product={p} color={color} value={size} onChange={(s) => { setSize(s); setSizeError(false); }} onSizeGuide={() => setGuide(true)} />
              </div>
              {size && variant && variant.stock > 0 && variant.stock <= 5 && <p className="text-xs font-semibold text-brick">Hurry, only {variant.stock} left in {size}</p>}
              {colorStock === 0 && <p className="text-xs font-semibold text-ink-500">This colour is sold out.</p>}

              <div className="flex gap-3">
                <QtyInput value={qty} onChange={setQty} max={variant ? Math.max(1, variant.stock) : 10} />
                {colorStock === 0 ? (
                  <button onClick={() => setNotify(true)} className="btn-secondary flex-1">Notify me when back</button>
                ) : (
                  <button onClick={addToBag} className="btn-primary flex-1 text-base"><ShoppingBag size={18} /> Add to bag</button>
                )}
                <button onClick={() => { wishlist.toggle(p.id); toast.info(liked ? 'Removed from wishlist' : 'Saved to wishlist'); }} className={clsx('rounded-full border border-ink-200 px-4 hover:border-ink', liked && 'text-brick')} aria-label="Wishlist"><Heart size={20} className={liked ? 'fill-brick' : ''} /></button>
              </div>
              <a href={waLink(waText)} target="_blank" rel="noreferrer" className="btn w-full border border-[#25D366] bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366] hover:text-white"><MessageCircle size={18} /> Order on WhatsApp</a>

              <ul className="space-y-2.5 rounded-xl bg-cream-100 p-4 text-sm">
                <li className="flex items-start gap-2"><Truck size={16} className="mt-0.5 text-brass" /><span><b>Same-day Kigali delivery</b> on orders before 2pm. Free over {money(delivery.freeThreshold)}.</span></li>
                <li className="flex items-start gap-2"><Store size={16} className="mt-0.5 text-brass" /><span><b>Try it on</b> at {store.address}.</span></li>
                <li className="flex items-start gap-2"><RefreshCcw size={16} className="mt-0.5 text-brass" /><span><b>7-day exchanges</b>, tags on. <Link to="/returns" className="underline">Details</Link></span></li>
                <li className="flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 text-brass" /><span>Pay with MoMo, Airtel, card or cash on delivery.</span></li>
              </ul>
              <button onClick={share} className="flex items-center gap-2 text-xs font-semibold text-ink-600 hover:text-ink"><Share2 size={14} /> Share this product</button>
            </div>

            <div className="mt-8">
              <Accordion title="Description" defaultOpen><p>{p.description}</p></Accordion>
              <Accordion title="Details & materials">
                <ul className="list-disc space-y-1 pl-4">{p.details?.map((d, i) => <li key={i}>{d}</li>)}</ul>
                {p.materials && <p className="mt-3"><b>Materials:</b> {p.materials}</p>}
                {p.care && <p className="mt-1"><b>Care:</b> {p.care}</p>}
              </Accordion>
              <Accordion title="Size & fit"><p>True to size. Our team can take measurements at Unif House for free. <button onClick={() => setGuide(true)} className="inline-flex items-center gap-1 font-semibold underline"><Ruler size={14} /> Size guide</button></p></Accordion>
              <Accordion title="Delivery & returns"><p>Kigali: same day (before 2pm) or next day, 2,000 RWF. Express within 3 hours, 5,000 RWF. Other provinces 1-2 days by bus courier. Exchanges within 7 days with tags attached.</p></Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <Reviews product={p} reviews={data.reviews} onPosted={refetch} />

      {/* Related */}
      {data.related?.length > 0 && (
        <section className="mt-20">
          <SectionHeader eyebrow="Complete the look" title="You may also like" action={data.category ? `More ${data.category.name}` : 'Shop all'} actionTo={data.category ? `/category/${data.category.slug}` : '/shop'} />
          <ProductRow products={data.related} />
        </section>
      )}
      {recentData?.items?.length > 0 && (
        <section className="mt-20">
          <SectionHeader eyebrow="Keep browsing" title="Recently viewed" />
          <ProductRow products={recentData.items} />
        </section>
      )}

      <Modal open={guide} onClose={() => setGuide(false)} title="Size guide" size="lg">
        <div className="p-5"><SizeGuideTable type={p.sizeType} /></div>
      </Modal>
      <NotifyModal open={notify} onClose={() => setNotify(false)} product={p} color={color} size={size} />
    </div>
  );
}

function NotifyModal({ open, onClose, product, color, size }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const d = await api.post('/notify', { productId: product.id, email, color, size }); toast.success(d.message); onClose(); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Notify me when it's back" size="sm">
      <form onSubmit={submit} className="space-y-4 p-5">
        <p className="text-sm text-ink-600">We will email you the moment <b>{product.name}</b> ({color}{size ? `, ${size}` : ''}) is restocked.</p>
        <Field label="Email"><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
        <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Notify me'}</button>
      </form>
    </Modal>
  );
}

function Reviews({ product, reviews, onPosted }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const counts = [5, 4, 3, 2, 1].map((r) => ({ r, n: reviews.filter((x) => x.rating === r).length }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const d = await api.post('/reviews', { ...form, productId: product.id, name: form.name || user?.name });
      toast.success(d.message); setOpen(false); setForm({ name: '', rating: 5, title: '', body: '' }); onPosted();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <section id="reviews" className="mt-20 scroll-mt-24">
      <SectionHeader eyebrow="Reviews" title={`${reviews.length} customer review${reviews.length === 1 ? '' : 's'}`} />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="card p-6">
            <div className="flex items-end gap-3">
              <span className="font-display text-6xl leading-none">{product.rating || '–'}</span>
              <div><Stars value={product.rating} size={18} /><p className="mt-1 text-xs text-ink-500">Based on {reviews.length} reviews</p></div>
            </div>
            <ul className="mt-5 space-y-1.5">
              {counts.map(({ r, n }) => (
                <li key={r} className="flex items-center gap-2 text-xs"><span className="w-8">{r} ★</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"><div className="h-full bg-brass" style={{ width: reviews.length ? `${(n / reviews.length) * 100}%` : 0 }} /></div><span className="w-6 text-right text-ink-500">{n}</span></li>
              ))}
            </ul>
            <button onClick={() => setOpen(true)} className="btn-primary mt-6 w-full">Write a review</button>
          </div>
        </div>
        <div className="lg:col-span-8">
          {!reviews.length && <p className="text-sm text-ink-500">No reviews yet. Be the first to tell Kigali what you think.</p>}
          <ul className="divide-y divide-ink-100">
            {reviews.map((r) => (
              <li key={r.id} className="py-5">
                <div className="flex items-center justify-between gap-2"><Stars value={r.rating} /><span className="text-xs text-ink-400">{date(r.createdAt)}</span></div>
                {r.title && <h4 className="mt-2 font-bold">{r.title}</h4>}
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{r.body}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-ink-500"><b className="text-ink">{r.name}</b>{r.verified && <span className="inline-flex items-center gap-1 text-green-700"><Check size={12} /> Verified buyer</span>}</p>
                {r.reply && <div className="mt-3 rounded-lg bg-cream-100 p-3 text-sm"><b>Briva Store:</b> {r.reply.text}</div>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`Review ${product.name}`} size="sm">
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <span className="label">Your rating</span>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((r) => <button type="button" key={r} onClick={() => setForm({ ...form, rating: r })} className="text-2xl" aria-label={`${r} stars`}>{r <= form.rating ? '★' : '☆'}</button>)}</div>
          </div>
          {!user && <Field label="Your name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>}
          <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sums it up" /></Field>
          <Field label="Review"><textarea className="input" rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How does it fit? Was delivery fast?" /></Field>
          <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Submit review'}</button>
        </form>
      </Modal>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-x grid gap-8 pt-10 lg:grid-cols-12">
      <div className="lg:col-span-7"><Skeleton className="aspect-[3/4] rounded-2xl" /></div>
      <div className="space-y-4 lg:col-span-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-40 w-full" /></div>
    </div>
  );
}

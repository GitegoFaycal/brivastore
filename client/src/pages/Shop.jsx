import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, X, LayoutGrid, Grid3X3, ChevronDown } from 'lucide-react';
import { useFetch, useTitle } from '../lib/hooks';
import { qs } from '../lib/api';
import { useStore } from '../context/StoreContext';
import ProductGrid from '../components/product/ProductGrid';
import { Breadcrumbs, Pagination, Drawer, EmptyState, Accordion } from '../components/ui';
import { money, imgUrl, clsx } from '../lib/format';

const SORTS = [
  { v: 'featured', l: 'Featured' },
  { v: 'newest', l: 'Newest' },
  { v: 'best-selling', l: 'Best selling' },
  { v: 'price-asc', l: 'Price: low to high' },
  { v: 'price-desc', l: 'Price: high to low' },
  { v: 'rating', l: 'Top rated' },
];
const PRICE_BUCKETS = [
  { l: 'Under 20,000', min: 0, max: 20000 },
  { l: '20,000 - 50,000', min: 20000, max: 50000 },
  { l: '50,000 - 100,000', min: 50000, max: 100000 },
  { l: '100,000 - 200,000', min: 100000, max: 200000 },
  { l: 'Over 200,000', min: 200000, max: '' },
];

export default function Shop({ gender: genderProp, collection: collectionProp, search }) {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [sp, setSp] = useSearchParams();
  const { categories, collections } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cols, setCols] = useState(4);

  // route context
  const isCategoryRoute = pathname.startsWith('/category/');
  const isCollectionRoute = pathname.startsWith('/collections/');
  const category = isCategoryRoute ? categories.find((c) => c.slug === slug) : null;
  const collection = isCollectionRoute ? collections.find((c) => c.slug === slug) : collectionProp ? collections.find((c) => c.slug === collectionProp) : null;
  const gender = genderProp || (category && category.gender !== 'unisex' ? category.gender : sp.get('gender') || '');

  const get = (k) => sp.get(k) || '';
  const getList = (k) => (sp.get(k) ? sp.get(k).split(',') : []);
  const q = search ? get('q') : '';

  const params = {
    gender,
    category: isCategoryRoute ? slug : getList('category'),
    collection: isCollectionRoute ? slug : collectionProp || getList('collection'),
    size: getList('size'),
    color: getList('color'),
    minPrice: get('minPrice'),
    maxPrice: get('maxPrice'),
    onSale: get('onSale'),
    inStock: get('inStock'),
    sort: get('sort') || 'featured',
    page: get('page') || 1,
    q,
    limit: 24,
  };
  const path = `/products${qs(params)}`;
  const { data, loading } = useFetch(path);

  const title = search ? (q ? `Results for “${q}”` : 'Search') : category ? category.name : collection ? collection.name : genderProp === 'men' ? "Men's" : genderProp === 'women' ? "Women's" : 'Shop all';
  useTitle(title);

  const update = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };
  const toggleList = (k, v) => {
    const list = getList(k);
    update({ [k]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (!isCategoryRoute) getList('category').forEach((c) => chips.push({ k: 'category', v: c, label: categories.find((x) => x.slug === c)?.name || c }));
    if (!isCollectionRoute && !collectionProp) getList('collection').forEach((c) => chips.push({ k: 'collection', v: c, label: collections.find((x) => x.slug === c)?.name || c }));
    getList('size').forEach((s) => chips.push({ k: 'size', v: s, label: `Size ${s}` }));
    getList('color').forEach((c) => chips.push({ k: 'color', v: c, label: c }));
    if (get('minPrice') || get('maxPrice')) chips.push({ k: 'price', label: `${get('minPrice') ? money(get('minPrice')) : '0'} - ${get('maxPrice') ? money(get('maxPrice')) : '∞'}` });
    if (get('onSale')) chips.push({ k: 'onSale', label: 'On sale' });
    if (get('inStock')) chips.push({ k: 'inStock', label: 'In stock' });
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, categories, collections]);

  const removeChip = (chip) => {
    if (chip.k === 'price') update({ minPrice: '', maxPrice: '' });
    else if (chip.v) toggleList(chip.k, chip.v);
    else update({ [chip.k]: '' });
  };
  const clearAll = () => setSp(new URLSearchParams(search ? { q } : {}));

  const subCats = categories.filter((c) => !gender || c.gender === gender || c.gender === 'unisex');
  const facets = data?.facets || { sizes: [], colors: [] };
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizes = [...facets.sizes].sort((a, b) => { const ia = sizeOrder.indexOf(a); const ib = sizeOrder.indexOf(b); if (ia !== -1 && ib !== -1) return ia - ib; if (ia !== -1) return -1; if (ib !== -1) return 1; return Number(a) - Number(b) || a.localeCompare(b); });

  const filters = (
    <div className="space-y-1">
      {!isCategoryRoute && (
        <Accordion title="Category" defaultOpen>
          <ul className="space-y-1.5">
            {subCats.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={getList('category').includes(c.slug)} onChange={() => toggleList('category', c.slug)} className="accent-ink" />
                  <span className="text-sm">{c.name}</span>
                  {!gender && <span className="text-[10px] uppercase text-ink-400">{c.gender}</span>}
                </label>
              </li>
            ))}
          </ul>
        </Accordion>
      )}
      <Accordion title="Size" defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button key={s} onClick={() => toggleList('size', s)} className={clsx('min-w-[2.5rem] rounded-md border px-2 py-1.5 text-xs font-semibold', getList('size').includes(s) ? 'border-ink bg-ink text-white' : 'border-ink-200 hover:border-ink')}>{s}</button>
          ))}
        </div>
      </Accordion>
      <Accordion title="Colour" defaultOpen>
        <div className="flex flex-wrap gap-2">
          {facets.colors.map((c) => (
            <button key={c.name} title={c.name} onClick={() => toggleList('color', c.name)} className={clsx('flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs', getList('color').includes(c.name) ? 'border-ink bg-ink text-white' : 'border-ink-200 hover:border-ink')}>
              <span className="h-3.5 w-3.5 rounded-full border border-ink-200" style={{ background: c.hex }} />{c.name}
            </button>
          ))}
        </div>
      </Accordion>
      <Accordion title="Price" defaultOpen>
        <ul className="space-y-1.5">
          {PRICE_BUCKETS.map((b) => {
            const active = String(get('minPrice')) === String(b.min || '') && String(get('maxPrice')) === String(b.max);
            return (
              <li key={b.l}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="price" checked={active} onChange={() => update({ minPrice: b.min || '', maxPrice: b.max })} className="accent-ink" />
                  <span className="text-sm">{b.l} RWF</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Accordion>
      {!isCollectionRoute && !collectionProp && (
        <Accordion title="Collection">
          <ul className="space-y-1.5">
            {collections.map((c) => (
              <li key={c.id}><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={getList('collection').includes(c.slug)} onChange={() => toggleList('collection', c.slug)} className="accent-ink" /><span className="text-sm">{c.name}</span></label></li>
            ))}
          </ul>
        </Accordion>
      )}
      <Accordion title="Availability" defaultOpen>
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={get('onSale') === 'true'} onChange={(e) => update({ onSale: e.target.checked ? 'true' : '' })} className="accent-ink" /><span className="text-sm">On sale</span></label>
        <label className="mt-1.5 flex cursor-pointer items-center gap-2"><input type="checkbox" checked={get('inStock') === 'true'} onChange={(e) => update({ inStock: e.target.checked ? 'true' : '' })} className="accent-ink" /><span className="text-sm">In stock only</span></label>
      </Accordion>
    </div>
  );

  const heroImage = collection?.image || category?.image;

  return (
    <div>
      {/* Collection header */}
      {heroImage ? (
        <div className="relative h-56 overflow-hidden bg-ink sm:h-72">
          <img src={imgUrl(heroImage, 1600)} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="container-x absolute inset-0 flex flex-col justify-end pb-8 text-white">
            <h1 className="h-display text-5xl sm:text-7xl">{title}</h1>
            {collection?.description && <p className="mt-1 max-w-lg text-sm text-ink-200">{collection.description}</p>}
          </div>
        </div>
      ) : (
        <div className="container-x pt-8">
          <Breadcrumbs items={[{ label: title }]} />
          <h1 className="h-display mt-3 text-5xl sm:text-6xl">{title}</h1>
          {search && q && <p className="mt-1 text-sm text-ink-500">{data ? `${data.total} result${data.total === 1 ? '' : 's'}` : ''}</p>}
        </div>
      )}

      {/* Quick category chips for gender pages */}
      {genderProp && (
        <div className="container-x no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.filter((c) => c.gender === genderProp).map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 text-xs font-semibold hover:border-ink">
              <img src={imgUrl(c.image, 60)} alt="" className="h-7 w-7 rounded-full object-cover" />{c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="container-x mt-6 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-2xl">Filters</h2>
              {activeChips.length > 0 && <button onClick={clearAll} className="text-xs font-semibold underline">Clear all</button>}
            </div>
            {filters}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setFiltersOpen(true)} className="btn-secondary btn-sm lg:hidden"><SlidersHorizontal size={14} /> Filters {activeChips.length ? `(${activeChips.length})` : ''}</button>
              <p className="text-sm text-ink-500">{data ? `${data.total} products` : ' '}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 md:flex">
                <button onClick={() => setCols(3)} className={clsx('rounded p-1.5', cols === 3 ? 'bg-ink text-white' : 'hover:bg-ink-100')} aria-label="3 columns"><Grid3X3 size={16} /></button>
                <button onClick={() => setCols(4)} className={clsx('rounded p-1.5', cols === 4 ? 'bg-ink text-white' : 'hover:bg-ink-100')} aria-label="4 columns"><LayoutGrid size={16} /></button>
              </div>
              <div className="relative">
                <select value={get('sort') || 'featured'} onChange={(e) => update({ sort: e.target.value })} className="appearance-none rounded-full border border-ink-200 bg-white py-2 pl-4 pr-9 text-sm font-semibold focus:border-ink focus:outline-none">
                  {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500" />
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeChips.map((c, i) => (
                <button key={i} onClick={() => removeChip(c)} className="flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold hover:bg-ink-200">{c.label} <X size={12} /></button>
              ))}
              <button onClick={clearAll} className="text-xs font-semibold underline">Clear all</button>
            </div>
          )}

          <div className="mt-6">
            {!loading && data && !data.items.length ? (
              <EmptyState title="Nothing here yet" body={search ? 'Try a different word, or browse by category.' : 'Try removing some filters.'} action={search ? 'Browse all' : 'Clear filters'} onAction={clearAll} />
            ) : (
              <ProductGrid products={data?.items || []} loading={loading} cols={cols} skeletons={12} />
            )}
          </div>
          {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        </div>
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" title="Filters" width="max-w-sm">
        <div className="flex-1 overflow-y-auto px-5">{filters}</div>
        <div className="flex gap-2 border-t border-ink-100 p-4">
          <button onClick={clearAll} className="btn-secondary flex-1">Clear</button>
          <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1">Show {data?.total ?? ''} results</button>
        </div>
      </Drawer>
    </div>
  );
}

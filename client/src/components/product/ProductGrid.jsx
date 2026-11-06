import { useState } from 'react';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import QuickView from './QuickView';
import { clsx } from '../../lib/format';

export default function ProductGrid({ products, loading, cols = 4, skeletons = 8, compact }) {
  const [quick, setQuick] = useState(null);
  const grid = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
  };
  return (
    <>
      <div className={clsx('grid gap-x-4 gap-y-8', grid[cols] || grid[4])}>
        {loading
          ? Array.from({ length: skeletons }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} compact={compact} />)}
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}

/** Horizontal scroll row used on the homepage */
export function ProductRow({ products, loading }) {
  const [quick, setQuick] = useState(null);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {(loading ? Array.from({ length: 4 }) : products).map((p, i) => (
          <div key={p ? p.id : i} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-auto">
            {p ? <ProductCard product={p} onQuickView={setQuick} /> : <ProductCardSkeleton />}
          </div>
        ))}
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}

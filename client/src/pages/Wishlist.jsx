import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useFetch, useTitle } from '../lib/hooks';
import ProductGrid from '../components/product/ProductGrid';
import { EmptyState } from '../components/ui';

export default function Wishlist() {
  useTitle('Wishlist');
  const { ids } = useWishlist();
  const { data, loading } = useFetch(ids.length ? `/products?ids=${ids.join(',')}&limit=96` : null, { enabled: ids.length > 0 });
  const items = (data?.items || []).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  return (
    <div className="container-x py-8">
      <h1 className="h-display text-5xl">Wishlist <span className="text-ink-400">({ids.length})</span></h1>
      <p className="mt-1 text-sm text-ink-500">Saved on this device{ids.length ? '. Sign in to keep it across devices.' : '.'}</p>
      <div className="mt-8">
        {!ids.length ? (
          <EmptyState icon={Heart} title="Nothing saved yet" body="Tap the heart on any product to save it here." action="Browse new arrivals" actionTo="/new" />
        ) : (
          <ProductGrid products={items} loading={loading && !data} cols={4} />
        )}
      </div>
    </div>
  );
}

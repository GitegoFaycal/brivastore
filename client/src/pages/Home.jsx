import { useStore } from '../context/StoreContext';
import { useFetch, useTitle } from '../lib/hooks';
import Hero from '../components/home/Hero';
import { CategoryTiles, CategoryStrip, ShopLatest, BannerGrid, PromoCodeBanner, Story, VideoStrip, LookbookGrid, Testimonials, ValueProps } from '../components/home/Sections';
import { SectionHeader } from '../components/ui';
import { ProductRow } from '../components/product/ProductGrid';

export default function Home() {
  useTitle('');
  const { content, categories } = useStore();
  const { data: home, loading } = useFetch('/home');
  const allProducts = home ? [...home.featured, ...home.newArrivals, ...home.bestSellers, ...home.men, ...home.women] : [];

  return (
    <div className="space-y-20 pb-10">
      <div>
        <Hero hero={content.hero} />
        <CategoryTiles categories={categories} />
      </div>
      <ShopLatest home={home} loading={loading} />
      <BannerGrid banners={content.banners} />
      <section className="container-x">
        <SectionHeader eyebrow="Best sellers" title="Kigali's favourites" action="Shop best sellers" actionTo="/collections/best-sellers" />
        <ProductRow products={home?.bestSellers || []} loading={loading} />
      </section>
      <CategoryStrip categories={categories} gender="women" />
      <Story story={content.story} />
      <CategoryStrip categories={categories} gender="men" />
      <PromoCodeBanner promo={content.promoCode} />
      <section className="container-x">
        <SectionHeader eyebrow="Just landed" title="New arrivals" action="Shop new in" actionTo="/new" />
        <ProductRow products={home?.newArrivals || []} loading={loading} />
      </section>
      <VideoStrip videos={content.videos} />
      <LookbookGrid items={content.lookbook} products={allProducts} />
      <Testimonials items={content.testimonials} />
      <ValueProps />
    </div>
  );
}

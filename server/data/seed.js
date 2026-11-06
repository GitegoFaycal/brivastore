/* Demo data for Briva Store Rwanda. All images are royalty-free Unsplash photos,
   videos are royalty-free Pexels clips. Replace with real product photos from the admin. */
const bcrypt = require('bcryptjs');

const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

const VIDEOS = {
  heroCity: 'https://videos.pexels.com/video-files/8052408/8052408-hd_1920_1080_30fps.mp4',
  shop: 'https://videos.pexels.com/video-files/8195083/8195083-hd_1920_1080_25fps.mp4',
  street: 'https://videos.pexels.com/video-files/2795749/2795749-hd_1920_1080_25fps.mp4',
  walk: 'https://videos.pexels.com/video-files/5319934/5319934-hd_1920_1080_25fps.mp4',
};

const SIZES = {
  tops: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  suits: ['46', '48', '50', '52', '54', '56'],
  bottoms: ['28', '30', '32', '34', '36', '38'],
  wbottoms: ['24', '26', '28', '30', '32'],
  shoes: ['39', '40', '41', '42', '43', '44', '45'],
  wshoes: ['36', '37', '38', '39', '40', '41'],
  dresses: ['XS', 'S', 'M', 'L', 'XL'],
  one: ['One Size'],
};

const categories = [
  // Men
  { id: 'c-m-suits', slug: 'men-suits', name: 'Suits & Tuxedos', gender: 'men', image: U('1507679799987-c73779587ccf', 600), order: 1 },
  { id: 'c-m-blazers', slug: 'men-blazers', name: 'Blazers', gender: 'men', image: U('1553143820-6bb68bc34679', 600), order: 2 },
  { id: 'c-m-jackets', slug: 'men-jackets', name: 'Jackets & Coats', gender: 'men', image: U('1521223890158-f9f7c3d5d504', 600), order: 3 },
  { id: 'c-m-shirts', slug: 'men-shirts', name: 'Shirts', gender: 'men', image: U('1620012253295-c15cc3e65df4', 600), order: 4 },
  { id: 'c-m-tees', slug: 'men-tshirts', name: 'T-Shirts & Sweatshirts', gender: 'men', image: U('1521572163474-6864f9cf17ab', 600), order: 5 },
  { id: 'c-m-trousers', slug: 'men-trousers', name: 'Trousers & Jeans', gender: 'men', image: U('1542272604-787c3835535d', 600), order: 6 },
  { id: 'c-m-shoes', slug: 'men-shoes', name: 'Shoes', gender: 'men', image: U('1608256246200-53e635b5b65f', 600), order: 7 },
  // Women
  { id: 'c-w-dresses', slug: 'women-dresses', name: 'Dresses', gender: 'women', image: U('1572804013309-59a88b7e92f1', 600), order: 1 },
  { id: 'c-w-tops', slug: 'women-tops', name: 'Tops & Blouses', gender: 'women', image: U('1603344797033-f0f4f587ab60', 600), order: 2 },
  { id: 'c-w-blazers', slug: 'women-blazers', name: 'Blazers & Suits', gender: 'women', image: U('1571513722275-4b41940f54b8', 600), order: 3 },
  { id: 'c-w-coats', slug: 'women-coats', name: 'Coats & Jackets', gender: 'women', image: U('1539533018447-63fcce2678e3', 600), order: 4 },
  { id: 'c-w-sets', slug: 'women-sets', name: 'Matching Sets', gender: 'women', image: U('1515886657613-9f3515b0c78f', 600), order: 5 },
  { id: 'c-w-bottoms', slug: 'women-bottoms', name: 'Jeans & Trousers', gender: 'women', image: U('1475178626620-a4d074967452', 600), order: 6 },
  { id: 'c-w-shoes', slug: 'women-shoes', name: 'Shoes', gender: 'women', image: U('1595950653106-6c9ebd614d3a', 600), order: 7 },
  { id: 'c-w-bags', slug: 'women-bags', name: 'Bags & Accessories', gender: 'women', image: U('1566150905458-1bf1fc113f0d', 600), order: 8 },
  // Unisex
  { id: 'c-u-acc', slug: 'accessories', name: 'Accessories', gender: 'unisex', image: U('1490114538077-0a7f8cb49891', 600), order: 9 },
];

const collections = [
  { id: 'col-new', slug: 'new-arrivals', name: 'New Arrivals', description: 'Fresh drops landing at Unif House every week.', image: U('1483985988355-763728e1935b', 1200), featured: true },
  { id: 'col-formal', slug: 'formal-shop', name: 'The Formal Shop', description: 'Suits, tuxedos and shirts for weddings, offices and Kigali evenings.', image: U('1617137968427-85924c800a22', 1200), featured: true },
  { id: 'col-street', slug: 'street-edit', name: 'Street Edit', description: 'Sweatshirts, graphic tees, sneakers. Built for Kigali weekends.', image: U('1588117305388-c2631a279f82', 1200), featured: true },
  { id: 'col-office', slug: 'office-ready', name: 'Office Ready', description: 'Polished pieces that go from Kigali Heights to dinner.', image: U('1571513722275-4b41940f54b8', 1200), featured: true },
  { id: 'col-wedding', slug: 'wedding-guest', name: 'Wedding Guest', description: 'Gowns, dresses and sharp suits for the season of celebrations.', image: U('1595777457583-95e059d581b8', 1200), featured: false },
  { id: 'col-sale', slug: 'sale', name: 'Sale', description: 'Up to 40% off selected styles. While stock lasts.', image: U('1441986300917-64674bd600d8', 1200), featured: true },
  { id: 'col-best', slug: 'best-sellers', name: 'Best Sellers', description: 'Our most-loved pieces, restocked.', image: U('1567401893414-76b7b1e5a7a5', 1200), featured: false },
];

let seq = 0;
function product(p) {
  seq += 1;
  const id = `p${String(seq).padStart(3, '0')}`;
  const colors = p.colors || [{ name: 'Default', hex: '#111111' }];
  const sizes = p.sizes || SIZES.tops;
  const variants = [];
  colors.forEach((c, ci) => {
    sizes.forEach((s, si) => {
      // deterministic pseudo-random stock
      const seedN = (seq * 31 + ci * 7 + si * 3) % 11;
      const stock = p.soldOut ? 0 : seedN === 0 ? 0 : seedN + (p.lowStock ? 0 : 4);
      variants.push({ sku: `${id.toUpperCase()}-${c.name.slice(0, 3).toUpperCase()}-${s}`, color: c.name, size: s, stock });
    });
  });
  const createdAt = new Date(Date.now() - (p.ageDays ?? seq * 3) * 86400000).toISOString();
  return {
    id,
    slug: p.slug,
    name: p.name,
    brand: p.brand || 'Briva',
    gender: p.gender,
    category: p.category,
    collections: p.collections || [],
    description: p.description,
    details: p.details || ['Premium European-quality fabric', 'True to size', 'Imported'],
    materials: p.materials || '',
    care: p.care || 'Dry clean or gentle machine wash cold. Do not tumble dry.',
    price: p.price,
    compareAtPrice: p.compareAtPrice || null,
    images: p.images,
    video: p.video || null,
    colors,
    sizes,
    sizeType: p.sizeType || 'tops',
    variants,
    tags: p.tags || [],
    featured: Boolean(p.featured),
    status: p.status || 'active',
    rating: p.rating || 4.5,
    reviewCount: 0,
    soldCount: p.soldCount || Math.floor((seq * 37) % 120) + 5,
    createdAt,
  };
}

const products = [
  // ---------------- MEN: SUITS ----------------
  product({
    slug: 'navy-slim-fit-suit', name: 'Navy Slim Fit Suit', gender: 'men', category: 'men-suits',
    collections: ['formal-shop', 'best-sellers', 'office-ready'],
    description: 'Our signature two-piece navy suit, cut slim through the chest and tapered at the leg. Half-canvas construction keeps the lapel rolling cleanly. The suit we fit most grooms, best men and new hires in Kigali with.',
    details: ['Two-piece: jacket + trousers', 'Notch lapel, two-button closure', 'Half-canvas construction', 'Side vents, four interior pockets', 'Free hemming at Unif House'],
    materials: '70% wool, 28% polyester, 2% elastane. Lining: viscose.',
    price: 185000, compareAtPrice: 220000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Navy', hex: '#1f2a44' }, { name: 'Charcoal', hex: '#3b3b3b' }],
    images: [U('1507679799987-c73779587ccf'), U('1617137968427-85924c800a22'), U('1534030347209-467a5b0ad3e6'), U('1472417583565-62e7bdeda490')],
    video: VIDEOS.heroCity, featured: true, rating: 4.9, soldCount: 212, ageDays: 40, tags: ['suit', 'wedding', 'office'],
  }),
  product({
    slug: 'classic-black-suit', name: 'Classic Black Suit', gender: 'men', category: 'men-suits', collections: ['formal-shop', 'wedding-guest'],
    description: 'A timeless black two-piece with a modern slim silhouette. Peak lapels and satin-trimmed buttons make it tuxedo-ready for evening events.',
    materials: '65% polyester, 33% viscose, 2% elastane.',
    price: 165000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Black', hex: '#0a0a0a' }],
    images: [U('1610652492500-ded49ceeb378'), U('1617127365659-c47fa864d8bc'), U('1598033129183-c4f50c736f10')], featured: true, rating: 4.8, soldCount: 140, ageDays: 55,
  }),
  product({
    slug: 'forest-green-suit', name: 'Forest Green Suit', gender: 'men', category: 'men-suits', collections: ['formal-shop', 'new-arrivals', 'wedding-guest'],
    description: 'Stand out at the reception. Deep forest green in a structured slim cut with a subtle sheen that photographs beautifully.',
    materials: '72% polyester, 25% viscose, 3% elastane.',
    price: 195000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Forest Green', hex: '#1f4d3a' }, { name: 'Burgundy', hex: '#5a1f2b' }],
    images: [U('1593032465175-481ac7f401a0'), U('1491336477066-31156b5e4f35'), U('1507679799987-c73779587ccf')], featured: true, rating: 4.7, soldCount: 64, ageDays: 6, tags: ['new', 'wedding'],
  }),
  product({
    slug: 'royal-blue-three-piece-suit', name: 'Royal Blue Three-Piece Suit', gender: 'men', category: 'men-suits', collections: ['formal-shop', 'wedding-guest'],
    description: 'Jacket, waistcoat and trousers in a bold royal blue. The three-piece that gets you noticed at Kigali weddings.',
    materials: '70% polyester, 28% viscose, 2% elastane.',
    price: 240000, compareAtPrice: 275000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Royal Blue', hex: '#1d3f8f' }],
    images: [U('1617137968427-85924c800a22'), U('1620012253295-c15cc3e65df4'), U('1534030347209-467a5b0ad3e6')], rating: 4.6, soldCount: 48, ageDays: 20,
  }),
  // ---------------- MEN: BLAZERS ----------------
  product({
    slug: 'camel-casual-blazer', name: 'Camel Casual Blazer', gender: 'men', category: 'men-blazers', collections: ['office-ready', 'best-sellers'],
    description: 'An unstructured camel blazer that dresses up a white tee and jeans. Soft shoulders, patch pockets, zero stiffness.',
    materials: '60% cotton, 38% linen, 2% elastane.',
    price: 75000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Camel', hex: '#b58a5a' }, { name: 'Stone', hex: '#c9c2b4' }],
    images: [U('1553143820-6bb68bc34679'), U('1552374196-1ab2a1c593e8')], featured: true, rating: 4.7, soldCount: 98, ageDays: 15,
  }),
  product({
    slug: 'black-tuxedo-blazer', name: 'Black Satin-Lapel Tuxedo Blazer', gender: 'men', category: 'men-blazers', collections: ['formal-shop', 'wedding-guest'],
    description: 'Shawl satin lapel, single button, slim cut. Pair with black trousers for a full tux look at a fraction of the price.',
    materials: '75% polyester, 23% viscose, 2% elastane.',
    price: 95000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Black', hex: '#0a0a0a' }],
    images: [U('1617127365659-c47fa864d8bc'), U('1610652492500-ded49ceeb378')], rating: 4.8, soldCount: 57, ageDays: 33,
  }),
  product({
    slug: 'grey-linen-blazer', name: 'Grey Linen Blazer', gender: 'men', category: 'men-blazers', collections: ['new-arrivals', 'office-ready'],
    description: 'Light, breathable linen blend for Kigali afternoons. Half-lined so you stay cool from the office to Kimihurura.',
    materials: '55% linen, 45% cotton.',
    price: 68000, sizes: SIZES.suits, sizeType: 'suits',
    colors: [{ name: 'Grey', hex: '#8d8d8d' }],
    images: [U('1555069519-127aadedf1ee'), U('1553143820-6bb68bc34679')], rating: 4.5, soldCount: 31, ageDays: 4, tags: ['new'],
  }),
  // ---------------- MEN: JACKETS ----------------
  product({
    slug: 'black-leather-biker-jacket', name: 'Black Leather Biker Jacket', gender: 'men', category: 'men-jackets', collections: ['street-edit', 'best-sellers'],
    description: 'Asymmetric zip, quilted shoulders and a buttery finish. The jacket that makes every outfit look intentional.',
    materials: 'Genuine lambskin leather. Lining: polyester.',
    price: 145000, compareAtPrice: 170000,
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Brown', hex: '#5c3a21' }],
    images: [U('1551028719-00167b16eac5'), U('1521223890158-f9f7c3d5d504'), U('1520975916090-3105956dac38'), U('1487222477894-8943e31ef7b2')], featured: true, rating: 4.9, soldCount: 76, ageDays: 60,
  }),
  product({
    slug: 'tan-leather-jacket', name: 'Tan Leather Jacket', gender: 'men', category: 'men-jackets', collections: ['street-edit'],
    description: 'Clean cafe-racer silhouette in a rich tan. Stand collar, two welt pockets and a slim fit through the body.',
    materials: 'Genuine leather. Lining: viscose.',
    price: 135000,
    colors: [{ name: 'Tan', hex: '#a9743f' }],
    images: [U('1614252369475-531eba835eb1'), U('1507680434567-5739c80be1ac')], rating: 4.7, soldCount: 42, ageDays: 25,
  }),
  product({
    slug: 'rust-bomber-jacket', name: 'Rust Bomber Jacket', gender: 'men', category: 'men-jackets', collections: ['street-edit', 'new-arrivals'],
    description: 'Lightweight satin bomber with ribbed cuffs and hem. Easy over a tee for Kigali evenings when it cools down.',
    materials: '100% polyester satin. Ribbing: 95% polyester, 5% elastane.',
    price: 55000,
    colors: [{ name: 'Rust', hex: '#b5603a' }, { name: 'Burgundy', hex: '#5a1f2b' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1591047139829-d91aecb6caea'), U('1512353087810-25dfcd100962'), U('1558769132-cb1aea458c5e')], rating: 4.6, soldCount: 88, ageDays: 9, tags: ['new'],
  }),
  product({
    slug: 'shearling-trucker-jacket', name: 'Shearling-Lined Trucker Jacket', gender: 'men', category: 'men-jackets', collections: ['street-edit'],
    description: 'A rugged grey trucker with a soft shearling collar and lining. Warm enough for Musanze mornings.',
    materials: 'Shell: 100% cotton. Lining: faux shearling polyester.',
    price: 78000, compareAtPrice: 92000,
    colors: [{ name: 'Grey', hex: '#6f6f6f' }],
    images: [U('1532332248682-206cc786359f'), U('1551488831-00ddcb6c6bd3')], rating: 4.4, soldCount: 27, ageDays: 70,
  }),
  product({
    slug: 'camel-wool-overcoat', name: 'Camel Wool Overcoat', gender: 'men', category: 'men-jackets', collections: ['formal-shop', 'office-ready'],
    description: 'A long single-breasted overcoat that finishes a suit. Clean lines, deep pockets, wool-blend warmth.',
    materials: '60% wool, 40% polyester.',
    price: 125000,
    colors: [{ name: 'Camel', hex: '#b58a5a' }, { name: 'Charcoal', hex: '#3b3b3b' }],
    images: [U('1507680434567-5739c80be1ac'), U('1552374196-1ab2a1c593e8')], rating: 4.6, soldCount: 22, ageDays: 48, lowStock: true,
  }),
  // ---------------- MEN: SHIRTS ----------------
  product({
    slug: 'white-dress-shirt', name: 'White Slim Dress Shirt', gender: 'men', category: 'men-shirts', collections: ['formal-shop', 'office-ready', 'best-sellers'],
    description: 'The shirt under every suit. Spread collar, easy-iron cotton and a slim fit that does not pull at the buttons.',
    materials: '100% cotton poplin, easy-iron finish.',
    price: 28000,
    colors: [{ name: 'White', hex: '#ffffff' }, { name: 'Sky Blue', hex: '#9ec5f4' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1598033129183-c4f50c736f10'), U('1603252109303-2751441dd157'), U('1602810318383-e386cc2a3ccf')], featured: true, rating: 4.8, soldCount: 310, ageDays: 90,
  }),
  product({
    slug: 'sky-blue-oxford-shirt', name: 'Sky Blue Oxford Shirt', gender: 'men', category: 'men-shirts', collections: ['office-ready'],
    description: 'Textured oxford cotton with a button-down collar. Looks right with a tie or open with chinos.',
    materials: '100% cotton oxford.',
    price: 32000,
    colors: [{ name: 'Sky Blue', hex: '#9ec5f4' }, { name: 'White', hex: '#ffffff' }],
    images: [U('1620012253295-c15cc3e65df4'), U('1558171813-4c088753af8f')], rating: 4.6, soldCount: 120, ageDays: 30,
  }),
  product({
    slug: 'dotted-chambray-shirt', name: 'Dotted Chambray Shirt', gender: 'men', category: 'men-shirts', collections: ['street-edit', 'new-arrivals'],
    description: 'Soft chambray with a micro-dot print. A weekend shirt that still looks put together.',
    materials: '100% cotton chambray.',
    price: 26000,
    colors: [{ name: 'Indigo', hex: '#3a5a8c' }],
    images: [U('1596755094514-f87e34085b2c'), U('1589810635657-232948472d98')], rating: 4.3, soldCount: 40, ageDays: 2, tags: ['new'],
  }),
  product({
    slug: 'leopard-print-shirt', name: 'Leopard Print Party Shirt', gender: 'men', category: 'men-shirts', collections: ['street-edit', 'sale'],
    description: 'Short-sleeve statement shirt in a relaxed cut. For Kigali nights out.',
    materials: '100% viscose.',
    price: 19000, compareAtPrice: 29000,
    colors: [{ name: 'Leopard', hex: '#b58a5a' }],
    images: [U('1536766820879-059fec98ec0a')], rating: 4.2, soldCount: 35, ageDays: 110,
  }),
  // ---------------- MEN: TEES ----------------
  product({
    slug: 'essential-tee', name: 'Essential Crew Tee', gender: 'men', category: 'men-tshirts', collections: ['street-edit', 'best-sellers'],
    description: 'Heavyweight 220gsm cotton, ribbed crew neck, holds its shape wash after wash. The 9,500 RWF tee everyone asks about on TikTok.',
    materials: '100% combed cotton, 220gsm.',
    price: 9500,
    colors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#0a0a0a' }, { name: 'Olive', hex: '#5b6b3a' }, { name: 'Navy', hex: '#1f2a44' }],
    images: [U('1521572163474-6864f9cf17ab'), U('1583743814966-8936f5b7be1a'), U('1519058082700-08a0b56da9b4'), U('1562157873-818bc0726f68')], featured: true, rating: 4.9, soldCount: 820, ageDays: 120,
  }),
  product({
    slug: 'original-graphic-tee', name: 'Original Graphic Tee', gender: 'men', category: 'men-tshirts', collections: ['street-edit'],
    description: 'Oversized fit with a bold front print. Drop shoulders, heavyweight cotton.',
    materials: '100% cotton, 240gsm.',
    price: 14500,
    colors: [{ name: 'Sand', hex: '#d9cfc0' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1576566588028-4147f3842f27'), U('1618354691373-d851c5c3a990'), U('1571945153237-4929e783af4a')], rating: 4.6, soldCount: 160, ageDays: 18,
  }),
  product({
    slug: 'crew-sweatshirt', name: 'Classic Crew Sweatshirt', gender: 'men', category: 'men-tshirts', collections: ['street-edit', 'best-sellers'],
    description: 'Brushed fleece interior, relaxed fit. The sweatshirt for rainy-season Kigali.',
    materials: '80% cotton, 20% polyester fleece.',
    price: 24000,
    colors: [{ name: 'White', hex: '#f4f4f4' }, { name: 'Pink', hex: '#e9c7cf' }, { name: 'Grey', hex: '#9a9a9a' }],
    images: [U('1620799140408-edc6dcb6d633'), U('1516826957135-700dedea698c')], rating: 4.7, soldCount: 240, ageDays: 45,
  }),
  product({
    slug: 'beige-knit-sweater', name: 'Beige Cable Knit Sweater', gender: 'men', category: 'men-tshirts', collections: ['new-arrivals', 'office-ready'],
    description: 'Chunky cable knit in a warm beige. Layer over a shirt for an easy smart-casual look.',
    materials: '50% acrylic, 30% wool, 20% nylon.',
    price: 38000,
    colors: [{ name: 'Beige', hex: '#cdb89b' }, { name: 'Rust', hex: '#b5603a' }],
    images: [U('1631541909061-71e349d1f203'), U('1614676471928-2ed0ad1061a4')], rating: 4.5, soldCount: 44, ageDays: 7, tags: ['new'],
  }),
  // ---------------- MEN: TROUSERS ----------------
  product({
    slug: 'slim-dark-jeans', name: 'Slim Dark Wash Jeans', gender: 'men', category: 'men-trousers', collections: ['street-edit', 'best-sellers'],
    description: 'Dark indigo stretch denim that fits like it was made for you. Tapered below the knee.',
    materials: '98% cotton, 2% elastane.',
    price: 32000, sizes: SIZES.bottoms, sizeType: 'bottoms',
    colors: [{ name: 'Dark Indigo', hex: '#1f2a44' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1542272604-787c3835535d'), U('1604176354204-9268737828e4'), U('1511105043137-7e66f28270e3')], featured: true, rating: 4.7, soldCount: 300, ageDays: 80,
  }),
  product({
    slug: 'straight-fit-jeans', name: 'Straight Fit Jeans', gender: 'men', category: 'men-trousers', collections: ['street-edit'],
    description: 'Classic straight leg in a mid-blue wash. Rigid-feel denim that softens with wear.',
    materials: '100% cotton denim.',
    price: 35000, sizes: SIZES.bottoms, sizeType: 'bottoms',
    colors: [{ name: 'Mid Blue', hex: '#4a6fa5' }],
    images: [U('1605518216938-7c31b7b14ad0'), U('1560243563-062bfc001d68')], rating: 4.5, soldCount: 90, ageDays: 36,
  }),
  product({
    slug: 'black-cargo-trousers', name: 'Black Cargo Trousers', gender: 'men', category: 'men-trousers', collections: ['street-edit', 'new-arrivals'],
    description: 'Six-pocket cargo in a tapered fit. Durable twill, drawcord hem.',
    materials: '100% cotton twill.',
    price: 29000, sizes: SIZES.bottoms, sizeType: 'bottoms',
    colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Khaki', hex: '#8b7d5a' }],
    images: [U('1548883354-7622d03aca27'), U('1624378439575-d8705ad7ae80')], rating: 4.4, soldCount: 66, ageDays: 3, tags: ['new'],
  }),
  product({
    slug: 'tailored-suit-trousers', name: 'Tailored Suit Trousers', gender: 'men', category: 'men-trousers', collections: ['formal-shop', 'office-ready'],
    description: 'Flat-front slim trousers to pair with any of our blazers. Sold separately for mix-and-match.',
    materials: '70% polyester, 28% viscose, 2% elastane.',
    price: 42000, sizes: SIZES.bottoms, sizeType: 'bottoms',
    colors: [{ name: 'Navy', hex: '#1f2a44' }, { name: 'Charcoal', hex: '#3b3b3b' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1617137968427-85924c800a22'), U('1624378439575-d8705ad7ae80')], rating: 4.6, soldCount: 110, ageDays: 50,
  }),
  // ---------------- MEN: SHOES ----------------
  product({
    slug: 'leather-lace-up-boots', name: 'Brown Leather Lace-Up Boots', gender: 'men', category: 'men-shoes', collections: ['formal-shop', 'best-sellers'],
    description: 'Full-grain leather boots with a Goodyear-style welt. Smart with a suit, rugged with jeans.',
    materials: 'Full-grain leather upper, rubber sole.',
    price: 68000, compareAtPrice: 80000, sizes: SIZES.shoes, sizeType: 'shoes',
    colors: [{ name: 'Brown', hex: '#5c3a21' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1608256246200-53e635b5b65f'), U('1614676471928-2ed0ad1061a4')], featured: true, rating: 4.8, soldCount: 72, ageDays: 65,
  }),
  product({
    slug: 'white-high-top-sneakers', name: 'White High-Top Sneakers', gender: 'men', category: 'men-shoes', collections: ['street-edit', 'best-sellers'],
    description: 'Clean white high-tops that go with everything. Padded collar, cushioned sole.',
    materials: 'Synthetic leather upper, rubber sole.',
    price: 45000, sizes: SIZES.shoes, sizeType: 'shoes',
    colors: [{ name: 'White', hex: '#ffffff' }],
    images: [U('1512374382149-233c42b6a83b'), U('1549298916-b41d501d3772')], rating: 4.7, soldCount: 180, ageDays: 28,
  }),
  product({
    slug: 'red-runner-sneakers', name: 'Red Knit Runner Sneakers', gender: 'men', category: 'men-shoes', collections: ['street-edit', 'sale'],
    description: 'Feather-light knit runners in bold red. Breathable, flexible, made for walking Kigali hills.',
    materials: 'Knit textile upper, EVA sole.',
    price: 39000, compareAtPrice: 52000, sizes: SIZES.shoes, sizeType: 'shoes',
    colors: [{ name: 'Red', hex: '#c62828' }, { name: 'White/Orange', hex: '#f0f0f0' }],
    images: [U('1542291026-7eec264c27ff'), U('1600185365926-3a2ce3cdb9eb')], rating: 4.5, soldCount: 95, ageDays: 95,
  }),
  product({
    slug: 'sky-blue-high-tops', name: 'Sky Blue High-Tops', gender: 'men', category: 'men-shoes', collections: ['street-edit', 'new-arrivals'],
    description: 'Limited-run high-tops in sky blue with orange accents. Few pairs per size.',
    materials: 'Leather and textile upper, rubber sole.',
    price: 85000, sizes: SIZES.shoes, sizeType: 'shoes',
    colors: [{ name: 'Sky Blue', hex: '#6fb7e8' }],
    images: [U('1588099768523-f4e6a5679d88')], rating: 4.9, soldCount: 18, ageDays: 1, lowStock: true, tags: ['new', 'limited'],
  }),
  // ---------------- WOMEN: DRESSES ----------------
  product({
    slug: 'red-floral-midi-dress', name: 'Red Floral Midi Dress', gender: 'women', category: 'women-dresses', collections: ['wedding-guest', 'best-sellers', 'new-arrivals'],
    description: 'A sleeveless midi with a fitted bodice, belted waist and a swishy skirt. The dress that gets asked about at every wedding.',
    materials: '100% viscose.',
    price: 48000, sizes: SIZES.dresses, sizeType: 'dresses',
    colors: [{ name: 'Red Floral', hex: '#c62828' }],
    images: [U('1572804013309-59a88b7e92f1'), U('1496747611176-843222e1e57c')], featured: true, rating: 4.9, soldCount: 150, ageDays: 5, tags: ['new', 'wedding'],
  }),
  product({
    slug: 'scarlet-evening-gown', name: 'Scarlet Evening Gown', gender: 'women', category: 'women-dresses', collections: ['wedding-guest'],
    description: 'Floor-length satin gown with a full skirt that moves. Hidden side zip, lightly boned bodice.',
    materials: '100% polyester satin. Lining: polyester.',
    price: 95000, sizes: SIZES.dresses, sizeType: 'dresses',
    colors: [{ name: 'Scarlet', hex: '#b71c1c' }, { name: 'Emerald', hex: '#1f6b4a' }],
    images: [U('1595777457583-95e059d581b8'), U('1568252542512-9fe8fe9c87bb')], featured: true, rating: 4.8, soldCount: 36, ageDays: 22,
  }),
  product({
    slug: 'burgundy-tulle-gown', name: 'Burgundy Tulle Gown', gender: 'women', category: 'women-dresses', collections: ['wedding-guest'],
    description: "Strapless gown with layers of embroidered tulle. For the bride's sister, the maid of honour, the night that matters.",
    materials: 'Polyester tulle with embroidered appliques. Lining: polyester.',
    price: 160000, compareAtPrice: 190000, sizes: SIZES.dresses, sizeType: 'dresses',
    colors: [{ name: 'Burgundy', hex: '#5a1f2b' }],
    images: [U('1568252542512-9fe8fe9c87bb'), U('1595777457583-95e059d581b8')], rating: 5, soldCount: 12, ageDays: 40, lowStock: true,
  }),
  product({
    slug: 'white-off-shoulder-dress', name: 'White Off-Shoulder Mini Dress', gender: 'women', category: 'women-dresses', collections: ['new-arrivals', 'street-edit'],
    description: 'Breezy cotton mini with elasticated off-shoulder neckline and tiered ruffles. Brunch in Kiyovu, sorted.',
    materials: '100% cotton.',
    price: 34000, sizes: SIZES.dresses, sizeType: 'dresses',
    colors: [{ name: 'White', hex: '#ffffff' }],
    images: [U('1515372039744-b8f02a3ae446'), U('1500917293891-ef795e70e1f6')], rating: 4.6, soldCount: 80, ageDays: 8, tags: ['new'],
  }),
  product({
    slug: 'plum-shirt-dress', name: 'Plum Corduroy Shirt Dress', gender: 'women', category: 'women-dresses', collections: ['office-ready'],
    description: 'Long-sleeve shirt dress in soft fine-wale corduroy. Buttons to the waist, flattering A-line skirt.',
    materials: '100% cotton corduroy.',
    price: 42000, sizes: SIZES.dresses, sizeType: 'dresses',
    colors: [{ name: 'Plum', hex: '#6b2a44' }, { name: 'Olive', hex: '#5b6b3a' }],
    images: [U('1585487000160-6ebcfceb0d03')], rating: 4.4, soldCount: 45, ageDays: 34,
  }),
  // ---------------- WOMEN: TOPS ----------------
  product({
    slug: 'champagne-satin-blouse', name: 'Champagne Satin Blouse', gender: 'women', category: 'women-tops', collections: ['office-ready', 'best-sellers'],
    description: 'A fluid satin blouse with a draped neckline. Tuck into trousers for work, leave loose for dinner.',
    materials: '100% polyester satin.',
    price: 26000, sizes: SIZES.dresses,
    colors: [{ name: 'Champagne', hex: '#e8d9c0' }, { name: 'Black', hex: '#0a0a0a' }, { name: 'Emerald', hex: '#1f6b4a' }],
    images: [U('1603344797033-f0f4f587ab60'), U('1581044777550-4cfa60707c03')], featured: true, rating: 4.7, soldCount: 130, ageDays: 26,
  }),
  product({
    slug: 'blush-ruffle-blouse', name: 'Blush Ruffle Blouse', gender: 'women', category: 'women-tops', collections: ['wedding-guest', 'new-arrivals'],
    description: 'Romantic off-shoulder blouse in a floral-dotted sheer with voluminous sleeves.',
    materials: '100% polyester chiffon.',
    price: 29000, sizes: SIZES.dresses,
    colors: [{ name: 'Blush', hex: '#f1c6cf' }],
    images: [U('1581044777550-4cfa60707c03')], rating: 4.5, soldCount: 38, ageDays: 10, tags: ['new'],
  }),
  product({
    slug: 'white-boxy-tee', name: 'White Boxy Tee', gender: 'women', category: 'women-tops', collections: ['street-edit', 'best-sellers'],
    description: 'Cropped boxy tee in thick cotton. The easiest top in your wardrobe.',
    materials: '100% cotton, 200gsm.',
    price: 9500, sizes: SIZES.dresses,
    colors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#0a0a0a' }, { name: 'Red', hex: '#c62828' }],
    images: [U('1598554747436-c9293d6a588f'), U('1554568218-0f1715e72254'), U('1529139574466-a303027c1d8b')], rating: 4.8, soldCount: 420, ageDays: 100,
  }),
  product({
    slug: 'skeleton-graphic-tee', name: 'Skeleton Hand Graphic Tee', gender: 'women', category: 'women-tops', collections: ['street-edit'],
    description: 'Cropped black tee with a glow-in-the-dark skeleton hand print.',
    materials: '100% cotton.',
    price: 14000, sizes: SIZES.dresses,
    colors: [{ name: 'Black', hex: '#0a0a0a' }],
    images: [U('1503342217505-b0a15ec3261c')], rating: 4.6, soldCount: 70, ageDays: 42,
  }),
  product({
    slug: 'red-oversized-sweatshirt', name: 'Red Oversized Sweatshirt', gender: 'women', category: 'women-tops', collections: ['street-edit', 'sale'],
    description: 'Slouchy, brushed-back fleece sweatshirt with dropped shoulders. Wear it as a dress with boots.',
    materials: '80% cotton, 20% polyester.',
    price: 21000, compareAtPrice: 28000, sizes: SIZES.dresses,
    colors: [{ name: 'Red', hex: '#c62828' }, { name: 'Grey', hex: '#9a9a9a' }],
    images: [U('1485230895905-ec40ba36b9bc'), U('1535295972055-1c762f4483e5')], rating: 4.5, soldCount: 110, ageDays: 75,
  }),
  product({
    slug: 'grey-oversized-shirt', name: 'Grey Oversized Shirt', gender: 'women', category: 'women-tops', collections: ['office-ready', 'new-arrivals'],
    description: 'Relaxed poplin shirt with dropped shoulders and a curved hem. Wear open over a tank or buttoned to the top.',
    materials: '100% cotton poplin.',
    price: 24000, sizes: SIZES.dresses,
    colors: [{ name: 'Grey', hex: '#9a9a9a' }, { name: 'White', hex: '#ffffff' }],
    images: [U('1601762603339-fd61e28b698a')], rating: 4.4, soldCount: 30, ageDays: 6, tags: ['new'],
  }),
  // ---------------- WOMEN: BLAZERS & SETS ----------------
  product({
    slug: 'ivory-power-blazer', name: 'Ivory Power Blazer', gender: 'women', category: 'women-blazers', collections: ['office-ready', 'best-sellers', 'wedding-guest'],
    description: 'Structured shoulders, double-breasted front, nipped waist. The blazer that runs the meeting.',
    materials: '72% polyester, 25% viscose, 3% elastane.',
    price: 68000, sizes: SIZES.dresses,
    colors: [{ name: 'Ivory', hex: '#f3efe6' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1571513722275-4b41940f54b8'), U('1603344797033-f0f4f587ab60')], featured: true, rating: 4.9, soldCount: 85, ageDays: 19,
  }),
  product({
    slug: 'navy-co-ord-set', name: 'Navy Tailored Co-ord Set', gender: 'women', category: 'women-sets', collections: ['office-ready', 'new-arrivals'],
    description: 'Cropped wrap top and matching high-waist trousers. Wear together or split them across the week.',
    materials: '65% polyester, 32% viscose, 3% elastane.',
    price: 58000, sizes: SIZES.dresses,
    colors: [{ name: 'Navy', hex: '#1f2a44' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1562572159-4efc207f5aff')], rating: 4.6, soldCount: 52, ageDays: 12, tags: ['new'],
  }),
  product({
    slug: 'yellow-tracksuit-set', name: 'Yellow Cropped Tracksuit Set', gender: 'women', category: 'women-sets', collections: ['street-edit', 'best-sellers'],
    description: 'Cropped hoodie and joggers in a bold mustard. Soft fleece, elasticated cuffs.',
    materials: '80% cotton, 20% polyester fleece.',
    price: 42000, sizes: SIZES.dresses,
    colors: [{ name: 'Mustard', hex: '#e2b007' }, { name: 'Grey', hex: '#9a9a9a' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1515886657613-9f3515b0c78f'), U('1588117305388-c2631a279f82')], featured: true, rating: 4.7, soldCount: 140, ageDays: 38,
  }),
  product({
    slug: 'teal-halter-jumpsuit', name: 'Teal Halter Jumpsuit', gender: 'women', category: 'women-sets', collections: ['wedding-guest'],
    description: 'Wide-leg jumpsuit with a plunging halter neckline and a self-tie belt. One piece, full look.',
    materials: '95% polyester, 5% elastane.',
    price: 52000, sizes: SIZES.dresses,
    colors: [{ name: 'Teal', hex: '#1b7a7a' }],
    images: [U('1495385794356-15371f348c31')], rating: 4.5, soldCount: 29, ageDays: 58,
  }),
  // ---------------- WOMEN: COATS ----------------
  product({
    slug: 'camel-wrap-coat', name: 'Camel Wrap Coat', gender: 'women', category: 'women-coats', collections: ['office-ready', 'best-sellers'],
    description: 'A long belted wrap coat in a soft wool blend. Minimal, warm, elegant.',
    materials: '55% wool, 45% polyester.',
    price: 98000, compareAtPrice: 115000, sizes: SIZES.dresses,
    colors: [{ name: 'Camel', hex: '#b58a5a' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1539533018447-63fcce2678e3'), U('1554412933-514a83d2f3c8')], featured: true, rating: 4.8, soldCount: 40, ageDays: 44,
  }),
  product({
    slug: 'burgundy-shearling-coat', name: 'Burgundy Shearling Coat', gender: 'women', category: 'women-coats', collections: ['new-arrivals'],
    description: 'Oversized burgundy coat with a shearling collar. Statement outerwear for the cool season.',
    materials: 'Shell: polyester. Collar: faux shearling.',
    price: 110000, sizes: SIZES.dresses,
    colors: [{ name: 'Burgundy', hex: '#5a1f2b' }],
    images: [U('1483985988355-763728e1935b')], rating: 4.7, soldCount: 15, ageDays: 2, tags: ['new'], lowStock: true,
  }),
  product({
    slug: 'powder-blue-trench', name: 'Powder Blue Trench Coat', gender: 'women', category: 'women-coats', collections: ['office-ready'],
    description: 'Classic double-breasted trench in powder blue cotton twill. Belted, water-resistant.',
    materials: '100% cotton twill, water-resistant finish.',
    price: 82000, sizes: SIZES.dresses,
    colors: [{ name: 'Powder Blue', hex: '#a9c4e0' }, { name: 'Beige', hex: '#cdb89b' }],
    images: [U('1539109136881-3be0616acf4b')], rating: 4.6, soldCount: 24, ageDays: 29,
  }),
  product({
    slug: 'brown-suede-bomber', name: 'Brown Suede Bomber', gender: 'women', category: 'women-coats', collections: ['street-edit', 'sale'],
    description: 'Cropped bomber in soft faux suede. Rib cuffs, zip front.',
    materials: '100% polyester faux suede.',
    price: 39000, compareAtPrice: 55000, sizes: SIZES.dresses,
    colors: [{ name: 'Brown', hex: '#7a4b2a' }, { name: 'Olive', hex: '#5b6b3a' }],
    images: [U('1519235106638-30cc49b5dbc5'), U('1544022613-e87ca75a784a')], rating: 4.4, soldCount: 60, ageDays: 85,
  }),
  // ---------------- WOMEN: BOTTOMS ----------------
  product({
    slug: 'light-wash-mom-jeans', name: 'Light Wash Mom Jeans', gender: 'women', category: 'women-bottoms', collections: ['street-edit', 'best-sellers'],
    description: "High-rise, relaxed through the hip, tapered leg. Our best-selling women's denim.",
    materials: '100% cotton denim.',
    price: 32000, sizes: SIZES.wbottoms, sizeType: 'wbottoms',
    colors: [{ name: 'Light Blue', hex: '#9ec5f4' }, { name: 'Mid Blue', hex: '#4a6fa5' }],
    images: [U('1475178626620-a4d074967452'), U('1541099649105-f69ad21f3246')], featured: true, rating: 4.7, soldCount: 210, ageDays: 66,
  }),
  product({
    slug: 'striped-wide-leg-pants', name: 'Striped Wide-Leg Pants', gender: 'women', category: 'women-bottoms', collections: ['new-arrivals', 'street-edit'],
    description: 'Bold black-and-white stripes, high waist, floor-skimming wide leg.',
    materials: '95% polyester, 5% elastane.',
    price: 27000, sizes: SIZES.dresses,
    colors: [{ name: 'Stripe', hex: '#222222' }],
    images: [U('1509631179647-0177331693ae')], rating: 4.3, soldCount: 22, ageDays: 11, tags: ['new'],
  }),
  product({
    slug: 'street-sweatpants', name: 'Grey Street Sweatpants', gender: 'women', category: 'women-bottoms', collections: ['street-edit'],
    description: 'Relaxed joggers with a tapered cuff. Pairs with the Yellow Tracksuit hoodie.',
    materials: '80% cotton, 20% polyester.',
    price: 22000, sizes: SIZES.dresses,
    colors: [{ name: 'Grey', hex: '#9a9a9a' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1588117305388-c2631a279f82')], rating: 4.5, soldCount: 75, ageDays: 52,
  }),
  // ---------------- WOMEN: SHOES ----------------
  product({
    slug: 'pastel-court-sneakers', name: 'Pastel Court Sneakers', gender: 'women', category: 'women-shoes', collections: ['street-edit', 'new-arrivals', 'best-sellers'],
    description: 'Low-top court sneakers in a dreamy pastel colourway. Padded tongue, lightweight sole.',
    materials: 'Synthetic leather upper, rubber sole.',
    price: 48000, sizes: SIZES.wshoes, sizeType: 'wshoes',
    colors: [{ name: 'Pastel', hex: '#d9c6f0' }, { name: 'White', hex: '#ffffff' }],
    images: [U('1595950653106-6c9ebd614d3a'), U('1511556532299-8f662fc26c06')], featured: true, rating: 4.8, soldCount: 95, ageDays: 4, tags: ['new'],
  }),
  product({
    slug: 'pink-air-sneakers', name: 'Pink Air Runner Sneakers', gender: 'women', category: 'women-shoes', collections: ['street-edit', 'sale'],
    description: 'Retro runners with a visible air unit and pink overlays.',
    materials: 'Mesh and synthetic upper, rubber sole.',
    price: 42000, compareAtPrice: 56000, sizes: SIZES.wshoes, sizeType: 'wshoes',
    colors: [{ name: 'Pink', hex: '#e75480' }],
    images: [U('1511556532299-8f662fc26c06')], rating: 4.6, soldCount: 50, ageDays: 92,
  }),
  // ---------------- BAGS & ACCESSORIES ----------------
  product({
    slug: 'pink-chain-crossbody-bag', name: 'Pink Chain Crossbody Bag', gender: 'women', category: 'women-bags', collections: ['new-arrivals', 'wedding-guest'],
    description: 'Structured mini crossbody with a gold chain strap and chevron flap.',
    materials: 'Vegan leather, gold-tone hardware.',
    price: 35000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Pink', hex: '#f1c6cf' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1566150905458-1bf1fc113f0d'), U('1506152983158-b4a74a01c721')], rating: 4.7, soldCount: 40, ageDays: 14, tags: ['new'],
  }),
  product({
    slug: 'woven-straw-tote', name: 'Woven Straw Tote', gender: 'women', category: 'women-bags', collections: ['street-edit'],
    description: 'Handwoven straw tote with a cotton lining. Market days and lake weekends.',
    materials: 'Natural straw, cotton lining.',
    price: 18000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Natural', hex: '#d2b48c' }],
    images: [U('1554342872-034a06541bad')], rating: 4.5, soldCount: 33, ageDays: 70,
  }),
  product({
    slug: 'crescent-layered-necklace', name: 'Crescent Layered Necklace', gender: 'women', category: 'women-bags', collections: ['wedding-guest'],
    description: 'Two-layer gold-tone necklace with a crescent pendant and a faceted blue stone.',
    materials: 'Gold-plated brass, glass stone.',
    price: 12000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Gold', hex: '#d4af37' }],
    images: [U('1599643478518-a784e5dc4c8f')], rating: 4.8, soldCount: 58, ageDays: 24,
  }),
  product({
    slug: 'leather-strap-watch', name: 'Leather Strap Watch', gender: 'unisex', category: 'accessories', collections: ['formal-shop', 'office-ready'],
    description: 'Minimal 40mm case with a brown leather strap. Finishes a suit.',
    materials: 'Stainless steel case, genuine leather strap, quartz movement.',
    price: 45000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Brown', hex: '#5c3a21' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1490114538077-0a7f8cb49891'), U('1491336477066-31156b5e4f35')], rating: 4.6, soldCount: 47, ageDays: 37,
  }),
  product({
    slug: 'grey-snapback-cap', name: 'Grey Snapback Cap', gender: 'unisex', category: 'accessories', collections: ['street-edit'],
    description: 'Structured six-panel cap with an embroidered logo. One size, adjustable snap.',
    materials: '100% cotton twill.',
    price: 11000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Grey', hex: '#9a9a9a' }, { name: 'Black', hex: '#0a0a0a' }],
    images: [U('1556306535-0f09a537f0a3')], rating: 4.4, soldCount: 90, ageDays: 61,
  }),
  product({
    slug: 'cream-fringe-poncho', name: 'Cream Fringe Poncho', gender: 'women', category: 'women-tops', collections: ['sale'],
    description: 'Knitted poncho with fringe hem. Light layer for cool Kigali evenings.',
    materials: '100% acrylic.',
    price: 19000, compareAtPrice: 30000, sizes: SIZES.one, sizeType: 'one',
    colors: [{ name: 'Cream', hex: '#f3efe6' }],
    images: [U('1434389677669-e08b4cac3105')], rating: 4.2, soldCount: 20, ageDays: 130,
  }),
];

const byslug = (slug) => products.find((p) => p.slug === slug).id;

// ---------------- REVIEWS ----------------
const reviewers = ['Aline U.', 'Kevin M.', 'Divine I.', 'Patrick N.', 'Sandrine K.', 'Eric H.', 'Chantal M.', 'Yves R.', 'Grace T.', 'Jean-Paul B.', 'Nadia M.', 'Samuel G.'];
const reviewTexts = [
  ['Perfect fit', 'Ordered on WhatsApp in the morning, delivered to Kimironko by 4pm. Fit is exactly as the size guide said.'],
  ['Quality is real', 'The fabric feels premium. I have washed it three times and it still looks new.'],
  ['Wore it to a wedding', 'Got so many compliments at the reception in Nyamata. Will buy another colour.'],
  ['Great value', 'Cheaper than what I saw in Kigali Heights and better quality. Delivery guy was polite.'],
  ['Exactly like the photos', 'Colour matches the pictures. Size M fits my 1.75m frame perfectly.'],
  ['Fast delivery', 'Picked up at Unif House, the team helped me try two sizes. Highly recommend.'],
  ['Good but runs slightly small', 'Love it, but I would suggest going one size up if you are between sizes.'],
  ['My new favourite', 'Comfortable, stylish and the price is fair. Thank you Briva!'],
];
const reviews = [];
products.forEach((p, i) => {
  const n = (i % 4) + 1;
  for (let k = 0; k < n; k += 1) {
    const t = reviewTexts[(i + k) % reviewTexts.length];
    const rating = t[0].includes('runs') ? 4 : 5 - ((i + k) % 3 === 0 ? 1 : 0);
    reviews.push({
      id: `r-${p.id}-${k}`,
      productId: p.id,
      name: reviewers[(i * 3 + k) % reviewers.length],
      rating,
      title: t[0],
      body: t[1],
      status: 'approved',
      verified: true,
      createdAt: new Date(Date.now() - ((i * 5 + k * 9) % 120) * 86400000).toISOString(),
    });
  }
  p.reviewCount = n;
  const avg = reviews.filter((r) => r.productId === p.id).reduce((s, r) => s + r.rating, 0) / n;
  p.rating = Math.round(avg * 10) / 10;
});
// a couple of pending reviews for the admin to moderate
reviews.push({ id: 'r-pending-1', productId: byslug('navy-slim-fit-suit'), name: 'Olivier K.', rating: 5, title: 'Best suit purchase', body: 'The tailor at Unif House adjusted the trousers for free. Incredible service.', status: 'pending', verified: false, createdAt: new Date(Date.now() - 86400000).toISOString() });
reviews.push({ id: 'r-pending-2', productId: byslug('red-floral-midi-dress'), name: 'Ange M.', rating: 4, title: 'Lovely dress', body: 'Beautiful colour. Zip was a little stiff at first.', status: 'pending', verified: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() });

// ---------------- USERS ----------------
const users = [
  {
    id: 'u-admin', name: 'Breston Briva', email: 'admin@brivastore.rw', phone: '+250782164798', role: 'admin',
    passwordHash: bcrypt.hashSync('Admin@123', 8), addresses: [], wishlist: [], createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
  {
    id: 'u-demo', name: 'Aline Uwase', email: 'aline@example.com', phone: '+250788123456', role: 'customer',
    passwordHash: bcrypt.hashSync('password123', 8),
    addresses: [{ id: 'a1', label: 'Home', line1: 'KG 11 Ave, House 24', sector: 'Kimironko', district: 'Gasabo', city: 'Kigali', phone: '+250788123456', default: true }],
    wishlist: [byslug('red-floral-midi-dress'), byslug('ivory-power-blazer'), byslug('camel-wrap-coat')], createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];
const customerNames = ['Kevin Mugisha', 'Divine Ingabire', 'Patrick Nsengimana', 'Sandrine Keza', 'Eric Habimana', 'Chantal Mukamana', 'Yves Rukundo', 'Grace Tuyishime', 'Jean-Paul Bizimana', 'Nadia Mutesi', 'Samuel Gatete', 'Olivier Kalisa', 'Ange Mihigo', 'Claudine Uwera', 'Fabrice Niyonzima', 'Josiane Umutoni'];
customerNames.forEach((name, i) => {
  users.push({
    id: `u-${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    phone: `+25078${String(1000000 + i * 73519).slice(0, 7)}`,
    role: 'customer',
    passwordHash: bcrypt.hashSync('password123', 8),
    addresses: [],
    wishlist: [],
    createdAt: new Date(Date.now() - (120 - i * 8) * 86400000).toISOString(),
  });
});

// ---------------- PROMOS ----------------
const promos = [
  { id: 'pr1', code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 20000, usageLimit: 1000, used: 134, active: true, expiresAt: null, description: '10% off your first order' },
  { id: 'pr2', code: 'KIGALI5K', type: 'fixed', value: 5000, minSubtotal: 50000, usageLimit: 500, used: 61, active: true, expiresAt: null, description: '5,000 RWF off orders over 50,000' },
  { id: 'pr3', code: 'FREEDELIVERY', type: 'free_delivery', value: 0, minSubtotal: 30000, usageLimit: null, used: 212, active: true, expiresAt: null, description: 'Free delivery anywhere in Kigali' },
  { id: 'pr4', code: 'WEDDING20', type: 'percent', value: 20, minSubtotal: 100000, usageLimit: 100, used: 100, active: false, expiresAt: new Date(Date.now() - 10 * 86400000).toISOString(), description: 'Wedding season promo (ended)' },
];

// ---------------- SETTINGS ----------------
const settings = {
  store: {
    name: 'Briva Store',
    tagline: 'All kinds of clothes for men and women',
    phone: '+250 782 164 798',
    whatsapp: '250782164798',
    email: 'hello@brivastore.rw',
    address: 'Unif House, 2nd Floor, Kigali City Centre',
    city: 'Kigali, Rwanda',
    hours: 'Mon - Sat: 8:00 - 20:00, Sun: 10:00 - 18:00',
    instagram: 'https://www.instagram.com/briva_store_rwanda/',
    tiktok: 'https://www.tiktok.com/@briva_store',
    mapQuery: 'Kigali City Centre, Rwanda',
    currency: 'RWF',
  },
  delivery: {
    freeThreshold: 80000,
    zones: [
      { id: 'kigali-standard', name: 'Kigali Standard (same/next day)', fee: 2000, eta: 'Same day if ordered before 2pm, otherwise next day', active: true },
      { id: 'kigali-express', name: 'Kigali Express (within 3 hours)', fee: 5000, eta: '2-3 hours', active: true },
      { id: 'pickup', name: 'Pick up at Unif House', fee: 0, eta: 'Ready in 1 hour', active: true },
      { id: 'upcountry', name: 'Other provinces (bus courier)', fee: 6000, eta: '1-2 days', active: true },
    ],
    districts: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  },
  payments: [
    { id: 'momo', name: 'MTN Mobile Money', description: 'Pay to 0782164798 and confirm with the prompt on your phone', active: true },
    { id: 'airtel', name: 'Airtel Money', description: 'Pay from your Airtel Money wallet', active: true },
    { id: 'card', name: 'Debit / Credit Card', description: 'Visa and Mastercard (secure checkout)', active: true },
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay the rider when your order arrives (Kigali only)', active: true },
  ],
  orderSeq: 0,
};

// ---------------- CONTENT (homepage) ----------------
const content = {
  promoBar: [
    'Free delivery in Kigali on orders over 80,000 RWF',
    'New in: The Formal Shop. Suits from 165,000 RWF',
    'Order on WhatsApp: +250 782 164 798',
  ],
  hero: {
    type: 'video',
    video: VIDEOS.heroCity,
    poster: U('1617137968427-85924c800a22', 1600),
    eyebrow: "Kigali's home of good clothes",
    title: 'Dress like you mean it.',
    subtitle: 'Suits, streetwear and everything in between. Delivered across Kigali in hours.',
    primaryCta: { label: 'Shop Men', to: '/men' },
    secondaryCta: { label: 'Shop Women', to: '/women' },
  },
  banners: [
    { id: 'b1', title: 'The Formal Shop', subtitle: 'Wedding-ready suits from 165,000 RWF', image: U('1507679799987-c73779587ccf', 1200), to: '/collections/formal-shop', theme: 'dark' },
    { id: 'b2', title: 'Street Edit', subtitle: 'Tees from 9,500 RWF. Sneakers, sweats, caps.', image: U('1515886657613-9f3515b0c78f', 1200), to: '/collections/street-edit', theme: 'light' },
    { id: 'b3', title: 'Sale', subtitle: 'Up to 40% off selected styles', image: U('1441986300917-64674bd600d8', 1200), to: '/collections/sale', theme: 'dark', badge: 'UP TO 40% OFF' },
  ],
  promoCode: { code: 'WELCOME10', title: '10% off your first order', subtitle: 'Use code WELCOME10 at checkout. Minimum order 20,000 RWF.' },
  story: {
    title: 'Made for Kigali',
    body: 'Briva Store started with a rack of suits at Unif House and a WhatsApp number. Today we stock European-quality clothing for men and women, fit you in store, and deliver across Kigali the same day. No middlemen, no inflated prices.',
    image: U('1567401893414-76b7b1e5a7a5', 1200),
    video: VIDEOS.shop,
    points: [
      { title: 'Fitted in store', body: 'Visit Unif House and our team will fit you properly. Free hemming on all suits.' },
      { title: 'Same-day delivery', body: 'Order before 2pm and a rider brings it to your door anywhere in Kigali.' },
      { title: 'Pay how you like', body: 'MTN MoMo, Airtel Money, card or cash on delivery.' },
      { title: 'Easy exchanges', body: 'Wrong size? Exchange within 7 days with the tag still on.' },
    ],
  },
  lookbook: [
    { id: 'l1', image: U('1483985988355-763728e1935b', 800), caption: 'Burgundy season', productId: byslug('burgundy-shearling-coat') },
    { id: 'l2', image: U('1610652492500-ded49ceeb378', 800), caption: 'Black tie, Kigali', productId: byslug('classic-black-suit') },
    { id: 'l3', image: U('1515886657613-9f3515b0c78f', 800), caption: 'Mustard moments', productId: byslug('yellow-tracksuit-set') },
    { id: 'l4', image: U('1614252369475-531eba835eb1', 800), caption: 'Tan leather', productId: byslug('tan-leather-jacket') },
    { id: 'l5', image: U('1572804013309-59a88b7e92f1', 800), caption: 'Wedding guest', productId: byslug('red-floral-midi-dress') },
    { id: 'l6', image: U('1588117305388-c2631a279f82', 800), caption: 'Street edit', productId: byslug('street-sweatpants') },
    { id: 'l7', image: U('1571513722275-4b41940f54b8', 800), caption: 'Office ready', productId: byslug('ivory-power-blazer') },
    { id: 'l8', image: U('1512353087810-25dfcd100962', 800), caption: 'Bomber weather', productId: byslug('rust-bomber-jacket') },
  ],
  videos: [
    { id: 'v1', title: 'Inside the store', src: VIDEOS.shop, poster: U('1567401893414-76b7b1e5a7a5', 900) },
    { id: 'v2', title: 'Street Edit', src: VIDEOS.street, poster: U('1588117305388-c2631a279f82', 900) },
    { id: 'v3', title: 'City walk', src: VIDEOS.walk, poster: U('1512353087810-25dfcd100962', 900) },
  ],
  testimonials: [
    { name: 'Kevin M.', role: 'Groom, Nyamata', body: 'Briva fitted my whole wedding party. Six suits, all delivered on time, all perfect.' },
    { name: 'Divine I.', role: 'Marketing manager, Kigali Heights', body: 'My office wardrobe is basically Briva now. The blazers are unreal for the price.' },
    { name: 'Patrick N.', role: 'Student, Nyarugenge', body: 'The 9,500 tees are the best in Kigali. I order on WhatsApp and they arrive the same day.' },
  ],
};

// ---------------- ORDERS (generated over the last 60 days) ----------------
function buildOrders(prods, usersList, cfg) {
  const orders = [];
  const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'processing', 'confirmed', 'pending', 'cancelled'];
  const methods = ['momo', 'momo', 'momo', 'airtel', 'card', 'cod'];
  const zones = cfg.delivery.zones;
  const sectors = ['Kimironko', 'Remera', 'Kacyiru', 'Kimihurura', 'Nyarutarama', 'Gikondo', 'Kicukiro Centre', 'Nyamirambo', 'Gisozi', 'Kanombe', 'Kibagabaga', 'Kiyovu'];
  const customers = usersList.filter((u) => u.role === 'customer');
  let n = 0;
  for (let day = 60; day >= 0; day -= 1) {
    const perDay = 1 + ((day * 7) % 3) + (day % 5 === 0 ? 2 : 0);
    for (let k = 0; k < perDay; k += 1) {
      n += 1;
      const cust = customers[(n * 5) % customers.length];
      const itemCount = 1 + ((n * 3) % 3);
      const items = [];
      for (let i = 0; i < itemCount; i += 1) {
        const p = prods[(n * 11 + i * 17) % prods.length];
        const color = p.colors[(n + i) % p.colors.length].name;
        const size = p.sizes[(n * 2 + i) % p.sizes.length];
        const qty = i === 0 && n % 7 === 0 ? 2 : 1;
        items.push({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], color, size, price: p.price, qty });
      }
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const zone = zones[(n * 3) % zones.length];
      let deliveryFee = zone.fee;
      let discount = 0;
      let promoCode = null;
      if (n % 6 === 0) { promoCode = 'WELCOME10'; discount = Math.round(subtotal * 0.1); }
      if (subtotal >= cfg.delivery.freeThreshold && zone.id !== 'pickup') deliveryFee = 0;
      const total = subtotal - discount + deliveryFee;
      const createdAt = new Date(Date.now() - day * 86400000 - (k * 3 + 9) * 3600000);
      const status = day === 0 ? ['pending', 'confirmed', 'processing'][k % 3] : day < 3 ? ['processing', 'shipped', 'delivered'][k % 3] : statuses[(n * 13) % statuses.length];
      const payMethod = methods[n % methods.length];
      const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
      const idx = status === 'cancelled' ? 1 : steps.indexOf(status);
      const timeline = steps.slice(0, idx + 1).map((s, i) => ({ status: s, at: new Date(createdAt.getTime() + i * 5 * 3600000).toISOString(), note: '' }));
      if (status === 'cancelled') timeline.push({ status: 'cancelled', at: new Date(createdAt.getTime() + 6 * 3600000).toISOString(), note: 'Customer requested cancellation' });
      cfg.orderSeq += 1;
      orders.push({
        id: `o${String(n).padStart(4, '0')}`,
        number: `BRV-${10000 + cfg.orderSeq}`,
        userId: cust.id,
        customer: { name: cust.name, email: cust.email, phone: cust.phone },
        items,
        subtotal, discount, deliveryFee, total, promoCode,
        delivery: {
          method: zone.id, methodName: zone.name,
          address: zone.id === 'pickup' ? null : { line1: `KG ${100 + n} St, House ${(n % 40) + 1}`, sector: sectors[n % sectors.length], district: cfg.delivery.districts[n % 3], city: 'Kigali' },
          instructions: n % 4 === 0 ? 'Call when you arrive at the gate.' : '',
        },
        payment: { method: payMethod, status: status === 'cancelled' ? 'refunded' : payMethod === 'cod' ? (status === 'delivered' ? 'paid' : 'pending') : 'paid', reference: `${payMethod.toUpperCase()}-${(createdAt.getTime() % 100000000).toString(36).toUpperCase()}` },
        status,
        timeline,
        notes: [],
        createdAt: createdAt.toISOString(),
      });
    }
  }
  return orders;
}

function build() {
  const cfg = JSON.parse(JSON.stringify(settings));
  const prods = JSON.parse(JSON.stringify(products));
  const usersList = JSON.parse(JSON.stringify(users));
  const orders = buildOrders(prods, usersList, cfg);
  return {
    products: prods,
    categories: JSON.parse(JSON.stringify(categories)),
    collections: JSON.parse(JSON.stringify(collections)),
    reviews: JSON.parse(JSON.stringify(reviews)),
    orders,
    users: usersList,
    promos: JSON.parse(JSON.stringify(promos)),
    subscribers: [
      { id: 's1', email: 'aline@example.com', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 's2', email: 'kevin.mugisha@example.com', createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
      { id: 's3', email: 'grace.t@example.com', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    settings: cfg,
    content: JSON.parse(JSON.stringify(content)),
  };
}

module.exports = { build, VIDEOS };

# Briva Store Rwanda

Fashion e-commerce storefront + admin dashboard for **Briva Store** (Unif House, Kigali), inspired by Fashion Nova and Allbirds.

- **Frontend:** React 18 + Vite + Tailwind CSS (`client/`)
- **Backend:** Node.js + Express (`server/`, exposed on Vercel as a serverless function via `api/index.js`)
- **Hosting:** Vercel (one project serves both the site and the `/api/*` routes)

## Quick start (local)

```bash
npm install                # API deps
npm --prefix client install
npm run dev                # API on http://localhost:5000, site on http://localhost:5173
```

Demo accounts (pre-seeded):

| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@brivastore.rw   | Admin@123     |
| Customer | aline@example.com     | password123   |

Admin dashboard: `http://localhost:5173/admin`

## What's included

### Storefront
- Rotating promo bar, sticky header with mega menus (Women / Men / Collections), ⌘K search with live suggestions, wishlist and bag counters
- Homepage: hero video, category tiles, tabbed "Shop the latest", promo banners, best sellers, category strips, brand story with video, promo-code strip, new arrivals, video strip, shoppable lookbook (Instagram style), testimonials, value props, newsletter
- Shop pages for Women / Men / New In / Sale / collections / categories / search with filters (category, size, colour, price, collection, on sale, in stock), sort, active filter chips, 3/4-column toggle, pagination, mobile filter drawer
- Product cards with hover image, quick add (size picker), quick view modal, wishlist, badges (new / sale / low stock / sold out)
- Product page: gallery + video, colour swatches, size selector with stock, size guide, quantity, add to bag, WhatsApp order button, delivery/returns info, share, accordions, reviews with rating breakdown and review form, related products, recently viewed, back-in-stock notify
- Cart drawer + cart page with free-delivery progress bar and promo codes
- 3-step checkout (contact → delivery zone & address → payment) with MTN MoMo / Airtel Money (simulated prompt), card (demo) and cash on delivery; server-side price/stock validation
- Order confirmation with timeline and printable receipt, public order tracking, customer account (orders, cancel, addresses, profile, wishlist sync)
- Info pages: story, visit & contact (map + form), size guide, delivery, returns, FAQ, privacy, terms. Floating WhatsApp button.

### Admin (`/admin`)
- Dashboard: revenue/orders/AOV/customer KPIs with period comparison, revenue & orders charts, status and payment breakdowns, top products, revenue by category, low stock, recent orders, action alerts
- Orders: filters, search, date range, CSV export, detail with status workflow + timeline, payment status, internal notes, WhatsApp customer, print
- Products: searchable table, inline status/featured, bulk actions, full editor (images, video, colours, size presets, per-variant stock matrix, pricing with compare-at, collections, tags)
- Categories & collections, customers (profiles, order history, roles), review moderation with replies, discount codes, analytics, homepage content editor (hero, promo bar, banners, story, videos, lookbook, testimonials), settings (store info, delivery zones, payment methods), subscribers & contact messages, demo reset

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: **Other**). `vercel.json` already sets the build command, output dir, and rewrites.
2. Add environment variables in the Vercel project:
   - `JWT_SECRET` – any long random string
   - *(recommended)* `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` – free Upstash Redis database, so admin changes persist across serverless cold starts. Without them the API runs on in-memory demo data that resets when the function restarts.
3. Deploy. The site is served from `client/dist`; every `/api/*` request goes to the Express app in `api/index.js`.

## Going live checklist

- Replace demo photos/videos with real product shots (Admin → Products → Media accepts any image URL; Cloudinary or Google Drive public links work well)
- Update store info, hours and WhatsApp number in Admin → Settings
- Connect a real payment provider (MTN MoMo API / Flutterwave) in `server/routes/orders.js` where payments are currently simulated
- Change the admin password (Admin → Customers → Breston Briva → Edit) and set `JWT_SECRET`

## Project layout

```
api/index.js           Vercel serverless entry (wraps the Express app)
server/app.js          Express app + routes
server/routes/         products, catalog, auth, orders, reviews, misc, admin
server/lib/store.js    in-memory document store with optional Upstash Redis persistence
server/data/seed.js    demo data (58 products, 147 orders, reviews, customers, promos, content)
client/src/pages       storefront pages
client/src/admin       admin dashboard
client/src/components  layout, product and UI components
client/src/context     store config, auth, cart, wishlist, toasts
```

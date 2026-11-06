import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, MessageCircle, Instagram, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { Accordion, Field, Spinner } from '../components/ui';
import { imgUrl, money } from '../lib/format';

const SIZE_TABLES = {
  tops: { title: "Men's tops (cm)", head: ['Size', 'Chest', 'Waist', 'Length'], rows: [['XS', '86-91', '71-76', '68'], ['S', '91-96', '76-81', '70'], ['M', '96-101', '81-86', '72'], ['L', '101-106', '86-91', '74'], ['XL', '106-111', '91-96', '76'], ['XXL', '111-116', '96-101', '78']] },
  suits: { title: 'Suits & blazers (EU)', head: ['Size', 'Chest (cm)', 'Waist (cm)', 'UK/US'], rows: [['46', '92', '80', '36'], ['48', '96', '84', '38'], ['50', '100', '88', '40'], ['52', '104', '92', '42'], ['54', '108', '96', '44'], ['56', '112', '100', '46']] },
  bottoms: { title: "Men's trousers (waist, inches)", head: ['Size', 'Waist (cm)', 'Hip (cm)'], rows: [['28', '71', '86'], ['30', '76', '91'], ['32', '81', '96'], ['34', '86', '101'], ['36', '91', '106'], ['38', '96', '111']] },
  dresses: { title: "Women's (cm)", head: ['Size', 'Bust', 'Waist', 'Hips'], rows: [['XS', '80-84', '62-66', '86-90'], ['S', '84-88', '66-70', '90-94'], ['M', '88-92', '70-74', '94-98'], ['L', '92-97', '74-79', '98-103'], ['XL', '97-102', '79-84', '103-108']] },
  wbottoms: { title: "Women's jeans (waist, inches)", head: ['Size', 'Waist (cm)', 'Hip (cm)'], rows: [['24', '61', '86'], ['26', '66', '91'], ['28', '71', '96'], ['30', '76', '101'], ['32', '81', '106']] },
  shoes: { title: "Men's shoes (EU)", head: ['EU', 'UK', 'US', 'Foot (cm)'], rows: [['39', '5.5', '6.5', '24.5'], ['40', '6', '7', '25'], ['41', '7', '8', '26'], ['42', '8', '9', '26.5'], ['43', '9', '10', '27.5'], ['44', '9.5', '10.5', '28'], ['45', '10.5', '11.5', '29']] },
  wshoes: { title: "Women's shoes (EU)", head: ['EU', 'UK', 'US', 'Foot (cm)'], rows: [['36', '3', '5', '22.5'], ['37', '4', '6', '23.5'], ['38', '5', '7', '24'], ['39', '6', '8', '25'], ['40', '6.5', '9', '25.5'], ['41', '7', '10', '26']] },
};

export function SizeGuideTable({ type }) {
  const order = type && SIZE_TABLES[type] ? [type, ...Object.keys(SIZE_TABLES).filter((k) => k !== type)] : Object.keys(SIZE_TABLES);
  const [active, setActive] = useState(order[0]);
  const t = SIZE_TABLES[active];
  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {order.map((k) => <button key={k} onClick={() => setActive(k)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${active === k ? 'border-ink bg-ink text-white' : 'border-ink-200'}`}>{SIZE_TABLES[k].title.split(' (')[0]}</button>)}
      </div>
      <h4 className="font-bold">{t.title}</h4>
      <div className="mt-2 overflow-x-auto"><table className="table-base min-w-[400px]"><thead><tr>{t.head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{t.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? 'font-bold' : ''}>{c}</td>)}</tr>)}</tbody></table></div>
      <p className="mt-4 text-xs text-ink-500">Between sizes? Size up for a relaxed fit, down for slim. Or visit Unif House and we will measure you for free.</p>
    </div>
  );
}

export default function Info({ page }) {
  const { store, content, waLink, delivery } = useStore();
  const titles = { about: 'Our story', contact: 'Visit & contact', 'size-guide': 'Size guide', shipping: 'Delivery', returns: 'Returns & exchanges', faq: 'FAQ', privacy: 'Privacy policy', terms: 'Terms of service' };
  useTitle(titles[page]);

  if (page === 'about') {
    const s = content.story || {};
    return (
      <div>
        <div className="relative h-[60vh] min-h-[400px] bg-ink">
          <img src={imgUrl(s.image, 1600)} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="container-x absolute inset-0 flex flex-col justify-end pb-12 text-white"><p className="eyebrow text-brass-200">Our story</p><h1 className="h-display mt-2 text-6xl sm:text-8xl">{s.title || 'Made for Kigali'}</h1></div>
        </div>
        <div className="container-x grid gap-10 py-16 lg:grid-cols-12">
          <div className="lg:col-span-7"><p className="text-lg leading-relaxed text-ink-700">{s.body}</p>
            <p className="mt-6 leading-relaxed text-ink-600">We select every piece ourselves: European-quality fabrics, cuts that fit Rwandan bodies, and prices that make sense. Whether it is a three-piece suit for your wedding or a 9,500 RWF tee for Saturday, you get the same care. Come to {store.address} and try it on, or order on WhatsApp and we bring it to you.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">{s.points?.map((p, i) => <div key={i} className="border-l-2 border-brass pl-4"><h4 className="font-bold">{p.title}</h4><p className="mt-1 text-sm text-ink-600">{p.body}</p></div>)}</div>
            <Link to="/shop" className="btn-primary mt-10">Shop the collection</Link>
          </div>
          <aside className="lg:col-span-5"><div className="overflow-hidden rounded-2xl bg-ink">{s.video ? <video src={s.video} poster={imgUrl(s.image, 900)} autoPlay muted loop playsInline className="aspect-[4/5] w-full object-cover" /> : null}</div></aside>
        </div>
      </div>
    );
  }

  if (page === 'contact') return <Contact store={store} waLink={waLink} />;

  if (page === 'size-guide') {
    return (
      <div className="container-x py-10"><h1 className="h-display text-5xl">Size guide</h1><p className="mt-2 max-w-xl text-sm text-ink-600">Measure over light clothing with a soft tape. Chest: fullest part. Waist: narrowest part. Hips: fullest part.</p><div className="card mt-8 p-6"><SizeGuideTable /></div></div>
    );
  }

  const Wrapper = ({ title, children }) => (
    <div className="container-x py-10"><div className="mx-auto max-w-3xl"><h1 className="h-display text-5xl">{title}</h1><div className="prose-sm mt-6 space-y-4 text-ink-700">{children}</div></div></div>
  );

  if (page === 'shipping') {
    return (
      <Wrapper title="Delivery">
        <p>We deliver everywhere in Rwanda. In Kigali, orders placed before 2pm arrive the same day.</p>
        <div className="card overflow-hidden"><table className="table-base"><thead><tr><th>Option</th><th>Time</th><th>Fee</th></tr></thead><tbody>{delivery.zones.map((z) => <tr key={z.id}><td className="font-semibold">{z.name}</td><td>{z.eta}</td><td>{z.fee ? money(z.fee) : 'Free'}</td></tr>)}</tbody></table></div>
        <p>Delivery in Kigali is <b>free on orders over {money(delivery.freeThreshold)}</b>. Riders call you when they are near. For other provinces we use bus couriers (Volcano, Ritco, Virunga) and send you the parcel number on WhatsApp.</p>
      </Wrapper>
    );
  }
  if (page === 'returns') {
    return (
      <Wrapper title="Returns & exchanges">
        <p><b>Wrong size? No stress.</b> Exchange any item within 7 days of delivery as long as it is unworn, unwashed and the tags are still attached.</p>
        <ol className="list-decimal space-y-2 pl-5"><li>Message us on WhatsApp with your order number.</li><li>Bring the item to Unif House, or we collect it in Kigali for 2,000 RWF.</li><li>Pick a new size or colour. If the new item costs more, pay the difference by MoMo.</li></ol>
        <p>Refunds are offered for faulty items only, processed to your MoMo or Airtel wallet within 3 working days. Underwear, swimwear and sale items marked “final sale” cannot be exchanged.</p>
      </Wrapper>
    );
  }
  if (page === 'faq') {
    const faqs = [
      ['How do I order on WhatsApp?', `Send the product name, colour and size to ${store.phone}. We confirm stock, you pay by MoMo and we deliver.`],
      ['Can I pay cash on delivery?', 'Yes, anywhere in Kigali. For other provinces we ask for MoMo payment before dispatch.'],
      ['Do you do alterations?', 'Yes. Free hemming on all suits and trousers bought at Briva. Other alterations from 3,000 RWF.'],
      ['Where is Unif House?', `${store.address}, ${store.city}. ${store.hours}.`],
      ['Do you restock sold-out items?', 'Most pieces are restocked within 2-3 weeks. Use “Notify me” on the product page and we will email you.'],
      ['Can I track my order?', 'Yes. Use the Track order page with your order number and phone number, or check My account.'],
    ];
    return <Wrapper title="FAQ">{faqs.map(([q, a]) => <Accordion key={q} title={q}>{a}</Accordion>)}</Wrapper>;
  }
  if (page === 'privacy') {
    return <Wrapper title="Privacy policy"><p>We collect only what we need to deliver your order: your name, phone number, delivery address and, if you give it, your email. We never sell your data. Payment details are processed by MTN, Airtel or our card processor and are never stored on our servers. You can ask us to delete your account at any time by messaging {store.phone}.</p></Wrapper>;
  }
  return <Wrapper title="Terms of service"><p>By ordering from {store.name} you agree that prices are in Rwandan Francs and include VAT, that delivery times are estimates, and that exchanges follow our 7-day policy. Promo codes cannot be combined. We reserve the right to cancel orders where stock is unavailable, in which case you are refunded in full.</p></Wrapper>;
}

function Contact({ store, waLink }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const d = await api.post('/contact', form); toast.success(d.message); setForm({ name: '', email: '', phone: '', message: '' }); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="container-x py-10">
      <h1 className="h-display text-5xl">Visit & contact</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <div className="card p-6">
            <h2 className="font-display text-2xl">{store.name} · Unif House</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3"><MapPin size={18} className="shrink-0 text-brass" /><span>{store.address}<br />{store.city}</span></li>
              <li className="flex gap-3"><Clock size={18} className="shrink-0 text-brass" /><span>{store.hours}</span></li>
              <li className="flex gap-3"><Phone size={18} className="shrink-0 text-brass" /><a href={`tel:${store.phone}`} className="underline">{store.phone}</a></li>
              {store.email && <li className="flex gap-3"><Mail size={18} className="shrink-0 text-brass" /><a href={`mailto:${store.email}`} className="underline">{store.email}</a></li>}
              <li className="flex gap-3"><Instagram size={18} className="shrink-0 text-brass" /><a href={store.instagram} target="_blank" rel="noreferrer" className="underline">@briva_store_rwanda</a></li>
            </ul>
            <a href={waLink('Hello Briva Store!')} target="_blank" rel="noreferrer" className="btn mt-5 w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]"><MessageCircle size={16} /> Chat on WhatsApp</a>
          </div>
          <form onSubmit={submit} className="card space-y-3 p-6">
            <h3 className="font-display text-2xl">Send a message</h3>
            <Field label="Name"><input className="input" required value={form.name} onChange={set('name')} /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Email"><input className="input" type="email" value={form.email} onChange={set('email')} /></Field><Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field></div>
            <Field label="Message"><textarea className="input" rows={4} required value={form.message} onChange={set('message')} /></Field>
            <button disabled={busy} className="btn-primary w-full">{busy ? <Spinner /> : 'Send'}</button>
          </form>
        </div>
        <div className="overflow-hidden rounded-2xl bg-cream-200 lg:col-span-7">
          <iframe title="Map" className="h-full min-h-[420px] w-full" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(store.mapQuery || store.address)}&output=embed`} />
        </div>
      </div>
    </div>
  );
}

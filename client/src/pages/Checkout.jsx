import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, Smartphone, CreditCard, Banknote, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { money, imgUrl, clsx } from '../lib/format';
import { Field, Spinner, Modal } from '../components/ui';

const STEPS = ['Information', 'Delivery', 'Payment'];

export default function Checkout() {
  useTitle('Checkout');
  const cart = useCart();
  const { delivery, payments, store } = useStore();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    line1: '', sector: '', district: 'Gasabo', city: 'Kigali', instructions: '', saveAddress: true,
    deliveryMethod: 'kigali-standard', paymentMethod: 'momo', paymentPhone: '', promoCode: '',
  });
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (!user) return;
    const addr = (user.addresses || []).find((a) => a.default) || user.addresses?.[0];
    setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone || '', ...(addr ? { line1: addr.line1, sector: addr.sector, district: addr.district, city: addr.city } : {}) }));
  }, [user]);
  useEffect(() => { setForm((f) => ({ ...f, promoCode: cart.promoCode || '' })); }, [cart.promoCode]);

  // live quote
  useEffect(() => {
    if (!cart.items.length) return;
    api.post('/orders/quote', { items: cart.items, deliveryMethod: form.deliveryMethod, promoCode: form.promoCode }).then(setQuote).catch(() => {});
  }, [cart.items, form.deliveryMethod, form.promoCode]);

  useEffect(() => { if (!cart.items.length && !busy) navigate('/cart', { replace: true }); }, [cart.items.length, busy, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const zones = delivery.zones.filter((z) => z.active);
  const zone = zones.find((z) => z.id === form.deliveryMethod);
  const needsAddress = form.deliveryMethod !== 'pickup';
  const availablePayments = useMemo(() => payments.filter((p) => !(p.id === 'cod' && form.deliveryMethod === 'upcountry')), [payments, form.deliveryMethod]);

  const validate = () => {
    if (step === 0) {
      if (!form.name.trim()) return 'Please enter your full name.';
      if (!/^\+?\d[\d\s]{7,}$/.test(form.phone.trim())) return 'Please enter a valid phone number.';
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Please enter a valid email.';
    }
    if (step === 1 && needsAddress) {
      if (!form.line1.trim()) return 'Please enter your street / house address.';
      if (!form.district) return 'Please choose your district.';
    }
    return null;
  };
  const next = () => { const err = validate(); if (err) { toast.error(err); return; } setStep((s) => s + 1); window.scrollTo({ top: 0 }); };

  const applyPromo = async () => {
    if (!form.promoCode.trim()) { cart.setPromo(''); return; }
    try { const d = await api.post('/promo/validate', { code: form.promoCode.trim(), subtotal: cart.subtotal }); cart.setPromo(d.code); toast.success(`${d.code} applied`); } catch (e) { toast.error(e.message); }
  };

  const placeOrder = async () => {
    const err = validate(); if (err) { toast.error(err); return; }
    const pm = availablePayments.find((p) => p.id === form.paymentMethod);
    if (!pm) { toast.error('Please choose a payment method.'); return; }
    setBusy(true);
    // simulated mobile-money prompt
    if (['momo', 'airtel'].includes(pm.id)) {
      setPaying({ method: pm, phone: form.paymentPhone || form.phone, stage: 'prompt' });
      await new Promise((r) => setTimeout(r, 2200));
      setPaying((p) => ({ ...p, stage: 'confirmed' }));
      await new Promise((r) => setTimeout(r, 900));
    }
    if (pm.id === 'card') {
      setPaying({ method: pm, stage: 'card' });
      await new Promise((r) => setTimeout(r, 1800));
      setPaying((p) => ({ ...p, stage: 'confirmed' }));
      await new Promise((r) => setTimeout(r, 700));
    }
    try {
      const d = await api.post('/orders', {
        items: cart.items,
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        paymentPhone: form.paymentPhone || form.phone,
        promoCode: form.promoCode,
        customer: { name: form.name, email: form.email, phone: form.phone },
        address: needsAddress ? { line1: form.line1, sector: form.sector, district: form.district, city: form.city } : null,
        instructions: form.instructions,
        saveAddress: form.saveAddress,
      });
      cart.clear();
      setPaying(null);
      navigate(`/order/${d.order.id}?new=1`, { replace: true });
    } catch (e) {
      setPaying(null);
      toast.error(e.message);
      if (e.data?.errors) setStep(0);
    } finally { setBusy(false); }
  };

  const icons = { momo: Smartphone, airtel: Smartphone, card: CreditCard, cod: Banknote };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-x grid gap-10 py-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="h-display text-4xl">Checkout</h1>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-500"><Lock size={14} /> Secure checkout</span>
          </div>
          <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <button onClick={() => i < step && setStep(i)} className={clsx('flex items-center gap-1.5', i === step ? 'text-ink' : i < step ? 'text-green-700' : 'text-ink-400')}>
                  <span className={clsx('grid h-5 w-5 place-items-center rounded-full text-[10px]', i === step ? 'bg-ink text-white' : i < step ? 'bg-green-600 text-white' : 'bg-ink-100')}>{i < step ? <Check size={12} /> : i + 1}</span>{s}
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-6 bg-ink-200" />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="mt-8 animate-fadeUp">
              <h2 className="font-display text-3xl">Contact information</h2>
              {!user && <p className="mt-1 text-sm text-ink-500">Have an account? <Link to="/account/login?next=/checkout" className="font-semibold underline">Sign in</Link> for faster checkout.</p>}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2"><input className="input" value={form.name} onChange={set('name')} placeholder="Aline Uwase" autoComplete="name" /></Field>
                <Field label="Phone (for delivery & MoMo)"><input className="input" value={form.phone} onChange={set('phone')} placeholder="078 000 0000" autoComplete="tel" inputMode="tel" /></Field>
                <Field label="Email (optional)" hint="For your receipt"><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" /></Field>
              </div>
              <div className="mt-6 flex justify-between"><Link to="/cart" className="btn-ghost"><ChevronLeft size={16} /> Back to bag</Link><button onClick={next} className="btn-primary">Continue to delivery</button></div>
            </section>
          )}

          {step === 1 && (
            <section className="mt-8 animate-fadeUp">
              <h2 className="font-display text-3xl">Delivery method</h2>
              <div className="mt-5 grid gap-3">
                {zones.map((z) => {
                  const free = z.id !== 'pickup' && z.id !== 'upcountry' && cart.subtotal >= delivery.freeThreshold;
                  return (
                    <label key={z.id} className={clsx('flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition', form.deliveryMethod === z.id ? 'border-ink bg-ink-50' : 'border-ink-200 hover:border-ink')}>
                      <input type="radio" name="zone" checked={form.deliveryMethod === z.id} onChange={() => setForm({ ...form, deliveryMethod: z.id })} className="accent-ink" />
                      <div className="flex-1"><p className="text-sm font-bold">{z.name}</p><p className="text-xs text-ink-500">{z.eta}</p></div>
                      <p className="text-sm font-bold">{free || z.fee === 0 ? <span className="text-green-700">Free</span> : money(z.fee)}</p>
                    </label>
                  );
                })}
              </div>
              {needsAddress ? (
                <>
                  <h3 className="mt-8 font-display text-2xl">Delivery address</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Street / house / landmark" className="sm:col-span-2"><input className="input" value={form.line1} onChange={set('line1')} placeholder="KG 11 Ave, House 24, near Simba Supermarket" /></Field>
                    <Field label="Sector / neighbourhood"><input className="input" value={form.sector} onChange={set('sector')} placeholder="Kimironko" /></Field>
                    <Field label="District">
                      {form.deliveryMethod === 'upcountry' ? (
                        <input className="input" value={form.district} onChange={set('district')} placeholder="e.g. Musanze" />
                      ) : (
                        <select className="input" value={form.district} onChange={set('district')}>{delivery.districts.map((d) => <option key={d}>{d}</option>)}</select>
                      )}
                    </Field>
                    <Field label="City / town"><input className="input" value={form.city} onChange={set('city')} /></Field>
                    <Field label="Delivery instructions (optional)"><input className="input" value={form.instructions} onChange={set('instructions')} placeholder="Call when you reach the gate" /></Field>
                    {user && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.saveAddress} onChange={set('saveAddress')} className="accent-ink" /> Save this address to my account</label>}
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-cream-100 p-4 text-sm"><b>Pick up at {store.address}.</b> {store.hours}. We will WhatsApp you when it is ready.</div>
              )}
              <div className="mt-6 flex justify-between"><button onClick={() => setStep(0)} className="btn-ghost"><ChevronLeft size={16} /> Back</button><button onClick={next} className="btn-primary">Continue to payment</button></div>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8 animate-fadeUp">
              <h2 className="font-display text-3xl">Payment</h2>
              <div className="mt-5 grid gap-3">
                {availablePayments.map((p) => {
                  const Icon = icons[p.id] || CreditCard;
                  const active = form.paymentMethod === p.id;
                  return (
                    <label key={p.id} className={clsx('block cursor-pointer rounded-xl border p-4 transition', active ? 'border-ink bg-ink-50' : 'border-ink-200 hover:border-ink')}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="pay" checked={active} onChange={() => setForm({ ...form, paymentMethod: p.id })} className="accent-ink" />
                        <span className={clsx('grid h-9 w-9 place-items-center rounded-lg text-white', p.id === 'momo' ? 'bg-[#ffcc00] text-ink' : p.id === 'airtel' ? 'bg-[#e40000]' : p.id === 'card' ? 'bg-ink' : 'bg-green-700')}><Icon size={18} /></span>
                        <div className="flex-1"><p className="text-sm font-bold">{p.name}</p><p className="text-xs text-ink-500">{p.description}</p></div>
                      </div>
                      {active && ['momo', 'airtel'].includes(p.id) && (
                        <div className="mt-4 pl-[3.25rem]"><Field label={`${p.id === 'momo' ? 'MTN' : 'Airtel'} number to charge`} hint="You will receive a prompt to enter your PIN"><input className="input max-w-xs" value={form.paymentPhone || form.phone} onChange={set('paymentPhone')} inputMode="tel" /></Field></div>
                      )}
                      {active && p.id === 'card' && (
                        <div className="mt-4 grid gap-3 pl-[3.25rem] sm:grid-cols-[2fr_1fr_1fr]">
                          <Field label="Card number"><input className="input" placeholder="4242 4242 4242 4242" inputMode="numeric" /></Field>
                          <Field label="Expiry"><input className="input" placeholder="MM/YY" /></Field>
                          <Field label="CVC"><input className="input" placeholder="123" inputMode="numeric" /></Field>
                          <p className="text-xs text-ink-400 sm:col-span-3">Demo mode: no real charge is made.</p>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-ink-500">By placing your order you agree to our <Link to="/terms" className="underline">terms</Link> and <Link to="/returns" className="underline">exchange policy</Link>.</p>
              <div className="mt-6 flex justify-between"><button onClick={() => setStep(1)} className="btn-ghost"><ChevronLeft size={16} /> Back</button><button onClick={placeOrder} disabled={busy} className="btn-primary min-w-[200px] text-base">{busy ? <Spinner /> : `Pay ${money(quote?.total ?? cart.subtotal)}`}</button></div>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-6 rounded-2xl bg-cream-100 p-6">
            <h3 className="font-display text-2xl">Order summary</h3>
            <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {cart.items.map((it) => (
                <li key={cart.keyOf(it)} className="flex items-center gap-3">
                  <div className="relative"><img src={imgUrl(it.image, 120)} alt="" className="h-16 w-13 w-[52px] rounded-lg object-cover" /><span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{it.qty}</span></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{it.name}</p><p className="text-xs text-ink-500">{it.color} · {it.size}</p></div>
                  <p className="text-sm font-semibold">{money(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <input value={form.promoCode} onChange={set('promoCode')} placeholder="Promo code" className="input uppercase" />
              <button type="button" onClick={applyPromo} className="btn-secondary btn-sm">Apply</button>
            </div>
            {quote?.promoError && form.promoCode && <p className="mt-1 text-xs text-red-600">{quote.promoError}</p>}
            <dl className="mt-4 space-y-2 border-t border-ink-200 pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(quote?.subtotal ?? cart.subtotal)}</dd></div>
              {quote?.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount {quote.promo?.code}</dt><dd>-{money(quote.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Delivery {zone ? <span className="text-ink-400">({zone.name.split(' (')[0]})</span> : ''}</dt><dd>{quote ? (quote.deliveryFee === 0 ? 'Free' : money(quote.deliveryFee)) : '—'}</dd></div>
              <div className="flex justify-between border-t border-ink-200 pt-3 text-lg font-bold"><dt>Total</dt><dd>{money(quote?.total ?? cart.subtotal)}</dd></div>
            </dl>
            {quote?.errors?.length > 0 && <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{quote.errors.map((e, i) => <p key={i}>{e}</p>)}</div>}
          </div>
        </aside>
      </div>

      <Modal open={Boolean(paying)} onClose={() => {}} size="sm">
        {paying && (
          <div className="p-8 text-center">
            {paying.stage === 'confirmed' ? (
              <>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-700 animate-pop"><Check size={32} /></div>
                <h3 className="mt-4 font-display text-3xl">Payment confirmed</h3>
                <p className="mt-1 text-sm text-ink-500">Creating your order…</p>
              </>
            ) : paying.stage === 'card' ? (
              <>
                <Spinner className="mx-auto h-10 w-10 text-ink" />
                <h3 className="mt-4 font-display text-3xl">Processing card</h3>
                <p className="mt-1 text-sm text-ink-500">Contacting your bank…</p>
              </>
            ) : (
              <>
                <div className={clsx('mx-auto grid h-16 w-16 place-items-center rounded-full', paying.method.id === 'momo' ? 'bg-[#ffcc00]' : 'bg-[#e40000] text-white')}><Smartphone size={30} /></div>
                <h3 className="mt-4 font-display text-3xl">Check your phone</h3>
                <p className="mt-1 text-sm text-ink-600">A {paying.method.name} prompt was sent to <b>{paying.phone}</b>. Enter your PIN to approve <b>{money(quote?.total ?? cart.subtotal)}</b>.</p>
                <p className="mt-4 text-xs text-ink-400">Demo: payment is simulated automatically.</p>
                <Spinner className="mx-auto mt-4 h-6 w-6 text-ink" />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Field, Spinner, Skeleton } from '../components/ui';
import { imgUrl } from '../lib/format';
import { PageHeader } from './components';

export default function Content() {
  const [c, setC] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('hero');
  const toast = useToast();
  const { refresh } = useStore();
  useEffect(() => { api.get('/admin/content').then(setC).catch((e) => toast.error(e.message)); }, [toast]);
  if (!c) return <Skeleton className="h-96" />;
  const save = async () => { setBusy(true); try { await api.put('/admin/content', c); toast.success('Homepage updated'); refresh(); } catch (e) { toast.error(e.message); } finally { setBusy(false); } };
  const setPath = (path, value) => setC((prev) => { const next = structuredClone(prev); let o = next; for (let i = 0; i < path.length - 1; i += 1) o = o[path[i]]; o[path[path.length - 1]] = value; return next; });
  const list = (key) => ({
    items: c[key] || [],
    update: (i, patch) => setPath([key], c[key].map((x, j) => (j === i ? { ...x, ...patch } : x))),
    remove: (i) => setPath([key], c[key].filter((_, j) => j !== i)),
    add: (item) => setPath([key], [...(c[key] || []), { id: `${key[0]}${Date.now().toString(36)}`, ...item }]),
    move: (i, d) => { const arr = [...c[key]]; const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; setPath([key], arr); },
  });
  const tabs = [['hero', 'Hero'], ['promoBar', 'Promo bar'], ['banners', 'Banners'], ['promoCode', 'Promo strip'], ['story', 'Story'], ['videos', 'Videos'], ['lookbook', 'Lookbook'], ['testimonials', 'Testimonials']];

  return (
    <div>
      <PageHeader title="Homepage & content" subtitle="Edit what customers see on the homepage. Changes go live when you save."><button onClick={save} disabled={busy} className="btn-primary btn-sm min-w-[100px]">{busy ? <Spinner className="h-4 w-4" /> : 'Save changes'}</button></PageHeader>
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">{tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${tab === k ? 'border-ink bg-ink text-white' : 'border-ink-200 bg-white'}`}>{l}</button>)}</div>

      {tab === 'hero' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="admin-card space-y-3">
            <Field label="Type"><select className="admin-input" value={c.hero.type} onChange={(e) => setPath(['hero', 'type'], e.target.value)}><option value="video">Video (with poster)</option><option value="image">Image</option></select></Field>
            <Field label="Video URL (.mp4)"><input className="admin-input" value={c.hero.video || ''} onChange={(e) => setPath(['hero', 'video'], e.target.value)} /></Field>
            <Field label="Poster / image URL"><input className="admin-input" value={c.hero.poster || ''} onChange={(e) => setPath(['hero', 'poster'], e.target.value)} /></Field>
            <Field label="Eyebrow"><input className="admin-input" value={c.hero.eyebrow} onChange={(e) => setPath(['hero', 'eyebrow'], e.target.value)} /></Field>
            <Field label="Headline"><input className="admin-input" value={c.hero.title} onChange={(e) => setPath(['hero', 'title'], e.target.value)} /></Field>
            <Field label="Subtitle"><textarea className="admin-input" rows={2} value={c.hero.subtitle} onChange={(e) => setPath(['hero', 'subtitle'], e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Button 1 label"><input className="admin-input" value={c.hero.primaryCta?.label || ''} onChange={(e) => setPath(['hero', 'primaryCta', 'label'], e.target.value)} /></Field>
              <Field label="Button 1 link"><input className="admin-input" value={c.hero.primaryCta?.to || ''} onChange={(e) => setPath(['hero', 'primaryCta', 'to'], e.target.value)} /></Field>
              <Field label="Button 2 label"><input className="admin-input" value={c.hero.secondaryCta?.label || ''} onChange={(e) => setPath(['hero', 'secondaryCta', 'label'], e.target.value)} /></Field>
              <Field label="Button 2 link"><input className="admin-input" value={c.hero.secondaryCta?.to || ''} onChange={(e) => setPath(['hero', 'secondaryCta', 'to'], e.target.value)} /></Field>
            </div>
          </div>
          <div className="admin-card overflow-hidden p-0"><div className="relative aspect-video bg-ink">{c.hero.type === 'video' && c.hero.video ? <video src={c.hero.video} poster={c.hero.poster} muted autoPlay loop playsInline className="h-full w-full object-cover opacity-80" /> : <img src={c.hero.poster} alt="" className="h-full w-full object-cover opacity-80" />}<div className="absolute inset-0 flex flex-col justify-end p-6 text-white"><p className="eyebrow text-brass-200">{c.hero.eyebrow}</p><p className="h-display text-4xl">{c.hero.title}</p><p className="text-sm text-ink-200">{c.hero.subtitle}</p></div></div><p className="p-3 text-xs text-ink-500">Preview</p></div>
        </div>
      )}

      {tab === 'promoBar' && (
        <div className="admin-card max-w-2xl space-y-2">
          <p className="text-sm text-ink-600">Messages rotate every 4 seconds in the black bar at the top of the store.</p>
          {c.promoBar.map((m, i) => <div key={i} className="flex gap-2"><input className="admin-input" value={m} onChange={(e) => setPath(['promoBar'], c.promoBar.map((x, j) => (j === i ? e.target.value : x)))} /><button onClick={() => setPath(['promoBar'], c.promoBar.filter((_, j) => j !== i))} className="rounded p-2 text-ink-400 hover:text-red-600"><X size={16} /></button></div>)}
          <button onClick={() => setPath(['promoBar'], [...c.promoBar, ''])} className="btn-ghost btn-sm"><Plus size={14} /> Add message</button>
        </div>
      )}

      {tab === 'banners' && <CardList l={list('banners')} fields={[['title', 'Title'], ['subtitle', 'Subtitle'], ['badge', 'Badge (optional)'], ['to', 'Link (e.g. /collections/sale)'], ['image', 'Image URL'], ['theme', 'Theme (dark/light)']]} blank={{ title: '', subtitle: '', to: '/shop', image: '', theme: 'dark' }} />}
      {tab === 'videos' && <CardList l={list('videos')} fields={[['title', 'Title'], ['src', 'Video URL (.mp4)'], ['poster', 'Poster image URL']]} blank={{ title: '', src: '', poster: '' }} previewKey="poster" />}
      {tab === 'lookbook' && <CardList l={list('lookbook')} fields={[['caption', 'Caption'], ['image', 'Image URL'], ['productId', 'Linked product ID (e.g. p001)']]} blank={{ caption: '', image: '', productId: '' }} />}
      {tab === 'testimonials' && <CardList l={list('testimonials')} fields={[['name', 'Name'], ['role', 'Role / location'], ['body', 'Quote']]} blank={{ name: '', role: '', body: '' }} noImage />}

      {tab === 'promoCode' && (
        <div className="admin-card max-w-xl space-y-3">
          <Field label="Code"><input className="admin-input font-mono uppercase" value={c.promoCode?.code || ''} onChange={(e) => setPath(['promoCode', 'code'], e.target.value.toUpperCase())} /></Field>
          <Field label="Title"><input className="admin-input" value={c.promoCode?.title || ''} onChange={(e) => setPath(['promoCode', 'title'], e.target.value)} /></Field>
          <Field label="Subtitle"><input className="admin-input" value={c.promoCode?.subtitle || ''} onChange={(e) => setPath(['promoCode', 'subtitle'], e.target.value)} /></Field>
          <p className="text-xs text-ink-500">Make sure the code also exists under Discounts, otherwise checkout will reject it.</p>
        </div>
      )}

      {tab === 'story' && (
        <div className="admin-card max-w-2xl space-y-3">
          <Field label="Title"><input className="admin-input" value={c.story.title} onChange={(e) => setPath(['story', 'title'], e.target.value)} /></Field>
          <Field label="Body"><textarea className="admin-input" rows={4} value={c.story.body} onChange={(e) => setPath(['story', 'body'], e.target.value)} /></Field>
          <Field label="Image URL"><input className="admin-input" value={c.story.image} onChange={(e) => setPath(['story', 'image'], e.target.value)} /></Field>
          <Field label="Video URL (optional)"><input className="admin-input" value={c.story.video || ''} onChange={(e) => setPath(['story', 'video'], e.target.value)} /></Field>
          <span className="label">Points</span>
          {c.story.points.map((p, i) => <div key={i} className="grid gap-2 rounded-lg border border-ink-100 p-3 sm:grid-cols-[1fr_2fr_auto]"><input className="admin-input" value={p.title} onChange={(e) => setPath(['story', 'points', i, 'title'], e.target.value)} placeholder="Title" /><input className="admin-input" value={p.body} onChange={(e) => setPath(['story', 'points', i, 'body'], e.target.value)} placeholder="Text" /><button onClick={() => setPath(['story', 'points'], c.story.points.filter((_, j) => j !== i))} className="rounded p-2 text-ink-400 hover:text-red-600"><X size={16} /></button></div>)}
          <button onClick={() => setPath(['story', 'points'], [...c.story.points, { title: '', body: '' }])} className="btn-ghost btn-sm"><Plus size={14} /> Add point</button>
        </div>
      )}
    </div>
  );
}

function CardList({ l, fields, blank, previewKey = 'image', noImage }) {
  return (
    <div className="space-y-3">
      {l.items.map((it, i) => (
        <div key={it.id || i} className="admin-card flex gap-4">
          {!noImage && <div className="h-28 w-20 shrink-0 overflow-hidden rounded bg-ink-100">{it[previewKey] && <img src={imgUrl(it[previewKey], 200)} alt="" className="h-full w-full object-cover" />}</div>}
          <div className="grid flex-1 gap-2 sm:grid-cols-2">{fields.map(([k, label]) => <Field key={k} label={label} className={k === 'body' || k === 'image' || k === 'src' ? 'sm:col-span-2' : ''}>{k === 'body' ? <textarea className="admin-input" rows={2} value={it[k] || ''} onChange={(e) => l.update(i, { [k]: e.target.value })} /> : <input className="admin-input" value={it[k] || ''} onChange={(e) => l.update(i, { [k]: e.target.value })} />}</Field>)}</div>
          <div className="flex flex-col gap-1"><button onClick={() => l.move(i, -1)} className="rounded p-1.5 hover:bg-ink-100"><ArrowUp size={14} /></button><button onClick={() => l.move(i, 1)} className="rounded p-1.5 hover:bg-ink-100"><ArrowDown size={14} /></button><button onClick={() => l.remove(i)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><X size={14} /></button></div>
        </div>
      ))}
      <button onClick={() => l.add(blank)} className="btn-secondary btn-sm"><Plus size={14} /> Add item</button>
    </div>
  );
}

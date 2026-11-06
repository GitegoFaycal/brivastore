import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronDown, Star, ChevronLeft } from 'lucide-react';
import { clsx, STATUS_STYLES, STATUS_LABELS } from '../lib/format';
import { useLockBody } from '../lib/hooks';

export function Modal({ open, onClose, children, title, size = 'md', className }) {
  useLockBody(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-lift animate-pop sm:rounded-2xl', sizes[size], className)}>
        {title !== undefined && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
            <h3 className="text-base font-bold">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100" aria-label="Close"><X size={18} /></button>
          </div>
        )}
        {title === undefined && (
          <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 shadow hover:bg-white" aria-label="Close"><X size={18} /></button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, children, side = 'right', title, width = 'max-w-md' }) {
  useLockBody(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={clsx('absolute top-0 flex h-full w-full flex-col bg-white shadow-lift', width, side === 'right' ? 'right-0 animate-slideIn' : 'left-0 animate-slideInLeft')}>
        {title && (
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h3 className="font-display text-2xl tracking-wide">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink-100" aria-label="Close"><X size={20} /></button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Badge({ children, tone = 'dark', className }) {
  const tones = {
    dark: 'bg-ink text-white',
    light: 'bg-white text-ink border border-ink-200',
    brass: 'bg-brass text-white',
    sale: 'bg-brick text-white',
    green: 'bg-green-600 text-white',
    ghost: 'bg-ink-100 text-ink-700',
  };
  return <span className={clsx('inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', tones[tone], className)}>{children}</span>;
}

export function StatusBadge({ status }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize', STATUS_STYLES[status] || 'bg-ink-100 text-ink-700 border-ink-200')}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || String(status || '').replace('_', ' ')}
    </span>
  );
}

export function Stars({ value = 0, size = 14, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-brass text-brass' : 'fill-ink-200 text-ink-200'} />
      ))}
    </span>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-ink-500" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-ink">Home</Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} />
          {it.to ? <Link to={it.to} className="hover:text-ink">{it.label}</Link> : <span className="text-ink">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function SectionHeader({ eyebrow, title, action, actionTo, center, light }) {
  return (
    <div className={clsx('mb-6 flex items-end justify-between gap-4', center && 'flex-col items-center text-center')}>
      <div>
        {eyebrow && <p className={clsx('eyebrow mb-2', light && 'text-brass-200')}>{eyebrow}</p>}
        <h2 className={clsx('h-display text-4xl sm:text-5xl', light && 'text-white')}>{title}</h2>
      </div>
      {action && actionTo && (
        <Link to={actionTo} className={clsx('group inline-flex shrink-0 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline', light && 'text-white')}>
          {action} <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />;
}

export function EmptyState({ icon: Icon, title, body, action, actionTo, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <div className="mb-4 rounded-full bg-ink-100 p-4 text-ink-500"><Icon size={28} /></div>}
      <h3 className="font-display text-3xl">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-ink-500">{body}</p>}
      {action && actionTo && <Link to={actionTo} className="btn-primary mt-6">{action}</Link>}
      {action && onAction && <button onClick={onAction} className="btn-primary mt-6">{action}</button>}
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i += 1) nums.push(i);
  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-ghost btn-sm" aria-label="Previous"><ChevronLeft size={16} /></button>
      {nums[0] > 1 && <><button onClick={() => onChange(1)} className="btn-ghost btn-sm">1</button><span className="px-1 text-ink-400">…</span></>}
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} className={clsx('btn-sm', n === page ? 'btn-primary' : 'btn-ghost')}>{n}</button>
      ))}
      {nums[nums.length - 1] < pages && <><span className="px-1 text-ink-400">…</span><button onClick={() => onChange(pages)} className="btn-ghost btn-sm">{pages}</button></>}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-ghost btn-sm" aria-label="Next"><ChevronRight size={16} /></button>
    </div>
  );
}

export function Accordion({ title, children, defaultOpen = false }) {
  const ref = useRef(null);
  return (
    <details ref={ref} open={defaultOpen} className="group border-b border-ink-200 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        {title}
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </summary>
      <div className="pt-3 text-sm leading-relaxed text-ink-600">{children}</div>
    </details>
  );
}

export function QtyInput({ value, onChange, min = 1, max = 10, small }) {
  return (
    <div className={clsx('inline-flex items-center rounded-full border border-ink-200', small ? 'h-8' : 'h-11')}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className={clsx('px-3 text-ink-600 hover:text-ink', small && 'px-2')} aria-label="Decrease">−</button>
      <span className={clsx('min-w-[1.5rem] text-center font-semibold', small ? 'text-xs' : 'text-sm')}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className={clsx('px-3 text-ink-600 hover:text-ink', small && 'px-2')} aria-label="Increase">+</button>
    </div>
  );
}

export function Field({ label, children, hint, error, className }) {
  return (
    <label className={clsx('block', className)}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <span className={clsx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)} />;
}

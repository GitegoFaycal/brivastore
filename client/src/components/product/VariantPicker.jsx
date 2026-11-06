import { clsx } from '../../lib/format';

export function ColorSwatches({ product, value, onChange, large }) {
  if (!product.colors?.length || (product.colors.length === 1 && product.colors[0].name === 'Default')) return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-ink-600">Colour: <span className="text-ink">{value}</span></span>
      </div>
      <div className="flex flex-wrap gap-2">
        {product.colors.map((c) => {
          const available = product.variants.some((v) => v.color === c.name && v.stock > 0);
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onChange(c.name)}
              className={clsx('relative rounded-full border-2 p-0.5 transition', value === c.name ? 'border-ink' : 'border-transparent hover:border-ink-300')}
            >
              <span className={clsx('block rounded-full border border-ink-200', large ? 'h-8 w-8' : 'h-6 w-6')} style={{ background: c.hex }} />
              {!available && <span className="absolute inset-0 m-auto h-[2px] w-full rotate-45 bg-ink-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SizeSelector({ product, color, value, onChange, onSizeGuide }) {
  if (product.sizes.length === 1 && product.sizes[0] === 'One Size') return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-ink-600">Size: <span className="text-ink">{value || 'Select'}</span></span>
        {onSizeGuide && <button type="button" onClick={onSizeGuide} className="font-semibold underline underline-offset-2">Size guide</button>}
      </div>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((s) => {
          const variant = product.variants.find((v) => v.size === s && v.color === color);
          const stock = variant ? variant.stock : 0;
          return (
            <button
              key={s}
              type="button"
              disabled={stock <= 0}
              onClick={() => onChange(s)}
              className={clsx(
                'relative min-w-[3rem] rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
                value === s ? 'border-ink bg-ink text-white' : 'border-ink-200 bg-white hover:border-ink',
                stock <= 0 && 'cursor-not-allowed border-ink-100 text-ink-300 line-through hover:border-ink-100',
              )}
            >
              {s}
              {stock > 0 && stock <= 3 && <span className="absolute -right-1 -top-1 rounded-full bg-brick px-1 text-[9px] font-bold text-white">{stock}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

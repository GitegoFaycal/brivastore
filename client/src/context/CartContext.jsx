import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';
import { api } from '../lib/api';

const CartContext = createContext(null);
const KEY = 'briva_cart_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { items: [], promoCode: '' }; } catch { return { items: [], promoCode: '' }; }
}

const keyOf = (i) => `${i.productId}|${i.color}|${i.size}`;

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const item = action.item;
      const k = keyOf(item);
      const existing = state.items.find((i) => keyOf(i) === k);
      const items = existing
        ? state.items.map((i) => (keyOf(i) === k ? { ...i, qty: Math.min(10, i.qty + (item.qty || 1)) } : i))
        : [...state.items, { ...item, qty: item.qty || 1 }];
      return { ...state, items };
    }
    case 'qty': {
      const items = state.items.map((i) => (keyOf(i) === action.key ? { ...i, qty: Math.max(1, Math.min(10, action.qty)) } : i));
      return { ...state, items };
    }
    case 'remove':
      return { ...state, items: state.items.filter((i) => keyOf(i) !== action.key) };
    case 'clear':
      return { items: [], promoCode: '' };
    case 'promo':
      return { ...state, promoCode: action.code || '' };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState(null);
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  // server-side quote keeps prices/stock honest
  useEffect(() => {
    if (!state.items.length) { setQuote(null); return undefined; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api.post('/orders/quote', { items: state.items, promoCode: state.promoCode }, { signal: ctrl.signal }).then(setQuote).catch(() => {});
    }, 150);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [state.items, state.promoCode]);

  const add = useCallback((product, { color, size, qty = 1 }) => {
    const item = { productId: product.id, slug: product.slug, name: product.name, image: product.images[0], price: product.price, compareAtPrice: product.compareAtPrice, color, size, qty };
    dispatch({ type: 'add', item });
    setLastAdded(item);
    setOpen(true);
  }, []);

  const count = useMemo(() => state.items.reduce((n, i) => n + i.qty, 0), [state.items]);
  const subtotal = useMemo(() => state.items.reduce((s, i) => s + i.price * i.qty, 0), [state.items]);

  const value = {
    items: state.items,
    promoCode: state.promoCode,
    count,
    subtotal,
    quote,
    open,
    lastAdded,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    add,
    setQty: (item, qty) => dispatch({ type: 'qty', key: keyOf(item), qty }),
    remove: (item) => dispatch({ type: 'remove', key: keyOf(item) }),
    clear: () => dispatch({ type: 'clear' }),
    setPromo: (code) => dispatch({ type: 'promo', code }),
    keyOf,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

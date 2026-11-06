import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from './api';

/** Fetch JSON from the API; refetches when `path` changes. */
export function useFetch(path, { enabled = true, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled || !path) { setLoading(false); return undefined; }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    api.get(path, { signal: ctrl.signal })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { if (e.name !== 'AbortError') { setError(e); setLoading(false); } });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled, tick, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch, setData };
}

export function useDebounce(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function useTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Briva Store Rwanda` : 'Briva Store Rwanda | Clothes for Men & Women in Kigali';
    return () => { document.title = prev; };
  }, [title]);
}

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(e); };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => { document.removeEventListener('mousedown', listener); document.removeEventListener('touchstart', listener); };
  }, [ref, handler]);
}

export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export function useRecentlyViewed() {
  const KEY = 'briva_recent';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const [ids, setIds] = useState(read);
  const push = useCallback((id) => {
    setIds(() => {
      const next = [id, ...read().filter((x) => x !== id)].slice(0, 12);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { ids, push };
}

export function useInView(options = { rootMargin: '200px' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return undefined;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, options]);
  return [ref, inView];
}

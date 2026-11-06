import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const StoreContext = createContext(null);

const FALLBACK = {
  store: { name: 'Briva Store', phone: '+250 782 164 798', whatsapp: '250782164798', address: 'Unif House, Kigali City Centre', city: 'Kigali, Rwanda', hours: '', instagram: '#', tiktok: '#' },
  delivery: { freeThreshold: 80000, zones: [], districts: [] },
  payments: [],
  content: { promoBar: [], hero: null, banners: [], lookbook: [], videos: [], testimonials: [], story: null },
  categories: [],
  collections: [],
};

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  const refresh = () => api.get('/storefront').then((d) => { setConfig(d); setLoaded(true); }).catch(() => setLoaded(true));

  useEffect(() => { refresh(); }, []);

  const waLink = (text = '') => `https://wa.me/${config.store.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  return (
    <StoreContext.Provider value={{ ...config, loaded, refresh, waLink }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const KEY = 'briva_wishlist_v1';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(loadLocal);
  const synced = useRef(false);

  // persist locally
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* ignore */ } }, [ids]);

  // merge with account wishlist on login
  useEffect(() => {
    if (!user) { synced.current = false; return; }
    if (synced.current) return;
    synced.current = true;
    const merged = [...new Set([...(user.wishlist || []), ...loadLocal()])];
    setIds(merged);
    api.put('/auth/me/wishlist', { wishlist: merged }).catch(() => {});
  }, [user]);

  const toggle = useCallback((productId) => {
    setIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((i) => i !== productId) : [...prev, productId];
      if (user) api.put('/auth/me/wishlist', { wishlist: next }).catch(() => {});
      return next;
    });
  }, [user]);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return <WishlistContext.Provider value={{ ids, toggle, has, count: ids.length }}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);

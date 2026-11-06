/**
 * Tiny document store.
 *  - In memory by default (seeded with demo data).
 *  - Optional persistence to Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN are set,
 *    so admin changes survive serverless cold starts on Vercel.
 */
const seed = require('../data/seed');

const COLLECTIONS = [
  'products', 'categories', 'collections', 'reviews', 'orders',
  'users', 'promos', 'subscribers', 'settings', 'content',
];

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const persistent = Boolean(REDIS_URL && REDIS_TOKEN);

let data = null;
let loading = null;

async function redis(cmd) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  const json = await res.json();
  return json.result;
}

async function load() {
  if (data) return data;
  if (loading) return loading;
  loading = (async () => {
    const fresh = seed.build();
    if (persistent && process.env.RESEED !== 'true') {
      try {
        const raw = await redis(['GET', 'brivastore:data']);
        if (raw) {
          const parsed = JSON.parse(raw);
          // merge: keep any collections missing from the snapshot
          for (const c of COLLECTIONS) if (!parsed[c]) parsed[c] = fresh[c];
          data = parsed;
          return data;
        }
      } catch (e) {
        console.error('Could not load from Redis, using seed:', e.message);
      }
    }
    data = fresh;
    if (persistent) await persist().catch(() => {});
    return data;
  })();
  return loading;
}

let persistTimer = null;
async function persist() {
  if (!persistent || !data) return;
  await redis(['SET', 'brivastore:data', JSON.stringify(data)]);
}
function schedulePersist() {
  if (!persistent) return;
  // On serverless we persist immediately; locally we debounce.
  if (process.env.VERCEL) return persist().catch((e) => console.error('persist failed', e.message));
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => persist().catch((e) => console.error('persist failed', e.message)), 300);
}

function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function collection(name) {
  return {
    all: () => data[name],
    find: (fn) => data[name].filter(fn),
    findOne: (fn) => data[name].find(fn),
    byId: (id) => data[name].find((d) => d.id === id),
    insert: (doc) => {
      const item = { id: doc.id || uid(), createdAt: new Date().toISOString(), ...doc };
      data[name].push(item);
      schedulePersist();
      return item;
    },
    update: (id, patch) => {
      const idx = data[name].findIndex((d) => d.id === id);
      if (idx === -1) return null;
      data[name][idx] = { ...data[name][idx], ...patch, updatedAt: new Date().toISOString() };
      schedulePersist();
      return data[name][idx];
    },
    remove: (id) => {
      const idx = data[name].findIndex((d) => d.id === id);
      if (idx === -1) return false;
      data[name].splice(idx, 1);
      schedulePersist();
      return true;
    },
    replaceAll: (items) => {
      data[name] = items;
      schedulePersist();
    },
  };
}

// Single-document collections (settings/content) helpers
function singleton(name) {
  return {
    get: () => data[name],
    set: (patch) => {
      data[name] = { ...data[name], ...patch };
      schedulePersist();
      return data[name];
    },
  };
}

const db = {
  load,
  persistent,
  uid,
  reset: async () => {
    data = seed.build();
    await persist().catch(() => {});
    return data;
  },
  get products() { return collection('products'); },
  get categories() { return collection('categories'); },
  get collections() { return collection('collections'); },
  get reviews() { return collection('reviews'); },
  get orders() { return collection('orders'); },
  get users() { return collection('users'); },
  get promos() { return collection('promos'); },
  get subscribers() { return collection('subscribers'); },
  get settings() { return singleton('settings'); },
  get content() { return singleton('content'); },
};

module.exports = db;

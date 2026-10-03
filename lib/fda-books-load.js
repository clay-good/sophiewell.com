// The page side of the FDA Orange Book (data/orange-book) and Purple Book (data/purple-book) for
// substitution-check: find the products a typed name names. The Orange Book is sharded by the first
// letter of the active ingredient, with names.json mapping every trade name and ingredient to the shards
// that hold it; the Purple Book is one shard. A book past its review date is not searched.

import { loadManifest, loadFile, loadShard, datasetStatus } from './data.js';
import { searchBooks } from './substitution-check.js';

const cache = new Map();
const once = (key, fn) => { if (!cache.has(key)) cache.set(key, fn().catch((e) => { cache.delete(key); throw e; })); return cache.get(key); };

async function book(id) {
  const manifest = await once(`${id}:manifest`, () => loadManifest(id));
  return { manifest, expired: datasetStatus(manifest).status === 'expired', edition: manifest.sourceEdition, shards: new Set((manifest.shards || []).map((s) => s.name)) };
}

// findProducts(query) -> { orange: [records], purple: [records], editions, expired: [ids] } or { error }.
export async function findProducts(query) {
  try {
    const [ob, pb] = await Promise.all([book('orange-book'), book('purple-book')]);
    const words = String(query || '').toUpperCase().split(/\s+/).filter(Boolean);
    const out = { orange: [], purple: [], editions: { orange: ob.edition, purple: pb.edition }, expired: [] };
    if (!words.length) return out;
    if (ob.expired) out.expired.push('orange-book');
    else {
      const names = await once('orange-book:names', () => loadFile('orange-book', 'names.json'));
      const keys = new Set();
      for (const [name, shardKeys] of Object.entries(names)) if (words.some((w) => name.includes(w))) for (const k of shardKeys) keys.add(`${k}.json`);
      const rows = (await Promise.all([...keys].filter((k) => ob.shards.has(k)).map((k) => once(`orange-book:${k}`, () => loadShard('orange-book', k))))).flat();
      out.orange = searchBooks(rows, words, 'orange');
    }
    if (pb.expired) out.expired.push('purple-book');
    else {
      const rows = (await Promise.all([...pb.shards].map((k) => once(`purple-book:${k}`, () => loadShard('purple-book', k))))).flat();
      out.purple = searchBooks(rows, words, 'purple');
    }
    return out;
  } catch {
    return { error: true };
  }
}

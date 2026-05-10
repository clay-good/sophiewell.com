// Data loader. Same-origin fetches against the static data folder.
// Caches per-URL promises so repeated reads are cheap.

const cache = new Map();

async function fetchJsonOnce(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Fetch ${path} failed: ${r.status}`);
  // Cloudflare's SPA fallback returns index.html (200, text/html) for missing
  // paths, so a 200 status alone isn't enough — verify content-type before
  // parsing. JSON dataset files must be served as application/json.
  const ct = r.headers.get('content-type') || '';
  if (!/json/i.test(ct)) throw new Error(`Fetch ${path} returned non-JSON (${ct || 'unknown'})`);
  return r.json();
}

export async function fetchJson(path) {
  if (!cache.has(path)) {
    const p = fetchJsonOnce(path);
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return cache.get(path);
}

export async function loadManifest(dataset) {
  return fetchJson(`data/${dataset}/manifest.json`);
}

// Per-dataset shard-layout memo. Manifests carry an explicit `shardLayout`
// field ("root" | "shards"); we cache the resolved value to avoid re-reading
// the manifest on every shard fetch.
const layoutMemo = new Map();

async function shardLayoutFor(dataset) {
  if (layoutMemo.has(dataset)) return layoutMemo.get(dataset);
  const m = await loadManifest(dataset);
  const layout = m.shardLayout === 'shards' ? 'shards' : 'root';
  layoutMemo.set(dataset, layout);
  return layout;
}

export async function loadShard(dataset, shardName) {
  if (shardName.includes('/')) return fetchJson(`data/${dataset}/${shardName}`);
  const layout = await shardLayoutFor(dataset);
  const base = layout === 'shards' ? `data/${dataset}/shards` : `data/${dataset}`;
  return fetchJson(`${base}/${shardName}`);
}

export async function loadAllShards(dataset) {
  const manifest = await loadManifest(dataset);
  const layout = manifest.shardLayout === 'shards' ? 'shards' : 'root';
  layoutMemo.set(dataset, layout);
  const base = layout === 'shards' ? `data/${dataset}/shards` : `data/${dataset}`;
  const shards = manifest.shards || [];
  const groups = await Promise.all(shards.map((s) =>
    s.name.includes('/') ? fetchJson(`data/${dataset}/${s.name}`) : fetchJson(`${base}/${s.name}`),
  ));
  return [].concat(...groups);
}

export async function loadFile(dataset, file) {
  return fetchJson(`data/${dataset}/${file}`);
}

export function clearCache() {
  cache.clear();
}

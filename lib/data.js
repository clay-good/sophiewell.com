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

export async function loadShard(dataset, shardName) {
  if (shardName.includes('/')) return fetchJson(`data/${dataset}/${shardName}`);
  // Datasets use one of two layouts: single-shard files live at the dataset
  // root (`data/{ds}/{name}`); multi-shard datasets use a `shards/` subdir.
  // Try the subdir first to match the historical convention, then fall back.
  try {
    return await fetchJson(`data/${dataset}/shards/${shardName}`);
  } catch {
    return fetchJson(`data/${dataset}/${shardName}`);
  }
}

export async function loadAllShards(dataset) {
  const manifest = await loadManifest(dataset);
  const shards = manifest.shards || [];
  const groups = await Promise.all(shards.map((s) => loadShard(dataset, s.name)));
  return [].concat(...groups);
}

export async function loadFile(dataset, file) {
  return fetchJson(`data/${dataset}/${file}`);
}

export function clearCache() {
  cache.clear();
}

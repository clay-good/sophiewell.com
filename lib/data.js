// Data loader. Same-origin fetches against the static data folder.
// Caches per-URL promises so repeated reads are cheap.

const cache = new Map();

export async function fetchJson(path) {
  if (!cache.has(path)) {
    cache.set(
      path,
      fetch(path).then((r) => {
        if (!r.ok) throw new Error(`Fetch ${path} failed: ${r.status}`);
        return r.json();
      })
    );
  }
  return cache.get(path);
}

export async function loadManifest(dataset) {
  return fetchJson(`data/${dataset}/manifest.json`);
}

export async function loadShard(dataset, shardName) {
  const path = shardName.includes('/')
    ? `data/${dataset}/${shardName}`
    : `data/${dataset}/shards/${shardName}`;
  return fetchJson(path);
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

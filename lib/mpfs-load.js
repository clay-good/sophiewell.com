// The page side of the physician fee schedule (data/mpfs) for tic-rate-lookup: the GPCI localities and
// conversion factor, and only the shards the requested codes fall in (shards are keyed by a code's first
// two characters). The upload worker has no network code, so the page loads these and passes them in.

import { loadManifest, loadFile, loadShard, datasetStatus, stampText } from './data.js';

export const shardOf = (code) => `${String(code).slice(0, 2).toUpperCase()}.json`;

// loadLocalities() -> { localities, manifest } or { expired } or { error }.
export async function loadLocalities() {
  try {
    const manifest = await loadManifest('mpfs');
    const status = datasetStatus(manifest);
    if (status.status === 'expired') return { expired: true, stamp: stampText(manifest, status, 'CMS physician fee schedule') };
    const [gpci, cf] = await Promise.all([loadFile('mpfs', 'gpci.json'), loadFile('mpfs', 'conversion-factor.json')]);
    return { localities: gpci, conversionFactor: cf.conversionFactor, edition: manifest.sourceEdition, stamp: stampText(manifest, status, 'CMS physician fee schedule') };
  } catch {
    return { error: true };
  }
}

// loadCodeRows(codes) -> { code: [rows] } for the codes the shard list holds; a shard the manifest
// does not list holds none of them.
export async function loadCodeRows(codes) {
  const manifest = await loadManifest('mpfs');
  const listed = new Set((manifest.shards || []).map((s) => s.name));
  const names = [...new Set(codes.map(shardOf))].filter((n) => listed.has(n));
  const shards = await Promise.all(names.map((n) => loadShard('mpfs', n)));
  const want = new Set(codes.map((c) => String(c).toUpperCase()));
  const out = {};
  for (const row of shards.flat()) if (want.has(row.code)) (out[row.code] ||= []).push(row);
  return out;
}

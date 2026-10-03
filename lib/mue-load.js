// The page side of the CMS medically unlikely edits (data/mue) for itemized-bill-check: only the shards the
// bill's codes fall in (shards are keyed by a code's first two characters). A shard the manifest does not
// list holds none of them; a table past its review date is not used.

import { loadManifest, loadShard, datasetStatus } from './data.js';

export const shardOf = (code) => `${String(code).slice(0, 2).toUpperCase()}.json`;

// loadMue(codes, table) -> { rows: { code: { mue, mai } }, edition } | { expired, edition } | { error }.
// table: 'hospital' (outpatient hospital), 'practitioner' or 'dme'.
export async function loadMue(codes, table = 'hospital') {
  try {
    const manifest = await loadManifest('mue');
    if (datasetStatus(manifest).status === 'expired') return { expired: true, edition: manifest.sourceEdition };
    const listed = new Set((manifest.shards || []).map((s) => s.name));
    const names = [...new Set(codes.map(shardOf))].filter((n) => listed.has(n));
    const want = new Set(codes.map((c) => String(c).toUpperCase()));
    const rows = {};
    for (const shard of await Promise.all(names.map((n) => loadShard('mue', n)))) {
      for (const r of shard) if (want.has(r.code) && r[table]) rows[r.code] = { mue: r[table].mue, mai: r[table].mai };
    }
    return { rows, edition: manifest.sourceEdition };
  } catch {
    return { error: true };
  }
}

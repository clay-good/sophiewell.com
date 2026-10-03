// The page side of the USPSTF A and B recommendations (data/uspstf) for preventive-owed: the one shard. A list
// past its review date is not used.

import { loadManifest, loadShard, datasetStatus, stampText } from './data.js';

let cached = null;

// loadUspstf() -> { records, stamp } | { expired, stamp } | { error }.
export async function loadUspstf() {
  if (cached) return cached;
  try {
    const manifest = await loadManifest('uspstf');
    const status = datasetStatus(manifest);
    const stamp = stampText(manifest, status, 'USPSTF A and B recommendations');
    if (status.status === 'expired') return { expired: true, stamp };
    cached = { records: await loadShard('uspstf', 'recommendations.json'), stamp };
    return cached;
  } catch {
    return { error: true };
  }
}

// The page side of the Da Vinci PAS profiles (data/pas-profiles) for pas-bundle-check: the one shard and the
// listable value sets. A pinned guide past its review date is not used.

import { loadManifest, loadShard, loadFile, datasetStatus } from './data.js';
import { profileSet } from './pas-bundle-check.js';

let cached = null;

// loadPasProfiles() -> { set, edition } | { expired, edition } | { error }.
export async function loadPasProfiles() {
  if (cached) return cached;
  try {
    const manifest = await loadManifest('pas-profiles');
    if (datasetStatus(manifest).status === 'expired') return { expired: true, edition: manifest.sourceEdition };
    const [records, valueSets] = await Promise.all([loadShard('pas-profiles', 'profiles.json'), loadFile('pas-profiles', 'valuesets.json')]);
    cached = { set: profileSet(records, valueSets), edition: manifest.sourceEdition };
    return cached;
  } catch {
    return { error: true };
  }
}

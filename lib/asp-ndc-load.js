// The page side of the CMS ASP NDC-HCPCS crosswalk (data/asp-ndc) for ndc-hcpcs-units: load the one
// labeler shard an NDC needs. The manifest's shard list is read first, so a shard that fails to load is
// "unavailable", never "not in the crosswalk". The MCP adapter reads the same files from disk.

import { loadManifest, loadShard } from './data.js';
import { shardName, xwLookup } from './ndc-crosswalk.js';

export async function loadXwLookup(ndc) {
  try {
    const manifest = await loadManifest('asp-ndc');
    const listed = (manifest.shards || []).some((s) => s.name === shardName(ndc));
    const rows = listed ? await loadShard('asp-ndc', shardName(ndc)) : null;
    return xwLookup({ ndc, manifest, rows });
  } catch {
    return { status: 'unavailable' };
  }
}

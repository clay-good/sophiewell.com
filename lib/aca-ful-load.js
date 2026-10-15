// The page side of CMS's ACA Federal Upper Limits file (data/aca-ful) for medicaid-ful-check: load the
// one labeler shard an NDC needs and the product groups. The manifest's shard list is read first, so a
// shard that fails to load is "unavailable", never "not on the list". The MCP adapter reads the same files
// from disk.

import { loadManifest, loadFile, loadShard } from './data.js';
import { shardName, fulLookup } from './aca-ful-lookup.js';

export async function loadFulLookup(ndc) {
  try {
    const manifest = await loadManifest('aca-ful');
    const listed = (manifest.shards || []).some((s) => s.name === shardName(ndc));
    const [rows, groups] = await Promise.all([listed ? loadShard('aca-ful', shardName(ndc)) : null, loadFile('aca-ful', 'groups.json')]);
    return fulLookup({ ndc, manifest, rows, groups });
  } catch {
    return { status: 'unavailable' };
  }
}

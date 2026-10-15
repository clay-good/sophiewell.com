// spec-v1638 tool 18, file mode: find an NDC in CMS's ACA Federal Upper Limits file (data/aca-ful,
// built by scripts/data/builders/aca-ful.mjs). Shards are by labeler, as NADAC's are; groups.json holds
// each product group's limit. The page loads through lib/aca-ful-load.js and the MCP adapter reads the
// same files from disk; both end here.
//
// Pure: no DOM, no fetch. A manifest past its review date is "expired" and the tool asks for the value.

import { shardName } from './nadac-margin.js';
import { datasetStatus } from './data.js';

export { shardName };

// fulLookup({ ndc, manifest, rows, groups, now }) -> { status: 'found'|'not-listed'|'expired', ... }.
export function fulLookup({ ndc, manifest, rows, groups, now }) {
  if (datasetStatus(manifest, now).status === 'expired') return { status: 'expired', edition: manifest && manifest.sourceEdition };
  const edition = manifest.sourceEdition;
  const rec = Array.isArray(rows) ? rows.find((r) => r.ndc === ndc) : null;
  const group = rec && groups ? groups[rec.group] : null;
  return rec && group ? { status: 'found', rec, group, edition } : { status: 'not-listed', edition };
}

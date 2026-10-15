// spec-v1638 tool 18, file mode: find an NDC in CMS's ACA Federal Upper Limits file (data/aca-ful,
// built by scripts/data/builders/aca-ful.mjs). Shards are by labeler, as NADAC's are; groups.json holds
// each product group's limit. The page loads through lib/aca-ful-load.js and the MCP adapter reads the
// same files from disk; both end here.
//
// Pure: no DOM, no fetch. A manifest past its review date is "expired" and the tool asks for the value.

import { shardName } from './nadac-margin.js';
import { datasetStatus } from './data.js';

export { shardName };

// The Medicaid Drug Rebate Program unit types the file uses, as words: [one, many].
const UNIT_WORDS = { TAB: ['tablet', 'tablets'], CAP: ['capsule', 'capsules'], ML: ['mL', 'mL'], GM: ['g', 'g'], TDP: ['patch', 'patches'], SUP: ['suppository', 'suppositories'], EA: ['unit', 'units'], AHF: ['AHF unit', 'AHF units'] };
export function fulUnitWords(code) {
  return UNIT_WORDS[code] || [`unit (${code})`, `units (${code})`];
}

// fulLookup({ ndc, manifest, rows, groups, now }) -> { status: 'found'|'not-listed'|'expired', ... }; a found
// NDC carries its record, its product group and the group's unit as a word.
export function fulLookup({ ndc, manifest, rows, groups, now }) {
  if (datasetStatus(manifest, now).status === 'expired') return { status: 'expired', edition: manifest && manifest.sourceEdition };
  const edition = manifest.sourceEdition;
  const rec = Array.isArray(rows) ? rows.find((r) => r.ndc === ndc) : null;
  const group = rec && groups ? groups[rec.group] : null;
  return rec && group ? { status: 'found', rec, group, edition, unit: fulUnitWords(group.unit)[0] } : { status: 'not-listed', edition };
}

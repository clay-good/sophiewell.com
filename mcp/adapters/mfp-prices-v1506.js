// spec-v1506: MCP adapter for the Medicare negotiated price check. The dom keys mirror views/group-v1506.js.
// An NDC is looked up in the data/mfp-negotiated-prices shard the website ships, read from disk.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as MF from '../../lib/mfp-prices-v1506.js';

const SHARD = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'mfp-negotiated-prices', 'shards', 'prices.json');

function compute(a) {
  let ndcRows = null;
  if (String(a.ndc ?? '').trim()) {
    try { ndcRows = JSON.parse(readFileSync(SHARD, 'utf8')); } catch { ndcRows = null; }
  }
  return MF.mfpPriceCheck({ ...a, ndcRows });
}

export default [
  {
    id: 'partd-mfp-price-check',
    summary: 'Whether a drug has a Medicare negotiated price on a date. Reads the CMS negotiated-prices file: the price per 30-day supply, the next one, or deselection, and with an NDC its per-unit price.',
    compute,
    fields: [
      { dom: 'mfp-drug', arg: 'drug', kind: 'enum', required: true, values: MF.DRUGS.map((d) => d.value), label: 'Drug selected for negotiation' },
      { dom: 'mfp-ndc', arg: 'ndc', kind: 'string', required: false, label: 'NDC of the package, for its per-unit price (optional)' },
      { dom: 'mfp-date', arg: 'date', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD; blank for today)' },
    ],
  },
];

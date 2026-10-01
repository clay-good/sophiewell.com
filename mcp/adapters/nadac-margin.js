// spec-v1510 tool 2: MCP adapter for nadac-margin. The dom keys mirror views/group-v1510.js. The NADAC
// week is the data/nadac shards the website ships, read from disk (never re-typed here).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as NM from '../../lib/nadac-margin.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'nadac');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));

function lookup(ndcRaw) {
  const ndc = NM.normalizeNdc(ndcRaw).ndc;
  if (!ndc) return undefined;
  try {
    const manifest = readJson('manifest.json');
    const file = join('shards', NM.shardName(ndc));
    const rows = existsSync(join(DATA, file)) ? readJson(file) : null;
    return NM.lookupFrom({ ndc, manifest, week: readJson('week.json'), rows });
  } catch {
    return { status: 'unavailable' };
  }
}

export default [
  {
    id: 'nadac-margin',
    summary: 'A pharmacy claim\'s margin against NADAC or the pharmacy\'s invoice cost. Reimbursement minus the national average acquisition cost per unit times quantity; flags a claim paid below cost.',
    compute: (a) => NM.nadacMargin({ ...a, lookup: String(a.cost ?? '').trim() ? undefined : lookup(a.ndc) }),
    fields: [
      { dom: 'nm-ndc', arg: 'ndc', kind: 'string', required: false, label: 'NDC (11 digits, or with its hyphens)' },
      { dom: 'nm-dos', arg: 'serviceDate', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'nm-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity dispensed', unit: 'units' },
      { dom: 'nm-paid', arg: 'reimbursed', kind: 'number', required: true, label: 'Reimbursement', unit: 'USD' },
      { dom: 'nm-cost', arg: 'cost', kind: 'number', required: false, label: 'Invoice cost per unit', unit: 'USD' },
    ],
  },
];

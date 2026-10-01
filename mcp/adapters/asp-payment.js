// spec-v1510 tool 1: MCP adapter for asp-payment. The dom keys mirror views/group-v1510.js. The quarter's
// payment limits are the data/asp shards the website ships, read from disk (never re-typed here).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as AP from '../../lib/asp-payment.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'asp');
const readJson = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));

function lookup(raw) {
  const code = AP.normalizeHcpcs(raw);
  if (!code) return undefined;
  try {
    const file = join('shards', AP.shardName(code));
    const rows = existsSync(join(DATA, file)) ? readJson(file) : null;
    return AP.aspLookup({ code, manifest: readJson('manifest.json'), period: readJson('period.json'), rows });
  } catch {
    return { status: 'unavailable' };
  }
}

export default [
  {
    id: 'asp-payment',
    summary: 'What Medicare allows and pays for a Part B drug. The quarter\'s CMS payment limit per HCPCS unit times units, the patient\'s coinsurance, and Medicare\'s share after sequestration.',
    compute: (a) => AP.aspPayment({ ...a, lookup: String(a.limit ?? '').trim() ? undefined : lookup(a.code) }),
    fields: [
      { dom: 'asp-code', arg: 'code', kind: 'string', required: true, label: 'HCPCS code of the drug' },
      { dom: 'asp-dos', arg: 'serviceDate', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'asp-units', arg: 'units', kind: 'number', required: true, label: 'Units billed', unit: 'HCPCS dosage units' },
      { dom: 'asp-limit', arg: 'limit', kind: 'number', required: false, label: 'Payment limit per unit from another quarter', unit: 'USD' },
      { dom: 'asp-coins', arg: 'coinsurance', kind: 'number', required: false, label: 'Coinsurance with that limit', unit: 'percent' },
    ],
  },
];

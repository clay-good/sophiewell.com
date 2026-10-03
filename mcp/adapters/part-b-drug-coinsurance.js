// spec-v1506 tool 4: MCP adapter for part-b-drug-coinsurance. The dom keys mirror views/group-v1506.js. The
// quarter's payment limits are the data/asp shards the website ships, read from disk.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as AP from '../../lib/asp-payment.js';
import * as PB from '../../lib/part-b-drug-coinsurance.js';

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
    id: 'part-b-drug-coinsurance',
    summary: 'What a patient pays for a Part B drug. The quarter\'s allowed amount and coinsurance percentage, any inflation reduction, and the $35-a-month cap for insulin through a pump.',
    compute: (a) => PB.partBDrugCoinsurance({ ...a, lookup: String(a.limit ?? '').trim() ? undefined : lookup(a.code) }),
    fields: [
      { dom: 'pbdc-code', arg: 'code', kind: 'string', required: true, label: 'HCPCS code of the drug' },
      { dom: 'pbdc-dos', arg: 'serviceDate', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'pbdc-units', arg: 'units', kind: 'number', required: true, label: 'Units billed', unit: 'HCPCS dosage units' },
      { dom: 'pbdc-months', arg: 'months', kind: 'number', required: false, label: 'Months of pump insulin supplied', unit: 'months' },
      { dom: 'pbdc-limit', arg: 'limit', kind: 'number', required: false, label: 'Payment limit per unit from another quarter', unit: 'USD' },
      { dom: 'pbdc-coins', arg: 'coinsurance', kind: 'number', required: false, label: 'Coinsurance with that limit', unit: 'percent' },
    ],
  },
];

// spec-v1601 tool 1: MCP adapter for preventive-owed. The dom keys mirror views/group-v1601.js. The USPSTF list
// is the data/uspstf shard the website ships, read from disk; a list past its review date is not used. The HRSA
// women's guidelines are a bundled constant the library reads itself.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { preventiveOwed, RISKS, PLANS, SEXES, PREGNANCY } from '../../lib/preventive-owed.js';
import { datasetStatus } from '../../lib/data.js';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'uspstf');

function compute(a) {
  let records = [];
  try {
    const manifest = JSON.parse(readFileSync(join(DATA, 'manifest.json'), 'utf8'));
    if (datasetStatus(manifest).status === 'expired') return { valid: false, message: 'The bundled USPSTF list has passed its review date.' };
    records = JSON.parse(readFileSync(join(DATA, 'shards', 'recommendations.json'), 'utf8'));
  } catch {
    return { valid: false, message: 'The USPSTF list could not be loaded.' };
  }
  const risks = Object.fromEntries(Object.keys(RISKS).map((id) => [id, a[`risk_${id.replace(/-/g, '_')}`]]));
  return preventiveOwed({ ...a, records, risks });
}

export default [
  {
    id: 'preventive-owed',
    summary: 'The preventive care a private plan must cover at no cost. The USPSTF A and B recommendations and the HRSA women\'s preventive services guidelines a non-grandfathered plan must cover in network, filtered to the person by age, sex, pregnancy and the risk questions answered, with the one-year rule; anything conditioned on an unanswered question is listed with that question, never dropped. USPSTF descriptions are verbatim; HRSA ones are summarized.',
    compute,
    fields: [
      { dom: 'pow-plan', arg: 'plan', kind: 'enum', required: true, label: 'Coverage', values: PLANS.map((p) => p.value) },
      { dom: 'pow-start', arg: 'planYearStart', kind: 'string', required: true, label: 'The date the plan year starts (YYYY-MM-DD)' },
      { dom: 'pow-age', arg: 'age', kind: 'number', label: 'Age in years', min: 0, max: 120 },
      { dom: 'pow-sex', arg: 'sex', kind: 'enum', label: 'Sex at birth', values: SEXES.map((s) => s.value) },
      { dom: 'pow-preg', arg: 'pregnancy', kind: 'enum', label: 'Pregnant or postpartum', values: PREGNANCY.map((s) => s.value) },
      ...Object.entries(RISKS).map(([id, q]) => ({ dom: `pow-risk-${id}`, arg: `risk_${id.replace(/-/g, '_')}`, kind: 'enum', label: q, values: ['yes', 'no'] })),
    ],
  },
];

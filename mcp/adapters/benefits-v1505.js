// spec-v1505: MCP adapters for the benefits investigation summary and the site-of-care comparison. The dom keys mirror views/group-v1505.js.

import * as BN from '../../lib/benefits-v1505.js';

const kinds = BN.SHARE_KINDS.map((k) => k.value);
const usd = (dom, arg, label, required = false) => ({ dom, arg, kind: 'number', required, label, unit: 'USD' });

export default [
  {
    id: 'bi-summary',
    summary: 'What a patient will pay for a therapy under the plan found in a benefits check. The first administration, the first 90 days and the plan year.',
    compute: BN.biSummary,
    fields: [
      usd('bi-allowed', 'allowed', 'Allowed amount per administration', true),
      { dom: 'bi-n', arg: 'perYear', kind: 'number', required: true, label: 'Administrations in the plan year' },
      { dom: 'bi-n90', arg: 'in90', kind: 'number', required: false, label: 'Administrations in the first 90 days' },
      usd('bi-ded', 'deductibleLeft', 'Deductible still to meet', true),
      usd('bi-oop', 'oopLeft', 'Out-of-pocket maximum still to meet', true),
      { dom: 'bi-kind', arg: 'shareKind', kind: 'enum', required: true, values: kinds, label: 'Coinsurance or copay' },
      { dom: 'bi-share', arg: 'share', kind: 'number', required: true, label: 'Coinsurance percent or copay dollars' },
      { dom: 'bi-pa', arg: 'priorAuth', kind: 'enum', required: false, values: BN.YES_NO.map((x) => x.value), label: 'Prior authorization required' },
      { dom: 'bi-sp', arg: 'specialtyPharmacy', kind: 'enum', required: false, values: BN.YES_NO.map((x) => x.value), label: 'Specialty pharmacy required' },
    ],
  },
  {
    id: 'site-of-care-compare',
    summary: 'What a therapy costs the plan and the patient at each site of care. Compares up to four sites over the plan year.',
    compute: BN.siteOfCareCompare,
    fields: [
      { dom: 'soc-n', arg: 'perYear', kind: 'number', required: true, label: 'Administrations in the plan year' },
      usd('soc-ded', 'deductibleLeft', 'Deductible still to meet'),
      usd('soc-oop', 'oopLeft', 'Out-of-pocket maximum still to meet'),
      ...[1, 2, 3, 4].flatMap((k) => [
        { dom: `soc-name${k}`, arg: `site${k}`, kind: 'string', required: k <= 2, label: `Site ${k} name` },
        usd(`soc-allowed${k}`, `allowed${k}`, `Site ${k} allowed amount per administration`, k <= 2),
        { dom: `soc-kind${k}`, arg: `s${k}shareKind`, kind: 'enum', required: k <= 2, values: kinds, label: `Site ${k} coinsurance or copay` },
        { dom: `soc-share${k}`, arg: `s${k}share`, kind: 'number', required: k <= 2, label: `Site ${k} coinsurance percent or copay dollars` },
      ]),
    ],
  },
];

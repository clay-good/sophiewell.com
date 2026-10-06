// spec-v1554 MCP adapter: infant-arv-prophylaxis in lib/infant-arv-prophylaxis-v1554.js.
// The dom keys mirror views/group-v1554.js and META['infant-arv-prophylaxis'].example. Clinical domain.

import * as M from '../../lib/infant-arv-prophylaxis-v1554.js';

export default [
  {
    id: 'infant-arv-prophylaxis',
    summary: 'Gives infant HIV prophylaxis by WHO risk group (December 2025). Six weeks of nevirapine (May 2026 doses by age) or a three-drug regimen if high risk, then breastfeeding continuation.',
    compute: M.infantArvProphylaxis,
    fields: [
      { dom: 'iap-art', arg: 'art', kind: 'enum', required: true, label: 'Mother\'s ART at delivery', values: M.ART_OPTIONS.map((d) => d.value) },
      { dom: 'iap-vl', arg: 'vl', kind: 'enum', label: 'Mother\'s viral load in the 4 weeks before delivery', values: M.VL_OPTIONS.map((d) => d.value) },
      { dom: 'iap-inc', arg: 'incident', kind: 'enum', required: true, label: 'Mother acquired HIV in pregnancy or breastfeeding', values: M.YES_NO.map((d) => d.value) },
      { dom: 'iap-pp', arg: 'postpartum', kind: 'enum', required: true, label: 'Mother first identified with HIV after delivery', values: M.YES_NO.map((d) => d.value) },
      { dom: 'iap-bf', arg: 'breastfeeding', kind: 'enum', required: true, label: 'Breastfeeding', values: M.YES_NO.map((d) => d.value) },
      { dom: 'iap-age', arg: 'age', kind: 'number', required: true, label: 'Infant age in weeks', min: 0, max: 104 },
      { dom: 'iap-weight', arg: 'weight', kind: 'number', label: 'Infant weight in kg (for alternatives)', min: 1, max: 25 },
    ],
  },
];

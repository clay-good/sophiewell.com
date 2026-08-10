// spec-v686 MCP adapter: UCSF criteria for HCC liver-transplant eligibility in
// lib/ucsf-hcc-v686.js. The dom keys mirror the browser renderer (views/group-v686.js)
// and META['ucsf-hcc'].example. Three tumor-burden numbers plus two exclusion flags;
// decision logic returns within/outside UCSF. Clinical domain.

import { ucsfHcc } from '../../lib/ucsf-hcc-v686.js';

export default [
  {
    id: 'ucsf-hcc',
    summary: 'UCSF criteria for HCC liver-transplant eligibility (Yao 2001): within if a solitary tumor <= 6.5 cm, OR <= 3 nodules with the largest <= 4.5 cm and total tumor diameter <= 8 cm; gross vascular invasion or extrahepatic spread makes the patient ineligible regardless of size. The modestly expanded version of Milan (single <= 5 cm or <= 3 nodules each <= 3 cm).',
    compute: ucsfHcc,
    fields: [
      { dom: 'ucsf-nodules', arg: 'nodules', kind: 'number', required: true, label: 'Number of tumor nodules' },
      { dom: 'ucsf-largest', arg: 'largest', kind: 'number', unit: 'cm', required: true, label: 'Largest tumor diameter (cm; single-tumor limit 6.5, multi-tumor limit 4.5)' },
      { dom: 'ucsf-total', arg: 'total', kind: 'number', unit: 'cm', required: true, label: 'Total (summed) tumor diameter (cm; multi-tumor limit 8)' },
      { dom: 'ucsf-vascular', arg: 'vascular', kind: 'bool', label: 'Gross (macro)vascular invasion present' },
      { dom: 'ucsf-extrahepatic', arg: 'extrahepatic', kind: 'bool', label: 'Extrahepatic spread present' },
    ],
  },
];

// spec-v183 MCP wave 24: adapter for the MECKI score in
// lib/cvrisk-engines-v202.js — a CPET-anchored 2-year prognostic model for
// systolic heart failure. dom keys mirror views/group-v202.js.

import * as F from '../../lib/cvrisk-engines-v202.js';

export default [
  {
    id: 'mecki',
    summary: 'MECKI score (Agostoni 2013): a CPET-anchored model estimating the 2-year risk of cardiovascular death, urgent transplant, or LVAD in systolic heart failure from hemoglobin, sodium, LVEF, percent-predicted peak VO₂, VE/VCO₂ slope, and MDRD-eGFR.',
    compute: F.mecki,
    fields: [
      { dom: 'mecki-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'mecki-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'mecki-lvef', arg: 'lvef', kind: 'number', required: true, label: 'LVEF', unit: '%' },
      { dom: 'mecki-ppvo2', arg: 'ppvo2', kind: 'number', required: true, label: 'Peak VO₂ (% predicted)' },
      { dom: 'mecki-veco2', arg: 'veco2', kind: 'number', required: true, label: 'VE/VCO₂ slope' },
      { dom: 'mecki-egfr', arg: 'egfr', kind: 'number', required: true, label: 'MDRD-eGFR', unit: 'mL/min/1.73 m²' },
    ],
  },
];

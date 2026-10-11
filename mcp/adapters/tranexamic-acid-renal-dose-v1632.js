// spec-v1632 MCP adapter: tranexamic-acid-renal-dose in lib/tranexamic-acid-renal-dose-v1632.js. The
// dom keys mirror views/group-v1632.js and META['tranexamic-acid-renal-dose'].example. Clinical
// domain. Two label rows: Cyklokapron and tranexamic acid tablets.

import * as TX from '../../lib/tranexamic-acid-renal-dose-v1632.js';

export default [
  {
    id: 'tranexamic-acid-renal-dose',
    summary: 'The row the FDA label gives for tranexamic acid by serum creatinine. Intravenous: the mg/kg row and the milligrams at the actual body weight entered. Oral tablets: the row and total daily dose. Both tables key on serum creatinine in mg/dL, not on a clearance, and a value on an edge two rows share shows both. It recommends nothing.',
    compute: TX.tranexamicAcidRenalDose,
    fields: [
      { dom: 'txa-route', arg: 'route', kind: 'enum', required: true, values: TX.ROUTES.map((r) => r.value), label: 'Route: iv or oral' },
      { dom: 'txa-scr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine (not a clearance)', unit: 'mg/dL' },
      { dom: 'txa-weight', arg: 'weight', kind: 'number', label: 'Intravenous: actual body weight', unit: 'kg' },
    ],
  },
];

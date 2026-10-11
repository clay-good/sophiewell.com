// spec-v1631 MCP adapter: aminoglycoside-label-renal in lib/aminoglycoside-label-renal-v1631.js. The
// dom keys mirror views/group-v1631.js and META['aminoglycoside-label-renal'].example. Clinical
// domain. Three label rows: gentamicin, tobramycin and amikacin.

import * as AG from '../../lib/aminoglycoside-label-renal-v1631.js';

export default [
  {
    id: 'aminoglycoside-label-renal',
    summary: 'Conventional (multiple daily dose) gentamicin, tobramycin or amikacin dosing by each FDA label: the usual adult dose, and the two label guides for impaired renal function side by side: the usual dose at an interval of serum creatinine × 8, 6 or 9 hours, and the usual dose ÷ serum creatinine at the usual interval (with the gentamicin table of percentages). It reports the label arithmetic and does not choose the regimen.',
    compute: AG.aminoglycosideLabelRenal,
    fields: [
      { dom: 'agl-drug', arg: 'drug', kind: 'enum', required: true, values: AG.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'agl-severity', arg: 'severity', kind: 'enum', values: AG.SEVERITIES.map((s) => s.value), label: 'Severity (gentamicin, tobramycin): serious or life' },
      { dom: 'agl-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual body weight', unit: 'kg' },
      { dom: 'agl-basis', arg: 'basis', kind: 'enum', required: true, values: AG.BASES.map((b) => b.value), label: 'Dose on actual weight or a lean estimate' },
      { dom: 'agl-lean', arg: 'leanWeight', kind: 'number', label: 'Lean weight estimate (if dosing on it)', unit: 'kg' },
      { dom: 'agl-creatinine', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
    ],
  },
];

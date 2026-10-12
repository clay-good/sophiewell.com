// spec-v1635 MCP adapter: chemo-dose-verify in lib/chemo-dose-verify-v1635.js. The dom keys mirror
// views/group-v1635.js and META['chemo-dose-verify'].example. Clinical domain.

import * as CV from '../../lib/chemo-dose-verify-v1635.js';

export default [
  {
    id: 'chemo-dose-verify',
    summary: 'Re-derives an ordered chemotherapy dose from the regimen and the patient\'s size, with the percent variance. The regimen dose is per m² or per kg; the variance is signed, against the order. It uses actual weight unless a dosing weight is entered, applies a body surface area cap only when one is typed (labeled institutional), and gives a pass or fail only against a tolerance the reader enters.',
    compute: (args) => CV.chemoDoseVerify(args),
    fields: [
      { dom: 'cdv-basis', arg: 'basis', kind: 'enum', required: true, values: CV.BASES.map((x) => x.value), label: 'Dose basis of the regimen' },
      { dom: 'cdv-per', arg: 'perUnitDose', kind: 'number', required: true, label: 'Regimen dose per m² or per kg' },
      { dom: 'cdv-height', arg: 'height', kind: 'number', label: 'Height (needed for a dose per m²)', unit: 'cm' },
      { dom: 'cdv-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual weight', unit: 'kg' },
      { dom: 'cdv-formula', arg: 'bsaFormula', kind: 'enum', values: CV.BSA_FORMULAS.map((x) => x.value), label: 'Body surface area formula the order used (needed for a dose per m²)' },
      { dom: 'cdv-ordered', arg: 'orderedDose', kind: 'number', required: true, label: 'Ordered dose (mg, or units)' },
      { dom: 'cdv-dosing-weight', arg: 'dosingWeight', kind: 'number', label: 'Dosing weight, if policy uses one other than actual (optional)', unit: 'kg' },
      { dom: 'cdv-reduction', arg: 'reduction', kind: 'number', label: 'Percent reduction for this cycle (optional)', unit: '%' },
      { dom: 'cdv-cap', arg: 'bsaCap', kind: 'number', label: 'Institutional body surface area cap (optional)', unit: 'm²' },
      { dom: 'cdv-tolerance', arg: 'tolerance', kind: 'number', label: 'Tolerance for a pass or fail (optional)', unit: '%' },
    ],
  },
];

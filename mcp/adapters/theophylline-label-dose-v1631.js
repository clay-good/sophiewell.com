// spec-v1631 MCP adapter: theophylline-label-dose in lib/theophylline-label-dose-v1631.js. The dom
// keys mirror views/group-v1631.js and META['theophylline-label-dose'].example. Clinical domain.
// Two label rows: aminophylline injection and theophylline extended-release tablets.

import * as TH from '../../lib/theophylline-label-dose-v1631.js';

export default [
  {
    id: 'theophylline-label-dose',
    summary: 'Theophylline and aminophylline by the FDA label. IV start: the loading dose on ideal body weight (4.6 mg/kg, or from a measured level with 0.5 L/kg) and the initial infusion rate for the patient group in the label table, with its daily ceiling. Adjustment: the label action for a peak steady-state level, for an infusion or an oral dose. It reports the label arithmetic and does not choose the dose.',
    compute: TH.theophyllineLabelDose,
    fields: [
      { dom: 'thl-mode', arg: 'mode', kind: 'enum', required: true, values: TH.MODES.map((m) => m.value), label: 'Mode: IV start or adjustment' },
      { dom: 'thl-product', arg: 'product', kind: 'enum', values: TH.PRODUCTS.map((p) => p.value), label: 'IV start: product' },
      { dom: 'thl-weight', arg: 'weight', kind: 'number', label: 'IV start: ideal body weight', unit: 'kg' },
      { dom: 'thl-group', arg: 'group', kind: 'enum', values: TH.GROUPS.map((g) => g.value), label: 'IV start: patient group' },
      { dom: 'thl-weeks', arg: 'ageWeeks', kind: 'number', label: 'IV start, infant group: age', unit: 'weeks' },
      { dom: 'thl-prior', arg: 'prior', kind: 'enum', values: TH.PRIOR.map((p) => p.value), label: 'IV start: theophylline in the past 24 hours' },
      { dom: 'thl-target', arg: 'target', kind: 'number', label: 'IV start with a level: desired level', unit: 'mcg/mL' },
      { dom: 'thl-level', arg: 'level', kind: 'number', label: 'Measured level (adjustment: the peak)', unit: 'mcg/mL' },
      { dom: 'thl-route', arg: 'route', kind: 'enum', values: TH.ROUTES.map((r) => r.value), label: 'Adjustment: IV infusion or oral product' },
      { dom: 'thl-current', arg: 'current', kind: 'number', label: 'Adjustment: current mg/h (IV) or mg/day (oral)' },
    ],
  },
];

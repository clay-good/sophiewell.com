// spec-v1631 MCP adapter: busulfan-auc-dose in lib/busulfan-auc-dose-v1631.js. The dom keys mirror
// views/group-v1631.js and META['busulfan-auc-dose'].example. Clinical domain. The busulfan label's
// therapeutic drug monitoring method (Pediatric Use), as a label row.

import * as BU from '../../lib/busulfan-auc-dose-v1631.js';

export default [
  {
    id: 'busulfan-auc-dose',
    summary: 'IV busulfan AUC from timed levels and the adjusted dose, by the method on the FDA label. After dose 1 it adds the area to 6 hours and the extrapolated area; after a later dose it takes the steady-state area over the interval. Adjusted dose = dose × target AUC ÷ measured AUC. The label prints this in its Pediatric Use section.',
    compute: BU.busulfanAucDose,
    fields: [
      { dom: 'bu-timing', arg: 'timing', kind: 'enum', required: true, values: BU.TIMINGS.map((t) => t.value), label: 'Samples followed dose 1 (dose-1) or a later dose (later)' },
      { dom: 'bu-dose', arg: 'dose', kind: 'number', required: true, label: 'Dose given', unit: 'mg' },
      { dom: 'bu-unit', arg: 'unit', kind: 'enum', required: true, values: BU.UNITS.map((u) => u.value), label: 'Concentration unit: micromolar (uM) or ng/mL (ng-mL)' },
      { dom: 'bu-samples', arg: 'samples', kind: 'string', required: true, label: 'Samples, one per line: hours from infusion start, then level' },
      { dom: 'bu-target', arg: 'target', kind: 'number', required: true, label: 'Target AUC (the label gives 1125)', unit: 'µM·min' },
    ],
  },
];

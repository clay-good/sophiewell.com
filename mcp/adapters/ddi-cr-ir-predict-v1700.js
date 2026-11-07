// spec-v1700 MCP adapter: ddi-cr-ir-predict in lib/ddi-cr-ir-predict-v1700.js. The dom keys mirror views/group-v1700.js and
// META['ddi-cr-ir-predict'].example.

import * as DCI from '../../lib/ddi-cr-ir-predict-v1700.js';

export default [
  {
    id: 'ddi-cr-ir-predict',
    summary: "CYP3A4 interaction size from the substrate's contribution ratio and the inhibitor's inhibition ratio (Ohno). Either can be solved from an observed exposure ratio.",
    compute: DCI.ddiCrIrPredict,
    fields: [
      { dom: 'dci-mode', arg: 'mode', kind: 'enum', values: ['inhibition', 'induction', 'solve-cr', 'solve-ir'], required: true, label: 'What to compute' },
      { dom: 'dci-cr', arg: 'cr', kind: 'number', min: 0, max: 1, required: false, label: 'CR (0 to 1)' },
      { dom: 'dci-ir', arg: 'ir', kind: 'number', min: 0, max: 1, required: false, label: 'IR (0 to 1)' },
      { dom: 'dci-ic', arg: 'ic', kind: 'number', required: false, label: 'IC, increase in clearance' },
      { dom: 'dci-ratio', arg: 'observedRatio', kind: 'number', required: false, label: 'Observed AUC ratio' },
      { dom: 'dci-dose', arg: 'irDose', kind: 'string', required: false, label: 'Inhibitor dose the IR applies to' },
    ]
  },
];

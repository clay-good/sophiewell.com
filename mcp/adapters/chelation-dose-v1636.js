// spec-v1636 MCP adapter: chelation-dose in lib/chelation-dose-v1636.js. The dom keys mirror
// views/group-v1636.js and META['chelation-dose'].example. Clinical domain. Three label rows.

import * as CH from '../../lib/chelation-dose-v1636.js';

export default [
  {
    id: 'chelation-dose',
    summary: 'Labeled chelation doses for heavy metal poisoning. Succimer by the label\'s capsule table with the 19-day course; edetate calcium disodium by surface area, with the lead nephropathy regimens by creatinine; dimercaprol by weight for arsenic, gold, mercury and lead encephalopathy. A weight the succimer table leaves between rows returns both. It does not choose a chelator.',
    compute: (args) => CH.chelationDose(args, new Date()),
    fields: [
      { dom: 'chd-regimen', arg: 'regimen', kind: 'enum', required: true, values: CH.REGIMENS.map((x) => x.value), label: 'Agent and poisoning' },
      { dom: 'chd-weight', arg: 'weight', kind: 'number', label: 'Weight (succimer and dimercaprol)', unit: 'kg' },
      { dom: 'chd-bsa', arg: 'bsa', kind: 'number', label: 'Body surface area (edetate calcium disodium)', unit: 'm²' },
      { dom: 'chd-cr', arg: 'creatinine', kind: 'number', label: 'Serum creatinine (edetate, lead nephropathy)', unit: 'mg/dL' },
      { dom: 'chd-start', arg: 'start', kind: 'string', label: 'First dose, YYYY-MM-DDTHH:MM (optional, for the dose calendar)' },
    ],
  },
];

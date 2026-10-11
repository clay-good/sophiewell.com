// spec-v1629 MCP adapter: aliquot-method in lib/aliquot-method-v1629.js. The dom keys mirror
// views/group-v1629.js and META['aliquot-method'].example. Arithmetic identity; administrative domain.

import * as AQ from '../../lib/aliquot-method-v1629.js';

export default [
  {
    id: 'aliquot-method',
    summary: 'Aliquot method for a drug quantity below the minimum weighable quantity, solid or liquid. Gives the drug to weigh, the diluent or volume, and the aliquot to take, and checks every measurement against the minimum.',
    compute: AQ.aliquotMethod,
    fields: [
      { dom: 'aq-form', arg: 'form', kind: 'enum', required: true, values: AQ.FORMS.map((f) => f.value), label: 'Method: a solid or a liquid aliquot' },
      { dom: 'aq-needed', arg: 'needed', kind: 'number', required: true, label: 'Drug needed', unit: 'mg' },
      { dom: 'aq-min', arg: 'minimum', kind: 'number', required: true, label: 'Minimum weighable quantity of the balance', unit: 'mg' },
      { dom: 'aq-aliquot', arg: 'aliquot', kind: 'number', required: false, label: 'Solid: aliquot weight (blank uses the smallest that keeps every weighing at or above the minimum)', unit: 'mg' },
      { dom: 'aq-vol', arg: 'volume', kind: 'number', required: false, label: 'Liquid: volume the drug is dissolved to', unit: 'mL' },
      { dom: 'aq-minvol', arg: 'minVolume', kind: 'number', required: false, label: 'Liquid: smallest volume that can be measured', unit: 'mL' },
    ],
  },
];

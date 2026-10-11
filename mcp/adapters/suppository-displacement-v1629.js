// spec-v1629 MCP adapter: suppository-displacement in lib/suppository-displacement-v1629.js. The dom
// keys mirror views/group-v1629.js and META['suppository-displacement'].example. Arithmetic identity;
// administrative domain. The factor is reader input and its definition is a required choice.

import * as SD from '../../lib/suppository-displacement-v1629.js';

export default [
  {
    id: 'suppository-displacement',
    summary: 'Base and drug for a batch of suppositories or other molded units, from the mold calibration and the drug factor. The factor is published two ways that are reciprocals, so which definition it uses is a required choice; a calibration mode finds the factor from three weighings.',
    compute: SD.suppositoryDisplacement,
    fields: [
      { dom: 'sp-mode', arg: 'mode', kind: 'enum', required: true, values: SD.MODES.map((m) => m.value), label: 'What to work out: a batch, or the factor from three weighings (calibrate)' },
      { dom: 'sp-def', arg: 'definition', kind: 'enum', required: false, values: SD.DEFINITIONS.map((d) => d.value), label: 'Batch: which definition the factor uses (density: g of drug per g of base space; displacement: g of base displaced per g of drug)' },
      { dom: 'sp-units', arg: 'units', kind: 'number', required: false, label: 'Batch: number of units' },
      { dom: 'sp-extra', arg: 'overage', kind: 'number', required: false, label: 'Batch: extra units to allow for loss (optional)' },
      { dom: 'sp-blank', arg: 'blankWeight', kind: 'number', required: true, label: 'One unit of plain base from this mold', unit: 'g' },
      { dom: 'sp-drug', arg: 'drugPerUnit', kind: 'number', required: true, label: 'Drug per unit', unit: 'g' },
      { dom: 'sp-factor', arg: 'factor', kind: 'number', required: false, label: 'Batch: the drug factor, under the definition chosen' },
      { dom: 'sp-med', arg: 'medicatedWeight', kind: 'number', required: false, label: 'Calibrate: one medicated unit from this mold', unit: 'g' },
    ],
  },
];

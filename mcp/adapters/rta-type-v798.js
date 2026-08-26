// spec-v798 MCP adapter: renal tubular acidosis typing in lib/rta-type-v798.js.
// The dom keys mirror the browser renderer (views/group-v798.js) and META['rta-type'].example.
// Potassium then urine pH assign the type; the other two are supporting only. Clinical domain.

import { rtaType } from '../../lib/rta-type-v798.js';

export default [
  {
    id: 'rta-type',
    summary: 'Assigns the type of a normal-anion-gap metabolic acidosis of renal origin, in order: a HIGH serum potassium gives type 4 (hyperkalemic distal); otherwise a urine pH above 5.5 during acidosis gives type 1 (classic distal) and 5.5 or less gives type 2 (proximal). A fractional excretion of bicarbonate above 15% supports type 2. The urine anion gap is reported but NOT used to assign a type, because sources disagree on its direction in type 4; it separates a renal cause from gastrointestinal bicarbonate loss. Type 3 is not offered.',
    compute: rtaType,
    fields: [
      { dom: 'rta-k', arg: 'potassium', kind: 'enum', values: ['low', 'normal', 'high'], required: false, label: 'Serum potassium' },
      { dom: 'rta-ph', arg: 'urinePh', kind: 'number', required: false, label: 'Urine pH in acidosis' },
      { dom: 'rta-fehco3', arg: 'feHco3', kind: 'number', required: false, label: 'FE bicarbonate (supporting)', unit: '%' },
      { dom: 'rta-uag', arg: 'urineAnionGap', kind: 'number', required: false, label: 'Urine anion gap (supporting)', unit: 'mEq/L' },
    ],
  },
];

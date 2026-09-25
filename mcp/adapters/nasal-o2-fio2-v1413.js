// spec-v1413: MCP adapter. The dom key mirrors views/group-v1413.js and this tile's META example.

import * as NF from '../../lib/nasal-o2-fio2-v1413.js';

export default [
  {
    id: 'nasal-o2-fio2',
    summary: 'Estimates the FiO2 for a patient on nasal oxygen whose FiO2 is not measured, as 0.21 plus 0.03 per liter per minute. That is the convention of the 2024 Global Definition of ARDS, for use in an SpO2/FiO2 or PaO2/FiO2 ratio, and the tool shows how widely the measured value varies.',
    compute: NF.nasalO2Fio2,
    fields: [
      { dom: 'nof-flow', arg: 'flowLpm', kind: 'number', required: true, label: 'Oxygen flow by nasal cannula', unit: 'L/min' },
    ],
  },
];

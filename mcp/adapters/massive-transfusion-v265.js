// spec-v265 MCP wave (one-hundred-fourth): adapter for the Assessment of Blood
// Consumption (ABC) score in lib/massive-transfusion-v265.js. dom keys mirror the
// browser renderer (views/group-v265.js) and META['abc-transfusion-score'].example.
// All four criteria are booleans; a total >= 2 predicts massive transfusion.

import * as F from '../../lib/massive-transfusion-v265.js';

export default [
  {
    id: 'abc-transfusion-score',
    summary: 'Assessment of Blood Consumption (ABC) score — a 0-4 count over penetrating mechanism of injury, systolic BP <= 90 mmHg on ED arrival, heart rate >= 120 bpm on ED arrival, and a positive FAST examination. A total >= 2 predicts the need for massive transfusion in trauma. A prediction score, not a transfusion order.',
    compute: F.abcTransfusion,
    fields: [
      { dom: 'abc-pen', arg: 'penetrating', kind: 'bool', label: 'Penetrating mechanism of injury' },
      { dom: 'abc-sbp', arg: 'sbp90', kind: 'bool', label: 'Systolic BP <= 90 mmHg on ED arrival' },
      { dom: 'abc-hr', arg: 'hr120', kind: 'bool', label: 'Heart rate >= 120 bpm on ED arrival' },
      { dom: 'abc-fast', arg: 'positiveFast', kind: 'bool', label: 'Positive FAST examination' },
    ],
  },
];

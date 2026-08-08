// spec-v658 MCP adapter: ISGLS bile-leak grade in lib/isgls-bile-leak-v658.js. The dom
// keys mirror the browser renderer (views/group-v658.js) and META['isgls-bile-leak'].example.
// A decision-logic classifier: the bile gate (required bool) gates the leak; then
// relaparotomy -> Grade C, else a change in management -> Grade B, else Grade A. Clinical domain.

import { isglsBileLeak } from '../../lib/isgls-bile-leak-v658.js';

export default [
  {
    id: 'isgls-bile-leak',
    summary: 'ISGLS grading of bile leakage after hepatobiliary/pancreatic surgery. Gate: drain bilirubin >= 3x serum on/after POD 3, or need for intervention. Grade C = requires relaparotomy; Grade B = change in management without relaparotomy (or grade A leak > 1 week); Grade A = no/little management change.',
    compute: isglsBileLeak,
    fields: [
      { dom: 'bile-gate', arg: 'bileGate', kind: 'bool', required: true, label: 'Drain bilirubin >= 3x serum on/after POD 3, OR need for radiologic/operative intervention (the bile-leak gate)' },
      { dom: 'bile-c', arg: 'relaparotomy', kind: 'bool', required: false, label: 'Requires relaparotomy (Grade C)' },
      { dom: 'bile-b', arg: 'managementChange', kind: 'bool', required: false, label: 'Change in management without relaparotomy (percutaneous drainage, ERCP/stent), or a grade A leak persisting > 1 week (Grade B)' },
    ],
  },
];

// spec-v730 MCP adapter: Severity of Dependence Scale in lib/sds-dependence-v730.js.
// The dom keys mirror the browser renderer (views/group-v730.js) and
// META['sds-dependence'].example. A substance enum + five 0-3 enums; the sum 0-15 is compared
// against a substance-specific cutoff. Clinical domain.

import { sdsDependence } from '../../lib/sds-dependence-v730.js';

export default [
  {
    id: 'sds-dependence',
    summary: 'Severity of Dependence Scale (SDS; Gossop 1995): 5-item measure of psychological dependence. Each item 0-3, summed to 0-15. Substance-specific cutoffs (>= suggests dependence): heroin 5, cocaine 3, amphetamines 5, cannabis 4, alcohol 4; no fixed cutoff for other substances. Higher = greater dependence.',
    compute: sdsDependence,
    fields: [
      { dom: 'sds-substance', arg: 'substance', kind: 'enum', values: ['heroin', 'cocaine', 'amphetamines', 'cannabis', 'alcohol', 'other'], required: true, label: 'Substance' },
      { dom: 'sds-control', arg: 'outOfControl', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Use felt out of control (0-3)' },
      { dom: 'sds-anxious', arg: 'anxiousMissing', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Anxious about missing a dose (0-3)' },
      { dom: 'sds-worried', arg: 'worried', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Worried about your use (0-3)' },
      { dom: 'sds-wish', arg: 'wishStop', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Wished you could stop (0-3)' },
      { dom: 'sds-difficulty', arg: 'difficultyStopping', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Difficulty stopping / going without (0-3)' },
    ],
  },
];

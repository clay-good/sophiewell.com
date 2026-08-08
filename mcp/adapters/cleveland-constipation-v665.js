// spec-v665 MCP adapter: Cleveland Clinic Constipation Score in
// lib/cleveland-constipation-v665.js. The dom keys mirror the browser renderer
// (views/group-v665.js) and META['cleveland-constipation'].example. Eight ordinal items
// summed 0-30 (seven 0-4 enums + assistance 0-2). Cutoff > 15 advisory. Distinct from the
// Wexner fecal incontinence score. Clinical domain.

import { clevelandConstipation } from '../../lib/cleveland-constipation-v665.js';

export default [
  {
    id: 'cleveland-constipation',
    summary: 'Cleveland Clinic (Wexner) Constipation Score (Agachan 1996): eight items summed 0-30 (frequency, difficulty, incomplete evacuation, pain, time in lavatory, assistance, failed attempts, duration). Seven items 0-4, assistance 0-2. A score above 15 is the commonly cited cutoff for constipation. Distinct from the Wexner fecal incontinence score.',
    compute: clevelandConstipation,
    fields: [
      { dom: 'cccs-frequency', arg: 'frequency', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Frequency: 0 (1-2/1-2 days), 1 (2/wk), 2 (1/wk), 3 (<1/wk), 4 (<1/month)' },
      { dom: 'cccs-difficulty', arg: 'difficulty', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Difficulty (painful effort): 0 never to 4 always' },
      { dom: 'cccs-completeness', arg: 'completeness', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Feeling of incomplete evacuation: 0 never to 4 always' },
      { dom: 'cccs-pain', arg: 'pain', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Abdominal pain: 0 never to 4 always' },
      { dom: 'cccs-time', arg: 'time', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Time in lavatory per attempt: 0 (<5 min) to 4 (>30 min)' },
      { dom: 'cccs-assistance', arg: 'assistance', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Assistance: 0 none, 1 stimulant laxatives, 2 digital/enema' },
      { dom: 'cccs-failure', arg: 'failure', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Unsuccessful attempts per 24 h: 0 never to 4 always' },
      { dom: 'cccs-history', arg: 'history', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Duration of constipation: 0 (0 y) to 4 (>20 y)' },
    ],
  },
];

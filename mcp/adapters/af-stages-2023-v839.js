// spec-v839 MCP adapter: 2023 AF staging in lib/af-stages-2023-v839.js.
// The dom keys mirror the browser renderer (views/group-v839.js) and
// META['af-stages-2023'].example.
//
// rhythmControlAbandoned is a SEPARATE field from pattern, because permanent AF is a decision
// rather than a duration. Clinical domain.

import { afStages2023 } from '../../lib/af-stages-2023-v839.js';

export default [
  {
    id: 'af-stages-2023',
    summary: 'Applies the 2023 stage-based classification of atrial fibrillation. Stage 1 at risk; 2 pre-AF; 3A paroxysmal within 7 days; 3B persistent beyond 7 days; 3C long-standing persistent beyond 12 months; 3D successful ablation; 4 permanent. PERMANENT IS A DECISION, not a duration - it means rhythm control is no longer pursued, at any duration. Stages 1 and 2 describe patients with no arrhythmia at all.',
    compute: afStages2023,
    fields: [
      { dom: 'afs-risk', arg: 'riskFactors', kind: 'boolean', required: false, label: 'Risk factors for AF present' },
      { dom: 'afs-predisposing', arg: 'predisposingFindings', kind: 'boolean', required: false, label: 'Structural or electrical predisposing findings' },
      { dom: 'afs-documented', arg: 'documentedAf', kind: 'boolean', required: false, label: 'Atrial fibrillation documented' },
      { dom: 'afs-pattern', arg: 'pattern', kind: 'enum', required: false, label: 'Pattern', values: ['paroxysmal', 'persistent', 'long-standing-persistent'] },
      { dom: 'afs-ablation', arg: 'freeAfterAblation', kind: 'boolean', required: false, label: 'Free from AF after ablation' },
      { dom: 'afs-abandoned', arg: 'rhythmControlAbandoned', kind: 'boolean', required: false, label: 'No further attempts at rhythm control' },
    ],
  },
];

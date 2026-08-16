// spec-v740 MCP adapter: Walch classification of glenoid morphology in
// lib/walch-glenoid-v740.js. The dom keys mirror the browser renderer
// (views/group-v740.js) and META['walch-glenoid'].example. A decision-logic classifier
// (returns a type code A1..D) over the humeral-head position, retroversion, concavity,
// erosion, and a dysplastic flag. Clinical domain.

import { walchGlenoid } from '../../lib/walch-glenoid-v740.js';

export default [
  {
    id: 'walch-glenoid',
    summary: "Walch classification of glenoid morphology in primary glenohumeral osteoarthritis (Walch 1999; Bercik 2016): centered head = A (A1 minor central erosion, A2 major); posterior subluxation = B (B1 no biconcavity, B2 biconcave, B3 monoconcave with >= 15 deg retroversion or >= 70% subluxation); dysplastic retroversion > 25 deg = C; anterior subluxation or anteversion = D.",
    compute: walchGlenoid,
    fields: [
      { dom: 'walch-sublux', arg: 'subluxation', kind: 'enum', values: ['centered', 'posterior', 'anterior'], required: true, label: 'Humeral-head position (centered / posterior / anterior)' },
      { dom: 'walch-retro', arg: 'retroversion', kind: 'number', required: true, label: 'Glenoid retroversion (degrees, anteversion negative)', unit: 'deg' },
      { dom: 'walch-conc', arg: 'concavity', kind: 'enum', values: ['single', 'biconcave'], required: true, label: 'Glenoid concavity (single / biconcave)' },
      { dom: 'walch-eros', arg: 'erosion', kind: 'enum', values: ['minor', 'major'], required: true, label: 'Central erosion severity (minor / major)' },
      { dom: 'walch-dys', arg: 'dysplastic', kind: 'bool', required: false, label: 'Retroversion is dysplastic (congenital, not erosion-caused)' },
    ],
  },
];

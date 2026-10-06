// spec-v1550 MCP adapter: vitamin A dose for a child by reason in lib/vitamin-a-dose-child-v1550.js.
// The dom keys mirror views/group-v1550.js and META['vitamin-a-dose-child'].example. Clinical domain.

import * as V from '../../lib/vitamin-a-dose-child-v1550.js';

export default [
  {
    id: 'vitamin-a-dose-child',
    summary: 'Gives the WHO vitamin A dose for a child under 5 by reason. Routine supplementation, the IMCI persistent-diarrhea dose, the 2-day measles course, or the 3-dose course for eye signs, with capsule counts and the holds.',
    compute: V.vitaminADoseChild,
    fields: [
      { dom: 'va-reason', arg: 'reason', kind: 'enum', required: true, label: 'Reason', values: V.REASON_OPTIONS.map((d) => d.value) },
      { dom: 'va-age', arg: 'age', kind: 'number', required: true, label: 'Age in months', min: 0, max: 60 },
      { dom: 'va-recent', arg: 'recent', kind: 'enum', label: 'Vitamin A dose in the past month (routine, diarrhea)', values: V.YES_NO.map((d) => d.value) },
      { dom: 'va-rutf', arg: 'rutf', kind: 'enum', label: 'On RUTF (routine, diarrhea)', values: V.YES_NO.map((d) => d.value) },
    ],
  },
];

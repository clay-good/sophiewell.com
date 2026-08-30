// spec-v902 MCP adapter: medical adhesive-related skin injury in lib/marsi-v902.js. The dom keys
// mirror the browser renderer (views/group-v902.js) and META.marsi.example.
//
// Persistence at 30 minutes is the criterion, not the appearance. Clinical domain.

import { marsi } from '../../lib/marsi-v902.js';

export default [
  {
    id: 'marsi',
    summary: 'Records a medical adhesive-related skin injury against the 2013 consensus statement. The defining criterion is erythema or another skin abnormality PERSISTING 30 MINUTES OR MORE after the adhesive is removed, and the injuries fall in three families: mechanical, covering skin stripping, tension injury or blister and skin tear; dermatitis, covering irritant and allergic reactions; and other, covering maceration and folliculitis. THE THIRTY-MINUTE RULE IS THE CRITERION, so erythema that fades within half an hour is not an injury. IRRITANT AND ALLERGIC REACTIONS ARE TOLD APART BY DISTRIBUTION AND TIMING, since an irritant one stays inside the adhesive footprint and an allergic one extends beyond it. A SKIN TEAR FROM ADHESIVE REMOVAL IS BOTH THINGS AT ONCE and should be recorded twice. It is mostly a technique problem.',
    compute: marsi,
    fields: [
      { dom: 'ma-persiststhirtyminutes', arg: 'persistsThirtyMinutes', kind: 'boolean', required: false, label: 'The skin change persists 30 minutes or more after the adhesive was removed (the diagnostic criterion)' },
      { dom: 'ma-injury', arg: 'injury', kind: 'enum', required: false, label: 'What was seen (leave empty if not yet categorized)', values: ['skin-stripping', 'tension-injury', 'skin-tear', 'irritant-dermatitis', 'allergic-dermatitis', 'maceration', 'folliculitis'] },
    ],
  },
];

// spec-v524 MCP wave: adapter for the Gray-Weale carotid plaque echogenicity type in
// lib/gray-weale-v524.js. The dom key mirrors the browser renderer (views/group-v524.js) and
// META['gray-weale'].example: gw-type maps to the lib arg `type`.
//
// The enum values are '1'-'4'. The lib also accepts roman numerals, but the adapter publishes only the
// arabic forms so an agent reading the schema emits one canonical shape.
//
// The field label carries each type's APPEARANCE rather than the bare numeral, because an agent choosing a
// type is describing an image and needs the descriptors, not the ordinal.
//
// The summary leads with the fact that decides whether a caller uses this correctly: it is a DIFFERENT AXIS
// from the degree of stenosis. An agent that already has a NASCET percentage must not read this as a second
// severity number, and an agent that has this must not report it as a stenosis. The summary also states,
// twice over, that plaque type is NOT an indication for carotid endarterectomy or stenting - the trials that
// established when to intervene selected on stenosis and symptom status, not echogenicity - because "type 1
// echolucent plaque" is exactly the phrase an agent would otherwise turn into a surgical recommendation. The
// echolucent-symptomatic association is given at group level with no stroke rate attached to any type.

import * as G from '../../lib/gray-weale-v524.js';

export default [
  {
    id: 'gray-weale',
    summary: 'The Gray-Weale classification of carotid plaque echogenicity on B-mode ultrasound, in four types: type 1 uniformly echolucent, typically beneath a thin echogenic cap; type 2 predominantly echolucent with small areas of echogenicity; type 3 predominantly echogenic with small areas of echolucency; type 4 uniformly echogenic, including the extensively calcified plaque. Types 1 and 2 are grouped as echolucent and types 3 and 4 as echogenic. This is a different axis from the degree of stenosis: NASCET measures how narrow the lumen is, this describes what the plaque appears to be made of, and the two are known to disagree, so neither substitutes for the other and this must not be reported as a stenosis. It is a grade read by eye, anchored to the vessel lumen for echolucency and the bright media-adventitia interface in the far wall for echogenicity, so it depends on gain settings and on the operator, which is why computerized grayscale-median measurement exists as an alternative; this tool records the visual type and does not compute a grayscale median. Dense calcification in a type 4 plaque can cast an acoustic shadow that hides plaque behind it. Echolucent plaque has been associated with symptomatic disease in published series, which is a group-level association rather than a risk for an individual patient, so no stroke rate is attached to a type. The plaque type is not an indication for carotid endarterectomy or stenting: the trials that established when to intervene selected patients on degree of stenosis and symptom status, not on echogenicity, so a type 1 plaque is not a reason to operate and a type 4 plaque is not a reason not to.',
    compute: G.grayWeale,
    fields: [
      {
        dom: 'gw-type',
        arg: 'type',
        kind: 'enum',
        values: G.GRAY_WEALE_TYPES.map((t) => t.value),
        required: true,
        label: `The plaque's appearance on B-mode ultrasound [${G.GRAY_WEALE_TYPES.map((t) => `${t.value} = ${t.text}`).join(' ')}]`,
      },
    ],
  },
];

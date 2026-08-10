// spec-v702 MCP adapter: Edinburgh Claudication Questionnaire in
// lib/edinburgh-claudication-v702.js. The dom keys mirror the browser renderer
// (views/group-v702.js) and META['edinburgh-claudication'].example. Five booleans + a
// pain-site enum; decision logic returns a claudication classification and grade. Clinical.

import { edinburghClaudication } from '../../lib/edinburgh-claudication-v702.js';

export default [
  {
    id: 'edinburgh-claudication',
    summary: 'Edinburgh Claudication Questionnaire (Leng 1992): classifies leg pain as definite / atypical / not claudication. Character criteria (all required): pain on walking, NOT beginning at rest, worse uphill/hurrying, relieved within ~10 min of stopping. Calf involvement = definite; thigh/buttock only = atypical; non-vascular sites or a failed criterion = not claudication. Grade I if pain not at ordinary pace, grade II if it is.',
    compute: edinburghClaudication,
    fields: [
      { dom: 'ecq-walking', arg: 'painOnWalking', kind: 'boolean', required: false, label: 'Pain or discomfort in the leg(s) on walking' },
      { dom: 'ecq-rest', arg: 'painAtRest', kind: 'boolean', required: false, label: 'The pain begins while standing still or sitting' },
      { dom: 'ecq-uphill', arg: 'painUphillHurry', kind: 'boolean', required: false, label: 'Pain when walking uphill or hurrying' },
      { dom: 'ecq-relief', arg: 'reliefWithin10', kind: 'boolean', required: false, label: 'Pain relieved within about 10 minutes of standing still' },
      { dom: 'ecq-ordinary', arg: 'painOrdinaryPace', kind: 'boolean', required: false, label: 'Pain also occurs at an ordinary walking pace on the level' },
      { dom: 'ecq-site', arg: 'painSite', kind: 'enum', values: ['calf', 'thigh-buttock', 'other'], required: true, label: 'Main pain site' },
    ],
  },
];

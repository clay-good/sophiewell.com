// spec-v692 MCP adapter: Conley Fall Risk Scale in lib/conley-fall-risk-v692.js.
// The dom keys mirror the browser renderer (views/group-v692.js) and
// META['conley-fall-risk'].example. Six booleans; a weighted count 0-10 screens fall risk.
// Clinical domain.

import { conleyFallRisk } from '../../lib/conley-fall-risk-v692.js';

export default [
  {
    id: 'conley-fall-risk',
    summary: 'Conley Fall Risk Scale (Conley 1999): six-item nursing fall-risk screen. Interview: fell in last 3 months (2), dizziness/vertigo (1), urgency/incontinence to bathroom (1). Observation: impaired judgment / lack of safety awareness (3), agitation (2), impaired gait (1). Total 0-10; >= 2 (or any fall during the stay) triggers fall-prevention strategies.',
    compute: conleyFallRisk,
    fields: [
      { dom: 'conley-falls', arg: 'previousFalls', kind: 'boolean', required: false, label: 'Fallen in the last 3 months' },
      { dom: 'conley-dizzy', arg: 'dizziness', kind: 'boolean', required: false, label: 'Dizziness or vertigo' },
      { dom: 'conley-incont', arg: 'incontinence', kind: 'boolean', required: false, label: 'Urgency / incontinence on the way to the bathroom' },
      { dom: 'conley-judgment', arg: 'impairedJudgment', kind: 'boolean', required: false, label: 'Impaired judgment / lack of safety awareness' },
      { dom: 'conley-agit', arg: 'agitation', kind: 'boolean', required: false, label: 'Agitation' },
      { dom: 'conley-gait', arg: 'impairedGait', kind: 'boolean', required: false, label: 'Impaired gait' },
    ],
  },
];

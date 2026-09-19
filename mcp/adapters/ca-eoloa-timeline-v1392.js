// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as CAE from '../../lib/ca-eoloa-timeline-v1392.js';

const C = ['met', 'not-met'];

export default [
  {
    id: 'ca-eoloa-timeline',
    summary: 'Checks California End of Life Option Act request timing and witnesses under Health and Safety Code 443.3. The two oral requests must be at least 48 hours apart, a gap SB 380 cut from 15 days in 2022. Only one of the two witnesses to the written request may be a relative or heir, only one may be tied to the treating health care entity, and none may be the attending, consulting physician, or mental health specialist. Eligibility enters as physician findings.',
    compute: CAE.caEoloaTimeline,
    fields: [
      { dom: 'cae-oral1', arg: 'oral1', kind: 'string', required: true, label: 'First oral request (YYYY-MM-DDTHH:MM)' },
      { dom: 'cae-oral2', arg: 'oral2', kind: 'string', label: 'Second oral request (YYYY-MM-DDTHH:MM)' },
      { dom: 'cae-w1', arg: 'witness1', kind: 'enum', label: 'Witness 1', values: CAE.WITNESS.map((x) => x.value) },
      { dom: 'cae-w2', arg: 'witness2', kind: 'enum', label: 'Witness 2', values: CAE.WITNESS.map((x) => x.value) },
      { dom: 'cae-adult', arg: 'adult', kind: 'enum', label: 'Adult (18 or older)', values: C },
      { dom: 'cae-capacity', arg: 'capacity', kind: 'enum', label: 'Capacity to make medical decisions', values: C },
      { dom: 'cae-terminal', arg: 'terminal', kind: 'enum', label: 'Terminal disease, death expected within six months', values: C },
      { dom: 'cae-resident', arg: 'resident', kind: 'enum', label: 'California resident, with proof', values: C },
      { dom: 'cae-self', arg: 'selfAdminister', kind: 'enum', label: 'Able to self-administer', values: C },
    ],
  },
];

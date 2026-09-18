// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as C17 from '../../lib/ca-ed-psych-detention-1799-v1389.js';

export default [
  {
    id: 'ca-ed-psych-detention-1799',
    summary: "California detention in an emergency department that is not a designated 5150 facility: 24 hours at most, credited to a later 5150. Under Health and Safety Code 1799.111, as amended by SB 43, such a hospital may detain a person who is a danger to self or others or gravely disabled for no more than 24 hours, and past 8 hours only while continuing care delays transfer and the person still meets the criteria. Placement efforts must begin no later than the time the person becomes medically stable for transfer. The time detained, up to 24 hours, is credited against a later 5150 hold, so the 72 hours are shortened by it.",
    compute: C17.caEdPsychDetention1799,
    fields: [
      { dom: 'c17-detained', arg: 'detained', kind: 'string', required: true, label: 'Detention began (YYYY-MM-DDTHH:MM)' },
      { dom: 'c17-stable', arg: 'stable', kind: 'string', label: 'Medically stable for transfer (YYYY-MM-DDTHH:MM)' },
      { dom: 'c17-contact', arg: 'firstContact', kind: 'string', label: 'First placement contact (YYYY-MM-DDTHH:MM)' },
      { dom: 'c17-5150', arg: 'hold5150', kind: 'string', label: '5150 written (YYYY-MM-DDTHH:MM)' },
    ],
  },
];

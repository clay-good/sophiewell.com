// spec-v1398: MCP adapter. The dom keys mirror views/group-v1398.js and this tile's META example.

import * as VF from '../../lib/ca-valley-fever-test-prompt-v1398.js';

export default [
  {
    id: 'ca-valley-fever-test-prompt',
    summary: 'Says when California\'s January 2024 CDPH advisory calls for Valley fever testing in a respiratory illness, and how. The prompts are living, working, or travelling where it occurs; outdoor dust or dirt; symptoms for a week or longer; or no response to CAP treatment. Order EIA, immunodiffusion, and complement fixation serology, repeat in 2 to 4 weeks if suspicion stays high, and send PCR and culture when severe.',
    compute: VF.caValleyFeverTestPrompt,
    fields: [
      { dom: 'vf-resp', arg: 'respiratory', kind: 'enum', required: true, label: 'Pneumonia or respiratory illness', values: ['yes', 'no'] },
      { dom: 'vf-endemic', arg: 'endemic', kind: 'enum', label: 'Lives, works, or travels where cocci occurs', values: ['yes', 'no'] },
      { dom: 'vf-dust', arg: 'dust', kind: 'enum', label: 'Exposed to outdoor dust or dirt', values: ['yes', 'no'] },
      { dom: 'vf-week', arg: 'week', kind: 'enum', label: 'Symptomatic a week or longer', values: ['yes', 'no'] },
      { dom: 'vf-noresp', arg: 'noResponse', kind: 'enum', label: 'Not responding to CAP treatment', values: ['yes', 'no'] },
      { dom: 'vf-severe', arg: 'severe', kind: 'enum', label: 'Hospitalized, suspected severe disease', values: ['yes', 'no'] },
    ],
  },
];

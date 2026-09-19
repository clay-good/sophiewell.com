// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as NYM from '../../lib/ny-maid-timeline-v1392.js';

export default [
  {
    id: 'ny-maid-timeline',
    summary: 'Tracks the New York Medical Aid in Dying steps under Public Health Law Article 28-F and the five-day wait to fill. It needs a recorded oral request, a written request with two adult witnesses, and the attending, consulting, and mental health confirmations. No prescription date is shown until all are entered. A prescription may not be filled until five days after it is written, unless the attending confirms death may come sooner. Neither witness may be a relative, heir, facility worker, domestic partner, proxy agent, or power of attorney agent.',
    compute: NYM.nyMaidTimeline,
    fields: [
      { dom: 'nym-oral', arg: 'oral', kind: 'string', label: 'Recorded oral request (YYYY-MM-DD)' },
      { dom: 'nym-written', arg: 'written', kind: 'string', label: 'Written request signed (YYYY-MM-DD)' },
      { dom: 'nym-w1', arg: 'witness1', kind: 'enum', label: 'Witness 1', values: NYM.WITNESS.map((x) => x.value) },
      { dom: 'nym-w2', arg: 'witness2', kind: 'enum', label: 'Witness 2', values: NYM.WITNESS.map((x) => x.value) },
      { dom: 'nym-attending', arg: 'attending', kind: 'string', label: 'Attending physician\'s determination (YYYY-MM-DD)' },
      { dom: 'nym-consulting', arg: 'consulting', kind: 'string', label: 'Consulting physician\'s confirmation (YYYY-MM-DD)' },
      { dom: 'nym-mh', arg: 'mentalHealth', kind: 'string', label: 'Mental health professional\'s confirmation (YYYY-MM-DD)' },
      { dom: 'nym-rx', arg: 'prescribed', kind: 'string', label: 'Prescription written (YYYY-MM-DDTHH:MM)' },
      { dom: 'nym-sooner', arg: 'dieSooner', kind: 'enum', label: 'Attending confirms death may come within five days', values: ['yes', 'no'] },
    ],
  },
];

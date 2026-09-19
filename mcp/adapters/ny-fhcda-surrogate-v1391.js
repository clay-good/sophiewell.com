// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as FH from '../../lib/ny-fhcda-surrogate-v1391.js';

export default [
  {
    id: 'ny-fhcda-surrogate',
    summary: 'Names the New York surrogate for an adult without capacity under the Family Health Care Decisions Act (PHL 2994-d). A health care proxy agent decides first, and a person with an Article 17-A guardian follows SCPA 1750-b instead. Otherwise the highest available class decides: an Article 81 guardian, then a spouse or domestic partner (who rank together), an adult child, a parent, an adult sibling, and a close friend. The two standards for refusing life-sustaining treatment are stated, not applied.',
    compute: FH.nyFhcdaSurrogate,
    fields: [
      { dom: 'fh-proxy', arg: 'proxy', kind: 'enum', required: true, label: 'Health care proxy agent available', values: ['yes', 'no'] },
      { dom: 'fh-17a', arg: 'article17a', kind: 'enum', label: 'Has an SCPA Article 17-A guardian', values: ['yes', 'no'] },
      { dom: 'fh-guardian', arg: 'guardian', kind: 'enum', label: '(a) Article 81 guardian', values: ['yes', 'no'] },
      { dom: 'fh-spouse', arg: 'spouse', kind: 'enum', label: '(b) Spouse or domestic partner', values: ['yes', 'no'] },
      { dom: 'fh-child', arg: 'child', kind: 'enum', label: '(c) Adult son or daughter', values: ['yes', 'no'] },
      { dom: 'fh-parent', arg: 'parent', kind: 'enum', label: '(d) Parent', values: ['yes', 'no'] },
      { dom: 'fh-sibling', arg: 'sibling', kind: 'enum', label: '(e) Adult brother or sister', values: ['yes', 'no'] },
      { dom: 'fh-friend', arg: 'friend', kind: 'enum', label: '(f) Close friend', values: ['yes', 'no'] },
    ],
  },
];

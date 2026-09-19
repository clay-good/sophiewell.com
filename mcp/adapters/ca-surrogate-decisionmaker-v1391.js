// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as CAS from '../../lib/ca-surrogate-decisionmaker-v1391.js';

export default [
  {
    id: 'ca-surrogate-decisionmaker',
    summary: 'Finds who decides for a California patient without capacity under Probate Code 4711 and 4712, and never ranks the family. Section 4712(a) is a mandatory order: a surrogate the patient named, then an agent under an advance directive, then a conservator. With none, 4712(b) lets the provider choose from any available spouse or partner, adult child, parent, sibling, grandchild, or relative or close friend, using the statute\'s factors. That list is unranked since AB 2338 (2023).',
    compute: CAS.caSurrogateDecisionmaker,
    fields: [
      { dom: 'cas-designated', arg: 'designated', kind: 'enum', required: true, label: 'Surrogate the patient named (4711)', values: ['yes', 'no'] },
      { dom: 'cas-agent', arg: 'agent', kind: 'enum', label: 'Advance directive or power of attorney agent', values: ['yes', 'no'] },
      { dom: 'cas-conservator', arg: 'conservator', kind: 'enum', label: 'Conservator or guardian with health care authority', values: ['yes', 'no'] },
      { dom: 'cas-spouse', arg: 'spouse', kind: 'enum', label: 'Spouse or domestic partner', values: ['yes', 'no'] },
      { dom: 'cas-child', arg: 'adultChild', kind: 'enum', label: 'Adult child', values: ['yes', 'no'] },
      { dom: 'cas-parent', arg: 'parent', kind: 'enum', label: 'Parent', values: ['yes', 'no'] },
      { dom: 'cas-sibling', arg: 'sibling', kind: 'enum', label: 'Adult sibling', values: ['yes', 'no'] },
      { dom: 'cas-grandchild', arg: 'grandchild', kind: 'enum', label: 'Adult grandchild', values: ['yes', 'no'] },
      { dom: 'cas-relative', arg: 'relativeFriend', kind: 'enum', label: 'Adult relative or close personal friend', values: ['yes', 'no'] },
    ],
  },
];

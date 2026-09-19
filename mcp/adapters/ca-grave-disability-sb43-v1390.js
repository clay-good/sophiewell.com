// spec-v1390: MCP adapter. The dom keys mirror views/group-v1390.js and this tile's META example.
// A blank need is "not assessed", never "able to provide".

import * as GD from '../../lib/ca-grave-disability-sb43-v1390.js';

const N = ['unable', 'able'];

export default [
  {
    id: 'ca-grave-disability-sb43',
    summary: 'Whether documented findings meet California\'s "gravely disabled" definition as SB 43 rewrote it (WIC 5008(h)). A mental health disorder, a severe substance use disorder, or both, leaving the person unable to provide for food, clothing, shelter, personal safety, or necessary medical care. Mild or moderate substance use disorder does not qualify, and intellectual disability alone is excluded. Chronic alcoholism counts for 5250 and conservatorship but not a 5150 hold. The county deferral option ended January 1, 2026.',
    compute: GD.caGraveDisabilitySb43,
    fields: [
      { dom: 'gd-cause', arg: 'cause', kind: 'enum', required: true, label: 'Cause', values: GD.CAUSES.map((c) => c.value) },
      { dom: 'gd-hold', arg: 'hold', kind: 'enum', label: 'Hold or proceeding', values: GD.HOLDS.map((h) => h.value) },
      { dom: 'gd-food', arg: 'food', kind: 'enum', label: 'Food', values: N },
      { dom: 'gd-clothing', arg: 'clothing', kind: 'enum', label: 'Clothing', values: N },
      { dom: 'gd-shelter', arg: 'shelter', kind: 'enum', label: 'Shelter', values: N },
      { dom: 'gd-safety', arg: 'personalSafety', kind: 'enum', label: 'Personal safety', values: N },
      { dom: 'gd-medical', arg: 'medicalCare', kind: 'enum', label: 'Necessary medical care', values: N },
      { dom: 'gd-result', arg: 'result', kind: 'enum', label: 'The inability results from the condition', values: ['met', 'not-met'] },
    ],
  },
];

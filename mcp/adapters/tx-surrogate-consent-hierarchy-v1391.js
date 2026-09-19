// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as TXS from '../../lib/tx-surrogate-consent-hierarchy-v1391.js';

export default [
  {
    id: 'tx-surrogate-consent-hierarchy',
    summary: 'Finds who may consent for a Texas adult who cannot decide (HSC 313.004), and what no surrogate may consent to. A guardian or medical power of attorney agent decides first, then the spouse, adult children, parents, and nearest living relative in that order. No surrogate may consent to voluntary inpatient mental health care, ECT, or naming another surrogate. For a jail inmate, add psychotropics, involuntary inpatient care, and competency restoration, and a 120-day limit.',
    compute: TXS.txSurrogateConsentHierarchy,
    fields: [
      { dom: 'txs-treatment', arg: 'treatment', kind: 'enum', required: true, label: 'Treatment', values: TXS.TREATMENTS.map((t) => t.value) },
      { dom: 'txs-inmate', arg: 'inmate', kind: 'enum', required: true, label: 'County or municipal jail inmate', values: ['yes', 'no'] },
      { dom: 'txs-guardian', arg: 'guardian', kind: 'enum', label: 'Legal guardian available', values: ['yes', 'no'] },
      { dom: 'txs-mpoa', arg: 'mpoa', kind: 'enum', label: 'Medical power of attorney agent available', values: ['yes', 'no'] },
      { dom: 'txs-spouse', arg: 'spouse', kind: 'enum', label: 'Spouse available', values: ['yes', 'no'] },
      { dom: 'txs-children', arg: 'children', kind: 'enum', label: 'Adult children available', values: ['yes', 'no'] },
      { dom: 'txs-parents', arg: 'parents', kind: 'enum', label: 'Parents available', values: ['yes', 'no'] },
      { dom: 'txs-relative', arg: 'relative', kind: 'enum', label: 'Nearest living relative available', values: ['yes', 'no'] },
    ],
  },
];

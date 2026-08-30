// spec-v898 MCP adapter: elective surgery timing after coronary stenting in
// lib/pci-surgery-timing-v898.js. The dom keys mirror the browser renderer
// (views/group-v898.js) and META['pci-surgery-timing'].example.
//
// The STENT TYPE is the input that moves the answer most. Clinical domain.

import { pciSurgeryTiming } from '../../lib/pci-surgery-timing-v898.js';

export default [
  {
    id: 'pci-surgery-timing',
    summary: 'Compares the interval since a coronary intervention against the published minimum delay before elective noncardiac surgery. Balloon angioplasty without a stent: at least 14 days. Bare-metal stent: at least 30 days. Drug-eluting stent: optimally at least 6 months, with surgery after 3 months considered when the risk of further delay outweighs the risk of stent thrombosis. THE STENT TYPE CHANGES THE ANSWER BY A FACTOR OF TWELVE, and which was placed is the first thing to establish. THE INTERVAL IS ABOUT WHEN TO OPERATE, NOT WHETHER TO STOP THE ANTIPLATELET: where surgery permits, aspirin is continued, and stopping both agents early is the exposure the interval exists to avoid. URGENT AND EMERGENCY SURGERY IS NOT DELAYED BY THESE.',
    compute: pciSurgeryTiming,
    fields: [
      { dom: 'pci-procedure', arg: 'procedure', kind: 'enum', required: false, label: 'What was done', values: ['des', 'bms', 'balloon'] },
      { dom: 'pci-dayssince', arg: 'daysSince', kind: 'number', required: false, label: 'Days since the coronary intervention', unit: 'days' },
      { dom: 'pci-urgentoremergency', arg: 'urgentOrEmergency', kind: 'boolean', required: false, label: 'The surgery is urgent or an emergency (these intervals do not govern it)' },
    ],
  },
];

// spec-v1633 MCP adapter: fentanyl-patch-initial-dose in lib/fentanyl-patch-initial-dose-v1633.js. The
// dom keys mirror views/group-v1633.js and META['fentanyl-patch-initial-dose'].example. Clinical
// domain. One label row (fentanyl transdermal system). One way: there is no reverse conversion.

import * as FP from '../../lib/fentanyl-patch-initial-dose-v1633.js';

export default [
  {
    id: 'fentanyl-patch-initial-dose',
    summary: 'The starting fentanyl patch strength the FDA label\'s tables give for a prior opioid. From the current opioid, its 24-hour dose and whether the patient is opioid tolerant, it reports the patch strength and the band matched, or says the label gives none (not opioid tolerant, below or above the table, or in a gap the label prints). One way only: the label forbids using the tables to convert from the patch to another opioid.',
    compute: FP.fentanylPatchInitialDose,
    fields: [
      { dom: 'fpd-drug', arg: 'drug', kind: 'enum', required: true, values: FP.DRUGS.map((d) => d.value), label: 'Current opioid and route' },
      { dom: 'fpd-mg', arg: 'dailyMg', kind: 'number', required: true, label: 'Total dose over 24 hours', unit: 'mg' },
      { dom: 'fpd-tolerant', arg: 'tolerant', kind: 'enum', required: true, values: FP.TOLERANT.map((d) => d.value), label: 'Opioid tolerant by the label\'s definition: yes or no' },
    ],
  },
];

// spec-v1635 MCP adapter: nuc-med-breastfeeding-interruption in
// lib/nuc-med-breastfeeding-interruption-v1635.js. The dom keys mirror views/group-v1635.js and
// META['nuc-med-breastfeeding-interruption'].example. Clinical domain.

import * as BF from '../../lib/nuc-med-breastfeeding-interruption-v1635.js';

export default [
  {
    id: 'nuc-med-breastfeeding-interruption',
    summary: 'Breastfeeding interruption after a radiopharmaceutical, from NRC Regulatory Guide 8.39. For the product and activity given, it says whether instructions and a record are required and the guide\'s recommended duration of interruption (Table 3). The durations aim at an infant dose below 1 mSv; it does not estimate the infant\'s dose.',
    compute: BF.nucMedBreastfeedingInterruption,
    fields: [
      { dom: 'nbi-agent', arg: 'agent', kind: 'enum', required: true, values: BF.AGENTS.map((a) => a.value), label: 'Radiopharmaceutical' },
      { dom: 'nbi-activity', arg: 'activity', kind: 'number', label: 'Administered activity (not needed for the rows with a duration only)' },
      { dom: 'nbi-unit', arg: 'unit', kind: 'enum', values: BF.UNITS.map((u) => u.value), label: 'Activity unit' },
    ],
  },
];

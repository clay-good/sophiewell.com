// spec-v890 MCP adapter: the methacholine challenge interpretation in lib/methacholine-v890.js.
// The dom keys mirror the browser renderer (views/group-v890.js) and META.methacholine.example.
//
// The cutpoints depend on WHICH metric was reported, so pass the metric. Clinical domain.

import { methacholine } from '../../lib/methacholine-v890.js';

export default [
  {
    id: 'methacholine',
    summary: 'Reads a methacholine challenge against the published cutpoints for whichever metric was reported. PD20, the dose producing a 20 percent fall in FEV1, is the metric the 2017 technical standard uses: above 400 micrograms is normal, 100 to 400 borderline, 25 to 100 mild bronchial hyperresponsiveness, and below 25 moderate to severe. PC20, the legacy concentration, reads as above 16 mg/mL normal, 4 to 16 borderline, 1 to 4 mild, and below 1 moderate to severe. THE 2017 STANDARD MOVED FROM CONCENTRATION TO DOSE because a concentration depends on the nebulizer and protocol and is not comparable between laboratories. THE NEGATIVE TEST IS THE INFORMATIVE ONE; a positive test does not diagnose asthma on its own. A FALSELY NEGATIVE TEST IS USUALLY A MEDICATION THAT WAS NOT WITHHELD.',
    compute: methacholine,
    fields: [
      { dom: 'mc-metric', arg: 'metric', kind: 'enum', required: false, label: 'Which metric was reported', values: ['pd20', 'pc20'] },
      { dom: 'mc-value', arg: 'value', kind: 'number', required: true, label: 'The reported value, in micrograms for PD20 or mg/mL for PC20' },
      { dom: 'mc-medicationswithheld', arg: 'medicationsWithheld', kind: 'boolean', required: false, label: 'Medications were withheld for the required intervals (a negative result depends on this)' },
    ],
  },
];

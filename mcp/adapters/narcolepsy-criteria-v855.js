// spec-v855 MCP adapter: the ICSD-3 narcolepsy criteria in lib/narcolepsy-criteria-v855.js.
// The dom keys mirror the browser renderer (views/group-v855.js) and
// META['narcolepsy-criteria'].example.
//
// cataplexy alone never returns a type: it has to be paired with the latency findings or
// replaced by a low hypocretin. Clinical domain.

import { narcolepsyCriteria } from '../../lib/narcolepsy-criteria-v855.js';

export default [
  {
    id: 'narcolepsy-criteria',
    summary: 'Applies the third International Classification of Sleep Disorders criteria for narcolepsy. Both types need daily irrepressible sleep or lapses into sleep for at least three months. Type 1 is met by cataplexy together with a mean sleep latency of 8 minutes or less and two or more sleep-onset REM periods, or by a spinal-fluid hypocretin-1 of 110 pg/mL or less on its own. Type 2 needs the same latency findings without cataplexy, with the hypocretin unmeasured or above the line and other causes excluded. CATAPLEXY ALONE IS NOT THE DIAGNOSIS, a REM period on the preceding overnight study may replace one of the two on the latency test, and a low hypocretin is type 1 whether or not there is cataplexy. It does not order a study or select treatment.',
    compute: narcolepsyCriteria,
    fields: [
      { dom: 'nar-sleepy', arg: 'dailySleepiness', kind: 'boolean', required: false, label: 'Daily irrepressible sleep or lapses into sleep for at least three months' },
      { dom: 'nar-cata', arg: 'cataplexy', kind: 'boolean', required: false, label: 'Cataplexy: brief loss of muscle tone triggered by emotion' },
      { dom: 'nar-latency', arg: 'meanSleepLatency', kind: 'number', required: false, label: 'Mean sleep latency on the latency test: the threshold is 8 or less', unit: 'minutes' },
      { dom: 'nar-soremp', arg: 'msltSoremps', kind: 'number', required: false, label: 'Sleep-onset REM periods on the latency test: the threshold is 2' },
      { dom: 'nar-psg', arg: 'psgSoremp', kind: 'boolean', required: false, label: 'A sleep-onset REM period on the overnight study, which may count as one of the two' },
      { dom: 'nar-hcrt', arg: 'hypocretin', kind: 'number', required: false, label: 'Hypocretin-1 in the spinal fluid: 110 or less is type 1 on its own', unit: 'pg/mL' },
      { dom: 'nar-excl', arg: 'othersExcluded', kind: 'boolean', required: false, label: 'Other causes excluded: too little sleep, obstructive apnea, a delayed sleep phase, medication' },
    ],
  },
];

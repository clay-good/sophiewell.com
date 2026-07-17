// spec-v388 MCP wave: adapter for the Brodsky tonsil grading scale in lib/brodsky-tonsil-v388.js. The dom
// key mirrors the browser renderer (views/group-v388.js) and META['brodsky-tonsil'].example. `grade` is
// an enum (0-4). The compute reports the grade and its oropharyngeal-width description. The example sets
// grade 3; its expected text quotes the "50-75%" band, echoed in the result, so it round-trips through
// the default makeToArgs with no custom toArgs.

import * as C from '../../lib/brodsky-tonsil-v388.js';

export default [
  {
    id: 'brodsky-tonsil',
    summary: 'Brodsky grading scale (Brodsky 1989) for palatine tonsil size (grades 0-4), by the percentage of the oropharyngeal width the tonsils occupy - the most validated tonsillar-hypertrophy classification, used in the assessment of pediatric sleep-disordered breathing. 0: tonsils within the tonsillar fossa; no obstruction. 1: occupy less than 25% of the oropharyngeal width. 2: 25-50%. 3: 50-75% (obstructive). 4: more than 75% ("kissing tonsils"; obstructive). Grades 0-2 are non-obstructive, 3-4 obstructive. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.brodskyTonsil,
    fields: [
      { dom: 'brodsky-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Brodsky grade' },
    ],
  },
];

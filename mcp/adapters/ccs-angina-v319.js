// spec-v319 MCP wave: adapter for the CCS angina grade in lib/ccs-angina-v319.js. The
// dom key mirrors the browser renderer (views/group-v319.js) and
// META['ccs-angina'].example. `grade` is an enum (the select values '1'-'4'; the compute
// also accepts roman I-IV). The compute reports the class (I-IV) and its standard
// definition. The example sets grade 2; its band carries the "2" example number, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/ccs-angina-v319.js';

export default [
  {
    id: 'ccs-angina',
    summary: 'Canadian Cardiovascular Society (CCS) grading of angina pectoris (Campeau 1976). Class I: ordinary activity does not cause angina (only strenuous/rapid/prolonged exertion). Class II: slight limitation — angina on hurrying, uphill, after meals, in cold, under stress, or walking > 2 blocks / > 1 flight at a normal pace. Class III: marked limitation — angina on walking 1-2 blocks or climbing 1 flight at a normal pace. Class IV: angina at rest or with any activity. The angina analog of the NYHA functional class. Reports the class the clinician has determined, not a diagnosis or a treatment order.',
    compute: C.ccsAngina,
    fields: [
      { dom: 'ccs-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4'], label: 'CCS angina class (1=I, 2=II, 3=III, 4=IV)' },
    ],
  },
];

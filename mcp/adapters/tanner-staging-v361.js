// spec-v361 MCP wave: adapter for Tanner staging / Sexual Maturity Rating in
// lib/tanner-staging-v361.js. The dom keys mirror the browser renderer (views/group-v361.js) and
// META['tanner-staging'].example. It is a TWO-field tile: `scale` (enum breast/genital/pubic) and
// `stage` (enum 1-5); both appear in the example so both are required. The compute reports the standard
// description for that scale + stage. The example sets scale breast, stage 2; its expected number (2)
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/tanner-staging-v361.js';

export default [
  {
    id: 'tanner-staging',
    summary: 'Tanner staging / Sexual Maturity Rating (Marshall & Tanner 1969/1970) — grades pubertal development on three scales (female breast, male genitalia, and pubic hair), each from stage 1 (prepubertal) to stage 5 (adult). Reports the standard description for the selected scale and stage. Whether a stage is early or late for age (precocious vs delayed puberty) is a clinician judgment; the stages themselves are descriptive, not a diagnosis, an age assessment, or a treatment decision.',
    compute: C.tannerStaging,
    fields: [
      { dom: 'tanner-scale', arg: 'scale', kind: 'enum', values: ['breast', 'genital', 'pubic'], label: 'Development scale', required: true },
      { dom: 'tanner-stage', arg: 'stage', kind: 'enum', values: ['1', '2', '3', '4', '5'], label: 'Tanner stage', required: true },
    ],
  },
];

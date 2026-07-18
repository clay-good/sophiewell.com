// spec-v424 MCP wave: adapter for the Bethesda thyroid cytopathology system in lib/bethesda-thyroid-v424.js.
// The dom key mirrors the browser renderer (views/group-v424.js) and META['bethesda-thyroid'].example.
// `category` is an enum (I..VI). The compute reports the category and its cytologic meaning. The example sets
// category IV; its expected text carries no numeric facts (the meaning is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/bethesda-thyroid-v424.js';

export default [
  {
    id: 'bethesda-thyroid',
    summary: 'The Bethesda System for Reporting Thyroid Cytopathology, the standardized six-category scheme a cytopathologist assigns to a thyroid fine-needle-aspiration (FNA), categories I/II/III/IV/V/VI. I: nondiagnostic or unsatisfactory. II: benign. III: atypia of undetermined significance (AUS/FLUS). IV: follicular neoplasm or suspicious for one. V: suspicious for malignancy. VI: malignant. Reports the category and its cytologic meaning, not the implied malignancy risk, the recommended management, or a diagnosis of thyroid cancer.',
    compute: C.bethesdaThyroid,
    fields: [
      { dom: 'bt-cat', arg: 'category', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Bethesda thyroid category' },
    ],
  },
];

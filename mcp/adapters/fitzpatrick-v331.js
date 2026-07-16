// spec-v331 MCP wave: adapter for the Fitzpatrick skin phototype in lib/fitzpatrick-v331.js.
// The dom key mirrors the browser renderer (views/group-v331.js) and
// META['fitzpatrick-skin-type'].example. `type` is an enum (I / II / III / IV / V / VI). The
// compute reports the phototype and its description. The example sets type III; its expected
// text is the phototype description (roman-graded, no numeric facts), so it round-trips through
// the default makeToArgs with no custom toArgs.

import * as F from '../../lib/fitzpatrick-v331.js';

export default [
  {
    id: 'fitzpatrick-skin-type',
    summary: 'Fitzpatrick skin phototype (Fitzpatrick 1988), the classification of constitutive skin color by UV sunburn/tan response. I: always burns, never tans. II: usually burns, tans minimally. III: sometimes burns, tans gradually. IV: burns minimally, tans well. V: rarely burns, tans darkly. VI: never burns, deeply pigmented. Lower types (I-II) have the highest photosensitivity and UV / skin-cancer risk. Used to guide sun protection, phototherapy dosing, and laser settings. Reports the phototype, not a diagnosis or a treatment order.',
    compute: F.fitzpatrick,
    fields: [
      { dom: 'fitz-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Fitzpatrick skin type' },
    ],
  },
];

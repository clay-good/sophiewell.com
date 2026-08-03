// spec-v629 wave 13: pregnancy dating (LMP / CRL / EDD). Bespoke deterministic
// composition in lib/preg-dating.js (the interactive view keeps its own
// clock-based "current GA" behavior). All three inputs are optional; pregnancyDating
// returns null when neither an LMP nor a positive CRL is supplied, surfacing as an
// INCOMPLETE result. A malformed date surfaces as COMPUTE_ERROR. Clinical domain.

import { pregnancyDating } from '../../lib/preg-dating.js';

export default [
  {
    id: 'preg-dating',
    summary: 'Pregnancy dating: LMP-derived EDD (Naegele), CRL-derived gestational age and EDD (Robinson-Fleming) at a given ultrasound date, and the LMP-vs-CRL discordance against ACOG redating thresholds.',
    compute: pregnancyDating,
    fields: [
      { dom: 'pd-lmp', arg: 'lmpIso', kind: 'string', required: false, label: 'LMP date (YYYY-MM-DD)' },
      { dom: 'pd-crl', arg: 'crlMm', kind: 'number', required: false, label: 'Ultrasound CRL (mm)' },
      { dom: 'pd-us', arg: 'ultrasoundDateIso', kind: 'string', required: false, label: 'Ultrasound date (YYYY-MM-DD)' },
    ],
  },
];

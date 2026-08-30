// spec-v922 MCP adapter: Cohen's kappa in lib/cohens-kappa-v922.js. The dom keys mirror the
// browser renderer (views/group-v922.js) and META['cohens-kappa'].example.
//
// The prevalence index comes back on every result, because that is what explains a low kappa
// beside high agreement. Clinical domain.

import { cohensKappa } from '../../lib/cohens-kappa-v922.js';

export default [
  {
    id: 'cohens-kappa',
    summary: 'Computes Cohen\'s kappa for two raters and a yes/no call, from the four counts of a 2x2 table. Kappa is observed agreement minus the agreement chance would give from the raters\' own margins, divided by one minus that. KAPPA IS NOT PERCENT AGREEMENT, and the gap between them is the point: two raters can agree on 95 of 100 cases and score a kappa near zero, because when almost every case falls in one category chance already predicts nearly all the agreement. That is the first kappa paradox, so the PREVALENCE INDEX is returned on every result rather than left in a footnote. A high BIAS INDEX means the disagreements run in a direction, one rater saying yes where the other says no systematically, which kappa alone cannot show. The strength-of-agreement labels -- slight, fair, moderate, substantial, almost perfect -- are a CONVENTION, NOT A STANDARD; Landis and Koch called their own divisions arbitrary. When every case falls in one category for both raters the denominator is zero and kappa is reported as undefined rather than as a number.',
    compute: cohensKappa,
    fields: [
      { dom: 'ck-bothyes', arg: 'bothYes', kind: 'number', required: true, label: 'Both raters said yes' },
      { dom: 'ck-firstyes', arg: 'firstYesSecondNo', kind: 'number', required: true, label: 'First said yes, second said no' },
      { dom: 'ck-secondyes', arg: 'firstNoSecondYes', kind: 'number', required: true, label: 'First said no, second said yes' },
      { dom: 'ck-bothno', arg: 'bothNo', kind: 'number', required: true, label: 'Both raters said no' },
    ],
  },
];

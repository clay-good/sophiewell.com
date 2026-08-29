// spec-v879 MCP adapter: the international consensus cancer cachexia definition in
// lib/cancer-cachexia-v879.js. The dom keys mirror the browser renderer (views/group-v879.js)
// and META['cancer-cachexia'].example.
//
// The percentage of weight lost does not settle this on its own. Clinical domain.

import { cancerCachexia } from '../../lib/cancer-cachexia-v879.js';

export default [
  {
    id: 'cancer-cachexia',
    summary: 'Applies the international consensus definition and stages of cancer cachexia, after Fearon and colleagues 2011. Cachexia is met by any one of weight loss above 5 percent over six months, a body mass index below 20 with weight loss above 2 percent, or sarcopenia with weight loss above 2 percent. Weight loss of 5 percent or less with anorexia or metabolic change, and none of those routes met, is precachexia. Refractory cachexia adds a cancer not responsive to treatment, a WHO performance status of 3 or 4, and an expected survival under three months. THE BODY MASS INDEX CHANGES THE THRESHOLD: 3 percent lost at a body mass index of 19 meets the definition and the same 3 percent at 30 does not, so the percentage alone never answers the question. THE CONSENSUS DEFINES CACHEXIA AS NOT FULLY REVERSIBLE BY NUTRITIONAL SUPPORT. REFRACTORY CACHEXIA IS DEFINED BY THE CANCER AND THE PERFORMANCE STATUS, NOT BY THE WEIGHT LOSS.',
    compute: cancerCachexia,
    fields: [
      { dom: 'cx-weightlosspercent', arg: 'weightLossPercent', kind: 'number', required: false, label: 'Weight loss over the past six months, percent of body weight', unit: '%' },
      { dom: 'cx-bmi', arg: 'bmi', kind: 'number', required: false, label: 'Body mass index (below 20 lowers the weight-loss threshold to 2 percent)', unit: 'kg/m2' },
      { dom: 'cx-sarcopenia', arg: 'sarcopenia', kind: 'boolean', required: false, label: 'Sarcopenia is present (also lowers the weight-loss threshold to 2 percent)' },
      { dom: 'cx-anorexiaormetabolicchange', arg: 'anorexiaOrMetabolicChange', kind: 'boolean', required: false, label: 'Anorexia or metabolic change is present (the precachexia stage)' },
      { dom: 'cx-cancernotresponsive', arg: 'cancerNotResponsive', kind: 'boolean', required: false, label: 'The cancer is not responsive to treatment, with active catabolism' },
      { dom: 'cx-performancestatusthreeorfour', arg: 'performanceStatusThreeOrFour', kind: 'boolean', required: false, label: 'WHO performance status 3 or 4' },
      { dom: 'cx-survivalunderthreemonths', arg: 'survivalUnderThreeMonths', kind: 'boolean', required: false, label: 'Expected survival under three months' },
    ],
  },
];

// spec-v183 MCP wave 7: adapters for the three lib/ebm-v163.js
// evidence-based-medicine calculators (Fagan post-test probability in odds
// space, the 2x2 diagnostic-test table, and ARR / RR / NNT from two event
// rates). dom keys mirror views/group-v163.js; the test counts and rates are
// numbers, the Fagan input mode is a two-value enum.

import * as F from '../../lib/ebm-v163.js';

export default [
  {
    id: 'fagan-post-test',
    summary: 'Fagan post-test probability from a pre-test probability and a likelihood ratio (or sensitivity / specificity), computed in odds space.',
    compute: F.faganPostTest,
    fields: [
      { dom: 'fagan-mode', arg: 'mode', kind: 'enum', values: ['lr', 'sensspec'], required: true, label: 'Input mode' },
      { dom: 'fagan-pretest', arg: 'pretest', kind: 'number', required: true, label: 'Pre-test probability (0-100, exclusive)', unit: '%' },
      { dom: 'fagan-lr', arg: 'lr', kind: 'number', required: false, label: 'Likelihood ratio (likelihood-ratio mode)' },
      { dom: 'fagan-sens', arg: 'sens', kind: 'number', required: false, label: 'Sensitivity (sens/spec mode)', unit: '%' },
      { dom: 'fagan-spec', arg: 'spec', kind: 'number', required: false, label: 'Specificity (sens/spec mode)', unit: '%' },
    ],
  },
  {
    id: 'diagnostic-2x2',
    summary: 'Sensitivity, specificity, PPV / NPV, accuracy and LR+/- from a 2x2 diagnostic table, with an optional Bayes prevalence adjustment of the predictive values.',
    compute: F.diagnostic2x2,
    fields: [
      { dom: 'dx-tp', arg: 'tp', kind: 'number', required: true, label: 'True positives' },
      { dom: 'dx-fp', arg: 'fp', kind: 'number', required: true, label: 'False positives' },
      { dom: 'dx-fn', arg: 'fn', kind: 'number', required: true, label: 'False negatives' },
      { dom: 'dx-tn', arg: 'tn', kind: 'number', required: true, label: 'True negatives' },
      { dom: 'dx-prev', arg: 'prevalence', kind: 'number', required: false, label: 'Target prevalence (recomputes PPV/NPV)', unit: '%' },
    ],
  },
  {
    id: 'nnt-arr',
    summary: 'Absolute and relative risk reduction, relative risk, and the number needed to treat / harm from a control and an experimental event rate.',
    compute: F.nntArr,
    fields: [
      { dom: 'nnt-cer', arg: 'cer', kind: 'number', required: true, label: 'Control event rate', unit: '%' },
      { dom: 'nnt-eer', arg: 'eer', kind: 'number', required: true, label: 'Experimental event rate', unit: '%' },
    ],
  },
];

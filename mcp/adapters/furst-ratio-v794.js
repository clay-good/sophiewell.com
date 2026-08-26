// spec-v794 MCP adapter: Furst U/P electrolyte ratio in lib/furst-ratio-v794.js.
// The dom keys mirror the browser renderer (views/group-v794.js) and
// META['furst-ratio'].example. Three mmol/L labs. Clinical domain.
//
// Distinct from efw-clearance: that one needs urine VOLUME and returns a clearance rate.
// This returns the dimensionless ratio and the published restriction volume that goes with it.

import { furstRatio } from '../../lib/furst-ratio-v794.js';

export default [
  {
    id: 'furst-ratio',
    summary: 'Furst formula, the urine-to-plasma electrolyte ratio (Furst 2000): (urine Na + urine K) / serum Na, all mmol/L. Predicts whether fluid restriction can raise the serum sodium in SIADH. Under 0.5, restrict to 1000 mL/day; 0.5 to 1.0, restrict to 500 mL/day; above 1.0 no electrolyte-free water is being excreted so restriction alone is unlikely to help however tight. Distinct from electrolyte-free water clearance, which needs urine volume and returns a rate.',
    compute: furstRatio,
    fields: [
      { dom: 'furst-una', arg: 'urineSodium', kind: 'number', required: true, label: 'Urine sodium', unit: 'mmol/L' },
      { dom: 'furst-uk', arg: 'urinePotassium', kind: 'number', required: true, label: 'Urine potassium', unit: 'mmol/L' },
      { dom: 'furst-sna', arg: 'serumSodium', kind: 'number', required: true, label: 'Serum sodium', unit: 'mmol/L' },
    ],
  },
];

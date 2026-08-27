// spec-v830 MCP adapter: alpha-1 antitrypsin interpretation in lib/aat-deficiency-v830.js.
// The dom keys mirror the browser renderer (views/group-v830.js) and
// META['aat-deficiency'].example. Units are NOT interconverted - see the lib. Clinical domain.

import { aatDeficiency } from '../../lib/aat-deficiency-v830.js';

export default [
  {
    id: 'aat-deficiency',
    summary: 'Interprets an alpha-1 antitrypsin level and genotype. Deficiency is under 100 mg/dL or 20 micromol/L. The classical 57 mg/dL or 11 micromol/L "protective threshold" has been REFUTED as a predictor of COPD risk - genotype, particularly PI*ZZ and rare equivalents, is what the evidence ties to disease. Units are compared against their own published thresholds and never interconverted.',
    compute: aatDeficiency,
    fields: [
      { dom: 'aat-level', arg: 'serumLevel', kind: 'number', required: false, label: 'Serum alpha-1 antitrypsin level' },
      { dom: 'aat-units', arg: 'units', kind: 'enum', required: false, label: 'Units', values: ['mg-dl', 'umol-l'] },
      { dom: 'aat-genotype', arg: 'genotype', kind: 'enum', required: false, label: 'Genotype', values: ['not-tested', 'mm', 'ms', 'ss', 'mz', 'sz', 'zz', 'rare-severe'] },
      { dom: 'aat-copd', arg: 'copd', kind: 'boolean', required: false, label: 'COPD' },
      { dom: 'aat-emphysema', arg: 'emphysema', kind: 'boolean', required: false, label: 'Emphysema' },
      { dom: 'aat-asthma', arg: 'irreversibleAsthma', kind: 'boolean', required: false, label: 'Incompletely reversible asthma' },
      { dom: 'aat-liver', arg: 'unexplainedLiverDisease', kind: 'boolean', required: false, label: 'Unexplained liver disease' },
      { dom: 'aat-sibling', arg: 'sibling', kind: 'boolean', required: false, label: 'Sibling with the deficiency' },
    ],
  },
];

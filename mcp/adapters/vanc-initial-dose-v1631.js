// spec-v1631 MCP adapter: vanc-initial-dose in lib/vanc-initial-dose-v1631.js. The dom keys mirror
// views/group-v1631.js and META['vanc-initial-dose'].example. Clinical domain. The 2020 consensus
// guideline, the Matzke and Rodvold equations, and the label's renal table as a label row.

import * as VI from '../../lib/vanc-initial-dose-v1631.js';

export default [
  {
    id: 'vanc-initial-dose',
    summary: 'A starting vancomycin regimen worked three ways, for the reader to compare. Adults: the loading dose on actual body weight with the 3,000 mg ceiling and its minimum infusion time, and three daily maintenance estimates side by side: Matzke clearance × target AUC24, the Rodvold dose equation, and the FDA label table. Children: the daily dose against the 2020 consensus guideline ranges and ceilings. Neonates: the label doses. It picks none.',
    compute: VI.vancInitialDose,
    fields: [
      { dom: 'vid-pop', arg: 'population', kind: 'enum', required: true, values: VI.POPULATIONS.map((p) => p.value), label: 'Population' },
      { dom: 'vid-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual body weight', unit: 'kg' },
      { dom: 'vid-crcl', arg: 'crcl', kind: 'number', label: 'Adults: creatinine clearance', unit: 'mL/min' },
      { dom: 'vid-load', arg: 'loadPerKg', kind: 'number', label: 'Loading dose (adults; optional in children)', unit: 'mg/kg' },
      { dom: 'vid-auc', arg: 'targetAuc', kind: 'number', label: 'Adults: target AUC24 (guideline 400 to 600)', unit: 'mg·h/L' },
      { dom: 'vid-age', arg: 'ageYears', kind: 'number', label: 'Children: age', unit: 'years' },
      { dom: 'vid-daily', arg: 'dailyPerKg', kind: 'number', label: 'Children: daily dose', unit: 'mg/kg/day' },
      { dom: 'vid-week', arg: 'week', kind: 'enum', values: VI.WEEKS.map((w) => w.value), label: 'Neonates: first week of life or later' },
    ],
  },
];

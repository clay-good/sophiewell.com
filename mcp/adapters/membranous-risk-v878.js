// spec-v878 MCP adapter: the KDIGO 2021 membranous nephropathy risk categories in
// lib/membranous-risk-v878.js. The dom keys mirror the browser renderer (views/group-v878.js)
// and META['membranous-risk'].example.
//
// It returns the risk category, which is what the guideline acts on. Clinical domain.

import { membranousRisk } from '../../lib/membranous-risk-v878.js';

export default [
  {
    id: 'membranous-risk',
    summary: 'Sorts membranous nephropathy into the four KDIGO 2021 risk categories. Low is a preserved eGFR with proteinuria below 3.5 g per day and a serum albumin above 3.0 g/dL, or proteinuria halved after six months of supportive therapy. Moderate is a preserved eGFR with proteinuria above 3.5 g per day and no high-risk feature. High is an eGFR below 60, or proteinuria above 8 g per day persisting beyond six months, or nephrotic-range proteinuria with a serum albumin below 2.5 g/dL, an anti-PLA2R above 50 RU/mL, or raised urinary alpha-1 microglobulin or IgG. Very high is a life-threatening nephrotic syndrome or a rapid unexplained fall in kidney function. THE CATEGORY, NOT THE PROTEINURIA ALONE, IS WHAT THE GUIDELINE ACTS ON. SIX MONTHS OF SUPPORTIVE THERAPY IS PART OF THE DEFINITION. A HIGH ANTI-PLA2R DOES NOT RAISE THE CATEGORY ON ITS OWN. Very high risk is a clinical picture, not a number.',
    compute: membranousRisk,
    fields: [
      { dom: 'mn-egfr', arg: 'egfr', kind: 'number', required: false, label: 'eGFR, mL/min per 1.73 square meters', unit: 'mL/min/1.73m2' },
      { dom: 'mn-proteinuria', arg: 'proteinuria', kind: 'number', required: false, label: 'Proteinuria, grams per day', unit: 'g/day' },
      { dom: 'mn-albumin', arg: 'albumin', kind: 'number', required: false, label: 'Serum albumin, g/dL', unit: 'g/dL' },
      { dom: 'mn-pla2r', arg: 'pla2r', kind: 'number', required: false, label: 'Anti-PLA2R antibody, RU/mL (counts only alongside proteinuria above 3.5 g/day)', unit: 'RU/mL' },
      { dom: 'mn-urinarymarkersraised', arg: 'urinaryMarkersRaised', kind: 'boolean', required: false, label: 'Urinary alpha-1 microglobulin or IgG excretion is raised' },
      { dom: 'mn-sixmonthssupportive', arg: 'sixMonthsSupportive', kind: 'boolean', required: false, label: 'Six months of supportive therapy have been given' },
      { dom: 'mn-proteinuriahalved', arg: 'proteinuriaHalved', kind: 'boolean', required: false, label: 'Proteinuria has fallen by more than half over that period' },
      { dom: 'mn-proteinuriaovereightsixmonths', arg: 'proteinuriaOverEightSixMonths', kind: 'boolean', required: false, label: 'Proteinuria above 8 g per day persisting beyond six months' },
      { dom: 'mn-lifethreateningnephrotic', arg: 'lifeThreateningNephrotic', kind: 'boolean', required: false, label: 'Life-threatening nephrotic syndrome' },
      { dom: 'mn-rapidunexplaineddecline', arg: 'rapidUnexplainedDecline', kind: 'boolean', required: false, label: 'Rapid unexplained fall in kidney function' },
    ],
  },
];

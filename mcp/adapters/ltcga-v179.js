// spec-v183 MCP wave 10: adapters for lib/ltcga-v179.js — anticholinergic / sedative medication-burden indices — ACB, ARS, and the Drug Burden Index.
// dom keys mirror views/group-v179.js; the compute arg names are the
// verbatim keys those renderers pass. Kind is number for graded / free-numeric
// inputs and enum for the yes/no and sex selects. Default makeToArgs round-trips.

import * as F from '../../lib/ltcga-v179.js';

export default [
  {
    id: 'anticholinergic-burden',
    summary: 'Anticholinergic Cognitive Burden: count of the patient\'s drugs at ACB level 1, 2, and 3, weighted 1/2/3. A total ≥ 3 is clinically relevant.',
    compute: F.anticholinergicBurden,
    fields: [
    { dom: 'acb-l1', arg: 'level1Count', kind: 'number', required: true, label: 'Level1 Count' },
    { dom: 'acb-l2', arg: 'level2Count', kind: 'number', required: true, label: 'Level2 Count' },
    { dom: 'acb-l3', arg: 'level3Count', kind: 'number', required: true, label: 'Level3 Count' },
    ],
  },
  {
    id: 'anticholinergic-risk-scale',
    summary: 'Anticholinergic Risk Scale: count of the patient\'s 1-, 2-, and 3-point ARS drugs, weighted and summed. Higher totals predict more anticholinergic adverse effects.',
    compute: F.anticholinergicRiskScale,
    fields: [
    { dom: 'ars-p1', arg: 'point1Count', kind: 'number', required: true, label: 'Point1 Count' },
    { dom: 'ars-p2', arg: 'point2Count', kind: 'number', required: true, label: 'Point2 Count' },
    { dom: 'ars-p3', arg: 'point3Count', kind: 'number', required: true, label: 'Point3 Count' },
    ],
  },
  {
    // Drug Burden Index (Hilmer 2007): DBI = Σ D/(D + δ) over up to 5 drugs.
    // The renderer builds a `drugs` array from five flat {dose, minDose} rows;
    // the adapter exposes the same five flat rows and rebuilds the array so the
    // agent contract stays a flat scalar object (no nested-array input).
    id: 'drug-burden-index',
    summary: 'Drug Burden Index (Hilmer 2007): for each anticholinergic or sedative drug, its daily dose (D) and minimum recommended dose (δ). DBI = Σ D/(D + δ); a higher index predicts poorer physical and cognitive function.',
    compute: F.drugBurdenIndex,
    fields: [
      { dom: 'dbi-d1', arg: 'dose1', kind: 'number', required: true, label: 'Drug 1 daily dose (D)' },
      { dom: 'dbi-min1', arg: 'minDose1', kind: 'number', required: true, label: 'Drug 1 minimum dose (δ)' },
      { dom: 'dbi-d2', arg: 'dose2', kind: 'number', required: false, label: 'Drug 2 daily dose (D)' },
      { dom: 'dbi-min2', arg: 'minDose2', kind: 'number', required: false, label: 'Drug 2 minimum dose (δ)' },
      { dom: 'dbi-d3', arg: 'dose3', kind: 'number', required: false, label: 'Drug 3 daily dose (D)' },
      { dom: 'dbi-min3', arg: 'minDose3', kind: 'number', required: false, label: 'Drug 3 minimum dose (δ)' },
      { dom: 'dbi-d4', arg: 'dose4', kind: 'number', required: false, label: 'Drug 4 daily dose (D)' },
      { dom: 'dbi-min4', arg: 'minDose4', kind: 'number', required: false, label: 'Drug 4 minimum dose (δ)' },
      { dom: 'dbi-d5', arg: 'dose5', kind: 'number', required: false, label: 'Drug 5 daily dose (D)' },
      { dom: 'dbi-min5', arg: 'minDose5', kind: 'number', required: false, label: 'Drug 5 minimum dose (δ)' },
    ],
    toArgs(inputs) {
      const drugs = [];
      for (let i = 1; i <= 5; i += 1) {
        drugs.push({ dose: inputs[`dbi-d${i}`], minDose: inputs[`dbi-min${i}`] });
      }
      return { drugs };
    },
  },
];

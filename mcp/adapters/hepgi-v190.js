// spec-v183 MCP wave 9: adapters for the four instruments in lib/hepgi-v190.js —
// the platelet-augmented ALBI grade (PALBI), the sodium-augmented MELD-Na, the
// Clichy acute-liver-failure criteria, and the Rome IV IBS diagnostic criteria.
// dom keys mirror views/group-v190.js.

import * as F from '../../lib/hepgi-v190.js';

export default [
  {
    id: 'palbi',
    summary: 'Platelet-albumin-bilirubin (PALBI) grade for chronic liver disease — the ALBI model augmented with platelet count, stratifying survival into three grades.',
    compute: F.palbi,
    fields: [
      { dom: 'palbi-bilirubin', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'palbi-albumin', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'palbi-platelets', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
  {
    id: 'meld-na',
    summary: 'MELD-Na (sodium-augmented MELD, OPTN/UNOS coefficients) for liver-disease severity and transplant priority; sodium is applied only when MELD > 11, bounded 6–40.',
    compute: F.meldNa,
    fields: [
      { dom: 'meldna-bilirubin', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'meldna-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'meldna-creatinine', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'meldna-sodium', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mmol/L' },
      { dom: 'meldna-dialysis', arg: 'dialysis', kind: 'bool', required: false, label: 'Dialysis ≥ 2× in the prior week' },
    ],
  },
  {
    id: 'clichy',
    summary: 'Clichy criteria for emergency liver transplant in acute liver failure: hepatic encephalopathy plus an age-branched coagulation factor-V threshold.',
    compute: F.clichy,
    fields: [
      { dom: 'clichy-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'clichy-factorV', arg: 'factorV', kind: 'number', required: true, label: 'Coagulation factor V', unit: '% of normal' },
      { dom: 'clichy-encephalopathy', arg: 'encephalopathy', kind: 'bool', required: false, label: 'Hepatic encephalopathy (grade 3–4)' },
    ],
  },
  {
    id: 'rome-iv-ibs',
    summary: 'Rome IV diagnostic criteria for irritable bowel syndrome: recurrent abdominal pain plus two of three defecation-related features, with the IBS-C/D/M/U subtype.',
    compute: F.romeIvIbs,
    fields: [
      { dom: 'rome-painFrequency', arg: 'painFrequency', kind: 'bool', required: false, label: 'Recurrent pain ≥ 1 day/week (last 3 months)' },
      { dom: 'rome-onset6mo', arg: 'onset6mo', kind: 'bool', required: false, label: 'Symptom onset ≥ 6 months prior' },
      { dom: 'rome-defecation', arg: 'defecation', kind: 'bool', required: false, label: 'Pain related to defecation' },
      { dom: 'rome-stoolFrequency', arg: 'stoolFrequency', kind: 'bool', required: false, label: 'Associated with a change in stool frequency' },
      { dom: 'rome-stoolForm', arg: 'stoolForm', kind: 'bool', required: false, label: 'Associated with a change in stool form' },
      { dom: 'rome-subtype', arg: 'subtype', kind: 'enum', values: ['ibs-c', 'ibs-d', 'ibs-m', 'ibs-u'], required: false, label: 'Predominant stool pattern (subtype)' },
    ],
  },
];

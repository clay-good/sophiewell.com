// spec-v860 MCP adapter: the malignant hyperthermia clinical grading scale in
// lib/mh-grading-scale-v860.js. The dom keys mirror the browser renderer
// (views/group-v860.js) and META['mh-grading-scale'].example.
//
// Pass every indicator that was present. The scale counts only the highest one in each process,
// and the tool reports what adding them all up would have given. Clinical domain.

import { mhGradingScale } from '../../lib/mh-grading-scale-v860.js';

export default [
  {
    id: 'mh-grading-scale',
    summary: 'Ranks how likely an episode was malignant hyperthermia, using the Larach clinical grading scale. Indicators sit in seven processes — rigidity, muscle breakdown, respiratory acidosis, temperature increase, cardiac involvement, family history and other — and ONLY THE HIGHEST-SCORING INDICATOR IN EACH PROCESS COUNTS. The seven add into a raw score: 0 is rank 1, almost never; 3 to 9 rank 2; 10 to 19 rank 3; 20 to 34 rank 4; 35 to 49 rank 5; and 50 or more rank 6, almost certain. THE SCALE IS NOT A TREATMENT TRIGGER — it was built for research and retrospective review, and during a crisis dantrolene is given on clinical suspicion. FEVER IS NEITHER REQUIRED NOR EARLY, because an unexplained rise in end-tidal carbon dioxide under controlled ventilation is the earliest sign. It does not diagnose malignant hyperthermia or replace contracture or genetic testing.',
    compute: mhGradingScale,
    fields: [
      { dom: 'mh-rigiditygeneralized', arg: 'rigidityGeneralized', kind: 'boolean', required: false, label: 'Generalized muscular rigidity (15 points)' },
      { dom: 'mh-masseterspasm', arg: 'masseterSpasm', kind: 'boolean', required: false, label: 'Masseter spasm shortly after succinylcholine (15 points)' },
      { dom: 'mh-cksux', arg: 'ckSux', kind: 'boolean', required: false, label: 'Creatine kinase over 20,000 units per liter after an anesthetic that included succinylcholine (15 points)' },
      { dom: 'mh-cknosux', arg: 'ckNoSux', kind: 'boolean', required: false, label: 'Creatine kinase over 10,000 units per liter after an anesthetic without succinylcholine (15 points)' },
      { dom: 'mh-colaurine', arg: 'colaUrine', kind: 'boolean', required: false, label: 'Cola-colored urine perioperatively (10 points)' },
      { dom: 'mh-myoglobinurine', arg: 'myoglobinUrine', kind: 'boolean', required: false, label: 'Urine myoglobin over 60 micrograms per liter (5 points)' },
      { dom: 'mh-myoglobinserum', arg: 'myoglobinSerum', kind: 'boolean', required: false, label: 'Serum myoglobin over 170 micrograms per liter (5 points)' },
      { dom: 'mh-potassium', arg: 'potassium', kind: 'boolean', required: false, label: 'Potassium over 6 millimoles per liter, without kidney failure (3 points)' },
      { dom: 'mh-etco2controlled', arg: 'etco2Controlled', kind: 'boolean', required: false, label: 'End-tidal carbon dioxide over 55 mmHg with appropriate controlled ventilation (15 points)' },
      { dom: 'mh-paco2controlled', arg: 'paco2Controlled', kind: 'boolean', required: false, label: 'Arterial carbon dioxide over 60 mmHg with appropriate controlled ventilation (15 points)' },
      { dom: 'mh-etco2spontaneous', arg: 'etco2Spontaneous', kind: 'boolean', required: false, label: 'End-tidal carbon dioxide over 60 mmHg with spontaneous ventilation (15 points)' },
      { dom: 'mh-paco2spontaneous', arg: 'paco2Spontaneous', kind: 'boolean', required: false, label: 'Arterial carbon dioxide over 65 mmHg with spontaneous ventilation (15 points)' },
      { dom: 'mh-hypercarbia', arg: 'hypercarbia', kind: 'boolean', required: false, label: 'Inappropriate hypercarbia judged inappropriate by the anesthesia team (15 points)' },
      { dom: 'mh-tachypnea', arg: 'tachypnea', kind: 'boolean', required: false, label: 'Inappropriate tachypnea (10 points)' },
      { dom: 'mh-temprapid', arg: 'tempRapid', kind: 'boolean', required: false, label: 'Inappropriately rapid increase in temperature judged inappropriate by the anesthesia team (15 points)' },
      { dom: 'mh-temphigh', arg: 'tempHigh', kind: 'boolean', required: false, label: 'Inappropriately increased temperature over 38.8 degrees Celsius perioperatively (10 points)' },
      { dom: 'mh-sinustach', arg: 'sinusTach', kind: 'boolean', required: false, label: 'Inappropriate sinus tachycardia (3 points)' },
      { dom: 'mh-ventriculararrhythmia', arg: 'ventricularArrhythmia', kind: 'boolean', required: false, label: 'Ventricular tachycardia or ventricular fibrillation (3 points)' },
      { dom: 'mh-familyfirstdegree', arg: 'familyFirstDegree', kind: 'boolean', required: false, label: 'Malignant hyperthermia in a first-degree relative (15 points)' },
      { dom: 'mh-familyother', arg: 'familyOther', kind: 'boolean', required: false, label: 'Malignant hyperthermia in a relative who is not first-degree (5 points)' },
      { dom: 'mh-baseexcess', arg: 'baseExcess', kind: 'boolean', required: false, label: 'Arterial base excess more negative than -8 millimoles per liter (10 points)' },
      { dom: 'mh-lowph', arg: 'lowPh', kind: 'boolean', required: false, label: 'Arterial pH below 7.25 (10 points)' },
      { dom: 'mh-restingck', arg: 'restingCk', kind: 'boolean', required: false, label: 'Raised resting creatine kinase with a family history of malignant hyperthermia (10 points)' },
      { dom: 'mh-dantrolenereversal', arg: 'dantroleneReversal', kind: 'boolean', required: false, label: 'Rapid reversal of the signs with intravenous dantrolene (5 points)' },
    ],
  },
];

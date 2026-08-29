// spec-v870 MCP adapter: the consensus diagnostic criteria for neuroleptic malignant syndrome in
// lib/nms-criteria-v870.js. The dom keys mirror the browser renderer (views/group-v870.js) and
// META['nms-criteria'].example.
//
// The total weighs how strongly the findings argue for the diagnosis, not how ill the patient
// is. Clinical domain.

import { nmsCriteria } from '../../lib/nms-criteria-v870.js';

export default [
  {
    id: 'nms-criteria',
    summary: 'Scores the international consensus diagnostic criteria for neuroleptic malignant syndrome over eight weighted findings. Exposure to a dopamine antagonist or withdrawal of a dopamine agonist within 72 hours scores 20, hyperthermia 18, rigidity 17, mental status alteration 13, a creatine kinase at least four times the upper limit of normal 10, sympathetic lability 10, a negative work-up for other causes 7, and hypermetabolism 5, summing to 100. A total of 74 or more supports the diagnosis. IT IS A DIAGNOSTIC-PRIORITY SCALE, NOT A SEVERITY SCALE: the points weigh how much each finding argues for the diagnosis, and a higher total does not mean a sicker patient. NEITHER FEVER NOR RIGIDITY IS REQUIRED, since the threshold is reachable without either. THE NEGATIVE WORK-UP IS A SCORED ITEM, NOT A PRECONDITION. The creatine kinase item asks for four times the upper limit of normal, not any elevation. It does not decide whether to stop a drug.',
    compute: nmsCriteria,
    fields: [
      { dom: 'nms-exposure', arg: 'exposure', kind: 'boolean', required: false, label: 'Dopamine antagonist exposure, or dopamine agonist withdrawal, within the past 72 hours (20 points)' },
      { dom: 'nms-hyperthermia', arg: 'hyperthermia', kind: 'boolean', required: false, label: 'Hyperthermia above 100.4 F on at least two occasions, measured orally (18 points)' },
      { dom: 'nms-rigidity', arg: 'rigidity', kind: 'boolean', required: false, label: 'Rigidity (17 points)' },
      { dom: 'nms-mentalstatus', arg: 'mentalStatus', kind: 'boolean', required: false, label: 'Mental status alteration: reduced or fluctuating level of consciousness (13 points)' },
      { dom: 'nms-creatinekinase', arg: 'creatineKinase', kind: 'boolean', required: false, label: 'Creatine kinase at least four times the upper limit of normal (10 points)' },
      { dom: 'nms-sympatheticlability', arg: 'sympatheticLability', kind: 'boolean', required: false, label: 'Sympathetic nervous system lability: at least two of a blood pressure rise of 25 percent or more above baseline, a swing of 20 mmHg diastolic or 25 mmHg systolic within 24 hours, diaphoresis, or urinary incontinence (10 points)' },
      { dom: 'nms-negativeworkup', arg: 'negativeWorkup', kind: 'boolean', required: false, label: 'Negative work-up for infectious, toxic, metabolic and neurologic causes (7 points)' },
      { dom: 'nms-hypermetabolism', arg: 'hypermetabolism', kind: 'boolean', required: false, label: 'Hypermetabolism: a heart rate 25 percent or more above baseline together with a respiratory rate 50 percent or more above baseline (5 points)' },
    ],
  },
];

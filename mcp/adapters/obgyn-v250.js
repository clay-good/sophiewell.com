// spec-v183 MCP wave: adapters for the four obstetric calculators in
// lib/obgyn-v250.js — the Pearl Index, the Robinson-Fleming crown-rump-length
// dating equation, the CARPREG II cardiac-risk score, and the Malinas
// imminent-delivery score. dom keys mirror views/group-v250.js.

import * as F from '../../lib/obgyn-v250.js';

export default [
  {
    id: 'pearl-index',
    summary: 'Pearl Index: (accidental pregnancies x 1200) / total woman-months of exposure = contraceptive failures per 100 woman-years; a lower index reflects a more effective method.',
    compute: F.pearlIndex,
    fields: [
      { dom: 'pi-preg', arg: 'pregnancies', kind: 'number', required: true, label: 'Accidental pregnancies' },
      { dom: 'pi-months', arg: 'months', kind: 'number', required: true, label: 'Total months of exposure', unit: 'months' },
    ],
  },
  {
    id: 'robinson-crl-dating',
    summary: 'Robinson-Fleming crown-rump-length dating: gestational age (days) = 8.052 x sqrt(1.037 x CRL) + 23.73, CRL in mm; validated for CRL 5-84 mm.',
    compute: F.robinsonCrlDating,
    fields: [
      { dom: 'crl-mm', arg: 'crl', kind: 'number', required: true, label: 'Crown-rump length', unit: 'mm' },
    ],
  },
  {
    id: 'carpreg-ii',
    summary: 'CARPREG II score (Silversides 2018): weighted maternal cardiac risk factors predicting the risk of a cardiac complication in pregnancy.',
    compute: F.carpregII,
    fields: [
      { dom: 'cp-events', arg: 'priorEvents', kind: 'bool', required: true, label: 'Prior cardiac events or arrhythmias (3)' },
      { dom: 'cp-nyha', arg: 'nyha', kind: 'bool', required: true, label: 'NYHA III-IV or cyanosis (3)' },
      { dom: 'cp-valve', arg: 'mechanicalValve', kind: 'bool', required: false, label: 'Mechanical heart valve (3)' },
      { dom: 'cp-vent', arg: 'ventricularDysfunction', kind: 'bool', required: false, label: 'Systemic ventricular dysfunction (EF < 40%) (2)' },
      { dom: 'cp-left', arg: 'leftObstruction', kind: 'bool', required: false, label: 'High-risk left-sided valve / LVOT obstruction (2)' },
      { dom: 'cp-ph', arg: 'pulmonaryHypertension', kind: 'bool', required: false, label: 'Pulmonary hypertension (2)' },
      { dom: 'cp-aorta', arg: 'aortopathy', kind: 'bool', required: false, label: 'High-risk aortopathy (2)' },
      { dom: 'cp-cad', arg: 'coronary', kind: 'bool', required: false, label: 'Coronary artery disease (2)' },
      { dom: 'cp-nointerv', arg: 'noPriorIntervention', kind: 'bool', required: false, label: 'No prior cardiac intervention (1)' },
      { dom: 'cp-late', arg: 'lateAssessment', kind: 'bool', required: false, label: 'Late pregnancy assessment (> 20 wk) (1)' },
    ],
  },
  {
    id: 'malinas-score',
    summary: 'Malinas score: five prehospital-labour criteria (parity, labour duration, contraction duration, interval, membranes) each 0-2; >= 6 suggests delivery is likely imminent.',
    compute: F.malinasScore,
    fields: [
      { dom: 'mal-par', arg: 'parity', kind: 'number', required: true, label: 'Parity' },
      { dom: 'mal-dur', arg: 'duration', kind: 'number', required: true, label: 'Duration of labour' },
      { dom: 'mal-con', arg: 'contraction', kind: 'number', required: true, label: 'Contraction duration' },
      { dom: 'mal-int', arg: 'interval', kind: 'number', required: true, label: 'Interval between contractions' },
      { dom: 'mal-mem', arg: 'membranes', kind: 'number', required: true, label: 'Ruptured membranes' },
    ],
  },
];

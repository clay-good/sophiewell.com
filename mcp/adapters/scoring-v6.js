// spec-v183 MCP wave 54: adapters for lib/scoring-v6.js - the neonatal
// assessment set: Ballard maturity, Finnegan NAS, Silverman-Andersen, Downes,
// Bhutani bilirubin risk zone, quantitative blood loss (PPH), and the AAP
// phototherapy threshold. dom keys mirror views/group-v10.js.

import * as F from '../../lib/scoring-v6.js';

export default [
  {
    id: 'ballard',
    summary: 'New Ballard Score: 6 neuromuscular and 6 physical maturity signs each scored -1 to 5; the summed maturity rating maps to estimated gestational age (weeks) for newborns 20-44 weeks.',
    // The lib takes two exactly-six-element numeric arrays; rebuild them from
    // the flat per-sign selects (the drug-burden-index array-rebuild precedent).
    compute: (a) => F.ballard({
      neuromuscular: [a.n0, a.n1, a.n2, a.n3, a.n4, a.n5],
      physical: [a.p0, a.p1, a.p2, a.p3, a.p4, a.p5],
    }),
    fields: [
      { dom: 'bl-n1', arg: 'n0', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Posture', to: Number },
      { dom: 'bl-n2', arg: 'n1', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Square window (wrist)', to: Number },
      { dom: 'bl-n3', arg: 'n2', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Arm recoil', to: Number },
      { dom: 'bl-n4', arg: 'n3', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Popliteal angle', to: Number },
      { dom: 'bl-n5', arg: 'n4', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Scarf sign', to: Number },
      { dom: 'bl-n6', arg: 'n5', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Heel to ear', to: Number },
      { dom: 'bl-p1', arg: 'p0', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Skin', to: Number },
      { dom: 'bl-p2', arg: 'p1', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Lanugo', to: Number },
      { dom: 'bl-p3', arg: 'p2', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Plantar surface', to: Number },
      { dom: 'bl-p4', arg: 'p3', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Breast', to: Number },
      { dom: 'bl-p5', arg: 'p4', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Eye / ear', to: Number },
      { dom: 'bl-p6', arg: 'p5', kind: 'enum', values: ['-1', '0', '1', '2', '3', '4', '5'], required: true, label: 'Genitals', to: Number },
    ],
  },
  {
    id: 'finnegan',
    summary: 'Modified Finnegan Neonatal Abstinence Score: 24 weighted binary signs plus 3 graded items (sleep 0-3, fever 0-2, respiratory rate 0-2) summed for one scoring interval; >=8 or >=12 trend thresholds prompt pharmacologic treatment per protocol. Higher = worse.',
    compute: F.finnegan,
    fields: [
      { dom: 'fn-highPitchedCry', arg: 'highPitchedCry', kind: 'bool', required: true, label: 'Excessive high-pitched cry (2)' },
      { dom: 'fn-continuousCry', arg: 'continuousCry', kind: 'bool', required: false, label: 'Continuous high-pitched cry (3)' },
      { dom: 'fn-moro', arg: 'moro', kind: 'bool', required: true, label: 'Hyperactive Moro reflex (2)' },
      { dom: 'fn-markedMoro', arg: 'markedMoro', kind: 'bool', required: false, label: 'Markedly hyperactive Moro (3)' },
      { dom: 'fn-tremorsDisturbed', arg: 'tremorsDisturbed', kind: 'bool', required: false, label: 'Mild tremors when disturbed (1)' },
      { dom: 'fn-markedTremorsDisturbed', arg: 'markedTremorsDisturbed', kind: 'bool', required: false, label: 'Marked tremors when disturbed (2)' },
      { dom: 'fn-tremorsUndisturbed', arg: 'tremorsUndisturbed', kind: 'bool', required: false, label: 'Mild tremors undisturbed (3)' },
      { dom: 'fn-markedTremorsUndisturbed', arg: 'markedTremorsUndisturbed', kind: 'bool', required: false, label: 'Marked tremors undisturbed (4)' },
      { dom: 'fn-increasedTone', arg: 'increasedTone', kind: 'bool', required: false, label: 'Increased muscle tone (2)' },
      { dom: 'fn-excoriation', arg: 'excoriation', kind: 'bool', required: false, label: 'Excoriation of skin (1)' },
      { dom: 'fn-myoclonus', arg: 'myoclonus', kind: 'bool', required: false, label: 'Myoclonic jerks (3)' },
      { dom: 'fn-convulsions', arg: 'convulsions', kind: 'bool', required: false, label: 'Generalized convulsions (5)' },
      { dom: 'fn-sweating', arg: 'sweating', kind: 'bool', required: true, label: 'Sweating (1)' },
      { dom: 'fn-yawning', arg: 'yawning', kind: 'bool', required: false, label: 'Frequent yawning (1)' },
      { dom: 'fn-mottling', arg: 'mottling', kind: 'bool', required: false, label: 'Mottling (1)' },
      { dom: 'fn-nasalStuffiness', arg: 'nasalStuffiness', kind: 'bool', required: false, label: 'Nasal stuffiness (1)' },
      { dom: 'fn-sneezing', arg: 'sneezing', kind: 'bool', required: false, label: 'Sneezing (1)' },
      { dom: 'fn-nasalFlaring', arg: 'nasalFlaring', kind: 'bool', required: false, label: 'Nasal flaring (2)' },
      { dom: 'fn-excessiveSucking', arg: 'excessiveSucking', kind: 'bool', required: false, label: 'Excessive sucking (1)' },
      { dom: 'fn-poorFeeding', arg: 'poorFeeding', kind: 'bool', required: false, label: 'Poor feeding (2)' },
      { dom: 'fn-regurgitation', arg: 'regurgitation', kind: 'bool', required: false, label: 'Regurgitation (2)' },
      { dom: 'fn-projectileVomiting', arg: 'projectileVomiting', kind: 'bool', required: false, label: 'Projectile vomiting (3)' },
      { dom: 'fn-looseStools', arg: 'looseStools', kind: 'bool', required: true, label: 'Loose stools (2)' },
      { dom: 'fn-wateryStools', arg: 'wateryStools', kind: 'bool', required: false, label: 'Watery stools (3)' },
      { dom: 'fn-sleep', arg: 'sleep', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sleeps after feeding: <3 h (1) / <2 h (2) / <1 h (3)', to: Number },
      { dom: 'fn-fever', arg: 'fever', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Fever: 37.2-38.3 C (1) / >38.3 C (2)', to: Number },
      { dom: 'fn-respRate', arg: 'respRate', kind: 'enum', values: ['0', '1', '2'], required: false, label: 'Respiratory rate: >60 (1) / >60 with retractions (2)', to: Number },
    ],
  },
  {
    id: 'silverman-andersen',
    summary: 'Silverman-Andersen retraction score: 5 neonatal respiratory signs scored 0-2 each (total 0-10) grading respiratory distress; 0 none, 1-3 mild, 4-6 moderate, >=7 severe. Higher = worse.',
    compute: F.silvermanAndersen,
    fields: [
      { dom: 'sa-chest', arg: 'chestMovement', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Upper-chest / abdomen movement (synchrony)', to: Number },
      { dom: 'sa-intercostal', arg: 'intercostal', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Intercostal retraction', to: Number },
      { dom: 'sa-xiphoid', arg: 'xiphoid', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Xiphoid retraction', to: Number },
      { dom: 'sa-nares', arg: 'naresDilatation', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Nares dilatation', to: Number },
      { dom: 'sa-grunt', arg: 'grunt', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Expiratory grunt', to: Number },
    ],
  },
  {
    id: 'downes',
    summary: 'Downes score: 5 neonatal respiratory-distress parameters scored 0-2 each (total 0-10); 0-3 mild, 4-6 moderate (impending respiratory failure), >=7 severe (consider assisted ventilation). Higher = worse.',
    compute: F.downes,
    fields: [
      { dom: 'dn-rr', arg: 'respiratoryRate', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Respiratory rate', to: Number },
      { dom: 'dn-cyanosis', arg: 'cyanosis', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Cyanosis', to: Number },
      { dom: 'dn-airentry', arg: 'airEntry', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Air entry', to: Number },
      { dom: 'dn-grunting', arg: 'grunting', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Grunting', to: Number },
      { dom: 'dn-retractions', arg: 'retractions', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Retractions', to: Number },
    ],
  },
  {
    id: 'bhutani-bilirubin',
    summary: 'Bhutani 1999 hour-specific bilirubin nomogram zone (40th/75th/95th percentile tracks) plus the AAP-2022 phototherapy threshold for the entered gestational age and neurotoxicity-risk flag, for newborns 35+ weeks.',
    compute: F.bhutaniBilirubin,
    fields: [
      { dom: 'bb-hours', arg: 'ageHours', kind: 'number', required: true, label: 'Age (hours)', unit: 'hours' },
      { dom: 'bb-tsb', arg: 'tsb', kind: 'number', required: true, label: 'Total serum bilirubin', unit: 'mg/dL (canonical)' },
      { dom: 'bb-ga', arg: 'gaWeeks', kind: 'number', required: true, label: 'Gestational age (weeks, 35-44)', unit: 'weeks' },
      { dom: 'bb-risk', arg: 'riskFactors', kind: 'bool', required: false, label: 'Neurotoxicity risk factor(s) present' },
    ],
  },
  {
    id: 'qbl-pph',
    summary: 'Quantitative blood loss for obstetric hemorrhage: QBL = measured mL + (pad grams - dry tare grams) with the 1 g = 1 mL convention, flags ACOG PPH thresholds by delivery route, and tiers CMQCC admission risk-factor count.',
    compute: F.qblPph,
    fields: [
      { dom: 'qp-measured', arg: 'measuredMl', kind: 'number', required: true, label: 'Measured / collected blood (mL)', unit: 'mL', to: (v) => v || 0 },
      { dom: 'qp-pad', arg: 'padGrams', kind: 'number', required: true, label: 'Weighed pads/drapes (g)', unit: 'g', to: (v) => v || 0 },
      { dom: 'qp-tare', arg: 'dryTareGrams', kind: 'number', required: true, label: 'Dry-pad + irrigation tare (g)', unit: 'g', to: (v) => v || 0 },
      { dom: 'qp-vaginal', arg: 'vaginal', kind: 'bool', required: true, label: 'Vaginal birth' },
      { dom: 'qp-unstable', arg: 'unstable', kind: 'bool', required: false, label: 'Hemodynamic instability' },
      { dom: 'qp-risk', arg: 'riskFactors', kind: 'enum', values: ['0', '1', '2', '3', '4', '5', '6'], required: true, label: 'CMQCC admission risk factors (count)', to: Number },
    ],
  },
  {
    id: 'neo-phototherapy',
    summary: 'AAP 2022 neonatal hyperbilirubinemia thresholds: phototherapy, escalation-of-care, and exchange-transfusion TSB lines for the entered gestational age, age in hours, and neurotoxicity-risk flag, with the margin of the entered TSB to the phototherapy line.',
    // Echo the measured TSB so the margin-to-threshold is self-describing.
    compute: (a) => {
      const r = F.neoPhototherapy(a);
      return r == null ? r : { ...r, tsb: a.tsb };
    },
    fields: [
      { dom: 'np-ga', arg: 'gaWeeks', kind: 'number', required: true, label: 'Gestational age (weeks, 35-44)', unit: 'weeks' },
      { dom: 'np-hours', arg: 'ageHours', kind: 'number', required: true, label: 'Age (hours, 0-336)', unit: 'hours' },
      { dom: 'np-tsb', arg: 'tsb', kind: 'number', required: true, label: 'Total serum bilirubin', unit: 'mg/dL (canonical)' },
      { dom: 'np-risk', arg: 'riskFactors', kind: 'bool', required: false, label: 'Neurotoxicity risk factor(s) present' },
    ],
  },
];

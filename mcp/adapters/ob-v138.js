// MCP wave 12: adapters for lib/ob-v138.js — the Hadlock estimated fetal
// weight, the fullPIERS and miniPIERS pre-eclampsia adverse-outcome models,
// the amniotic fluid index, the Barnhart minimal serial-hCG rise, and the IOM
// gestational-weight-gain guidance. dom keys mirror views/group-v138.js.

import * as F from '../../lib/ob-v138.js';

export default [
  {
    id: 'hadlock-efw',
    summary: 'Hadlock estimated fetal weight (four-parameter model) from biparietal diameter, head circumference, abdominal circumference, and femur length (all in centimeters).',
    compute: F.hadlockEfw,
    fields: [
      { dom: 'he-bpd', arg: 'bpd', kind: 'number', required: true, label: 'Biparietal diameter', unit: 'cm' },
      { dom: 'he-hc', arg: 'hc', kind: 'number', required: true, label: 'Head circumference', unit: 'cm' },
      { dom: 'he-ac', arg: 'ac', kind: 'number', required: true, label: 'Abdominal circumference', unit: 'cm' },
      { dom: 'he-fl', arg: 'fl', kind: 'number', required: true, label: 'Femur length', unit: 'cm' },
    ],
  },
  {
    id: 'fullpiers',
    summary: 'fullPIERS — a logistic model for an adverse maternal outcome within 48 h of pre-eclampsia from gestational age, chest pain/dyspnea, oxygen saturation, platelets, creatinine, and AST; ≥ 30% is high risk.',
    compute: F.fullPiers,
    fields: [
      { dom: 'fp-ga', arg: 'ga', kind: 'number', required: true, label: 'Gestational age', unit: 'weeks' },
      { dom: 'fp-chest', arg: 'chestPainDyspnea', kind: 'bool', required: false, label: 'Chest pain or dyspnea' },
      { dom: 'fp-spo2', arg: 'spo2', kind: 'number', required: true, label: 'Oxygen saturation', unit: '%' },
      { dom: 'fp-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
      { dom: 'fp-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'µmol/L' },
      { dom: 'fp-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
    ],
  },
  {
    id: 'minipiers',
    summary: 'miniPIERS — the bedside-only pre-eclampsia adverse-outcome model from parity, gestational age, headache/visual changes, chest pain/dyspnea, vaginal bleeding with abdominal pain, SBP, and dipstick proteinuria; ≥ 25% is high risk.',
    compute: F.miniPiers,
    fields: [
      { dom: 'mp-multip', arg: 'multiparous', kind: 'bool', required: false, label: 'Multiparous' },
      { dom: 'mp-ga', arg: 'ga', kind: 'number', required: true, label: 'Gestational age', unit: 'weeks' },
      { dom: 'mp-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic blood pressure', unit: 'mmHg' },
      { dom: 'mp-prot', arg: 'proteinuria', kind: 'enum', values: ['2+', '3+', '4+'], required: false, label: 'Dipstick proteinuria' },
      { dom: 'mp-hv', arg: 'headacheVisual', kind: 'bool', required: false, label: 'Headache or visual changes' },
      { dom: 'mp-cpd', arg: 'chestPainDyspnea', kind: 'bool', required: false, label: 'Chest pain or dyspnea' },
      { dom: 'mp-vbap', arg: 'vaginalBleedingAbdPain', kind: 'bool', required: false, label: 'Vaginal bleeding with abdominal pain' },
    ],
  },
  {
    id: 'afi',
    summary: 'Amniotic Fluid Index: the sum of the deepest vertical fluid pocket in each of the four uterine quadrants (cm); under 5 cm oligohydramnios, over 24 cm polyhydramnios.',
    compute: F.afi,
    fields: [
      { dom: 'af-q1', arg: 'q1', kind: 'number', required: true, label: 'Quadrant 1 pocket depth', unit: 'cm' },
      { dom: 'af-q2', arg: 'q2', kind: 'number', required: true, label: 'Quadrant 2 pocket depth', unit: 'cm' },
      { dom: 'af-q3', arg: 'q3', kind: 'number', required: true, label: 'Quadrant 3 pocket depth', unit: 'cm' },
      { dom: 'af-q4', arg: 'q4', kind: 'number', required: true, label: 'Quadrant 4 pocket depth', unit: 'cm' },
    ],
  },
  {
    id: 'barnhart-hcg',
    summary: 'Barnhart minimal serial-hCG rise: compares the observed rise (repeat − initial)/initial against the minimal expected rise scaled from the 53%-over-48-h anchor for a potentially viable IUP.',
    compute: F.barnhartHcg,
    fields: [
      { dom: 'bh-init', arg: 'initial', kind: 'number', required: true, label: 'Initial hCG', unit: 'mIU/mL' },
      { dom: 'bh-rep', arg: 'repeat', kind: 'number', required: true, label: 'Repeat hCG', unit: 'mIU/mL' },
      { dom: 'bh-hrs', arg: 'hours', kind: 'number', required: true, label: 'Interval', unit: 'hours' },
    ],
  },
  {
    id: 'iom-gwg',
    summary: 'IOM gestational weight gain: the recommended total gain and second/third-trimester weekly rate by pre-pregnancy BMI category (computed from weight and height), singleton or twin.',
    compute: F.iomGwg,
    fields: [
      { dom: 'ig-wt', arg: 'weight', kind: 'number', required: true, label: 'Pre-pregnancy weight', unit: 'lb' },
      { dom: 'ig-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'in' },
      { dom: 'ig-twin', arg: 'twin', kind: 'bool', required: false, label: 'Twin pregnancy' },
    ],
  },
];

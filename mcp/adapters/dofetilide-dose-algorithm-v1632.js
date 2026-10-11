// spec-v1632 MCP adapter: dofetilide-dose-algorithm in lib/dofetilide-dose-algorithm-v1632.js. The
// dom keys mirror views/group-v1632.js and META['dofetilide-dose-algorithm'].example. Clinical
// domain. One label row: Tikosyn.

import * as DF from '../../lib/dofetilide-dose-algorithm-v1632.js';

export default [
  {
    id: 'dofetilide-dose-algorithm',
    summary: 'The dofetilide initiation steps on the Tikosyn label. From the baseline QTc or QT, a ventricular conduction abnormality and the creatinine clearance it reports the starting dose or the contraindication; with the interval after the first dose, whether the label steps the dose down (a rise above 15% or above 500 msec); with a later interval, whether the label says to discontinue. It starts, adjusts and stops nothing.',
    compute: DF.dofetilideDoseAlgorithm,
    fields: [
      { dom: 'dof-base', arg: 'baselineQt', kind: 'number', required: true, label: 'Baseline QTc (QT if heart rate under 60)', unit: 'msec' },
      { dom: 'dof-cond', arg: 'conduction', kind: 'enum', required: true, values: DF.YES_NO.map((y) => y.value), label: 'Ventricular conduction abnormality' },
      { dom: 'dof-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance (actual weight)', unit: 'mL/min' },
      { dom: 'dof-first', arg: 'firstDoseQt', kind: 'number', label: 'QTc or QT 2 to 3 h after dose 1 (optional)', unit: 'msec' },
      { dom: 'dof-later', arg: 'laterQt', kind: 'number', label: 'QTc or QT after a later dose (optional)', unit: 'msec' },
    ],
  },
];

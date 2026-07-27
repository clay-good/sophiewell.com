// spec-v526 MCP wave: adapter for the neonatal SOFA in lib/nsofa-v526.js. The dom keys mirror the browser
// renderer (views/group-v526.js) and META['nsofa'].example: nso-intubated, nso-spo2, nso-fio2,
// nso-inotropes, nso-steroids, nso-platelets map to the lib args intubated, spo2, fio2, inotropes, steroids,
// platelets.
//
// SpO2 AND FiO2 ARE DELIBERATELY NOT REQUIRED, and that is the design point of the wave. The published
// respiratory domain scores the SpO2/FiO2 ratio ONLY when the infant is intubated; a non-intubated infant
// scores 0 there regardless of oxygen requirement. Marking the two required would force a caller scoring a
// non-intubated infant to supply values the instrument will not look at, which is worse than useless -- it
// would suggest they contribute. The lib requires them exactly when intubation is reported, and returns a
// message naming what is missing otherwise.
//
// The FiO2 field is labeled as a FRACTION with a worked example ("0.40 for 40 percent"), because an agent
// that sends 40 would compute a ratio 100x too small and land the infant in the 8-point row. The unit is
// declared so it appears in the published schema description.
//
// The summary states the respiratory blind spot in the instrument's own terms rather than papering over it,
// and states the validated population, because "nSOFA 2" is exactly the kind of number an agent would
// otherwise carry into a term infant or an early-onset-sepsis case as though it travelled.

import * as N from '../../lib/nsofa-v526.js';

const YES_NO = ['no', 'yes'];

export default [
  {
    id: 'nsofa',
    summary: 'The neonatal Sequential Organ Failure Assessment (nSOFA): three organ systems for a total of 0 to 15, not the adult SOFA\'s 24. Respiratory 0 to 8 is scored from the SpO2 to FiO2 ratio and only when the infant is intubated: 0 if not intubated or the ratio is 300 or above, 2 below 300, 4 below 200, 6 below 150, 8 below 100. This means a non-intubated infant scores 0 on the respiratory domain however much oxygen they are receiving, so an infant on nasal CPAP at an FiO2 of 0.60 scores the same zero as an infant in room air; there is no not-intubated-on-oxygen row in the published table, so it is a blind spot in the instrument rather than an omission here. Cardiovascular 0 to 4 comes from the number of inotropes and systemic steroid treatment: no inotropes and no steroids 0, steroids alone 1, one inotrope alone 2, two or more inotropes or one inotrope with steroids 3, two or more inotropes with steroids 4. Hematologic 0 to 3 comes from the platelet count: 150 or above 0, 100 to 149 1, below 100 2, below 50 3; the published rows overlap, so the highest point value whose criterion is met applies. nSOFA has three domains where the adult SOFA has six, dropping the neurologic, hepatic, and renal domains because a coma scale cannot be scored in a very preterm infant, neonatal bilirubin is dominated by physiologic jaundice, and early creatinine and urine output reflect maternal creatinine and the postnatal diuresis. This is an organ-dysfunction score, not a diagnosis. It was derived and validated to predict mortality from late-onset sepsis in preterm very-low-birth-weight infants: it does not diagnose sepsis, does not rule it out, and a low score in an infant who looks unwell is not reassurance. It is not an indication to start, continue, or stop antibiotics, inotropes, or steroids, and applying it to a term infant, to early-onset sepsis, or to an infant with a congenital cardiac lesion is extrapolation beyond its validated population.',
    compute: N.nsofa,
    fields: [
      {
        dom: 'nso-intubated', arg: 'intubated', kind: 'enum', values: YES_NO, required: true,
        label: 'Is the infant intubated? The SpO2 to FiO2 ratio is scored only if yes; if no, the respiratory domain is 0 regardless of oxygen requirement',
      },
      {
        dom: 'nso-spo2', arg: 'spo2', kind: 'number', unit: 'percent',
        label: 'SpO2. Required only when intubated, because the ratio is not scored otherwise',
      },
      {
        dom: 'nso-fio2', arg: 'fio2', kind: 'number', unit: 'fraction from 0 to 1',
        label: 'FiO2 as a FRACTION, for example 0.40 for 40 percent - sending 40 would compute a ratio a hundred times too small. Required only when intubated',
      },
      {
        dom: 'nso-inotropes', arg: 'inotropes', kind: 'enum',
        values: N.INOTROPE_OPTIONS.map((o) => o.value), required: true,
        label: `Number of inotropes [${N.INOTROPE_OPTIONS.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
      },
      {
        dom: 'nso-steroids', arg: 'steroids', kind: 'enum', values: YES_NO, required: true,
        label: 'Systemic steroid treatment?',
      },
      {
        dom: 'nso-platelets', arg: 'platelets', kind: 'number', unit: 'x10^9/L', required: true,
        label: 'Platelet count. 150 or above scores 0, 100 to 149 scores 1, below 100 scores 2, below 50 scores 3',
      },
    ],
  },
];

// spec-v183 MCP wave 6: adapters for the four lib/nephro-v127.js renal
// instruments (the Kidney Failure Risk Equation, the RIFLE and AKIN AKI
// classifications, and the dialysis ultrafiltration rate). dom keys mirror
// views/group-v127.js; the continuous labs/vitals are numbers, sex / RRT are
// booleans, and the mode / urine-output category are enums.

import * as F from '../../lib/nephro-v127.js';

export default [
  {
    id: 'kfre',
    summary: 'Kidney Failure Risk Equation (Tangri 2011/2016): the 2- and 5-year probability of treated kidney failure in CKD G3-G5, in the 4-variable (age, sex, eGFR, urine ACR) or 8-variable (adding calcium, phosphate, bicarbonate, albumin) form.',
    compute: F.kfre,
    fields: [
      { dom: 'kf-mode', arg: 'mode', kind: 'enum', values: ['4', '8'], label: 'Equation (4- or 8-variable)' },
      { dom: 'kf-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'kf-male', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'kf-egfr', arg: 'egfr', kind: 'number', required: true, label: 'eGFR', unit: 'mL/min/1.73m2' },
      { dom: 'kf-acr', arg: 'acr', kind: 'number', required: true, label: 'Urine albumin-creatinine ratio', unit: 'mg/g' },
      { dom: 'kf-ca', arg: 'calcium', kind: 'number', label: 'Serum calcium (8-variable)', unit: 'mg/dL' },
      { dom: 'kf-po4', arg: 'phosphate', kind: 'number', label: 'Serum phosphate (8-variable)', unit: 'mg/dL' },
      { dom: 'kf-hco3', arg: 'bicarbonate', kind: 'number', label: 'Serum bicarbonate (8-variable)', unit: 'mEq/L' },
      { dom: 'kf-alb', arg: 'albumin', kind: 'number', label: 'Serum albumin (8-variable)', unit: 'g/dL' },
    ],
  },
  {
    id: 'rifle-aki',
    summary: 'RIFLE criteria (ADQI, Bellomo 2004): the acute-kidney-injury class (Risk / Injury / Failure) from the creatinine ratio (or eGFR fall) and the urine-output category; the worse of the two governs.',
    compute: F.rifleAki,
    fields: [
      { dom: 'ri-base', arg: 'baselineCr', kind: 'number', label: 'Baseline creatinine', unit: 'mg/dL' },
      { dom: 'ri-curr', arg: 'currentCr', kind: 'number', label: 'Current creatinine', unit: 'mg/dL' },
      { dom: 'ri-uo', arg: 'uoClass', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Urine-output category' },
    ],
  },
  {
    id: 'akin-aki',
    summary: 'AKIN criteria (Mehta 2007): the acute-kidney-injury stage 1-3 from the creatinine rise (absolute or ratio within 48 h), the urine-output category, or initiation of renal replacement therapy; the worst criterion governs.',
    compute: F.akinAki,
    fields: [
      { dom: 'ak-base', arg: 'baselineCr', kind: 'number', label: 'Baseline creatinine', unit: 'mg/dL' },
      { dom: 'ak-curr', arg: 'currentCr', kind: 'number', label: 'Current creatinine', unit: 'mg/dL' },
      { dom: 'ak-rrt', arg: 'rrt', kind: 'bool', label: 'Renal replacement therapy initiated' },
      { dom: 'ak-uo', arg: 'uoClass', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Urine-output category' },
    ],
  },
  {
    id: 'ufr-dialysis',
    summary: 'Dialysis ultrafiltration rate: net fluid removed per session, normalized to post-dialysis weight (mL/kg/hr), against the 13 mL/kg/hr cardiovascular-risk threshold.',
    compute: F.ufrDialysis,
    fields: [
      { dom: 'uf-vol', arg: 'volume', kind: 'number', required: true, label: 'Ultrafiltration volume', unit: 'L' },
      { dom: 'uf-hr', arg: 'hours', kind: 'number', required: true, label: 'Session duration', unit: 'hours' },
      { dom: 'uf-wt', arg: 'weight', kind: 'number', required: true, label: 'Post-dialysis weight', unit: 'kg' },
    ],
  },
];

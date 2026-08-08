// spec-v664 MCP adapter: ASE 2016 LV diastolic function screen in
// lib/diastolic-function-ase-v664.js. The dom keys mirror the browser renderer
// (views/group-v664.js) and META['diastolic-function-ase'].example. Four criteria from
// five optional numeric echo values; the fraction of AVAILABLE criteria abnormal gives
// normal (<50%) / indeterminate (=50%) / dysfunction (>50%). Clinical domain.

import { diastolicFunctionAse } from '../../lib/diastolic-function-ase-v664.js';

export default [
  {
    id: 'diastolic-function-ase',
    summary: 'ASE/EACVI 2016 LV diastolic function screen for normal EF: four criteria (average E/e\' > 14, septal e\' < 7 or lateral e\' < 10 cm/s, TR velocity > 2.8 m/s, LA volume index > 34 mL/m2). Of the measured criteria, <50% abnormal = normal, >50% = diastolic dysfunction, =50% = indeterminate. Grade I-III not computed.',
    compute: diastolicFunctionAse,
    fields: [
      { dom: 'dias-ee', arg: 'avgEe', kind: 'number', required: false, label: 'Average E/e\' (abnormal > 14)' },
      { dom: 'dias-septal', arg: 'septalE', kind: 'number', required: false, label: 'Septal e\' velocity (cm/s; abnormal < 7)' },
      { dom: 'dias-lateral', arg: 'lateralE', kind: 'number', required: false, label: 'Lateral e\' velocity (cm/s; abnormal < 10)' },
      { dom: 'dias-tr', arg: 'trVelocity', kind: 'number', required: false, label: 'Peak TR velocity (m/s; abnormal > 2.8)' },
      { dom: 'dias-lavi', arg: 'lavi', kind: 'number', required: false, label: 'LA volume index (mL/m2; abnormal > 34)' },
    ],
  },
];

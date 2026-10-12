// spec-v1635 MCP adapter: dexrazoxane-ratio-dose in lib/dexrazoxane-ratio-dose-v1635.js. The dom keys
// mirror views/group-v1635.js and META['dexrazoxane-ratio-dose'].example. Clinical domain. One label
// row: Dexrazoxane for Injection (Eugia).

import * as DX from '../../lib/dexrazoxane-ratio-dose-v1635.js';

export default [
  {
    id: 'dexrazoxane-ratio-dose',
    summary: 'Dexrazoxane dose from the doxorubicin dose, by the label ratio. Ten times the doxorubicin dose, or five times when creatinine clearance is under 40 mL/min, with the label\'s timing line and a flag when cumulative doxorubicin is under the 300 mg/m² at which the labeled indication starts. It does not check the doxorubicin dose itself.',
    compute: (args) => DX.dexrazoxaneRatioDose(args, new Date()),
    fields: [
      { dom: 'dxr-dose', arg: 'doxorubicinDose', kind: 'number', required: true, label: 'Doxorubicin dose' },
      { dom: 'dxr-unit', arg: 'unit', kind: 'enum', required: true, values: DX.UNITS.map((u) => u.value), label: 'Dose unit' },
      { dom: 'dxr-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'dxr-cumulative', arg: 'cumulativeDoxorubicin', kind: 'number', label: 'Cumulative doxorubicin to date (optional)', unit: 'mg/m²' },
    ],
  },
];

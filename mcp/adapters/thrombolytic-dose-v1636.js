// spec-v1636 MCP adapter: thrombolytic-dose in lib/thrombolytic-dose-v1636.js. The dom keys mirror
// views/group-v1636.js and META['thrombolytic-dose'].example. Clinical domain. Three label rows.

import * as TD from '../../lib/thrombolytic-dose-v1636.js';

export default [
  {
    id: 'thrombolytic-dose',
    summary: 'Alteplase and tenecteplase dose by weight and indication, from the labels. Alteplase for stroke (0.9 mg/kg to 90 mg, 10% as a bolus), myocardial infarction (accelerated or 3-hour) and pulmonary embolism; tenecteplase by the label\'s weight bands for stroke and STEMI; Cathflo for catheter clearance. It gives mg, mL and pump rates. It does not assess eligibility or contraindications.',
    compute: (args) => TD.thrombolyticDose(args, new Date()),
    fields: [
      { dom: 'thd-regimen', arg: 'regimen', kind: 'enum', required: true, values: TD.REGIMENS.map((x) => x.value), label: 'Drug and indication' },
      { dom: 'thd-weight', arg: 'weight', kind: 'number', label: 'Weight (not needed for pulmonary embolism)', unit: 'kg' },
      { dom: 'thd-lumen', arg: 'lumenVolume', kind: 'number', label: 'Cathflo under 30 kg: internal lumen volume of the catheter', unit: 'mL' },
    ],
  },
];

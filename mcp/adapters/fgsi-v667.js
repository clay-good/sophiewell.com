// spec-v667 MCP adapter: FGSI (Fournier's Gangrene Severity Index) in lib/fgsi-v667.js.
// The dom keys mirror the browser renderer (views/group-v667.js) and META['fgsi'].example.
// Nine physiologic numbers, each scored 0-4 by APACHE-II deviation bands (eight reused
// verbatim from the verified apache2, plus the standard bicarbonate row), summed; a
// creatinine-doubling toggle for acute renal failure. Total > 9 = high mortality. Clinical domain.

import { fgsi } from '../../lib/fgsi-v667.js';

export default [
  {
    id: 'fgsi',
    summary: 'FGSI (Fournier\'s Gangrene Severity Index, Laor 1995): the APACHE-II acute-physiology score over 9 parameters (temperature, heart rate, respiratory rate, sodium, potassium, creatinine, hematocrit, WBC, bicarbonate), each 0-4 by deviation, summed (0-36). A total > 9 predicts high mortality. Creatinine points double for acute renal failure.',
    compute: fgsi,
    fields: [
      { dom: 'fgsi-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature (°C)' },
      { dom: 'fgsi-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate (beats/min)' },
      { dom: 'fgsi-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate (breaths/min)' },
      { dom: 'fgsi-na', arg: 'na', kind: 'number', required: true, label: 'Serum sodium (mmol/L)' },
      { dom: 'fgsi-k', arg: 'k', kind: 'number', required: true, label: 'Serum potassium (mmol/L)' },
      { dom: 'fgsi-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine (mg/dL)' },
      { dom: 'fgsi-hct', arg: 'hct', kind: 'number', required: true, label: 'Hematocrit (%)' },
      { dom: 'fgsi-wbc', arg: 'wbc', kind: 'number', required: true, label: 'White blood cell count (x10^3/mm3)' },
      { dom: 'fgsi-bicarb', arg: 'bicarbonate', kind: 'number', required: true, label: 'Serum bicarbonate (mmol/L)' },
      { dom: 'fgsi-arf', arg: 'acuteRenalFailure', kind: 'bool', required: false, label: 'Acute renal failure (doubles the creatinine points)' },
    ],
  },
];

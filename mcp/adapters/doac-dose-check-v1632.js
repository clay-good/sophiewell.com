// spec-v1632 MCP adapter: doac-dose-check in lib/doac-dose-check-v1632.js. The dom keys mirror
// views/group-v1632.js and META['doac-dose-check'].example. Clinical domain. Four label rows:
// Eliquis, Xarelto, Pradaxa and Savaysa.

import * as DC from '../../lib/doac-dose-check-v1632.js';

export default [
  {
    id: 'doac-dose-check',
    summary: 'The dose the FDA label gives for a direct oral anticoagulant. For apixaban, rivaroxaban, dabigatran or edoxaban it reports the row of the adult dosing section for the indication, creatinine clearance and (where the label uses them) age, weight, serum creatinine and an interacting drug, including "avoid", "not recommended" and "no recommendation given". It reports the label and recommends nothing.',
    compute: DC.doacDoseCheck,
    fields: [
      { dom: 'doac-drug', arg: 'drug', kind: 'enum', required: true, values: DC.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'doac-ind', arg: 'indication', kind: 'enum', required: true, values: DC.INDICATIONS.map((i) => i.value), label: 'Indication' },
      { dom: 'doac-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance (not used for apixaban)', unit: 'mL/min' },
      { dom: 'doac-int', arg: 'interaction', kind: 'enum', required: true, values: DC.INTERACTIONS.map((i) => i.value), label: 'Interacting drug the label names' },
      { dom: 'doac-age', arg: 'age', kind: 'number', label: 'Age (apixaban, atrial fibrillation)', unit: 'years' },
      { dom: 'doac-weight', arg: 'weight', kind: 'number', label: 'Weight (apixaban AF; edoxaban DVT or PE)', unit: 'kg' },
      { dom: 'doac-scr', arg: 'creatinine', kind: 'number', label: 'Serum creatinine (apixaban AF)', unit: 'mg/dL' },
    ],
  },
];

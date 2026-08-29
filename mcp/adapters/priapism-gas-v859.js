// spec-v859 MCP adapter: priapism classification in lib/priapism-gas-v859.js. The dom keys
// mirror the browser renderer (views/group-v859.js) and META['priapism-gas'].example.
//
// The gas classifies the episode. The trauma and sickle cell flags never change the type; they
// select the two warnings that go wrong around them. Clinical domain.

import { priapismGas } from '../../lib/priapism-gas-v859.js';

export default [
  {
    id: 'priapism-gas',
    summary: 'Classifies a priapism episode from the cavernous blood gas, which separates two conditions treated in opposite directions. A pO2 under 30 mmHg with a pCO2 over 60 mmHg and a pH under 7.25 is ISCHEMIC priapism, a compartment syndrome of the erectile tissue that is decompressed rather than observed. A pO2 over 90 mmHg with a pCO2 under 40 mmHg and a pH near 7.40 is NON-ISCHEMIC priapism, an unregulated arterial inflow that is not an emergency and where aspiration and a sympathomimetic treat the wrong disease. A gas in between is settled by color duplex, and anything unresolved is handled as ischemic. A TRAUMA HISTORY DOES NOT CLASSIFY THE EPISODE, the duration is the prognosis (compartment syndrome past 4 hours, necrosis around 24, function rarely preserved past 36), and sickle cell disease does not change the acute treatment. It does not choose a drug, a dose, a shunt, or an embolization.',
    compute: priapismGas,
    fields: [
      { dom: 'pg-po2', arg: 'po2', kind: 'number', required: false, label: 'pO2 in blood drawn from the corpus cavernosum', unit: 'mmHg' },
      { dom: 'pg-pco2', arg: 'pco2', kind: 'number', required: false, label: 'pCO2 in blood drawn from the corpus cavernosum', unit: 'mmHg' },
      { dom: 'pg-ph', arg: 'ph', kind: 'number', required: false, label: 'pH in blood drawn from the corpus cavernosum' },
      { dom: 'pg-hours', arg: 'hours', kind: 'number', required: false, label: 'Hours since the erection began', unit: 'hours' },
      { dom: 'pg-flow', arg: 'flow', kind: 'enum', values: ['', 'absent', 'normal'], required: false, label: 'Color duplex finding, if done' },
      { dom: 'pg-trauma', arg: 'trauma', kind: 'enum', values: ['', 'no', 'yes'], required: false, label: 'Perineal or straddle trauma before onset' },
      { dom: 'pg-sickle', arg: 'sickle', kind: 'enum', values: ['', 'no', 'yes'], required: false, label: 'Sickle cell disease' },
    ],
  },
];

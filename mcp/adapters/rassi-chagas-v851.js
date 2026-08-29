// spec-v851 MCP adapter: the Rassi death-risk score in lib/rassi-chagas-v851.js. The dom keys
// mirror the browser renderer (views/group-v851.js) and META['rassi-chagas'].example.
//
// There is no ejection-fraction argument because the model does not contain one. Do not
// substitute one for the cardiomegaly or wall-motion term. Clinical domain.

import { rassiChagas } from '../../lib/rassi-chagas-v851.js';

export default [
  {
    id: 'rassi-chagas',
    summary: 'Applies the Rassi score for death in chronic Chagas heart disease. Class III or IV symptoms score 5, an enlarged heart on the chest radiograph 5, a wall-motion abnormality on echocardiography 3, nonsustained ventricular tachycardia on Holter 3, low QRS voltage 2 and male sex 2, for a total of 0 to 20: 0 to 6 is low risk at 10 percent ten-year mortality, 7 to 11 intermediate at 44 percent, 12 to 20 high at 84 percent. THERE IS NO EJECTION FRACTION IN THE MODEL - it carries ventricular function as the chest radiograph and a binary wall-motion term, and substituting a fraction for either is not this score. It predicts all-cause death, not sudden death, and it does not select a device.',
    compute: rassiChagas,
    fields: [
      { dom: 'rassi-nyha', arg: 'nyhaClass34', kind: 'boolean', required: false, label: 'Class III or IV symptoms (5 points)' },
      { dom: 'rassi-cmeg', arg: 'cardiomegaly', kind: 'boolean', required: false, label: 'Enlarged heart on the chest radiograph (5 points)' },
      { dom: 'rassi-wma', arg: 'wallMotion', kind: 'boolean', required: false, label: 'Segmental or global wall-motion abnormality on echocardiography (3 points)' },
      { dom: 'rassi-nsvt', arg: 'nsvt', kind: 'boolean', required: false, label: 'Nonsustained ventricular tachycardia on 24-hour Holter (3 points)' },
      { dom: 'rassi-lowv', arg: 'lowVoltage', kind: 'boolean', required: false, label: 'Low QRS voltage on the ECG (2 points)' },
      { dom: 'rassi-male', arg: 'maleSex', kind: 'boolean', required: false, label: 'Male sex (2 points)' },
    ],
  },
];

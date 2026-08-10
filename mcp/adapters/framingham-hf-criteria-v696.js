// spec-v696 MCP adapter: Framingham heart-failure criteria in
// lib/framingham-hf-criteria-v696.js. The dom keys mirror the browser renderer
// (views/group-v696.js) and META['framingham-hf-criteria'].example. Fourteen booleans
// (8 major + 6 minor); decision logic returns whether HF criteria are met. Clinical domain.

import { framinghamHfCriteria } from '../../lib/framingham-hf-criteria-v696.js';

export default [
  {
    id: 'framingham-hf-criteria',
    summary: 'Framingham criteria for heart failure (McKee 1971): HF diagnosed with >=2 major OR 1 major + >=2 minor. Major (8): acute pulmonary edema, cardiomegaly, hepatojugular reflux, neck-vein distention, PND/orthopnea, rales, S3 gallop, weight loss >4.5kg/5d on HF treatment. Minor (6): ankle edema, dyspnea on exertion, hepatomegaly, nocturnal cough, pleural effusion, HR >120 (minor counts only if not from another condition).',
    compute: framinghamHfCriteria,
    fields: [
      { dom: 'fhf-edema', arg: 'acutePulmonaryEdema', kind: 'boolean', required: false, label: 'Acute pulmonary edema (major)' },
      { dom: 'fhf-cardiomegaly', arg: 'cardiomegaly', kind: 'boolean', required: false, label: 'Cardiomegaly (major)' },
      { dom: 'fhf-hjr', arg: 'hepatojugularReflux', kind: 'boolean', required: false, label: 'Hepatojugular reflux (major)' },
      { dom: 'fhf-jvd', arg: 'neckVeinDistention', kind: 'boolean', required: false, label: 'Neck-vein distention / raised JVP (major)' },
      { dom: 'fhf-pnd', arg: 'pndOrthopnea', kind: 'boolean', required: false, label: 'PND or orthopnea (major)' },
      { dom: 'fhf-rales', arg: 'rales', kind: 'boolean', required: false, label: 'Pulmonary rales (major)' },
      { dom: 'fhf-s3', arg: 's3Gallop', kind: 'boolean', required: false, label: 'S3 gallop (major)' },
      { dom: 'fhf-wtloss', arg: 'weightLossTreatment', kind: 'boolean', required: false, label: 'Weight loss >4.5 kg/5 d on HF treatment (major)' },
      { dom: 'fhf-ankle', arg: 'ankleEdema', kind: 'boolean', required: false, label: 'Ankle edema (minor)' },
      { dom: 'fhf-doe', arg: 'dyspneaExertion', kind: 'boolean', required: false, label: 'Dyspnea on exertion (minor)' },
      { dom: 'fhf-hepatomegaly', arg: 'hepatomegaly', kind: 'boolean', required: false, label: 'Hepatomegaly (minor)' },
      { dom: 'fhf-cough', arg: 'nocturnalCough', kind: 'boolean', required: false, label: 'Nocturnal cough (minor)' },
      { dom: 'fhf-effusion', arg: 'pleuralEffusion', kind: 'boolean', required: false, label: 'Pleural effusion (minor)' },
      { dom: 'fhf-tachy', arg: 'tachycardia', kind: 'boolean', required: false, label: 'Tachycardia HR >120 (minor)' },
    ],
  },
];

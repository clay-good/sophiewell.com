// spec-v638 MCP adapter: 2022 ACR/EULAR Takayasu Arteritis Classification
// Criteria in lib/takayasu-v638.js. The dom keys mirror the browser renderer
// (views/group-v638.js) and META['takayasu-acr-eular-2022'].example. Both absolute
// requirements (age ≤ 60 at diagnosis, imaging evidence of vasculitis) must be set
// before the weighted items score; otherwise the result is applicable:false.

import { takayasuAcrEular2022 } from '../../lib/takayasu-v638.js';

export default [
  {
    id: 'takayasu-acr-eular-2022',
    summary: '2022 ACR/EULAR Takayasu arteritis classification (weighted, max 19); a cumulative score ≥ 5 classifies as Takayasu arteritis once both absolute requirements (age ≤ 60 at diagnosis and imaging evidence of vasculitis) are met.',
    compute: takayasuAcrEular2022,
    fields: [
      { dom: 'tak-age', arg: 'ageEntry', kind: 'bool', required: false, label: 'Absolute requirement — age ≤ 60 years at diagnosis' },
      { dom: 'tak-imaging', arg: 'imagingEntry', kind: 'bool', required: false, label: 'Absolute requirement — evidence of vasculitis on imaging' },
      { dom: 'tak-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex (+1)' },
      { dom: 'tak-angina', arg: 'angina', kind: 'bool', required: false, label: 'Angina or ischemic cardiac pain (+2)' },
      { dom: 'tak-claud', arg: 'claudication', kind: 'bool', required: false, label: 'Arm or leg claudication (+2)' },
      { dom: 'tak-bruit', arg: 'bruit', kind: 'bool', required: false, label: 'Vascular bruit (+2)' },
      { dom: 'tak-pulse', arg: 'reducedPulse', kind: 'bool', required: false, label: 'Reduced pulse in upper extremity (+2)' },
      { dom: 'tak-carotid', arg: 'carotid', kind: 'bool', required: false, label: 'Carotid artery abnormality — reduced/absent pulse or tenderness (+2)' },
      { dom: 'tak-bp', arg: 'bpDiff', kind: 'bool', required: false, label: 'Arm systolic blood-pressure difference ≥ 20 mmHg (+1)' },
      { dom: 'tak-symmetric', arg: 'symmetric', kind: 'bool', required: false, label: 'Symmetric involvement of paired arteries (+1)' },
      { dom: 'tak-abdo', arg: 'abdoAorta', kind: 'bool', required: false, label: 'Abdominal aorta with renal or mesenteric involvement (+3)' },
      { dom: 'tak-terr', arg: 'territories', kind: 'enum', values: ['none', 'one', 'two', 'three'], required: false, label: 'Number of affected arterial territories (one +1 / two +2 / three or more +3)' },
    ],
  },
];

// spec-v861 MCP adapter: the spinal epidural abscess decision guideline in
// lib/sea-guideline-v861.js. The dom keys mirror the browser renderer (views/group-v861.js) and
// META['sea-guideline'].example.
//
// For a patient who already has spine pain. The white cell count is accepted only so the tool
// can say what a normal one does not mean. Clinical domain.

import { seaGuideline } from '../../lib/sea-guideline-v861.js';

export default [
  {
    id: 'sea-guideline',
    summary: 'Selects which patients with spine pain need imaging for a spinal epidural abscess. It applies the decision guideline of Davis and colleagues. A NEUROLOGIC DEFICIT MEANS IMAGE NOW. Without one, any of five risk factors — injection drug use, an indwelling vascular access device, a remote site of infection, immunosuppression, or a spinal procedure within the past year — leads to a sedimentation rate, and a rate over 20 mm per hour leads to imaging. THE CLASSIC TRIAD OF FEVER, SPINE PAIN AND A DEFICIT IS PRESENT IN ONLY A SMALL MINORITY of confirmed cases, so waiting for it is the delay. Fever is absent in about half and is not an entry criterion. THE SEDIMENTATION RATE IS THE TEST, NOT THE WHITE CELL COUNT, which is normal in a large share of confirmed cases. Not selecting a patient is not an exclusion. It does not diagnose or exclude the abscess.',
    compute: seaGuideline,
    fields: [
      { dom: 'sea-deficit', arg: 'deficit', kind: 'boolean', required: false, label: 'Any neurologic deficit' },
      { dom: 'sea-injectiondruguse', arg: 'injectionDrugUse', kind: 'boolean', required: false, label: 'Injection drug use' },
      { dom: 'sea-vascularaccess', arg: 'vascularAccess', kind: 'boolean', required: false, label: 'An indwelling vascular access device' },
      { dom: 'sea-remoteinfection', arg: 'remoteInfection', kind: 'boolean', required: false, label: 'A site of infection elsewhere in the body' },
      { dom: 'sea-immunosuppression', arg: 'immunosuppression', kind: 'boolean', required: false, label: 'Immunosuppression, including diabetes, HIV, cancer, dialysis, and alcohol use disorder' },
      { dom: 'sea-spinalprocedure', arg: 'spinalProcedure', kind: 'boolean', required: false, label: 'A spinal procedure or spinal surgery within the past year' },
      { dom: 'sea-fever', arg: 'fever', kind: 'boolean', required: false, label: 'Fever' },
      { dom: 'sea-esr', arg: 'esr', kind: 'number', required: false, label: 'Sedimentation rate', unit: 'mm per hour' },
      { dom: 'sea-wbc', arg: 'wbc', kind: 'number', required: false, label: 'White cell count', unit: 'thousand per microliter' },
    ],
  },
];

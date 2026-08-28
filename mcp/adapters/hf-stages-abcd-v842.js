// spec-v842 MCP adapter: ACC/AHA/HFSA heart failure stages in lib/hf-stages-abcd-v842.js.
// The dom keys mirror the browser renderer (views/group-v842.js) and
// META['hf-stages-abcd'].example.
//
// currentSymptoms and previousSymptoms are separate args because stage C is defined to
// include previous ones. Clinical domain.

import { hfStagesAbcd } from '../../lib/hf-stages-abcd-v842.js';

export default [
  {
    id: 'hf-stages-abcd',
    summary: 'Applies the ACC/AHA/HFSA heart failure stages. A is at risk with no symptoms, structural disease or biomarker abnormality; B is pre-HF by structural disease, raised filling pressures, or risk factors PLUS a raised natriuretic peptide or troponin; C is structural disease with current OR PREVIOUS symptoms; D is advanced disease despite guideline-directed therapy. Resolved symptoms do NOT move a patient back to stage B.',
    compute: hfStagesAbcd,
    fields: [
      { dom: 'hfs-risk', arg: 'riskFactors', kind: 'boolean', required: false, label: 'Risk factors for heart failure' },
      { dom: 'hfs-structural', arg: 'structuralHeartDisease', kind: 'boolean', required: false, label: 'Structural heart disease' },
      { dom: 'hfs-filling', arg: 'raisedFillingPressures', kind: 'boolean', required: false, label: 'Raised filling pressures on echo' },
      { dom: 'hfs-biomarkers', arg: 'raisedBiomarkers', kind: 'boolean', required: false, label: 'Raised natriuretic peptide or troponin' },
      { dom: 'hfs-current', arg: 'currentSymptoms', kind: 'boolean', required: false, label: 'Current symptoms' },
      { dom: 'hfs-previous', arg: 'previousSymptoms', kind: 'boolean', required: false, label: 'Previous symptoms, now resolved' },
      { dom: 'hfs-advanced', arg: 'advancedFeatures', kind: 'boolean', required: false, label: 'Advanced features despite therapy' },
    ],
  },
];

// spec-v1708 MCP adapter: tpa-eligibility in lib/tpa-eligibility-v1708.js. The dom keys mirror views/group-v1708.js
// and META['tpa-eligibility'].example; Table 8's rows are one boolean each, generated from TPA.CONDITIONS.

import * as TPA from '../../lib/tpa-eligibility-v1708.js';

export default [
  {
    id: 'tpa-eligibility',
    summary: 'IV thrombolysis checklist for acute ischemic stroke from the AHA/ASA 2026 guideline: timing windows, disabling deficits and the three tiers of Table 8, beside the TNKase and Activase labels. Never an order.',
    compute: TPA.tpaEligibility,
    fields: [
      { dom: 'tpa-timing', arg: 'timing', kind: 'enum', values: TPA.TIMING_OPTIONS.map((o) => o.value), required: true, label: 'Time from last known well' },
      { dom: 'tpa-disabling', arg: 'disabling', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Deficits disabling' },
      { dom: 'tpa-evt', arg: 'evtCandidate', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Thrombectomy is an option (extended windows)' },
      { dom: 'tpa-penumbra', arg: 'perfusionPenumbra', kind: 'boolean', required: false, label: 'Salvageable penumbra on perfusion imaging' },
      { dom: 'tpa-lvo', arg: 'lvo', kind: 'boolean', required: false, label: 'Large-vessel occlusion' },
      { dom: 'tpa-dwi', arg: 'dwiFlairMismatch', kind: 'boolean', required: false, label: 'DWI lesion under 1/3 MCA, no marked FLAIR change' },
      { dom: 'tpa-sbp', arg: 'sbp', kind: 'number', required: false, label: 'Systolic BP (mm Hg)' },
      { dom: 'tpa-dbp', arg: 'dbp', kind: 'number', required: false, label: 'Diastolic BP (mm Hg)' },
      { dom: 'tpa-glu', arg: 'glucose', kind: 'number', required: false, label: 'Glucose (mg/dL)' },
      { dom: 'tpa-plt', arg: 'platelets', kind: 'number', required: false, label: 'Platelets (x1,000/mm³)' },
      { dom: 'tpa-inr', arg: 'inr', kind: 'number', required: false, label: 'INR' },
      { dom: 'tpa-aptt', arg: 'aptt', kind: 'number', required: false, label: 'aPTT (s)' },
      { dom: 'tpa-pt', arg: 'pt', kind: 'number', required: false, label: 'PT (s)' },
      { dom: 'tpa-anticoag', arg: 'recentAnticoagulant', kind: 'boolean', required: false, label: 'Recent warfarin or heparin' },
      { dom: 'tpa-active-bleed', arg: 'activeInternalBleeding', kind: 'boolean', required: false, label: 'Active internal bleeding (labels)' },
      { dom: 'tpa-sah', arg: 'subarachnoid', kind: 'boolean', required: false, label: 'Subarachnoid hemorrhage (Activase label)' },
      ...TPA.CONDITIONS.map((c) => ({ dom: `tpa-c-${c.key}`, arg: c.key, kind: 'boolean', required: false, label: c.text.replace(/ \(.*\)$/, '') })),
    ]
  },
];

// spec-v183 MCP wave 6: adapters for the four lib/neuro-v119.js stroke-triage /
// cerebrovascular scores. dom keys mirror views/group-v119.js and
// META.example.fields; arg names mirror the lib signatures. Checkbox items are
// booleans (the lib onFlag maps true/'1'/'yes' to counted); graded select items
// are enums whose string value the lib lvl()-coerces.

import * as F from '../../lib/neuro-v119.js';

export default [
  {
    id: 'cpsss',
    summary: 'Cincinnati Prehospital Stroke Severity Scale / C-STAT (Katz 2015): a 0-4 field screen for large-vessel occlusion from conjugate gaze deviation (+2), incorrect LOC questions/commands (+1), and severe arm weakness (+1); a total >= 2 supports comprehensive-stroke-center triage.',
    compute: F.cpsss,
    fields: [
      { dom: 'cp-gaze', arg: 'gaze', kind: 'bool', label: 'Conjugate gaze deviation (+2)' },
      { dom: 'cp-loc', arg: 'loc', kind: 'bool', label: 'LOC questions / commands incorrect (+1)' },
      { dom: 'cp-arm', arg: 'arm', kind: 'bool', label: 'Severe arm weakness (+1)' },
    ],
  },
  {
    id: 'fast-ed',
    summary: 'Field Assessment Stroke Triage for Emergency Destination (Lima 2016): a 0-9 large-vessel-occlusion screen from facial palsy (0-1), arm weakness (0-2), speech changes (0-2), eye deviation (0-2), and neglect (0-2); a total >= 4 predicts occlusion.',
    compute: F.fastEd,
    fields: [
      { dom: 'fe-facial', arg: 'facial', kind: 'enum', values: ['0', '1'], required: true, label: 'Facial palsy' },
      { dom: 'fe-arm', arg: 'arm', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Arm weakness' },
      { dom: 'fe-speech', arg: 'speech', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Speech changes' },
      { dom: 'fe-eye', arg: 'eye', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Eye deviation' },
      { dom: 'fe-neglect', arg: 'neglect', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Neglect' },
    ],
  },
  {
    id: 'boston-caa',
    summary: 'Boston Criteria v2.0 (Charidimou 2022) for cerebral amyloid angiopathy: a categorical Definite / Probable / Possible / not-fulfilled determination from age >= 50, a compatible presentation, the count of strictly lobar hemorrhagic lesions, white-matter features, and the absence of deep hemorrhage.',
    compute: F.bostonCaa,
    fields: [
      { dom: 'bc-path', arg: 'pathology', kind: 'enum', values: ['none', 'specimen', 'postmortem'], label: 'Pathological confirmation' },
      { dom: 'bc-age', arg: 'age50', kind: 'bool', label: 'Age 50 or older' },
      { dom: 'bc-pres', arg: 'presentation', kind: 'bool', label: 'Compatible presentation (lobar ICH / TFNE / cognitive)' },
      { dom: 'bc-lobar', arg: 'lobar', kind: 'enum', values: ['0', '1', '2'], label: 'Strictly lobar hemorrhagic lesions' },
      { dom: 'bc-wm', arg: 'wm', kind: 'bool', label: 'White-matter feature (CSO-PVS > 20 or WMH multispot)' },
      { dom: 'bc-deep', arg: 'deep', kind: 'bool', label: 'Deep hemorrhagic lesion present (exclusion)' },
    ],
  },
  {
    id: 'cvt-risk',
    summary: 'Cerebral-venous-thrombosis risk score (ISCVT, Ferro 2009): a 0-9 in-hospital poor-outcome predictor from malignancy (+2), coma (+2), deep venous thrombosis (+2), mental-status disturbance (+1), male sex (+1), and intracranial hemorrhage (+1); a total >= 3 predicts mRS > 2.',
    compute: F.cvtRisk,
    fields: [
      { dom: 'cv-malig', arg: 'malignancy', kind: 'bool', label: 'Malignancy (+2)' },
      { dom: 'cv-coma', arg: 'coma', kind: 'bool', label: 'Coma / GCS < 9 (+2)' },
      { dom: 'cv-deep', arg: 'deepCvt', kind: 'bool', label: 'Deep venous system thrombosis (+2)' },
      { dom: 'cv-mental', arg: 'mentalStatus', kind: 'bool', label: 'Mental-status disturbance (+1)' },
      { dom: 'cv-male', arg: 'male', kind: 'bool', label: 'Male sex (+1)' },
      { dom: 'cv-ich', arg: 'ich', kind: 'bool', label: 'Intracranial hemorrhage (+1)' },
    ],
  },
];

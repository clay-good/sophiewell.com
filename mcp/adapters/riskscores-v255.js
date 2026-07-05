// spec-v183 MCP wave: adapters for the risk & severity scores in
// lib/riskscores-v255.js — the Venous Clinical Severity Score (VCSS), the PEN-FAST
// penicillin-allergy decision rule, the Harris Hip Score, and the Koivuranta PONV
// score. dom keys mirror views/group-v255.js.

import * as F from '../../lib/riskscores-v255.js';

export default [
  {
    id: 'vcss',
    summary: 'Venous Clinical Severity Score (Vasquez 2010): 10 attributes each scored 0-3; total 0-30, higher = more severe chronic venous disease.',
    compute: F.vcss,
    fields: [
      { dom: 'vc-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain (0-3)' },
      { dom: 'vc-var', arg: 'varicose', kind: 'number', required: true, label: 'Varicose veins (0-3)' },
      { dom: 'vc-edema', arg: 'edema', kind: 'number', required: true, label: 'Venous edema (0-3)' },
      { dom: 'vc-pig', arg: 'pigmentation', kind: 'number', required: true, label: 'Skin pigmentation (0-3)' },
      { dom: 'vc-inf', arg: 'inflammation', kind: 'number', required: true, label: 'Inflammation (0-3)' },
      { dom: 'vc-ind', arg: 'induration', kind: 'number', required: false, label: 'Induration (0-3)' },
      { dom: 'vc-uln', arg: 'ulcerNumber', kind: 'number', required: false, label: 'Number of active ulcers (0-3)' },
      { dom: 'vc-uld', arg: 'ulcerDuration', kind: 'number', required: false, label: 'Active ulcer duration (0-3)' },
      { dom: 'vc-uls', arg: 'ulcerSize', kind: 'number', required: false, label: 'Active ulcer size (0-3)' },
      { dom: 'vc-comp', arg: 'compression', kind: 'number', required: false, label: 'Use of compression therapy (0-3)' },
    ],
  },
  {
    id: 'pen-fast',
    summary: 'PEN-FAST penicillin-allergy rule (Trubiano 2020): reaction within five years (+2), anaphylaxis/angioedema or severe cutaneous reaction (+2), treatment required (+1); total 0-5 and < 3 is low risk.',
    compute: F.penFast,
    fields: [
      { dom: 'pf-recent', arg: 'recent', kind: 'bool', required: true, label: 'Reaction within the last five years' },
      { dom: 'pf-anaph', arg: 'anaphylaxis', kind: 'bool', required: true, label: 'Anaphylaxis/angioedema OR severe cutaneous reaction' },
      { dom: 'pf-treat', arg: 'treatment', kind: 'bool', required: false, label: 'Treatment required for the reaction' },
    ],
  },
  {
    id: 'harris-hip-score',
    summary: 'Harris Hip Score (Harris 1969): pain (0-44) + function (0-47) + absence of deformity (0/4) + range of motion (0-5); total 0-100, higher = better hip function.',
    compute: F.harrisHipScore,
    fields: [
      { dom: 'hh-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain (0-44)' },
      { dom: 'hh-func', arg: 'function', kind: 'number', required: true, label: 'Function / gait + activities (0-47)' },
      { dom: 'hh-def', arg: 'deformity', kind: 'number', required: true, label: 'Absence of deformity (0 or 4)' },
      { dom: 'hh-rom', arg: 'rom', kind: 'number', required: true, label: 'Range of motion (0-5)' },
    ],
  },
  {
    id: 'koivuranta-ponv',
    summary: 'Koivuranta PONV score (Koivuranta 1997): female sex, prior PONV, motion sickness, non-smoker, and surgery > 60 min each 1 point; total 0-5 predicts postoperative nausea/vomiting risk.',
    compute: F.koivurantaPonv,
    fields: [
      { dom: 'kv-female', arg: 'female', kind: 'bool', required: true, label: 'Female sex' },
      { dom: 'kv-prior', arg: 'priorPonv', kind: 'bool', required: true, label: 'Previous PONV' },
      { dom: 'kv-motion', arg: 'motionSickness', kind: 'bool', required: false, label: 'History of motion sickness' },
      { dom: 'kv-smoke', arg: 'nonSmoker', kind: 'bool', required: true, label: 'Non-smoker' },
      { dom: 'kv-long', arg: 'longSurgery', kind: 'bool', required: false, label: 'Surgery > 60 minutes' },
    ],
  },
];

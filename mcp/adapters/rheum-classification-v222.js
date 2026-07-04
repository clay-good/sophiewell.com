// spec-v183 MCP wave 44: adapters for the seven rheumatology classification /
// severity instruments in lib/rheum-classification-v222.js — the 2017 EULAR/ACR
// myositis and 2012 EULAR/ACR PMR criteria, the Bohan & Peter criteria, the 2013
// ACR/EULAR systemic-sclerosis criteria, the modified Rodnan skin score, the
// 2016 ACR/EULAR Sjogren criteria, and ESSPRI. dom keys mirror
// views/group-v222.js. The IIM age band and the SSc skin/fingertip selects carry
// numeric-string point values (modeled as enums); mRSS takes 17 optional 0–3
// site grades; the rest are boolean criteria and 0–10 patient scales.

import * as F from '../../lib/rheum-classification-v222.js';

const MRSS_SITES = [
  'fingersR', 'fingersL', 'handsR', 'handsL', 'forearmsR', 'forearmsL',
  'upperArmsR', 'upperArmsL', 'face', 'chest', 'abdomen', 'thighsR', 'thighsL',
  'legsR', 'legsL', 'feetR', 'feetL',
];

export default [
  {
    id: 'iim-eular-acr-2017',
    summary: '2017 EULAR/ACR classification criteria for idiopathic inflammatory myopathies (Lundberg 2017), without-biopsy weights: age of onset plus weakness pattern, skin findings, dysphagia, anti-Jo-1, and elevated muscle enzymes give a weighted score (definite ≥ 7.5).',
    compute: F.iimEularAcr,
    fields: [
      { dom: 'iim-age', arg: 'ageBand', kind: 'enum', values: ['0', '1.3', '2.1'], required: true, label: 'Age of onset (points)' },
      { dom: 'iim-pu', arg: 'proximalUpper', kind: 'bool', required: false, label: 'Proximal upper-extremity weakness (0.7)' },
      { dom: 'iim-pl', arg: 'proximalLower', kind: 'bool', required: false, label: 'Proximal lower-extremity weakness (0.8)' },
      { dom: 'iim-neck', arg: 'neckFlexors', kind: 'bool', required: false, label: 'Neck flexors weaker than extensors (1.9)' },
      { dom: 'iim-leg', arg: 'legProximal', kind: 'bool', required: false, label: 'Leg proximal weaker than distal (0.9)' },
      { dom: 'iim-helio', arg: 'heliotrope', kind: 'bool', required: false, label: 'Heliotrope rash (3.1)' },
      { dom: 'iim-gp', arg: 'gottronPapules', kind: 'bool', required: false, label: "Gottron's papules (2.1)" },
      { dom: 'iim-gs', arg: 'gottronSign', kind: 'bool', required: false, label: "Gottron's sign (3.3)" },
      { dom: 'iim-dys', arg: 'dysphagia', kind: 'bool', required: false, label: 'Dysphagia / esophageal dysmotility (0.7)' },
      { dom: 'iim-jo1', arg: 'antiJo1', kind: 'bool', required: false, label: 'Anti-Jo-1 antibody (3.9)' },
      { dom: 'iim-enz', arg: 'elevatedEnzymes', kind: 'bool', required: false, label: 'Elevated CK / LDH / AST / ALT (1.3)' },
    ],
  },
  {
    id: 'pmr-eular-acr-2012',
    summary: '2012 EULAR/ACR polymyalgia rheumatica criteria (Dasgupta 2012), after entry criteria: morning stiffness > 45 min, hip involvement, absent RF/ACPA, and absent other joint involvement give a score (≥ 4 classifies as PMR).',
    compute: F.pmrEularAcr,
    fields: [
      { dom: 'pmr-stiff', arg: 'stiffness', kind: 'bool', required: false, label: 'Morning stiffness > 45 minutes (+2)' },
      { dom: 'pmr-hip', arg: 'hip', kind: 'bool', required: false, label: 'Hip pain or limited range of motion (+1)' },
      { dom: 'pmr-rf', arg: 'absentRfAcpa', kind: 'bool', required: false, label: 'Absence of RF and/or ACPA (+2)' },
      { dom: 'pmr-joint', arg: 'absentOtherJoints', kind: 'bool', required: false, label: 'Absence of other joint involvement (+1)' },
    ],
  },
  {
    id: 'bohan-peter',
    summary: 'Bohan & Peter criteria (1975): symmetric proximal weakness, elevated muscle enzymes, myopathic EMG, abnormal biopsy, and a dermatomyositis rash classify polymyositis (no rash) or dermatomyositis (rash) by the count of core criteria.',
    compute: F.bohanPeter,
    fields: [
      { dom: 'bp-weak', arg: 'weakness', kind: 'bool', required: false, label: 'Symmetric proximal muscle weakness' },
      { dom: 'bp-enz', arg: 'enzymes', kind: 'bool', required: false, label: 'Elevated serum muscle enzymes' },
      { dom: 'bp-emg', arg: 'emg', kind: 'bool', required: false, label: 'Myopathic EMG changes' },
      { dom: 'bp-biopsy', arg: 'biopsy', kind: 'bool', required: false, label: 'Abnormal muscle biopsy' },
      { dom: 'bp-rash', arg: 'rash', kind: 'bool', required: false, label: 'Dermatomyositis rash (heliotrope / Gottron)' },
    ],
  },
  {
    id: 'acr-eular-2013-systemic-sclerosis',
    summary: '2013 ACR/EULAR systemic-sclerosis criteria (van den Hoogen 2013): skin thickening proximal to the MCP joints is sufficient (9); otherwise a weighted sum of skin, fingertip, telangiectasia, nailfold, PAH/ILD, Raynaud, and autoantibody items (≥ 9 classifies as SSc).',
    compute: F.ssc2013,
    fields: [
      { dom: 'ssc-mcp', arg: 'proximalMcp', kind: 'bool', required: false, label: 'Skin thickening proximal to the MCP joints (sufficient, 9)' },
      { dom: 'ssc-skin', arg: 'skinFingers', kind: 'enum', values: ['0', '2', '4'], required: true, label: 'Skin thickening of the fingers (points)' },
      { dom: 'ssc-tip', arg: 'fingertip', kind: 'enum', values: ['0', '2', '3'], required: true, label: 'Fingertip lesions (points)' },
      { dom: 'ssc-tel', arg: 'telangiectasia', kind: 'bool', required: false, label: 'Telangiectasia (2)' },
      { dom: 'ssc-nail', arg: 'nailfold', kind: 'bool', required: false, label: 'Abnormal nailfold capillaries (2)' },
      { dom: 'ssc-pah', arg: 'pahIld', kind: 'bool', required: false, label: 'Pulmonary arterial hypertension and/or ILD (2)' },
      { dom: 'ssc-ray', arg: 'raynaud', kind: 'bool', required: false, label: 'Raynaud phenomenon (3)' },
      { dom: 'ssc-ab', arg: 'autoantibodies', kind: 'bool', required: false, label: 'SSc-related autoantibodies (3)' },
    ],
  },
  {
    id: 'mrss-modified-rodnan-skin-score',
    summary: 'Modified Rodnan skin score (Clements 1995): skin thickness graded 0–3 at 17 body sites gives a 0–51 total; a higher score marks more extensive skin involvement in systemic sclerosis.',
    compute: F.mrss,
    fields: MRSS_SITES.map((key) => ({
      dom: `mrss-${key}`, arg: key, kind: 'number', required: false, label: `${key} skin thickness (0–3)`,
    })),
  },
  {
    id: 'acr-eular-2016-sjogren',
    summary: "2016 ACR/EULAR Sjogren's criteria (Shiboski 2017): labial-gland focus score ≥ 1 (3), anti-SSA/Ro (3), ocular staining ≥ 5 (1), Schirmer ≤ 5 (1), and unstimulated saliva flow ≤ 0.1 (1); a total ≥ 4 classifies as Sjogren's.",
    compute: F.sjogren2016,
    fields: [
      { dom: 'sj-focus', arg: 'focusScore', kind: 'bool', required: false, label: 'Labial gland focus score ≥ 1 (+3)' },
      { dom: 'sj-ssa', arg: 'antiSsa', kind: 'bool', required: false, label: 'Anti-SSA/Ro positivity (+3)' },
      { dom: 'sj-ocular', arg: 'ocularStaining', kind: 'bool', required: false, label: 'Ocular staining score ≥ 5 (+1)' },
      { dom: 'sj-schirmer', arg: 'schirmer', kind: 'bool', required: false, label: 'Schirmer test ≤ 5 mm/5 min (+1)' },
      { dom: 'sj-saliva', arg: 'salivaFlow', kind: 'bool', required: false, label: 'Unstimulated saliva flow ≤ 0.1 mL/min (+1)' },
    ],
  },
  {
    id: 'esspri',
    summary: 'ESSPRI (Seror 2011): the mean of three 0–10 patient-reported scales — dryness, fatigue, and pain; ≥ 5 is above the patient-acceptable symptom state.',
    compute: F.esspri,
    fields: [
      { dom: 'esp-dry', arg: 'dryness', kind: 'number', required: true, label: 'Dryness (0–10)' },
      { dom: 'esp-fat', arg: 'fatigue', kind: 'number', required: true, label: 'Fatigue (0–10)' },
      { dom: 'esp-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain (limb / articular / muscular) (0–10)' },
    ],
  },
];

// MCP wave 12: adapters for lib/rheum-v148.js — the ASDAS axial-SpA activity
// score, the 2011 Five-Factor Score, the 2022 ACR/EULAR giant-cell-arteritis
// classification, the Palliative Prognostic Index and Score, the opioid
// equianalgesic converter, and the Naranjo ADR probability scale. dom keys
// mirror views/group-v148.js.

import * as F from '../../lib/rheum-v148.js';

const OPIOID_AGENTS = [
  'morphine-po', 'morphine-iv', 'oxycodone-po', 'hydromorphone-po',
  'hydromorphone-iv', 'hydrocodone-po', 'codeine-po', 'tramadol-po',
  'tapentadol-po', 'oxymorphone-po', 'oxymorphone-iv', 'fentanyl-iv',
  'fentanyl-td',
];

export default [
  {
    id: 'asdas',
    summary: 'Ankylosing Spondylitis Disease Activity Score (ASDAS) from four 0–10 patient items plus CRP (mg/L, preferred) or ESR (mm/h), banded inactive / low / high / very-high.',
    compute: F.asdas,
    fields: [
      { dom: 'asdas-bp', arg: 'backPain', kind: 'number', required: true, label: 'Back pain (0–10)' },
      { dom: 'asdas-ms', arg: 'morningStiffness', kind: 'number', required: true, label: 'Morning stiffness (0–10)' },
      { dom: 'asdas-pg', arg: 'patientGlobal', kind: 'number', required: true, label: 'Patient global (0–10)' },
      { dom: 'asdas-pp', arg: 'peripheralPain', kind: 'number', required: true, label: 'Peripheral pain/swelling (0–10)' },
      { dom: 'asdas-crp', arg: 'crp', kind: 'number', required: false, label: 'CRP (preferred)', unit: 'mg/L' },
      { dom: 'asdas-esr', arg: 'esr', kind: 'number', required: false, label: 'ESR (if no CRP)', unit: 'mm/h' },
    ],
  },
  {
    id: 'ffs-2011',
    summary: 'Five-Factor Score, 2011 revision (0–5) for systemic necrotizing vasculitis: age > 65, cardiac, GI, and renal involvement each +1, plus absence of ENT manifestations +1.',
    compute: F.ffs2011,
    fields: [
      { dom: 'ffs-age', arg: 'age', kind: 'bool', required: false, label: 'Age > 65 years' },
      { dom: 'ffs-cardiac', arg: 'cardiac', kind: 'bool', required: false, label: 'Cardiac insufficiency' },
      { dom: 'ffs-gi', arg: 'gi', kind: 'bool', required: false, label: 'Gastrointestinal involvement' },
      { dom: 'ffs-renal', arg: 'renal', kind: 'bool', required: false, label: 'Renal insufficiency (creatinine ≥ 150 µmol/L)' },
      { dom: 'ffs-noent', arg: 'noEnt', kind: 'bool', required: false, label: 'Absence of ENT manifestations' },
    ],
  },
  {
    id: 'gca-acr-eular-2022',
    summary: '2022 ACR/EULAR giant-cell-arteritis classification (weighted, max 25); a cumulative score ≥ 6 classifies as GCA once the age ≥ 50 entry requirement is met.',
    compute: F.gcaAcrEular2022,
    fields: [
      { dom: 'gca-entry', arg: 'entry', kind: 'bool', required: false, label: 'Entry: age ≥ 50 at diagnosis' },
      { dom: 'gca-biopsy', arg: 'biopsyHalo', kind: 'bool', required: false, label: 'Positive TA biopsy or halo on ultrasound (+5)' },
      { dom: 'gca-apr', arg: 'aprHigh', kind: 'bool', required: false, label: 'ESR ≥ 50 or CRP ≥ 10 mg/L (+3)' },
      { dom: 'gca-visual', arg: 'visualLoss', kind: 'bool', required: false, label: 'Sudden visual loss (+3)' },
      { dom: 'gca-stiff', arg: 'morningStiffness', kind: 'bool', required: false, label: 'Morning stiffness of shoulders/neck (+2)' },
      { dom: 'gca-jaw', arg: 'jawClaudication', kind: 'bool', required: false, label: 'Jaw or tongue claudication (+2)' },
      { dom: 'gca-headache', arg: 'temporalHeadache', kind: 'bool', required: false, label: 'New temporal headache (+2)' },
      { dom: 'gca-scalp', arg: 'scalpTenderness', kind: 'bool', required: false, label: 'Scalp tenderness (+2)' },
      { dom: 'gca-ta', arg: 'taAbnormal', kind: 'bool', required: false, label: 'Abnormal temporal artery on exam (+2)' },
      { dom: 'gca-axillary', arg: 'bilateralAxillary', kind: 'bool', required: false, label: 'Bilateral axillary involvement on imaging (+2)' },
      { dom: 'gca-pet', arg: 'petAorta', kind: 'bool', required: false, label: 'FDG-PET activity throughout the aorta (+2)' },
    ],
  },
  {
    id: 'palliative-prognostic-index',
    summary: 'Palliative Prognostic Index (PPI, 0–15) from the Palliative Performance Scale band, oral intake, edema, dyspnea at rest, and delirium; > 6 predicts survival under 3 weeks.',
    compute: F.palliativePrognosticIndex,
    fields: [
      { dom: 'ppi-pps', arg: 'pps', kind: 'enum', values: ['high', 'mid', 'low'], required: false, label: 'Palliative Performance Scale band (high ≥ 60 / mid 30–50 / low 10–20)' },
      { dom: 'ppi-intake', arg: 'intake', kind: 'enum', values: ['normal', 'reduced', 'mouthfuls'], required: false, label: 'Oral intake' },
      { dom: 'ppi-edema', arg: 'edema', kind: 'bool', required: false, label: 'Edema (+1)' },
      { dom: 'ppi-dyspnea', arg: 'dyspnea', kind: 'bool', required: false, label: 'Dyspnea at rest (+3.5)' },
      { dom: 'ppi-delirium', arg: 'delirium', kind: 'bool', required: false, label: 'Delirium (+4)' },
    ],
  },
  {
    id: 'palliative-prognostic-score',
    summary: 'Palliative Prognostic Score (PaP, 0–17.5) from dyspnea, anorexia, Karnofsky status, the clinician’s survival prediction, WBC, and lymphocyte percentage; maps to risk groups A/B/C.',
    compute: F.palliativePrognosticScore,
    fields: [
      { dom: 'pap-kps', arg: 'kps', kind: 'enum', values: ['ge30', 'lo'], required: false, label: 'Karnofsky Performance Status (ge30 ≥ 30 / lo 10–20)' },
      { dom: 'pap-cps', arg: 'cps', kind: 'enum', values: ['w12', 'w11', 'w7', 'w5', 'w3', 'w1'], required: false, label: 'Clinical prediction of survival (weeks band)' },
      { dom: 'pap-wbc', arg: 'wbc', kind: 'enum', values: ['normal', 'high', 'vhigh'], required: false, label: 'Total WBC' },
      { dom: 'pap-lymph', arg: 'lymph', kind: 'enum', values: ['normal', 'low', 'vlow'], required: false, label: 'Lymphocyte percentage' },
      { dom: 'pap-dyspnea', arg: 'dyspnea', kind: 'bool', required: false, label: 'Dyspnea (+1)' },
      { dom: 'pap-anorexia', arg: 'anorexia', kind: 'bool', required: false, label: 'Anorexia (+1.5)' },
    ],
  },
  {
    id: 'opioid-conversion',
    summary: 'Opioid equianalgesic / rotation converter: the source daily dose is converted to oral morphine equivalents and back to the target opioid, then reduced 0–50% for incomplete cross-tolerance.',
    compute: F.opioidConversion,
    fields: [
      { dom: 'opc-source', arg: 'source', kind: 'enum', values: OPIOID_AGENTS, required: true, label: 'Source opioid and route' },
      { dom: 'opc-dose', arg: 'dose', kind: 'number', required: true, label: 'Total source daily dose', unit: 'mg or mcg/day' },
      { dom: 'opc-target', arg: 'target', kind: 'enum', values: OPIOID_AGENTS, required: true, label: 'Target opioid and route' },
      { dom: 'opc-reduction', arg: 'reduction', kind: 'enum', values: ['r0', 'r25', 'r33', 'r50'], required: false, label: 'Cross-tolerance reduction (r0/r25/r33/r50)' },
    ],
  },
  {
    id: 'naranjo',
    summary: 'Naranjo Adverse Drug Reaction Probability Scale: ten weighted yes/no/unknown questions summing −4 to +13, banded doubtful / possible / probable / definite.',
    compute: F.naranjo,
    fields: [
      { dom: 'nar-q1', arg: 'q1', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Previous conclusive reports' },
      { dom: 'nar-q2', arg: 'q2', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Event after the drug was given' },
      { dom: 'nar-q3', arg: 'q3', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Improved on dechallenge/antagonist' },
      { dom: 'nar-q4', arg: 'q4', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Reappeared on rechallenge' },
      { dom: 'nar-q5', arg: 'q5', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Alternative causes present' },
      { dom: 'nar-q6', arg: 'q6', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Reappeared with placebo' },
      { dom: 'nar-q7', arg: 'q7', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Drug in toxic blood concentration' },
      { dom: 'nar-q8', arg: 'q8', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Dose-response relationship' },
      { dom: 'nar-q9', arg: 'q9', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Prior similar reaction' },
      { dom: 'nar-q10', arg: 'q10', kind: 'enum', values: ['yes', 'no', 'unknown'], required: true, label: 'Confirmed by objective evidence' },
    ],
  },
];

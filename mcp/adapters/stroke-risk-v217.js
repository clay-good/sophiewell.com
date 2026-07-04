// spec-v183 MCP wave 39: adapters for the seven stroke / neuro-vascular risk
// scores in lib/stroke-risk-v217.js — the Canadian TIA Score, the ASTRAL and
// PLAN ischemic-stroke outcome scores, the SOAR stroke-mortality score, the
// SITS-SICH post-thrombolysis hemorrhage score, and the VASOGRADE and
// Ogilvy-Carter aneurysmal-SAH grading scales. dom keys mirror
// views/group-v217.js. SOAR, SITS-SICH, and VASOGRADE ordinal selects carry
// numeric-string values (modeled as enums); the rest are numeric vitals/labs and
// boolean flags.

import * as F from '../../lib/stroke-risk-v217.js';

export default [
  {
    id: 'canadian-tia-score',
    summary: 'Canadian TIA Score (Perry 2014): thirteen clinical and investigation variables (range −3 to 23) stratify the 7-day risk of stroke after a TIA (low ≤ 3, medium 4–8, high ≥ 9).',
    compute: F.canadianTia,
    fields: [
      { dom: 'ctia-first', arg: 'firstTia', kind: 'bool', required: false, label: 'First TIA in lifetime (+2)' },
      { dom: 'ctia-dur', arg: 'duration10', kind: 'bool', required: false, label: 'Symptoms ≥ 10 minutes (+2)' },
      { dom: 'ctia-carotid', arg: 'carotid', kind: 'bool', required: false, label: 'History of carotid stenosis (+2)' },
      { dom: 'ctia-ap', arg: 'antiplatelet', kind: 'bool', required: false, label: 'Already on antiplatelet therapy (+3)' },
      { dom: 'ctia-gait', arg: 'gait', kind: 'bool', required: false, label: 'History of gait disturbance (+1)' },
      { dom: 'ctia-weak', arg: 'weakness', kind: 'bool', required: false, label: 'History of unilateral weakness (+1)' },
      { dom: 'ctia-vertigo', arg: 'vertigo', kind: 'bool', required: false, label: 'History of vertigo (−3)' },
      { dom: 'ctia-dbp', arg: 'dbp110', kind: 'bool', required: false, label: 'Triage diastolic BP ≥ 110 mmHg (+3)' },
      { dom: 'ctia-dys', arg: 'dysarthria', kind: 'bool', required: false, label: 'Dysarthria or aphasia (+1)' },
      { dom: 'ctia-af', arg: 'afEcg', kind: 'bool', required: false, label: 'Atrial fibrillation on ECG (+2)' },
      { dom: 'ctia-ct', arg: 'infarctCt', kind: 'bool', required: false, label: 'Infarction on CT (+1)' },
      { dom: 'ctia-plt', arg: 'plt400', kind: 'bool', required: false, label: 'Platelets ≥ 400 ×10⁹/L (+2)' },
      { dom: 'ctia-glu', arg: 'glucose15', kind: 'bool', required: false, label: 'Glucose ≥ 15 mmol/L (+3)' },
    ],
  },
  {
    id: 'astral-score',
    summary: 'ASTRAL score (Ntaios 2012): 1 point per 5 years of age, 1 per NIHSS point, onset > 3 h, new visual-field defect, abnormal admission glucose, and impaired consciousness predict the 90-day unfavorable-outcome probability after ischemic stroke.',
    compute: F.astral,
    fields: [
      { dom: 'ast-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ast-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Admission NIHSS' },
      { dom: 'ast-onset', arg: 'onsetOver3h', kind: 'bool', required: false, label: 'Onset > 3 h (or unknown) (+2)' },
      { dom: 'ast-visual', arg: 'visualDefect', kind: 'bool', required: false, label: 'New visual-field defect (+2)' },
      { dom: 'ast-glu', arg: 'glucoseAbnormal', kind: 'bool', required: false, label: 'Admission glucose > 7.3 or < 3.7 mmol/L (+1)' },
      { dom: 'ast-loc', arg: 'impairedConsciousness', kind: 'bool', required: false, label: 'Impaired consciousness (+3)' },
    ],
  },
  {
    id: 'soar-score',
    summary: 'SOAR score (Myint 2014): stroke subtype, OCSP (Bamford) class, age band, and prestroke Rankin give a 0–7 score predicting early stroke mortality.',
    compute: F.soar,
    fields: [
      { dom: 'soar-sub', arg: 'subtype', kind: 'enum', values: ['0', '1'], required: true, label: 'Stroke subtype (ischemic 0 / hemorrhagic 1)' },
      { dom: 'soar-ocsp', arg: 'ocsp', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'OCSP (Bamford) classification' },
      { dom: 'soar-age', arg: 'ageBand', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Age band' },
      { dom: 'soar-rankin', arg: 'rankin', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Prestroke modified Rankin' },
    ],
  },
  {
    id: 'plan-score',
    summary: 'PLAN score (O’Donnell 2012): preadmission comorbidities (dependence, cancer, heart failure, AF), level of consciousness, age, and neurologic deficits (arm/leg weakness, aphasia/neglect) give a 0–25 score predicting 30-day mortality after ischemic stroke.',
    compute: F.plan,
    fields: [
      { dom: 'plan-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'plan-dep', arg: 'dependence', kind: 'bool', required: false, label: 'Preadmission dependence' },
      { dom: 'plan-cancer', arg: 'cancer', kind: 'bool', required: false, label: 'Cancer' },
      { dom: 'plan-chf', arg: 'chf', kind: 'bool', required: false, label: 'Congestive heart failure' },
      { dom: 'plan-af', arg: 'af', kind: 'bool', required: false, label: 'Atrial fibrillation' },
      { dom: 'plan-loc', arg: 'reducedLoc', kind: 'bool', required: false, label: 'Reduced level of consciousness' },
      { dom: 'plan-arm', arg: 'armWeakness', kind: 'bool', required: false, label: 'Arm weakness' },
      { dom: 'plan-leg', arg: 'legWeakness', kind: 'bool', required: false, label: 'Leg weakness' },
      { dom: 'plan-aphasia', arg: 'aphasiaNeglect', kind: 'bool', required: false, label: 'Aphasia or neglect' },
    ],
  },
  {
    id: 'sits-sich',
    summary: 'SITS-SICH score (Mazya 2012): antiplatelet therapy, NIHSS, glucose, systolic BP, weight, age, onset time, and hypertension predict symptomatic intracranial hemorrhage after IV alteplase.',
    compute: F.sitsSich,
    fields: [
      { dom: 'sits-ap', arg: 'antiplatelet', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Antiplatelet therapy (none / aspirin / aspirin + clopidogrel)' },
      { dom: 'sits-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Admission NIHSS' },
      { dom: 'sits-glu', arg: 'glucose', kind: 'number', required: true, label: 'Blood glucose', unit: 'mg/dL' },
      { dom: 'sits-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'sits-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'sits-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sits-onset', arg: 'onset180', kind: 'bool', required: false, label: 'Onset-to-treatment > 180 min' },
      { dom: 'sits-htn', arg: 'hypertension', kind: 'bool', required: false, label: 'History of hypertension' },
    ],
  },
  {
    id: 'vasograde',
    summary: 'VASOGRADE (de Oliveira Manoel 2015): combines the modified Fisher scale and WFNS grade after aneurysmal SAH into a Green / Yellow / Red band of delayed-cerebral-ischemia risk.',
    compute: F.vasograde,
    fields: [
      { dom: 'vaso-mf', arg: 'modifiedFisher', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Modified Fisher scale' },
      { dom: 'vaso-wfns', arg: 'wfns', kind: 'enum', values: ['1', '2', '3', '4', '5'], required: true, label: 'WFNS grade' },
    ],
  },
  {
    id: 'ogilvy-carter',
    summary: 'Ogilvy-Carter grading (Ogilvy 1998): one point each for age > 50, Hunt-Hess 4–5, Fisher 3–4, aneurysm > 10 mm, and posterior giant ≥ 25 mm gives a 0–5 grade predicting post-operative outcome.',
    compute: F.ogilvyCarter,
    fields: [
      { dom: 'oc-age', arg: 'ageOver50', kind: 'bool', required: false, label: 'Age > 50 (+1)' },
      { dom: 'oc-hh', arg: 'huntHess45', kind: 'bool', required: false, label: 'Hunt-Hess 4–5 (+1)' },
      { dom: 'oc-fisher', arg: 'fisher34', kind: 'bool', required: false, label: 'Fisher 3–4 (+1)' },
      { dom: 'oc-size', arg: 'sizeOver10', kind: 'bool', required: false, label: 'Aneurysm > 10 mm (+1)' },
      { dom: 'oc-post', arg: 'posteriorGiant', kind: 'bool', required: false, label: 'Posterior giant ≥ 25 mm (+1)' },
    ],
  },
];

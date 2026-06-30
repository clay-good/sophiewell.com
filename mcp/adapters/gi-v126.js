// spec-v183 MCP wave 4: adapters for five lib/gi-v126.js gastroenterology
// disease-activity / severity indices. dom keys mirror views/group-v126.js and
// META.example.fields; arg names mirror the lib signatures (stools, vascular,
// pao2, …). `ses-cd` is deliberately NOT exposed: its inputs are per-segment
// arrays (sumArr), not the flat dom→arg→kind contract this wave covers.

import * as F from '../../lib/gi-v126.js';

export default [
  {
    id: 'cdai-crohns',
    summary: "Crohn's Disease Activity Index (Best 1976): liquid stools (×2) + abdominal pain (×5) + general well-being (×7) + complications (×20) + antidiarrheal use (30) + abdominal mass (×10) + hematocrit deficit (×6) + percent below standard weight; < 150 remission, 150-220 mild, 221-450 moderate, > 450 severe.",
    compute: F.cdaiCrohns,
    fields: [
      { dom: 'cd-stools', arg: 'stools', kind: 'number', label: 'Liquid/soft stools (sum over 7 days)' },
      { dom: 'cd-pain', arg: 'pain', kind: 'number', label: 'Abdominal pain (sum of daily 0-3 over 7 days)' },
      { dom: 'cd-well', arg: 'wellbeing', kind: 'number', label: 'General well-being (sum of daily 0-4 over 7 days)' },
      { dom: 'cd-comp', arg: 'complications', kind: 'number', label: 'Number of complications (0-6)' },
      { dom: 'cd-anti', arg: 'antidiarrheal', kind: 'bool', label: 'Antidiarrheal use' },
      { dom: 'cd-mass', arg: 'abdMass', kind: 'number', label: 'Abdominal mass (0 none, 2 questionable, 5 definite)' },
      { dom: 'cd-female', arg: 'female', kind: 'bool', label: 'Female (sets the hematocrit reference to 42)' },
      { dom: 'cd-hct', arg: 'hct', kind: 'number', required: true, label: 'Hematocrit', unit: '%' },
      { dom: 'cd-wt', arg: 'weight', kind: 'number', required: true, label: 'Current weight', unit: 'kg' },
      { dom: 'cd-std', arg: 'standardWeight', kind: 'number', required: true, label: 'Standard/ideal body weight', unit: 'kg' },
    ],
  },
  {
    id: 'uceis',
    summary: 'UC Endoscopic Index of Severity (Travis 2012, 0-based modern scale): vascular pattern (0-2) + bleeding (0-3) + erosions/ulcers (0-3) at the worst-affected area; total 0-8, remission 0-1, mild 2-4, moderate 5-6, severe 7-8.',
    compute: F.uceis,
    fields: [
      { dom: 'uc-vasc', arg: 'vascular', kind: 'number', required: true, label: 'Vascular pattern (0 normal, 1 patchy, 2 obliterated)' },
      { dom: 'uc-bleed', arg: 'bleeding', kind: 'number', required: true, label: 'Bleeding (0 none … 3 luminal moderate/severe)' },
      { dom: 'uc-ero', arg: 'erosions', kind: 'number', required: true, label: 'Erosions/ulcers (0 none … 3 deep ulcer)' },
    ],
  },
  {
    id: 'haps',
    summary: 'Harmless Acute Pancreatitis Score (Lankisch 2009): a three-criterion admission gate — no rebound/guarding, normal hematocrit (< 43 men / < 39.6 women), normal creatinine (< 2 mg/dL). All three normal predicts a non-severe course; any abnormal does not rule severity in.',
    compute: F.haps,
    fields: [
      { dom: 'ha-perit', arg: 'peritonitis', kind: 'bool', label: 'Rebound tenderness or guarding present' },
      { dom: 'ha-female', arg: 'female', kind: 'bool', label: 'Female (sets the hematocrit threshold to 39.6)' },
      { dom: 'ha-hct', arg: 'hct', kind: 'number', required: true, label: 'Hematocrit', unit: '%' },
      { dom: 'ha-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'ctsi-balthazar',
    summary: 'CT Severity Index (Balthazar 1990): contrast-CT grade A-E (0-4) + pancreatic-necrosis score (0/2/4/6); total 0-10, 0-3 mild, 4-6 moderate, 7-10 severe acute pancreatitis.',
    compute: F.ctsiBalthazar,
    fields: [
      { dom: 'ct-grade', arg: 'grade', kind: 'number', required: true, label: 'Balthazar CT grade (A=0 … E=4)' },
      { dom: 'ct-necr', arg: 'necrosis', kind: 'number', required: true, label: 'Pancreatic necrosis (0 none, 2 ≤ 30%, 4 30-50%, 6 > 50%)' },
    ],
  },
  {
    id: 'modified-marshall',
    summary: 'Modified Marshall organ-dysfunction score (Banks 2013, Revised Atlanta): respiratory by PaO2/FiO2, renal by creatinine, and cardiovascular each scored 0-4; a score ≥ 2 in any system is organ failure.',
    compute: F.modifiedMarshall,
    fields: [
      { dom: 'mm-pao2', arg: 'pao2', kind: 'number', label: 'PaO2', unit: 'mmHg' },
      { dom: 'mm-fio2', arg: 'fio2', kind: 'number', label: 'FiO2', unit: '%' },
      { dom: 'mm-creat', arg: 'creatinine', kind: 'number', label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'mm-cv', arg: 'cardiovascular', kind: 'number', label: 'Cardiovascular score (0-4, pre-banded; blank = not assessed)' },
    ],
  },
];

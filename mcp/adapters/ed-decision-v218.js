// spec-v183 MCP wave 40: adapters for the seven ED decision instruments in
// lib/ed-decision-v218.js — the FAINT syncope score, the NEXUS Head CT rule, the
// HANDOC and DENOVA endocarditis-echo scores, the 2018 ICM prosthetic-joint-
// infection definition, and the AIR and Adult Appendicitis scores. dom keys
// mirror views/group-v218.js. HANDOC aetiology, AIR rebound, and AAS guarding
// are ordinal selects (numeric-string enums); the rest are numeric labs and
// boolean flags.

import * as F from '../../lib/ed-decision-v218.js';

export default [
  {
    id: 'faint-score',
    summary: 'FAINT score (Probst 2020): heart failure, arrhythmia history, abnormal ECG, elevated NT-proBNP, and elevated hs-troponin identify older ED syncope patients not at low risk for a 30-day serious cardiac outcome.',
    compute: F.faint,
    fields: [
      { dom: 'fnt-hf', arg: 'heartFailure', kind: 'bool', required: false, label: 'History of heart failure (+1)' },
      { dom: 'fnt-arr', arg: 'arrhythmia', kind: 'bool', required: false, label: 'History of cardiac arrhythmia (+1)' },
      { dom: 'fnt-ecg', arg: 'abnormalEcg', kind: 'bool', required: false, label: 'Abnormal initial ECG (+1)' },
      { dom: 'fnt-bnp', arg: 'ntprobnp', kind: 'bool', required: false, label: 'Elevated NT-proBNP (+2)' },
      { dom: 'fnt-trop', arg: 'troponin', kind: 'bool', required: false, label: 'Elevated hs-troponin (+1)' },
    ],
  },
  {
    id: 'nexus-head-ct',
    summary: 'NEXUS Head CT rule: any of eight criteria (skull fracture signs, scalp hematoma, neurologic deficit, altered alertness, abnormal behavior, coagulopathy, persistent vomiting, age ≥ 65) makes head CT indicated after blunt head trauma.',
    compute: F.nexusHead,
    fields: [
      { dom: 'nx-skull', arg: 'skullFracture', kind: 'bool', required: false, label: 'Signs of significant skull fracture' },
      { dom: 'nx-scalp', arg: 'scalpHematoma', kind: 'bool', required: false, label: 'Scalp hematoma' },
      { dom: 'nx-deficit', arg: 'neuroDeficit', kind: 'bool', required: false, label: 'Neurologic deficit' },
      { dom: 'nx-alert', arg: 'alteredAlertness', kind: 'bool', required: false, label: 'Altered level of alertness' },
      { dom: 'nx-behavior', arg: 'abnormalBehavior', kind: 'bool', required: false, label: 'Abnormal behavior' },
      { dom: 'nx-coag', arg: 'coagulopathy', kind: 'bool', required: false, label: 'Coagulopathy' },
      { dom: 'nx-vomit', arg: 'vomiting', kind: 'bool', required: false, label: 'Persistent vomiting' },
      { dom: 'nx-age', arg: 'ageOver65', kind: 'bool', required: false, label: 'Age ≥ 65 years' },
    ],
  },
  {
    id: 'handoc-score',
    summary: 'HANDOC score (Bai 2020): murmur, aetiology (species group), ≥ 2 positive cultures, symptom duration ≥ 7 days, single species, and community acquisition identify non-beta-hemolytic-streptococcal bacteremia warranting echocardiography (≥ 3).',
    compute: F.handoc,
    fields: [
      { dom: 'hd-murmur', arg: 'murmur', kind: 'bool', required: false, label: 'Auscultated murmur' },
      { dom: 'hd-aet', arg: 'aetiology', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Aetiology (species group)' },
      { dom: 'hd-cult', arg: 'cultures2', kind: 'bool', required: false, label: '≥ 2 positive cultures' },
      { dom: 'hd-dur', arg: 'duration7', kind: 'bool', required: false, label: 'Duration of symptoms ≥ 7 days' },
      { dom: 'hd-one', arg: 'oneSpecies', kind: 'bool', required: false, label: 'Single species isolated' },
      { dom: 'hd-comm', arg: 'community', kind: 'bool', required: false, label: 'Community acquisition' },
    ],
  },
  {
    id: 'denova-score',
    summary: 'DENOVA score (Berge 2019): in Enterococcus faecalis bacteremia — symptom duration ≥ 7 days, embolization, ≥ 2 positive cultures, unknown origin, valve disease, and murmur (0–6); ≥ 3 warrants echocardiography.',
    compute: F.denova,
    fields: [
      { dom: 'dn-dur', arg: 'duration7', kind: 'bool', required: false, label: 'Duration of symptoms ≥ 7 days (+1)' },
      { dom: 'dn-emb', arg: 'embolization', kind: 'bool', required: false, label: 'Embolization (+1)' },
      { dom: 'dn-cult', arg: 'cultures2', kind: 'bool', required: false, label: '≥ 2 positive cultures (+1)' },
      { dom: 'dn-origin', arg: 'originUnknown', kind: 'bool', required: false, label: 'Origin of infection unknown (+1)' },
      { dom: 'dn-valve', arg: 'valveDisease', kind: 'bool', required: false, label: 'Valve disease (+1)' },
      { dom: 'dn-murmur', arg: 'murmur', kind: 'bool', required: false, label: 'Auscultated murmur (+1)' },
    ],
  },
  {
    id: 'icm-pji-2018',
    summary: '2018 ICM definition of periprosthetic joint infection (Parvizi 2018): a major criterion means infected; otherwise the preoperative minor criteria (CRP/D-dimer, ESR, synovial WBC/LE, alpha-defensin, PMN%, synovial CRP) sum to ≥ 6 infected, 2–5 inconclusive, 0–1 not infected.',
    compute: F.icmPji,
    fields: [
      { dom: 'icm-major', arg: 'major', kind: 'bool', required: false, label: 'Major criterion: sinus tract or ≥ 2 cultures with the same organism' },
      { dom: 'icm-crp', arg: 'crpDdimer', kind: 'bool', required: false, label: 'Elevated CRP or D-dimer (+2)' },
      { dom: 'icm-esr', arg: 'esr', kind: 'bool', required: false, label: 'Elevated ESR (+1)' },
      { dom: 'icm-swbc', arg: 'synovialWbcLe', kind: 'bool', required: false, label: 'Elevated synovial WBC or leukocyte esterase (+3)' },
      { dom: 'icm-ad', arg: 'alphaDefensin', kind: 'bool', required: false, label: 'Positive alpha-defensin (+3)' },
      { dom: 'icm-pmn', arg: 'pmn', kind: 'bool', required: false, label: 'Elevated synovial PMN% (+2)' },
      { dom: 'icm-scrp', arg: 'synovialCrp', kind: 'bool', required: false, label: 'Elevated synovial CRP (+1)' },
    ],
  },
  {
    id: 'air-score',
    summary: 'Appendicitis Inflammatory Response (AIR) score (Andersson 2008): vomiting, right-iliac-fossa pain, rebound-tenderness grade, fever, and WBC/PMN/CRP bands give a 0–12 score (low 0–4, indeterminate 5–8, high 9–12).',
    compute: F.airScore,
    fields: [
      { dom: 'air-vomit', arg: 'vomiting', kind: 'bool', required: false, label: 'Vomiting (+1)' },
      { dom: 'air-rif', arg: 'rifPain', kind: 'bool', required: false, label: 'Right-iliac-fossa pain (+1)' },
      { dom: 'air-rebound', arg: 'rebound', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Rebound tenderness / defense' },
      { dom: 'air-fever', arg: 'fever', kind: 'bool', required: false, label: 'Temperature ≥ 38.5 °C (+1)' },
      { dom: 'air-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: '×10⁹/L' },
      { dom: 'air-pmn', arg: 'pmnPct', kind: 'number', required: true, label: 'Neutrophil percentage', unit: '%' },
      { dom: 'air-crp', arg: 'crp', kind: 'number', required: true, label: 'CRP', unit: 'mg/L' },
    ],
  },
  {
    id: 'adult-appendicitis-score',
    summary: 'Adult Appendicitis Score (Sammalkorpi 2014): RLQ pain, pain relocation, RLQ tenderness, sex, age, guarding, and WBC/PMN/CRP bands (CRP by symptom duration) give a score (low 0–10, intermediate 11–15, high ≥ 16).',
    compute: F.adultAppendicitis,
    fields: [
      { dom: 'aas-rlq', arg: 'rlqPain', kind: 'bool', required: false, label: 'Right-lower-quadrant pain' },
      { dom: 'aas-reloc', arg: 'relocation', kind: 'bool', required: false, label: 'Pain relocation to RLQ' },
      { dom: 'aas-tender', arg: 'tenderness', kind: 'bool', required: false, label: 'RLQ tenderness' },
      { dom: 'aas-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
      { dom: 'aas-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'aas-guard', arg: 'guarding', kind: 'enum', values: ['0', '2', '4'], required: true, label: 'Guarding' },
      { dom: 'aas-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: '×10⁹/L' },
      { dom: 'aas-pmn', arg: 'pmnPct', kind: 'number', required: true, label: 'Neutrophil percentage', unit: '%' },
      { dom: 'aas-crp', arg: 'crp', kind: 'number', required: true, label: 'CRP', unit: 'mg/L' },
      { dom: 'aas-dur', arg: 'durationOver24h', kind: 'bool', required: false, label: 'Symptom duration > 24 h' },
    ],
  },
];

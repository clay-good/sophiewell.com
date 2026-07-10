// spec-v258 MCP wave (ninety-ninth): adapters for the acute & primary-care
// decision rules in lib/decision-rules-v258.js — the Canadian CT Head Rule, the
// San Francisco Syncope Rule (CHESS), and the McIsaac score. dom keys mirror the
// browser renderer (views/group-v258.js) and each tile's META.example.fields.
// The two criteria-count rules take all-boolean inputs (none individually
// required); McIsaac needs the patient age.

import * as F from '../../lib/decision-rules-v258.js';

export default [
  {
    id: 'canadian-ct-head',
    summary: 'Canadian CT Head Rule — for minor head injury (GCS 13-15 with witnessed loss of consciousness, amnesia, or disorientation). CT is recommended if any high-risk (need for neurosurgical intervention) or medium-risk (clinically important brain injury) criterion is present. A decision rule, not a treatment or imaging order.',
    compute: F.canadianCtHead,
    fields: [
      { dom: 'cch-gcs2h', arg: 'gcs2h', kind: 'bool', label: 'GCS < 15 at 2 h post-injury (high-risk)' },
      { dom: 'cch-skull', arg: 'skullFracture', kind: 'bool', label: 'Suspected open or depressed skull fracture (high-risk)' },
      { dom: 'cch-basal', arg: 'basalFracture', kind: 'bool', label: 'Any sign of basal skull fracture (high-risk)' },
      { dom: 'cch-vomit', arg: 'vomiting', kind: 'bool', label: '>= 2 episodes of vomiting (high-risk)' },
      { dom: 'cch-age65', arg: 'age65', kind: 'bool', label: 'Age >= 65 years (high-risk)' },
      { dom: 'cch-amnesia', arg: 'retrogradeAmnesia', kind: 'bool', label: 'Retrograde amnesia >= 30 min before impact (medium-risk)' },
      { dom: 'cch-mechanism', arg: 'dangerousMechanism', kind: 'bool', label: 'Dangerous mechanism (medium-risk)' },
    ],
  },
  {
    id: 'sf-syncope',
    summary: 'San Francisco Syncope Rule (CHESS mnemonic) — any one positive criterion marks high risk for a serious 7-day outcome; all negative marks low risk. Criteria: history of Congestive heart failure, Hematocrit < 30%, abnormal ECG, Shortness of breath, triage Systolic BP < 90 mmHg. A risk-stratification rule, not a disposition order.',
    compute: F.sfSyncope,
    fields: [
      { dom: 'sfs-chf', arg: 'chf', kind: 'bool', label: 'History of congestive heart failure' },
      { dom: 'sfs-hct', arg: 'hct30', kind: 'bool', label: 'Hematocrit < 30%' },
      { dom: 'sfs-ecg', arg: 'abnormalEcg', kind: 'bool', label: 'Abnormal ECG (new change or any non-sinus rhythm)' },
      { dom: 'sfs-sob', arg: 'dyspnea', kind: 'bool', label: 'Shortness of breath' },
      { dom: 'sfs-sbp', arg: 'sbp90', kind: 'bool', label: 'Triage systolic BP < 90 mmHg' },
    ],
  },
  {
    id: 'mcisaac',
    summary: 'McIsaac score — the age-corrected Centor score for streptococcal pharyngitis: temperature > 38 C (+1), absence of cough (+1), tender anterior cervical adenopathy (+1), tonsillar swelling/exudate (+1), plus an age adjustment (3-14 +1, 15-44 0, >= 45 -1). The total maps to the estimated probability of group A strep and a testing strategy; it recommends testing, never an antibiotic order.',
    compute: F.mcisaacScore,
    fields: [
      { dom: 'mci-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mci-fever', arg: 'fever', kind: 'bool', label: 'Temperature > 38 C' },
      { dom: 'mci-cough', arg: 'absentCough', kind: 'bool', label: 'Absence of cough' },
      { dom: 'mci-adeno', arg: 'adenopathy', kind: 'bool', label: 'Tender anterior cervical adenopathy' },
      { dom: 'mci-exudate', arg: 'exudate', kind: 'bool', label: 'Tonsillar swelling or exudate' },
    ],
  },
];

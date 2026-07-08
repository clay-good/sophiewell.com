// spec-v183 MCP wave 76: adapters for lib/scoring-v5.js - the screening and
// decision instruments rendered by views/group-v9.js: PHQ-2/GAD-2, the full
// AUDIT, DAST-10, GDS-15, the Ottawa Knee and NEXUS Chest rules, the San
// Francisco and Canadian syncope rules, EDACS, YEARS, FeverPAIN, the STONE
// score, ISS + RTS, and the pediatric shock index (SIPA). dom keys mirror the
// renderers.
//
// AUDIT, DAST-10, and GDS-15 take a fixed-length `items` array; a bespoke
// toArgs rebuilds each from the flat per-question fields (the drug-burden-index
// precedent), defaulting absent items so the reverse-scored questions (DAST-10
// item 3, the GDS-15 positive-worded items) score correctly.

import * as F from '../../lib/scoring-v5.js';

// Build a fixed-length array from prefixed dom keys; absent -> the supplied
// default (0 for the numeric AUDIT items, false for the boolean DAST/GDS items).
function itemArray(inputs, prefix, count, coerce, dflt) {
  const out = [];
  for (let i = 1; i <= count; i += 1) {
    const key = `${prefix}${i}`;
    out.push(Object.prototype.hasOwnProperty.call(inputs, key) ? coerce(inputs[key]) : dflt);
  }
  return out;
}
const toNum = (v) => (v === '' || v == null ? 0 : Number(v));
const toBoolItem = (v) => v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';

export default [
  {
    id: 'phq2-gad2',
    summary: 'Combined PHQ-2 depression and GAD-2 anxiety ultra-brief screens: two depression items (d1, d2) and two anxiety items (a1, a2) each 0-3; a PHQ-2 or GAD-2 total >= 3 is a positive screen.',
    compute: F.phq2Gad2,
    fields: [
      { dom: 'pg-d1', arg: 'd1', kind: 'number', required: true, label: 'Little interest or pleasure (0-3)' },
      { dom: 'pg-d2', arg: 'd2', kind: 'number', required: true, label: 'Feeling down / depressed / hopeless (0-3)' },
      { dom: 'pg-a1', arg: 'a1', kind: 'number', required: true, label: 'Feeling nervous / anxious / on edge (0-3)' },
      { dom: 'pg-a2', arg: 'a2', kind: 'number', required: true, label: 'Not able to stop / control worrying (0-3)' },
    ],
  },
  {
    id: 'audit-full',
    summary: 'Full AUDIT alcohol-use screen (WHO): ten items (1-8 each 0-4, 9-10 each 0/2/4); total 0-40 with zones (0-7 low, 8-15 hazardous, 16-19 harmful, 20+ likely dependence).',
    compute: F.auditFull,
    toArgs: (inputs) => ({ items: itemArray(inputs, 'af-', 10, toNum, 0) }),
    fields: Array.from({ length: 10 }, (_, i) => ({ dom: `af-${i + 1}`, arg: `af-${i + 1}`, kind: 'number', label: `AUDIT item ${i + 1}` })),
  },
  {
    id: 'dast10',
    summary: 'Drug Abuse Screening Test (DAST-10): ten yes/no items (item 3 is reverse-scored); total 0-10 (0 none, 1-2 low, 3-5 moderate, 6-8 substantial, 9-10 severe).',
    // Echo the 10-item denominator: the extractor reads the "10" in "DAST-10".
    compute: (a) => { const r = F.dast10(a); return r == null ? null : { ...r, maxScore: 10 }; },
    toArgs: (inputs) => ({ items: itemArray(inputs, 'dt-', 10, toBoolItem, false) }),
    fields: Array.from({ length: 10 }, (_, i) => ({ dom: `dt-${i + 1}`, arg: `dt-${i + 1}`, kind: 'bool', label: `DAST-10 item ${i + 1}${i === 2 ? ' (reverse-scored)' : ''}` })),
  },
  {
    id: 'gds15',
    summary: 'Geriatric Depression Scale, 15-item (GDS-15): fifteen yes/no items (the positive-worded items are reverse-scored); total 0-15 (0-4 normal, 5-8 mild, 9-11 moderate, 12-15 severe depression).',
    // Echo the 15-item denominator: the extractor reads the "15" in "GDS-15".
    compute: (a) => { const r = F.gds15(a); return r == null ? null : { ...r, maxScore: 15 }; },
    toArgs: (inputs) => ({ items: itemArray(inputs, 'gd-', 15, toBoolItem, false) }),
    fields: Array.from({ length: 15 }, (_, i) => ({ dom: `gd-${i + 1}`, arg: `gd-${i + 1}`, kind: 'bool', label: `GDS-15 item ${i + 1} (Yes)` })),
  },
  {
    id: 'ottawa-knee',
    summary: 'Ottawa Knee Rule: knee x-ray indicated if any of age >= 55, isolated patellar tenderness, fibular-head tenderness, inability to flex to 90 degrees, or inability to bear weight 4 steps.',
    compute: F.ottawaKnee,
    fields: [
      { dom: 'ok-age55', arg: 'age55', kind: 'bool', label: 'Age >= 55 years' },
      { dom: 'ok-patellar', arg: 'patellarTender', kind: 'bool', label: 'Isolated patellar tenderness' },
      { dom: 'ok-fibular', arg: 'fibularHeadTender', kind: 'bool', label: 'Fibular-head tenderness' },
      { dom: 'ok-flex', arg: 'cannotFlex90', kind: 'bool', label: 'Cannot flex to 90 degrees' },
      { dom: 'ok-weight', arg: 'cannotBearWeight', kind: 'bool', label: 'Cannot bear weight 4 steps' },
    ],
  },
  {
    id: 'nexus-chest',
    summary: 'NEXUS Chest CT rule for blunt trauma: imaging indicated if any of abnormal chest x-ray, distracting injury, chest-wall/sternal/thoracic-spine tenderness, age > 60, rapid deceleration, intoxication, or altered alertness.',
    compute: F.nexusChest,
    fields: [
      { dom: 'nc-cxr', arg: 'abnormalCxr', kind: 'bool', label: 'Abnormal chest x-ray' },
      { dom: 'nc-distract', arg: 'distractingInjury', kind: 'bool', label: 'Distracting painful injury' },
      { dom: 'nc-tender', arg: 'chestWallTender', kind: 'bool', label: 'Chest-wall / sternal / thoracic-spine tenderness' },
      { dom: 'nc-age60', arg: 'age60', kind: 'bool', label: 'Age > 60 years' },
      { dom: 'nc-decel', arg: 'rapidDecel', kind: 'bool', label: 'Rapid deceleration mechanism' },
      { dom: 'nc-intox', arg: 'intoxication', kind: 'bool', label: 'Intoxication' },
      { dom: 'nc-altered', arg: 'alteredAlertness', kind: 'bool', label: 'Altered alertness / mental status' },
    ],
  },
  {
    id: 'sfsr',
    summary: 'San Francisco Syncope Rule (CHESS): high risk for a serious 7-day outcome if any of congestive heart failure history, hematocrit < 30%, abnormal ECG, shortness of breath, or triage SBP < 90.',
    compute: F.sfsr,
    fields: [
      { dom: 'sf-chf', arg: 'chf', kind: 'bool', label: 'C - congestive heart failure history' },
      { dom: 'sf-hct', arg: 'hctLow', kind: 'bool', label: 'H - hematocrit < 30%' },
      { dom: 'sf-ecg', arg: 'ecgAbnormal', kind: 'bool', label: 'E - abnormal ECG' },
      { dom: 'sf-sob', arg: 'sob', kind: 'bool', label: 'S - shortness of breath' },
      { dom: 'sf-sbp', arg: 'sbpLow', kind: 'bool', label: 'S - triage SBP < 90 mmHg' },
    ],
  },
  {
    id: 'canadian-syncope',
    summary: 'Canadian Syncope Risk Score: vasovagal predisposition (-1), heart-disease history (1), extreme SBP (2), elevated troponin (2), abnormal QRS axis (1), QRS > 130 ms (1), QTc > 480 ms (2), ED vasovagal diagnosis (-2), ED cardiac diagnosis (2); the total maps to a 30-day serious-outcome risk band.',
    compute: F.canadianSyncope,
    fields: [
      { dom: 'cs-vaso', arg: 'vasovagalPredisp', kind: 'bool', label: 'Vasovagal predisposition (-1)' },
      { dom: 'cs-heart', arg: 'heartDisease', kind: 'bool', label: 'Heart-disease history (+1)' },
      { dom: 'cs-sbp', arg: 'sbpExtreme', kind: 'bool', label: 'Any SBP < 90 or > 180 (+2)' },
      { dom: 'cs-trop', arg: 'tropElevated', kind: 'bool', label: 'Troponin > 99th percentile (+2)' },
      { dom: 'cs-axis', arg: 'abnormalAxis', kind: 'bool', label: 'Abnormal QRS axis (+1)' },
      { dom: 'cs-qrs', arg: 'qrsProlonged', kind: 'bool', label: 'QRS > 130 ms (+1)' },
      { dom: 'cs-qtc', arg: 'qtcProlonged', kind: 'bool', label: 'QTc > 480 ms (+2)' },
      { dom: 'cs-dxvaso', arg: 'edxVasovagal', kind: 'bool', label: 'ED diagnosis of vasovagal syncope (-2)' },
      { dom: 'cs-dxcardiac', arg: 'edxCardiac', kind: 'bool', label: 'ED diagnosis of cardiac syncope (+2)' },
    ],
  },
  {
    id: 'edacs',
    summary: 'Emergency Department Assessment of Chest pain Score: age points, male sex, known CAD or >= 3 risk factors (age 18-50), diaphoresis (3), pain radiating (5), pain worse on inspiration (-4), pain reproduced by palpation (-6); EDACS-ADP low risk needs score < 16 with a non-ischemic ECG and negative 0/2-hour troponins.',
    compute: F.edacs,
    fields: [
      { dom: 'ed-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ed-male', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'ed-risk', arg: 'riskOrCad', kind: 'bool', label: 'Known CAD or >= 3 risk factors (age 18-50)' },
      { dom: 'ed-diaph', arg: 'diaphoresis', kind: 'bool', label: 'Diaphoresis (+3)' },
      { dom: 'ed-radiate', arg: 'painRadiates', kind: 'bool', label: 'Pain radiates to arm / shoulder / neck / jaw (+5)' },
      { dom: 'ed-insp', arg: 'painInspiration', kind: 'bool', label: 'Pain worse with inspiration (-4)' },
      { dom: 'ed-palp', arg: 'painPalpation', kind: 'bool', label: 'Pain reproduced by palpation (-6)' },
      { dom: 'ed-ecg', arg: 'ecgIschemic', kind: 'bool', label: 'Ischemic ECG changes' },
      { dom: 'ed-trop0', arg: 'trop0Pos', kind: 'bool', label: 'Troponin positive at 0 h' },
      { dom: 'ed-trop2', arg: 'trop2Pos', kind: 'bool', label: 'Troponin positive at 2 h' },
    ],
  },
  {
    id: 'years-pe',
    summary: 'YEARS algorithm for pulmonary embolism: three items (clinical DVT signs, hemoptysis, PE most likely) set the D-dimer threshold (1000 ng/mL with 0 items, 500 with >= 1); PE is excluded if the D-dimer is below the threshold.',
    compute: F.yearsPe,
    fields: [
      { dom: 'yp-dvt', arg: 'dvtSigns', kind: 'bool', label: 'Clinical signs of DVT' },
      { dom: 'yp-hemo', arg: 'hemoptysis', kind: 'bool', label: 'Hemoptysis' },
      { dom: 'yp-likely', arg: 'peMostLikely', kind: 'bool', label: 'PE is the most likely diagnosis' },
      { dom: 'yp-ddimer', arg: 'dDimer', kind: 'number', required: true, label: 'D-dimer', unit: 'ng/mL FEU' },
    ],
  },
  {
    id: 'feverpain',
    summary: 'FeverPAIN score for streptococcal pharyngitis (NICE NG84): fever in 24 h, purulence, rapid attendance (<= 3 days), inflamed tonsils, and no cough/coryza (1 each); a higher score raises the streptococcal likelihood and antibiotic consideration.',
    compute: F.feverpain,
    fields: [
      { dom: 'fp-fever', arg: 'fever', kind: 'bool', label: 'Fever in the last 24 hours' },
      { dom: 'fp-pus', arg: 'purulence', kind: 'bool', label: 'Purulence (pus on tonsils)' },
      { dom: 'fp-attend', arg: 'attendRapid', kind: 'bool', label: 'Attended rapidly (<= 3 days)' },
      { dom: 'fp-inflamed', arg: 'inflamedTonsils', kind: 'bool', label: 'Severely inflamed tonsils' },
      { dom: 'fp-nocough', arg: 'noCough', kind: 'bool', label: 'No cough or coryza' },
    ],
  },
  {
    id: 'stone-score',
    summary: 'STONE score for uncomplicated ureteral stone: sex (male 2), timing of onset (< 6 h 3 / 6-24 h 1 / > 24 h 0), non-black race (3), nausea/vomiting (vomiting 2 / nausea 1), and microscopic hematuria (3); total 0-13 with low / moderate / high probability bands.',
    compute: F.stoneScore,
    fields: [
      { dom: 'st-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: true, label: 'Sex (female 0 / male 2)' },
      { dom: 'st-timing', arg: 'timing', kind: 'enum', values: ['gt24', '6to24', 'lt6'], required: true, label: 'Timing (>24 h 0 / 6-24 h 1 / <6 h 3)' },
      { dom: 'st-nonblack', arg: 'nonBlack', kind: 'bool', label: 'Non-black race (+3)' },
      { dom: 'st-nausea', arg: 'nausea', kind: 'enum', values: ['none', 'nausea', 'vomiting'], required: true, label: 'Nausea / vomiting (none 0 / nausea 1 / vomiting 2)' },
      { dom: 'st-hematuria', arg: 'hematuria', kind: 'bool', label: 'Microscopic hematuria (+3)' },
    ],
  },
  {
    id: 'iss-rts',
    summary: 'Injury Severity Score (sum of squares of the three highest AIS region scores; any AIS 6 forces ISS 75, >= 16 is major trauma) alongside the Revised Trauma Score computed from GCS, systolic BP, and respiratory rate (0-7.84).',
    compute: F.issRts,
    fields: [
      { dom: 'ir-ais1', arg: 'ais1', kind: 'number', required: true, label: 'Highest AIS region (0-6)' },
      { dom: 'ir-ais2', arg: 'ais2', kind: 'number', required: true, label: '2nd highest AIS region (0-6)' },
      { dom: 'ir-ais3', arg: 'ais3', kind: 'number', required: true, label: '3rd highest AIS region (0-6)' },
      { dom: 'ir-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3-15)' },
      { dom: 'ir-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'ir-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: '/min' },
    ],
  },
  {
    id: 'sipa',
    summary: 'Shock Index, Pediatric Age-adjusted (SIPA): heart rate / systolic BP compared to the age-banded elevated cutoff (1.22 for 4-6 years, 1.0 for 7-12, 0.9 for 13-16); above the cutoff is an elevated SIPA.',
    compute: F.sipa,
    fields: [
      { dom: 'sp-age', arg: 'ageYears', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'sp-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'sp-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
    ],
  },
];

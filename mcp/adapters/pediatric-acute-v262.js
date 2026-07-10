// spec-v262 MCP wave (one-hundred-second): adapters for the pediatric acute-care
// scores in lib/pediatric-acute-v262.js — the Lab-score (serious bacterial
// infection in young children), the CHALICE pediatric head-injury CT rule, and
// the Egami score (IVIG resistance in Kawasaki disease). dom keys mirror the
// browser renderer (views/group-v262.js) and each tile's META.example.fields.
// Enum bands default in the compute when omitted; no field is individually
// required.

import * as F from '../../lib/pediatric-acute-v262.js';

export default [
  {
    id: 'lab-score',
    summary: 'Lab-score — a 0-9 score for the risk of serious bacterial infection in young children with fever without source, from CRP band (< 40 mg/L 0 / 40-99 +2 / >= 100 +4), procalcitonin band (< 0.5 ng/mL 0 / 0.5-1.99 +2 / >= 2.0 +4), and a positive urine dipstick (+1). A total >= 3 marks high risk. A risk score, not a treatment order.',
    compute: F.labScore,
    fields: [
      { dom: 'ls-crp', arg: 'crp', kind: 'enum', values: ['lt40', 'mid', 'high'], label: 'CRP band (< 40 / 40-99 / >= 100 mg/L)' },
      { dom: 'ls-pct', arg: 'pct', kind: 'enum', values: ['lt05', 'mid', 'high'], label: 'Procalcitonin band (< 0.5 / 0.5-1.99 / >= 2.0 ng/mL)' },
      { dom: 'ls-urine', arg: 'urinePositive', kind: 'bool', label: 'Urine dipstick positive (leukocyte esterase and/or nitrite) (+1)' },
    ],
  },
  {
    id: 'chalice',
    summary: 'CHALICE rule (Children\'s Head injury ALgorithm for the prediction of Important Clinical Events) — CT head recommended if any one of 14 high-risk history, examination, or mechanism criteria is present in a child with head injury. A decision rule, not an imaging order.',
    compute: F.chalice,
    fields: [
      { dom: 'ch-loc', arg: 'locOver5', kind: 'bool', label: 'Witnessed loss of consciousness > 5 min' },
      { dom: 'ch-amnesia', arg: 'amnesiaOver5', kind: 'bool', label: 'Amnesia > 5 min' },
      { dom: 'ch-drowsy', arg: 'drowsiness', kind: 'bool', label: 'Abnormal drowsiness' },
      { dom: 'ch-vomit', arg: 'vomits3', kind: 'bool', label: '>= 3 vomits after injury' },
      { dom: 'ch-nai', arg: 'nonAccidental', kind: 'bool', label: 'Suspicion of non-accidental injury' },
      { dom: 'ch-seizure', arg: 'seizure', kind: 'bool', label: 'Post-traumatic seizure without epilepsy history' },
      { dom: 'ch-gcs', arg: 'gcsLow', kind: 'bool', label: 'GCS < 14 (or < 15 if age < 1 year)' },
      { dom: 'ch-penetrating', arg: 'penetrating', kind: 'bool', label: 'Suspected penetrating/depressed skull injury or tense fontanelle' },
      { dom: 'ch-basal', arg: 'basalSkull', kind: 'bool', label: 'Signs of a basal skull fracture' },
      { dom: 'ch-focal', arg: 'focalNeuro', kind: 'bool', label: 'Positive focal neurology' },
      { dom: 'ch-bruise', arg: 'bruise5', kind: 'bool', label: 'Bruise/swelling/laceration > 5 cm if age < 1 year' },
      { dom: 'ch-rta', arg: 'highSpeedRta', kind: 'bool', label: 'High-speed road-traffic accident (> 40 mph)' },
      { dom: 'ch-fall', arg: 'fall3m', kind: 'bool', label: 'Fall > 3 m' },
      { dom: 'ch-projectile', arg: 'projectile', kind: 'bool', label: 'High-speed projectile or object' },
    ],
  },
  {
    id: 'egami',
    summary: 'Egami score — a 0-6 score predicting IVIG resistance in Kawasaki disease, from ALT >= 80 IU/L (+2), age <= 6 months (+1), treatment on illness day <= 4 (+1), CRP >= 8 mg/dL (+1), and platelets <= 300k/mm^3 (+1). A total >= 3 marks high risk of IVIG resistance. A risk score, not a treatment order.',
    compute: F.egami,
    fields: [
      { dom: 'eg-alt', arg: 'altHigh', kind: 'bool', label: 'ALT >= 80 IU/L (+2)' },
      { dom: 'eg-age', arg: 'ageYoung', kind: 'bool', label: 'Age <= 6 months (+1)' },
      { dom: 'eg-day', arg: 'earlyTreatment', kind: 'bool', label: 'Treatment on illness day <= 4 (+1)' },
      { dom: 'eg-crp', arg: 'crpHigh', kind: 'bool', label: 'CRP >= 8 mg/dL (+1)' },
      { dom: 'eg-plt', arg: 'plateletsLow', kind: 'bool', label: 'Platelets <= 300k /mm^3 (+1)' },
    ],
  },
];

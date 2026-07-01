// spec-v183 MCP wave 13: adapters for three of the four lib/eddecision-v107.js
// ED / critical-care decision tiles. dom keys mirror views/group-v107.js and
// META.example.fields; arg names mirror the lib signatures (input.headache,
// { age, neuroIntact, ...items }, input.mallampati, …). `hear` is intentionally
// not exposed — it carries no META.example to round-trip (the phases-iph
// precedent).

import * as F from '../../lib/eddecision-v107.js';

export default [
  {
    id: 'new-orleans-head',
    summary: 'New Orleans Criteria for CT in minor head injury (Haydel 2000): a head CT is indicated if any of seven criteria is present in a GCS-15 patient with loss of consciousness.',
    compute: F.newOrleansHead,
    fields: [
      { dom: 'no-head', arg: 'headache', kind: 'bool', label: 'Headache' },
      { dom: 'no-vomit', arg: 'vomiting', kind: 'bool', label: 'Vomiting' },
      { dom: 'no-age', arg: 'ageOver60', kind: 'bool', label: 'Age > 60 years' },
      { dom: 'no-intox', arg: 'intoxication', kind: 'bool', label: 'Drug or alcohol intoxication' },
      { dom: 'no-amnesia', arg: 'amnesia', kind: 'bool', label: 'Persistent anterograde amnesia' },
      { dom: 'no-trauma', arg: 'traumaAboveClavicle', kind: 'bool', label: 'Trauma above the clavicles' },
      { dom: 'no-seizure', arg: 'seizure', kind: 'bool', label: 'Seizure' },
    ],
  },
  {
    id: 'go-far',
    summary: 'GO-FAR score (Ebell 2013): predicts the probability of survival to discharge with good neurologic function after in-hospital cardiac arrest, from age plus 12 admission variables.',
    compute: F.goFar,
    fields: [
      { dom: 'gf-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'gf-neuro', arg: 'neuroIntact', kind: 'bool', label: 'Neurologically intact or minimal deficit at admission' },
      { dom: 'gf-trauma', arg: 'majorTrauma', kind: 'bool', label: 'Major trauma' },
      { dom: 'gf-stroke', arg: 'acuteStroke', kind: 'bool', label: 'Acute stroke' },
      { dom: 'gf-cancer', arg: 'cancer', kind: 'bool', label: 'Metastatic or hematologic cancer' },
      { dom: 'gf-sepsis', arg: 'septicemia', kind: 'bool', label: 'Septicemia' },
      { dom: 'gf-noncardiac', arg: 'medicalNoncardiac', kind: 'bool', label: 'Medical noncardiac diagnosis' },
      { dom: 'gf-hepatic', arg: 'hepatic', kind: 'bool', label: 'Hepatic insufficiency' },
      { dom: 'gf-snf', arg: 'snf', kind: 'bool', label: 'Admitted from a skilled-nursing facility' },
      { dom: 'gf-hypotension', arg: 'hypotension', kind: 'bool', label: 'Hypotension or hypoperfusion' },
      { dom: 'gf-renal', arg: 'renal', kind: 'bool', label: 'Renal insufficiency or dialysis' },
      { dom: 'gf-resp', arg: 'respiratory', kind: 'bool', label: 'Respiratory insufficiency' },
      { dom: 'gf-pneumonia', arg: 'pneumonia', kind: 'bool', label: 'Pneumonia' },
    ],
  },
  {
    id: 'macocha',
    summary: 'MACOCHA score (De Jong 2013): predicts difficult intubation in the ICU from patient, pathology, and operator factors (0–12); ≥ 3 flags elevated risk.',
    compute: F.macocha,
    fields: [
      { dom: 'mc-mallampati', arg: 'mallampati', kind: 'bool', label: 'Mallampati III or IV' },
      { dom: 'mc-osa', arg: 'osa', kind: 'bool', label: 'Obstructive sleep apnea syndrome' },
      { dom: 'mc-cervical', arg: 'cervical', kind: 'bool', label: 'Reduced cervical-spine mobility' },
      { dom: 'mc-mouth', arg: 'mouthOpening', kind: 'bool', label: 'Limited mouth opening < 3 cm' },
      { dom: 'mc-coma', arg: 'coma', kind: 'bool', label: 'Coma' },
      { dom: 'mc-hypoxemia', arg: 'hypoxemia', kind: 'bool', label: 'Severe hypoxemia (SpO₂ < 80%)' },
      { dom: 'mc-operator', arg: 'nonAnesthesiologist', kind: 'bool', label: 'Non-anesthesiologist operator' },
    ],
  },
];

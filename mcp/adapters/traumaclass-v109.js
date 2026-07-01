// spec-v183 MCP wave 11: adapters for the five lib/traumaclass-v109.js trauma
// classification and soft-tissue-infection instruments (Denver BCVI screening
// criteria, AAST organ-injury grading with the 2018 vascular rule, the Mangled
// Extremity Severity Score, LRINEC for necrotizing fasciitis, and the ALT-70
// cellulitis score). dom keys mirror views/group-v34.js; the compute arg names
// are the verbatim keys that renderer passes. optNum and Number(selVal) inputs
// are 'number', chk inputs 'bool', the organ / vascular selects 'enum'. Default
// makeToArgs round-trips every documented example.

import * as F from '../../lib/traumaclass-v109.js';

export default [
  {
    id: 'denver-bcvi',
    summary: 'Denver blunt-cerebrovascular-injury screening criteria: whether any sign or risk factor is present that warrants CT-angiography screening for BCVI.',
    compute: F.denverBcvi,
    fields: [
      { dom: 'db-ah', arg: 'arterialHemorrhage', kind: 'bool', label: 'Arterial hemorrhage from neck/nose/mouth' },
      { dom: 'db-br', arg: 'cervicalBruit', kind: 'bool', label: 'Cervical bruit (age < 50)' },
      { dom: 'db-eh', arg: 'expandingHematoma', kind: 'bool', label: 'Expanding cervical hematoma' },
      { dom: 'db-fd', arg: 'focalDeficit', kind: 'bool', label: 'Focal neurologic deficit' },
      { dom: 'db-in', arg: 'deficitIncongruous', kind: 'bool', label: 'Neurologic deficit incongruous with CT' },
      { dom: 'db-st', arg: 'strokeOnCt', kind: 'bool', label: 'Stroke on CT/MRI' },
      { dom: 'db-lf', arg: 'lefort', kind: 'bool', label: 'Le Fort II or III fracture' },
      { dom: 'db-cs', arg: 'cspineFracture', kind: 'bool', label: 'Cervical-spine fracture' },
      { dom: 'db-bc', arg: 'basilarCarotid', kind: 'bool', label: 'Basilar skull fracture involving the carotid canal' },
      { dom: 'db-da', arg: 'daiLowGcs', kind: 'bool', label: 'Diffuse axonal injury with GCS < 6' },
      { dom: 'db-nh', arg: 'nearHanging', kind: 'bool', label: 'Near-hanging with anoxic brain injury' },
      { dom: 'db-sb', arg: 'seatbeltSign', kind: 'bool', label: 'Seatbelt sign / soft-tissue neck injury' },
    ],
  },
  {
    id: 'aast-organ-injury',
    summary: 'AAST organ-injury grade (2018 revision): the I-V spleen/liver/kidney injury grade set by the anatomic finding or the vascular-injury rule, whichever is higher.',
    compute: F.aastOrganInjury,
    fields: [
      { dom: 'ao-organ', arg: 'organ', kind: 'enum', values: ['spleen', 'liver', 'kidney'], required: true, label: 'Organ' },
      { dom: 'ao-find', arg: 'finding', kind: 'number', required: true, label: 'Anatomic finding grade (1-5)' },
      { dom: 'ao-vasc', arg: 'vascular', kind: 'enum', values: ['none', 'contained', 'beyond'], required: true, label: 'Vascular injury / active bleeding' },
    ],
  },
  {
    id: 'mangled-extremity',
    summary: 'Mangled Extremity Severity Score (Johansen 1990): the amputation-risk score from skeletal/soft-tissue injury, limb ischemia, shock, and age (ischemia doubled > 6 h).',
    compute: F.mangledExtremity,
    fields: [
      { dom: 'me-sk', arg: 'skeletal', kind: 'number', required: true, label: 'Skeletal/soft-tissue injury energy (1-4)' },
      { dom: 'me-isc', arg: 'ischemia', kind: 'number', required: true, label: 'Limb ischemia grade (1-3)' },
      { dom: 'me-6h', arg: 'ischemiaOver6h', kind: 'bool', label: 'Ischemia time > 6 hours (doubles the subscore)' },
      { dom: 'me-sh', arg: 'shock', kind: 'number', required: true, label: 'Shock grade (0-2)' },
      { dom: 'me-age', arg: 'age', kind: 'number', required: true, label: 'Age grade (0-2)' },
    ],
  },
  {
    id: 'lrinec',
    summary: 'LRINEC score (Wong 2004): risk-stratifies necrotizing fasciitis (0-13) from CRP, WBC, hemoglobin, sodium, creatinine, and glucose; >= 6 raises suspicion.',
    compute: F.lrinec,
    fields: [
      { dom: 'lr-crp', arg: 'crp', kind: 'number', required: true, label: 'C-reactive protein (mg/L)' },
      { dom: 'lr-wbc', arg: 'wbc', kind: 'number', required: true, label: 'White blood cell count (x10^3/uL)' },
      { dom: 'lr-hb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin (g/dL)' },
      { dom: 'lr-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium (mmol/L)' },
      { dom: 'lr-cr', arg: 'creatinine', kind: 'number', label: 'Creatinine (mg/dL)' },
      { dom: 'lr-glu', arg: 'glucose', kind: 'number', label: 'Glucose (mg/dL)' },
    ],
  },
  {
    id: 'alt-70',
    summary: 'ALT-70 score (Raff 2017): predicts the likelihood of cellulitis versus pseudocellulitis (0-7) from asymmetry, leukocytosis, tachycardia, and age >= 70.',
    compute: F.alt70,
    fields: [
      { dom: 'al-asym', arg: 'asymmetry', kind: 'bool', label: 'Asymmetry (unilateral leg involvement)' },
      { dom: 'al-wbc', arg: 'wbc', kind: 'number', required: true, label: 'White blood cell count (x10^3/uL)' },
      { dom: 'al-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate (beats/min)' },
      { dom: 'al-age', arg: 'age', kind: 'number', label: 'Age (years)' },
    ],
  },
];

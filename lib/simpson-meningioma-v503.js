// spec-v503: the Simpson grade of the completeness of a meningioma resection (grades I-V), recorded by the
// surgeon at operation. It is the standard descriptor of how complete a meningioma removal was, and it
// correlates with the reported recurrence risk. The catalog had no extent-of-resection descriptor. "simpson"
// (meningioma) routed to nothing.
//
// HIGH-STAKES: this reports the resection grade the surgeon has recorded, NOT a diagnosis, an individual
// recurrence prediction, or a decision about adjuvant radiotherapy (spec-v11 section 5.3). The recurrence-risk
// associations below are the general associations Simpson reported, stated descriptively, not a prognosis for
// a particular patient. The management decision stays with the neurosurgery and neuro-oncology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Simpson D. The recurrence of intracranial meningiomas after surgical treatment. J Neurol Neurosurg
//     Psychiatry. 1957;20(1):22-39.
//   - Neurosurgical references reproducing the same grade I (complete with dura and bone) through grade V
//     (decompression only) definitions.
//
// Grades (decreasing completeness of removal):
//   I   : macroscopically complete removal, with excision of the dural attachment and any abnormal bone.
//   II  : macroscopically complete removal, with coagulation (rather than excision) of the dural attachment.
//   III : macroscopically complete removal, without excision or coagulation of the dural attachment or its
//         extradural extensions.
//   IV  : partial (subtotal) removal, leaving tumor in situ.
//   V   : simple decompression, with or without biopsy.

const GRADES = {
  I: { grade: 'I', text: 'Simpson grade I - macroscopically complete removal, with excision of the dural attachment and any abnormal bone.' },
  II: { grade: 'II', text: 'Simpson grade II - macroscopically complete removal, with coagulation rather than excision of the dural attachment.' },
  III: { grade: 'III', text: 'Simpson grade III - macroscopically complete removal, without excision or coagulation of the dural attachment or its extradural extensions.' },
  IV: { grade: 'IV', text: 'Simpson grade IV - partial (subtotal) removal, leaving tumor in situ.' },
  V: { grade: 'V', text: 'Simpson grade V - simple decompression, with or without biopsy.' },
};

const NOTE = 'The Simpson grade (Simpson 1957) records how complete a meningioma resection was, from grade I (complete removal with the dural attachment and abnormal bone) to grade V (decompression only). Lower grades were associated with a lower reported recurrence rate. This reports the grade the surgeon has recorded and the general association Simpson reported, not a diagnosis, an individual recurrence prediction, or a decision about adjuvant radiotherapy.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' / 'V' (case-insensitive; also accepts 1-5).
export function simpsonMeningioma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Simpson grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Simpson grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

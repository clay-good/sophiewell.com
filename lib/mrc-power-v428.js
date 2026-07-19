// spec-v428: the Medical Research Council (MRC) muscle-power grade, the standard 0-5 bedside grading of the
// strength of a single muscle or movement — grades 0 / 1 / 2 / 3 / 4 / 5. It is the atomic unit the MRC sum
// score (mrc-sum-score) aggregates across muscle groups. "mrc muscle grade" / "muscle power grade" routed to
// nothing.
//
// This tile reports the BASE 0-5 grade. Grade 4 is sometimes subdivided into 4- (movement against slight
// resistance), 4 (moderate), and 4+ (strong resistance); the widely used base grading reproduced here uses
// the single grade 4.
//
// HIGH-STAKES: this reports the power GRADE the clinician has elicited on examination, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The clinical decision stays
// with the treating team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Medical Research Council. Aids to the Examination of the Peripheral Nervous System. Memorandum No. 45.
//     London: HMSO; 1976 (the 0-5 muscle-power scale), reproduced in Compston A. Brain. 2010;133(10):2838-2844.
//   - Neurology / rehabilitation references reproducing the same no-contraction (0) / flicker (1) /
//     gravity-eliminated (2) / against-gravity (3) / against-resistance (4) / normal (5) grading.
//
// Grades (strength of a single muscle or movement):
//   0 : no contraction.
//   1 : a flicker or trace of contraction.
//   2 : active movement with gravity eliminated.
//   3 : active movement against gravity.
//   4 : active movement against gravity and resistance.
//   5 : normal power.

const GRADES = {
  0: { grade: '0', text: 'MRC grade 0 - no contraction.' },
  1: { grade: '1', text: 'MRC grade 1 - a flicker or trace of contraction.' },
  2: { grade: '2', text: 'MRC grade 2 - active movement with gravity eliminated.' },
  3: { grade: '3', text: 'MRC grade 3 - active movement against gravity.' },
  4: { grade: '4', text: 'MRC grade 4 - active movement against gravity and resistance.' },
  5: { grade: '5', text: 'MRC grade 5 - normal power.' },
};

const NOTE = 'The Medical Research Council (MRC) muscle-power grade (MRC 1976) grades the strength of a single muscle or movement. 0: no contraction. 1: a flicker or trace. 2: active movement with gravity eliminated. 3: active movement against gravity. 4: active movement against gravity and resistance. 5: normal power. Grade 4 is sometimes subdivided (4-/4/4+). This reports the grade the clinician has elicited, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
};

// input:
//   grade: '0' / '1' / '2' / '3' / '4' / '5'.
export function mrcPower(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the MRC muscle-power grade (0, 1, 2, 3, 4, or 5).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `MRC grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

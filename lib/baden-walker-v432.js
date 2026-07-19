// spec-v432: the Baden-Walker halfway system for grading pelvic organ prolapse, by the position of the
// leading edge of the prolapse relative to the hymen at maximum strain — grades 0 / 1 / 2 / 3 / 4. It is a
// standard bedside grading of prolapse severity. "baden walker" / "prolapse grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE the clinician has determined on examination, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the gynecology / urogynecology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Baden WF, Walker TA. Physical diagnosis in the evaluation of vaginal relaxation. Clin Obstet Gynecol.
//     1972;15(4):1055-1069 (the halfway system).
//   - Gynecology / urogynecology references reproducing the same normal (0) / halfway-to-hymen (1) /
//     at-hymen (2) / halfway-past-hymen (3) / maximum-descent (4) grading.
//
// Grades (leading edge relative to the hymen, at maximum strain):
//   0 : normal position, no descent.
//   1 : descent halfway to the hymen.
//   2 : descent to the hymen.
//   3 : descent halfway past the hymen.
//   4 : maximum descent (complete prolapse / procidentia).

const GRADES = {
  0: { grade: '0', text: 'Baden-Walker grade 0 - normal position, no descent.' },
  1: { grade: '1', text: 'Baden-Walker grade 1 - descent halfway to the hymen.' },
  2: { grade: '2', text: 'Baden-Walker grade 2 - descent to the hymen.' },
  3: { grade: '3', text: 'Baden-Walker grade 3 - descent halfway past the hymen.' },
  4: { grade: '4', text: 'Baden-Walker grade 4 - maximum descent (complete prolapse / procidentia).' },
};

const NOTE = 'The Baden-Walker halfway system (Baden & Walker 1972) grades pelvic organ prolapse by the position of the leading edge relative to the hymen at maximum strain. 0: normal position. 1: halfway to the hymen. 2: to the hymen. 3: halfway past the hymen. 4: maximum descent (complete prolapse / procidentia). This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: '0' / '1' / '2' / '3' / '4'.
export function badenWalker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Baden-Walker grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Baden-Walker grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

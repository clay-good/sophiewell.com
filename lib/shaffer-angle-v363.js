// spec-v363: Shaffer gonioscopy grading of the anterior chamber angle (grades 0-4) — the standard
// grading of the drainage-angle width on gonioscopy, used to gauge the risk of angle-closure glaucoma.
// The catalog carries other ophthalmology grades (ICDR diabetic retinopathy, KWB hypertensive
// retinopathy, ACR TI-RADS) but no anterior-chamber-angle grade. "shaffer grade" / "gonioscopy angle
// grade" / "anterior chamber angle grade" routed to nothing.
//
// HIGH-STAKES: this reports the Shaffer GRADE the clinician has determined on gonioscopy, NOT a
// diagnosis (angle-closure glaucoma), a treatment decision, or a prognosis (spec-v11 §5.3). A closed or
// very narrow angle (grade 0-1) with symptoms can be an ophthalmic emergency assessed on its own; the
// management decision stays with the ophthalmologist.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Shaffer RN. Primary glaucomas. Gonioscopy, ophthalmoscopy and perimetry. Trans Am Acad Ophthalmol
//     Otolaryngol. 1960;64:112-127 (the original grades 0-4 by approximate angular width).
//   - AAO and gonioscopy references (EyeWiki) reproducing the same wide-open-to-closed grading and the
//     angle-closure-risk interpretation. The exact degree boundaries vary slightly by source, so the
//     angular widths are given as approximate; the clinical interpretation is consistent.
//
// Grades (anterior chamber angle width; HIGHER grade = WIDER, safer angle):
//   4 : wide open angle (~35-45 degrees); incapable of closure.
//   3 : open angle (~20-35 degrees); incapable of closure.
//   2 : moderately narrow angle (~20 degrees); angle closure is possible. Flagged.
//   1 : very narrow angle (~10 degrees); angle closure is probable (high risk). Flagged.
//   0 : closed angle (0 degrees). Flagged.

const GRADES = {
  4: { grade: '4', narrow: false, text: 'Shaffer grade 4 - wide open anterior chamber angle (approximately 35-45 degrees); incapable of angle closure.' },
  3: { grade: '3', narrow: false, text: 'Shaffer grade 3 - open angle (approximately 20-35 degrees); incapable of angle closure.' },
  2: { grade: '2', narrow: true, text: 'Shaffer grade 2 - moderately narrow angle (approximately 20 degrees); angle closure is possible.' },
  1: { grade: '1', narrow: true, text: 'Shaffer grade 1 - very narrow angle (approximately 10 degrees); angle closure is probable (high risk).' },
  0: { grade: '0', narrow: true, text: 'Shaffer grade 0 - closed anterior chamber angle (0 degrees).' },
};

const NOTE = 'The Shaffer system (Shaffer 1960) grades the anterior chamber (drainage) angle on gonioscopy from 4 (wide open) to 0 (closed). A HIGHER grade is a WIDER, safer angle. 4: wide open (~35-45 deg). 3: open (~20-35 deg). 2: moderately narrow (~20 deg), closure possible. 1: very narrow (~10 deg), closure probable. 0: closed. Grades 0-2 are narrow angles at risk of angle-closure glaucoma; grades 3-4 are open with low risk. The angular widths are approximate (they vary by source); the clinical interpretation is consistent. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: '0'-'4' (string or number)
export function shafferAngle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Shaffer grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    narrow: g.narrow,
    abnormal: g.narrow,
    bandLabel: `Shaffer grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

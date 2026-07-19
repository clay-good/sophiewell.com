// spec-v435: the Van Herick grade of the peripheral anterior chamber angle, estimated at the slit lamp by
// the ratio of the peripheral anterior chamber depth (PACD) to the corneal thickness (CT) — grades 0 / 1 / 2
// / 3 / 4. It is a standard bedside estimate of angle-closure risk and companions the Shaffer gonioscopy
// angle grade (shaffer-angle). "van herick" / "anterior chamber angle grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE the clinician has estimated at the slit lamp, NOT a diagnosis of
// angle-closure, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Gonioscopy
// remains the reference standard; the management decision stays with the ophthalmology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Van Herick W, Shaffer RN, Schwartz A. Estimation of width of angle of anterior chamber. Incidence and
//     significance of the narrow angle. Am J Ophthalmol. 1969;68(4):626-629.
//   - Ophthalmology / optometry references reproducing the same closed (0) to wide-open (4) PACD:CT grading.
//
// Grades (peripheral anterior chamber depth relative to corneal thickness):
//   0 : PACD = 0 (cornea in contact with iris) - angle closed.
//   1 : PACD less than 1/4 corneal thickness - angle closure likely.
//   2 : PACD = 1/4 corneal thickness - angle closure possible.
//   3 : PACD = 1/4 to 1/2 corneal thickness - angle closure unlikely.
//   4 : PACD at least 1 corneal thickness - angle wide open, closure not possible.

const GRADES = {
  0: { grade: '0', text: 'Van Herick grade 0 - peripheral anterior chamber depth = 0 (cornea in contact with iris): angle closed.' },
  1: { grade: '1', text: 'Van Herick grade 1 - peripheral anterior chamber depth less than 1/4 corneal thickness: angle closure likely.' },
  2: { grade: '2', text: 'Van Herick grade 2 - peripheral anterior chamber depth = 1/4 corneal thickness: angle closure possible.' },
  3: { grade: '3', text: 'Van Herick grade 3 - peripheral anterior chamber depth = 1/4 to 1/2 corneal thickness: angle closure unlikely.' },
  4: { grade: '4', text: 'Van Herick grade 4 - peripheral anterior chamber depth at least 1 corneal thickness: angle wide open, closure not possible.' },
};

const NOTE = 'The Van Herick grade (Van Herick 1969) estimates the peripheral anterior chamber angle at the slit lamp by the ratio of the peripheral anterior chamber depth to the corneal thickness. 0: closed. 1: less than 1/4 (closure likely). 2: 1/4 (closure possible). 3: 1/4 to 1/2 (closure unlikely). 4: at least 1 corneal thickness (wide open). Gonioscopy remains the reference standard. This reports the grade the clinician has estimated, not a diagnosis of angle-closure, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: '0' / '1' / '2' / '3' / '4'.
export function vanHerick(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Van Herick grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Van Herick grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

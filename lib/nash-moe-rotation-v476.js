// spec-v476: the Nash-Moe method of grading vertebral rotation in scoliosis, by the position of the convex-side
// pedicle on the AP radiograph — grades 0 / 1 / 2 / 3 / 4. It companions the scoliosis skeletal-maturity and
// curve tiles. "nash-moe" / "vertebral rotation grade" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic ROTATION grade the clinician has determined, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the orthopedic / spine team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Nash CL Jr, Moe JH. A study of vertebral rotation. J Bone Joint Surg Am. 1969;51(2):223-229.
//   - Spine references reproducing the same symmetric-pedicles (0) / slight-migration (1) / middle-third (2) /
//     central (3) / past-midline (4) grading of the convex pedicle.
//
// Grades (convex-side pedicle position on the AP film):
//   0 : both pedicles symmetric; no rotation.
//   1 : the convex pedicle moves slightly toward the midline; the concave pedicle begins to disappear.
//   2 : the convex pedicle lies within the middle third of the vertebral body; the concave pedicle is no longer
//       visible.
//   3 : the convex pedicle lies in the central segment of the vertebral body, near the midline.
//   4 : the convex pedicle has migrated past the midline, onto the concave side of the vertebral body.

const GRADES = {
  0: { grade: '0', text: 'Nash-Moe grade 0 - both pedicles are symmetric; no rotation.' },
  1: { grade: '1', text: 'Nash-Moe grade 1 - the convex pedicle moves slightly toward the midline; the concave pedicle begins to disappear.' },
  2: { grade: '2', text: 'Nash-Moe grade 2 - the convex pedicle lies within the middle third of the vertebral body; the concave pedicle is no longer visible.' },
  3: { grade: '3', text: 'Nash-Moe grade 3 - the convex pedicle lies in the central segment of the vertebral body, near the midline.' },
  4: { grade: '4', text: 'Nash-Moe grade 4 - the convex pedicle has migrated past the midline, onto the concave side of the vertebral body.' },
};

const NOTE = 'The Nash-Moe method (Nash & Moe 1969) grades vertebral rotation in scoliosis by the position of the convex-side pedicle on the AP radiograph. 0: symmetric pedicles (no rotation). 1: convex pedicle slightly toward the midline. 2: convex pedicle in the middle third. 3: convex pedicle central, near the midline. 4: convex pedicle past the midline. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: 0-4.
export function nashMoeRotation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Nash-Moe grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Nash-Moe grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

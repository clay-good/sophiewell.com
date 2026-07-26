// spec-v470: the Larsen (Larsen-Dale-Eek) radiographic grading of joint damage in rheumatoid arthritis and
// related conditions, by erosion and joint-space change — grades 0 / 1 / 2 / 3 / 4 / 5. It companions the RA
// functional (Steinbrocker) and disease-activity (DAS28) tiles. "larsen" / "rheumatoid arthritis radiographic
// grade" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// rheumatology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Larsen A, Dale K, Eek M. Radiographic evaluation of rheumatoid arthritis and related conditions by
//     standard reference films. Acta Radiol Diagn (Stockh). 1977;18(4):481-491.
//   - Rheumatology / radiology references reproducing the same normal (0) / slight (1) / definite-early (2) /
//     medium-destructive (3) / severe-destructive (4) / mutilating (5) grading.
//
// Grades (radiographic joint damage):
//   0 : normal; intact bony outlines and normal joint space.
//   1 : slight abnormality - periarticular soft-tissue swelling, periarticular osteoporosis, and/or slight
//       joint-space narrowing.
//   2 : definite early abnormality - erosion and joint-space narrowing.
//   3 : medium destructive abnormality - marked erosions and joint-space narrowing.
//   4 : severe destructive abnormality - extensive erosions and gross deformity of the joint surfaces.
//   5 : mutilating abnormality - the original articular surfaces have disappeared, with gross bony deformity.

const GRADES = {
  0: { grade: '0', text: 'Larsen grade 0 - normal; intact bony outlines and normal joint space.' },
  1: { grade: '1', text: 'Larsen grade 1 - slight abnormality: periarticular soft-tissue swelling, periarticular osteoporosis, and/or slight joint-space narrowing.' },
  2: { grade: '2', text: 'Larsen grade 2 - definite early abnormality: erosion and joint-space narrowing.' },
  3: { grade: '3', text: 'Larsen grade 3 - medium destructive abnormality: marked erosions and joint-space narrowing.' },
  4: { grade: '4', text: 'Larsen grade 4 - severe destructive abnormality: extensive erosions and gross deformity of the joint surfaces.' },
  5: { grade: '5', text: 'Larsen grade 5 - mutilating abnormality: the original articular surfaces have disappeared, with gross bony deformity.' },
};

const NOTE = 'The Larsen (Larsen-Dale-Eek 1977) radiographic grading of rheumatoid arthritis grades joint damage by erosion and joint-space change. 0: normal. 1: slight (swelling, osteoporosis, slight narrowing). 2: definite early (erosion and narrowing). 3: medium destructive (marked erosions). 4: severe destructive (extensive erosions, gross deformity). 5: mutilating (articular surfaces lost). This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  I: '1', II: '2', III: '3', IV: '4', V: '5',
};

// input:
//   grade: 0-5 (also accepts I-V for grades 1-5).
export function larsenRa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Larsen grade (0, 1, 2, 3, 4, or 5).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Larsen grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

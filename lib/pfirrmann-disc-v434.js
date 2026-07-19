// spec-v434: the Pfirrmann classification of lumbar intervertebral disc degeneration on T2-weighted MRI, by
// disc structure, the distinction between nucleus and annulus, signal intensity, and disc height — grades
// I / II / III / IV / V. It is a standard descriptor in spine MRI reporting and joins the spine tiles
// (Modic changes, Meyerding). "pfirrmann grade" / "disc degeneration grade" routed to nothing.
//
// HIGH-STAKES: this reports the imaging GRADE the radiologist has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The clinical decision stays with the
// treating team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Pfirrmann CW, Metzdorf A, Zanetti M, Hodler J, Boos N. Magnetic resonance classification of lumbar
//     intervertebral disc degeneration. Spine (Phila Pa 1976). 2001;26(17):1873-1878.
//   - Radiology / spine references reproducing the same homogeneous-bright (I) to collapsed-black (V) grading.
//
// Grades (T2 MRI: structure / nucleus-annulus distinction / signal / height):
//   I   : homogeneous bright white, clear nucleus-annulus distinction, normal height.
//   II  : inhomogeneous (+/- horizontal bands), bright white, clear distinction, normal height.
//   III : inhomogeneous gray, unclear distinction, normal to slightly decreased height.
//   IV  : inhomogeneous gray to black, lost distinction, normal to moderately decreased height.
//   V   : inhomogeneous black, lost distinction, collapsed disc space.

const GRADES = {
  I: { grade: 'I', text: 'Pfirrmann grade I - homogeneous bright white disc, clear nucleus-annulus distinction, normal height.' },
  II: { grade: 'II', text: 'Pfirrmann grade II - inhomogeneous (with or without horizontal bands), bright white, clear distinction, normal height.' },
  III: { grade: 'III', text: 'Pfirrmann grade III - inhomogeneous gray, unclear nucleus-annulus distinction, normal to slightly decreased height.' },
  IV: { grade: 'IV', text: 'Pfirrmann grade IV - inhomogeneous gray to black, lost nucleus-annulus distinction, normal to moderately decreased height.' },
  V: { grade: 'V', text: 'Pfirrmann grade V - inhomogeneous black, lost distinction, collapsed disc space.' },
};

const NOTE = 'The Pfirrmann classification (Pfirrmann 2001) grades lumbar disc degeneration on T2 MRI by disc structure, nucleus-annulus distinction, signal, and height. I: homogeneous bright, normal. II: inhomogeneous bright, normal. III: gray, unclear distinction, height normal to slightly reduced. IV: gray-black, lost distinction, height normal to moderately reduced. V: black, collapsed disc space. This reports the grade the radiologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' / 'V' (case-insensitive; also accepts 1-5).
export function pfirrmannDisc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Pfirrmann grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Pfirrmann grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

// spec-v303: Anaphylaxis severity grade — the Ring & Messmer (1977)
// classification (a catalog gap surfaced by the SESSION-40 fresh-domain search
// sweep: "anaphylaxis grading" had no tile). Given the grade (I-IV) the tile
// reports the clinical features of that grade and whether it is life-threatening
// (grades III-IV).
//
// This reports the classification's own descriptors, NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3) — grading and management (including
// epinephrine) stay with the clinician.
//
// TABLE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against two
// independent sources that agree on the four grades and their features:
//   - Ring J, Messmer K. Incidence and severity of anaphylactoid reactions to
//     colloid volume substitutes. Lancet. 1977;1(8009):466-469.
//   - Perioperative anaphylaxis reviews reproducing the same I-IV grading
//     (BJA 2016;117(5):551; BJA Education 2019).

// Grades ordered I..IV. `lifeThreatening` marks the grades treated as anaphylaxis.
const GRADES = {
  I: { features: 'Cutaneous-mucous signs only: generalised erythema, urticaria, with or without angioedema.', lifeThreatening: false },
  II: { features: 'Moderate, measurable but not immediately life-threatening: cutaneous-mucous signs plus one or more of hypotension, tachycardia, dyspnea, or gastrointestinal disturbance.', lifeThreatening: false },
  III: { features: 'Life-threatening: cardiovascular collapse, tachycardia or bradycardia or arrhythmia, and/or bronchospasm; cutaneous signs may be absent or appear only after circulation is restored.', lifeThreatening: true },
  IV: { features: 'Cardiac and/or respiratory arrest.', lifeThreatening: true },
};

const ORDER = ['I', 'II', 'III', 'IV'];

const NOTE = 'Ring & Messmer anaphylaxis severity grade (1977). Grade I = cutaneous-mucous signs only; grade II = moderate multi-organ features not immediately life-threatening; grade III = life-threatening cardiovascular collapse and/or bronchospasm; grade IV = cardiac/respiratory arrest. Grades I-II are generally not life-threatening (and may be non-allergic); grades III-IV are life-threatening reactions typically managed as anaphylaxis. This reports the classification descriptor, not a diagnosis or a treatment order; grading and management stay with the clinician.';

// input.grade: one of 'I'..'IV' (case-insensitive). Returns the grade's clinical
// features and life-threatening flag.
export function anaphylaxisGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const code = typeof o.grade === 'string' ? o.grade.trim().toUpperCase() : String(o.grade || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Select the anaphylaxis grade (I-IV).' };
  }
  if (!Object.prototype.hasOwnProperty.call(GRADES, code)) {
    throw new RangeError('Anaphylaxis grade must be one of I, II, III, or IV.');
  }
  const entry = GRADES[code];

  let band = `Ring & Messmer grade ${code}: ${entry.features}`;
  if (entry.lifeThreatening) {
    band += ' Life-threatening (grade III-IV) — manage as anaphylaxis.';
  }

  return {
    valid: true,
    grade: code,
    features: entry.features,
    lifeThreatening: entry.lifeThreatening,
    abnormal: entry.lifeThreatening,
    rank: ORDER.indexOf(code) + 1,
    bandLabel: `Grade ${code}`,
    band,
    note: NOTE,
  };
}

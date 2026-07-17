// spec-v387: Dimeglio (Diméglio) classification of a congenital clubfoot — four reducibility parameters
// (each 0-4) plus four bonus points, summed to a 0-20 severity score that maps to grades I-IV. It is the
// companion clubfoot-severity system to the Pirani score (spec-v386) already in the catalog; the two are
// often used together during Ponseti management. "dimeglio" / "clubfoot classification score" routed to
// nothing.
//
// HIGH-STAKES: this reports the Dimeglio SCORE and grade from the parameters the clinician has assessed,
// NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Higher
// = more severe; the management decision stays with the treating orthopedic team.
//
// ITEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Diméglio A, Bensahel H, Souchet P, Mazeau P, Bonnet F. Classification of clubfoot. J Pediatr Orthop
//     B. 1995;4(2):129-136 (the four reducibility parameters, the bonus points, and the 0-20 grading).
//   - Clubfoot references reproducing the same four parameters (equinus, varus, derotation of the
//     calcaneopedal block, forefoot adduction; each 0-4 by reducibility) + four 1-point features
//     (posterior crease, medial crease, cavus, muscle abnormality) and the grade bands.
//
// Scoring:
//   Four parameters, each 0-4 by reducibility on its plane (90-45 deg = 4, 45-20 = 3, 20-0 = 2, 0 to -20
//     = 1, < -20 = 0): equinus, varus, derotation, adduction. Subtotal 0-16.
//   Four bonus points (1 each): posterior crease, medial crease, cavus, muscle abnormality. Subtotal 0-4.
//   Total 0-20. Grade: 0 normal; 1-5 grade I (benign); 6-10 grade II (moderate); 11-15 grade III
//     (severe); 16-20 grade IV (very severe).

const PARAMS = ['equinus', 'varus', 'derotation', 'adduction'];
const FLAGS = ['posteriorCrease', 'medialCrease', 'cavus', 'muscleAbnormality'];

function param(o, key) {
  const raw = String(o[key] == null ? '' : o[key]).trim();
  if (raw === '') return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}
function isTrue(v) {
  if (v === true) return true;
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'on';
}

function grade(total) {
  if (total === 0) return { g: 'normal', label: 'normal foot' };
  if (total <= 5) return { g: 'I', label: 'grade I (benign)' };
  if (total <= 10) return { g: 'II', label: 'grade II (moderate)' };
  if (total <= 15) return { g: 'III', label: 'grade III (severe)' };
  return { g: 'IV', label: 'grade IV (very severe)' };
}

// input:
//   equinus, varus, derotation, adduction — each 0-4 (integer)
//   posteriorCrease, medialCrease, cavus, muscleAbnormality — booleans (each adds 1; default false)
export function dimeglioClubfoot(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let angle = 0;
  for (const k of PARAMS) {
    const v = param(o, k);
    if (v === null) return { valid: false, message: 'Score all four reducibility parameters (each 0-4).' };
    if (Number.isNaN(v)) return { valid: false, message: 'Each reducibility parameter must be an integer 0-4.' };
    angle += v;
  }
  let bonus = 0;
  for (const k of FLAGS) { if (isTrue(o[k])) bonus += 1; }
  const total = angle + bonus;
  const g = grade(total);
  return {
    valid: true,
    total,
    angleScore: angle,
    bonusScore: bonus,
    grade: g.g,
    abnormal: total >= 11,
    bandLabel: `Dimeglio ${total}/20`,
    band: `Dimeglio total ${total} of 20: ${g.label}.`,
    note: 'The Dimeglio classification grades clubfoot severity: four reducibility parameters (equinus, varus, derotation of the calcaneopedal block, forefoot adduction), each 0-4, plus four 1-point features (posterior crease, medial crease, cavus, muscle abnormality), total 0-20. 1-5 grade I (benign), 6-10 II (moderate), 11-15 III (severe), 16-20 IV (very severe). Higher = more severe. This reports the score, not a diagnosis, a treatment decision, or a prognosis.',
  };
}

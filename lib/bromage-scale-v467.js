// spec-v467: the Bromage scale of motor block after neuraxial (epidural / spinal) anesthesia, by the degree of
// residual lower-limb movement — grades I / II / III / IV (the original Bromage numbering). It is the standard
// bedside motor-block grade and companions the Aldrete recovery score. "bromage" / "motor block scale" routed
// to nothing.
//
// HIGH-STAKES: this reports the motor-block GRADE the clinician has determined on examination, NOT a diagnosis,
// a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the anesthesia team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Bromage PR. Epidural Analgesia. Philadelphia: WB Saunders; 1978 (originating from Bromage 1965).
//   - Anesthesia references reproducing the same nil (I) / partial (II) / almost-complete (III) / complete
//     (IV) motor-block grading. A widely used modified Bromage renumbers these 0-3; this tile uses the original
//     I-IV numbering.
//
// Grades (residual movement):
//   I   : nil - free flexion of the knees and feet (no motor block).
//   II  : partial - just able to flex the knees, with free flexion of the feet.
//   III : almost complete - unable to flex the knees, but with some flexion of the feet still possible.
//   IV  : complete - unable to move the legs or feet.

const GRADES = {
  I: { grade: 'I', text: 'Bromage grade I - nil: free flexion of the knees and feet (no motor block).' },
  II: { grade: 'II', text: 'Bromage grade II - partial: just able to flex the knees, with free flexion of the feet.' },
  III: { grade: 'III', text: 'Bromage grade III - almost complete: unable to flex the knees, but with some flexion of the feet still possible.' },
  IV: { grade: 'IV', text: 'Bromage grade IV - complete: unable to move the legs or feet.' },
};

const NOTE = 'The Bromage scale (Bromage 1965/1978) grades motor block after neuraxial anesthesia by residual lower-limb movement. I: nil (free knees and feet). II: partial (just able to flex the knees). III: almost complete (unable to flex the knees, some foot movement). IV: complete (unable to move the legs or feet). A widely used modified Bromage renumbers these 0-3. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I'..'IV' (case-insensitive; also accepts 1-4, the original Bromage numbering).
export function bromageScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Bromage grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Bromage grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

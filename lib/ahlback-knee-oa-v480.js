// spec-v480: the Ahlback classification of knee osteoarthritis, by radiographic joint-space loss and bone
// attrition — grades I / II / III / IV / V. It companions the Kellgren-Lawrence knee-OA grade (Ahlback
// emphasizes joint-space obliteration and bone loss). "ahlback" / "knee osteoarthritis grade" routed to
// nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ahlback S. Osteoarthrosis of the knee. A radiographic investigation. Acta Radiol Diagn (Stockh).
//     1968;Suppl 277:7-72.
//   - Orthopedic / radiology references reproducing the same narrowing (I) / obliteration (II) /
//     minor-attrition (III) / moderate-attrition (IV) / severe-attrition (V) grading.
//
// Grades (joint-space loss and bone attrition):
//   I   : joint-space narrowing (less than 3 mm, or less than half of the opposite compartment), with or
//         without subchondral sclerosis.
//   II  : joint-space obliteration (bone-to-bone contact in the affected compartment).
//   III : minor bone attrition (0 to 5 mm of bone loss).
//   IV  : moderate bone attrition (5 to 10 mm of bone loss).
//   V   : severe bone attrition (more than 10 mm of bone loss), often with joint subluxation.

const GRADES = {
  I: { grade: 'I', text: 'Ahlback grade I - joint-space narrowing (less than 3 mm, or less than half of the opposite compartment), with or without subchondral sclerosis.' },
  II: { grade: 'II', text: 'Ahlback grade II - joint-space obliteration (bone-to-bone contact in the affected compartment).' },
  III: { grade: 'III', text: 'Ahlback grade III - minor bone attrition (0 to 5 mm of bone loss).' },
  IV: { grade: 'IV', text: 'Ahlback grade IV - moderate bone attrition (5 to 10 mm of bone loss).' },
  V: { grade: 'V', text: 'Ahlback grade V - severe bone attrition (more than 10 mm of bone loss), often with joint subluxation.' },
};

const NOTE = 'The Ahlback classification (Ahlback 1968) grades knee osteoarthritis by radiographic joint-space loss and bone attrition. I: joint-space narrowing. II: joint-space obliteration (bone-to-bone). III: minor bone attrition (0-5 mm). IV: moderate bone attrition (5-10 mm). V: severe bone attrition (>10 mm), often with subluxation. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I'..'V' (case-insensitive; also accepts 1-5).
export function ahlbackKneeOa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Ahlback grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Ahlback grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

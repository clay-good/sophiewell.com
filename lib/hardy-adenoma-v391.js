// spec-v391: Hardy (Hardy-Wilson) classification of a pituitary adenoma — a two-axis system: a sellar-
// floor / sphenoid-invasion GRADE (0-IV) and a suprasellar-extension STAGE (0/A-E). It complements the
// Knosp grade (which describes the parasellar / cavernous-sinus axis) shipped alongside. "hardy" /
// "hardy wilson pituitary" / "suprasellar extension stage" routed to nothing.
//
// HIGH-STAKES: this reports the Hardy GRADE and STAGE the clinician has determined from the imaging, NOT
// a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Grades
// III-IV are the classically "invasive" (sellar-floor) grades, but the management decision stays with the
// neurosurgical / endocrine team.
//
// AXES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hardy J. Transsphenoidal microsurgery of the normal and pathological pituitary. Clin Neurosurg.
//     1969;16:185-217; with Wilson's modification (the suprasellar stages).
//   - Neurosurgery / neuroradiology references reproducing the same sellar-floor grade (0 enclosed /
//     I focal <10 mm / II enlarged, floor intact / III localized floor erosion / IV diffuse destruction)
//     and suprasellar stage (0 none / A cistern / B third-ventricle recess / C third ventricle displaced
//     / D intracranial-intradural / E into the cavernous sinus).
//
// GRADE (sellar floor / sphenoid): 0 enclosed within the sella; I sella normal/focally expanded, tumor
//   <10 mm; II tumor >=10 mm, sella enlarged, floor intact; III localized erosion of the sellar floor
//   (invasive); IV diffuse destruction of the floor (invasive).
// STAGE (suprasellar): 0 none (intrasellar); A suprasellar cistern; B recess of the third ventricle;
//   C third ventricle grossly displaced; D intracranial (intradural) extension; E into / beneath the
//   cavernous sinus (extradural, lateral).

const GRADES = {
  0: { g: '0', invasive: false, text: 'grade 0 (enclosed within the sella)' },
  I: { g: 'I', invasive: false, text: 'grade I (sella normal or focally expanded, tumor < 10 mm)' },
  II: { g: 'II', invasive: false, text: 'grade II (tumor >= 10 mm, sella enlarged, floor intact)' },
  III: { g: 'III', invasive: true, text: 'grade III (localized erosion of the sellar floor; invasive)' },
  IV: { g: 'IV', invasive: true, text: 'grade IV (diffuse destruction of the sellar floor; invasive)' },
};

const STAGES = {
  0: { s: '0', text: 'stage 0 (no suprasellar extension)' },
  A: { s: 'A', text: 'stage A (suprasellar cistern)' },
  B: { s: 'B', text: 'stage B (recess of the third ventricle)' },
  C: { s: 'C', text: 'stage C (third ventricle grossly displaced)' },
  D: { s: 'D', text: 'stage D (intracranial, intradural extension)' },
  E: { s: 'E', text: 'stage E (into or beneath the cavernous sinus)' },
};

const GRADE_ALIAS = { 0: '0', I: 'I', II: 'II', III: 'III', IV: 'IV', 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
const STAGE_ALIAS = { 0: '0', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' };

const NOTE = 'The Hardy (Hardy-Wilson) classification grades a pituitary adenoma on two axes: a sellar-floor / sphenoid-invasion grade (0 enclosed, I focal <10 mm, II enlarged with an intact floor, III localized floor erosion, IV diffuse destruction) and a suprasellar-extension stage (0 none, A cistern, B third-ventricle recess, C third ventricle displaced, D intracranial, E cavernous sinus). Grades III-IV are the classically invasive grades. This reports the grade and stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Knosp grade (parasellar axis).';

// input:
//   grade: '0'/'I'/'II'/'III'/'IV' (also 1-4)
//   stage: '0'/'A'/'B'/'C'/'D'/'E'
export function hardyAdenoma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const gRaw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const sRaw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const gKey = Object.prototype.hasOwnProperty.call(GRADE_ALIAS, gRaw) ? GRADE_ALIAS[gRaw] : gRaw;
  const sKey = Object.prototype.hasOwnProperty.call(STAGE_ALIAS, sRaw) ? STAGE_ALIAS[sRaw] : sRaw;
  const g = GRADES[gKey];
  const s = STAGES[sKey];
  if (!g) return { valid: false, message: 'Select the Hardy grade (0, I, II, III, or IV).' };
  if (!s) return { valid: false, message: 'Select the Hardy stage (0, A, B, C, D, or E).' };
  return {
    valid: true,
    grade: g.g,
    stage: s.s,
    invasive: g.invasive,
    abnormal: g.invasive,
    bandLabel: `Hardy grade ${g.g}, stage ${s.s}`,
    band: `Hardy ${g.text}, ${s.text}.`,
    note: NOTE,
  };
}

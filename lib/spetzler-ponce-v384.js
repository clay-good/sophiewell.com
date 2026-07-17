// spec-v384: Spetzler-Ponce classification of a cerebral arteriovenous malformation (Classes A/B/C) — a
// 3-tier simplification of the 5-tier Spetzler-Martin grade, grouping SM grades by the similarity of
// their surgical outcomes. It is the companion to the existing Spetzler-Martin tile in the catalog.
// "spetzler ponce" / "AVM 3-tier classification" routed to nothing.
//
// HIGH-STAKES: this reports the Spetzler-Ponce CLASS derived from the Spetzler-Martin grade the clinician
// has determined, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient
// (spec-v11 §5.3). The management approaches the authors ASSOCIATED with each class (in their series) are
// stated descriptively below; they are not an order for any given patient — that decision stays with the
// neurosurgical / neurovascular team.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Spetzler RF, Ponce FA. A 3-tier classification of cerebral arteriovenous malformations. Clinical
//     article. J Neurosurg. 2011;114(3):842-849 (the A/B/C grouping; the 3-tier and 5-tier systems had
//     equivalent predictive accuracy for surgical outcome).
//
// Classes (grouping of the Spetzler-Martin grade; higher class = higher surgical risk):
//   A : Spetzler-Martin grade I-II. Lowest surgical risk. (The authors generally associated surgery with
//       this class.)
//   B : Spetzler-Martin grade III. Intermediate. (The authors generally associated multimodal treatment
//       with this class.)
//   C : Spetzler-Martin grade IV-V. Highest surgical risk. (The authors generally associated observation
//       with this class, reserving treatment for recurrent hemorrhage or progressive deficit.) Flagged.

const CLASSES = {
  A: { cls: 'A', smGrades: 'I-II', higherRisk: false, text: 'Spetzler-Ponce Class A - Spetzler-Martin grade I-II; the lowest surgical risk.' },
  B: { cls: 'B', smGrades: 'III', higherRisk: false, text: 'Spetzler-Ponce Class B - Spetzler-Martin grade III; intermediate surgical risk.' },
  C: { cls: 'C', smGrades: 'IV-V', higherRisk: true, text: 'Spetzler-Ponce Class C - Spetzler-Martin grade IV-V; the highest surgical risk.' },
};

const NOTE = 'The Spetzler-Ponce classification is a 3-tier simplification of the 5-tier Spetzler-Martin AVM grade, grouping grades with similar surgical outcomes: A = SM I-II, B = SM III, C = SM IV-V. In the original series, Spetzler and Ponce generally associated surgery with Class A, multimodal treatment with Class B, and observation with Class C (reserving treatment for recurrent hemorrhage or progressive deficit) - a general association from their data, not an order for any individual patient. This reports the class derived from the Spetzler-Martin grade you enter, not a diagnosis, a treatment decision, or a prognosis. Companion: the Spetzler-Martin grade.';

// map a Spetzler-Martin grade (1-5 or I-V) directly to a class, as a convenience
const SM_TO_CLASS = { 1: 'A', 2: 'A', 3: 'B', 4: 'C', 5: 'C', I: 'A', II: 'A', III: 'B', IV: 'C', V: 'C' };
const ALIAS = { A: 'A', B: 'B', C: 'C', 1: 'A', 2: 'B', 3: 'C' };

// input:
//   class: 'A' / 'B' / 'C' (case-insensitive; also accepts 1-3), OR
//   smGrade: a Spetzler-Martin grade 1-5 / I-V to derive the class
export function spetzlerPonce(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let key = '';
  if (o.class != null && String(o.class).trim() !== '') {
    const raw = String(o.class).trim().toUpperCase();
    key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  } else if (o.smGrade != null && String(o.smGrade).trim() !== '') {
    const raw = String(o.smGrade).trim().toUpperCase();
    key = Object.prototype.hasOwnProperty.call(SM_TO_CLASS, raw) ? SM_TO_CLASS[raw] : '';
  }
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the Spetzler-Ponce class (A, B, or C), or enter a Spetzler-Martin grade (1-5).' };
  }
  return {
    valid: true,
    class: c.cls,
    spetzlerMartinGrades: c.smGrades,
    higherRisk: c.higherRisk,
    abnormal: c.higherRisk,
    bandLabel: `Spetzler-Ponce Class ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}

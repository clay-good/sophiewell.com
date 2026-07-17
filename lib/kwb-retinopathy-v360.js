// spec-v360: Keith-Wagener-Barker (KWB) classification of hypertensive retinopathy (grades 1-4) — the
// classic grading of the retinal changes of systemic hypertension on fundoscopy. The catalog carries
// the ICDR diabetic-retinopathy severity scale but no hypertensive-retinopathy grade. "keith wagener
// barker" / "hypertensive retinopathy grade" / "kwb grade" routed to nothing.
//
// HIGH-STAKES: this reports the KWB GRADE the clinician has determined from the fundus exam, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Grade 4
// (papilledema) is the fundoscopic hallmark of malignant hypertension, a clinical emergency assessed on
// its own; the management decision stays with the treating clinician.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Keith NM, Wagener HP, Barker NW. Some different types of essential hypertension: their course and
//     prognosis. Am J Med Sci. 1939;197(3):332-343 (the original four-grade classification).
//   - Ophthalmology / internal-medicine references (StatPearls and standard texts) reproducing the same
//     grade 1-4 fundoscopic definitions.
//
// Grades (fundoscopic changes of hypertensive retinopathy):
//   1 : mild generalized retinal arteriolar narrowing (and arteriovenous tortuosity).
//   2 : focal arteriolar narrowing and arteriovenous (AV) nicking.
//   3 : grade 2 changes plus retinal hemorrhages, cotton-wool spots, and hard exudates. Flagged.
//   4 : grade 3 changes plus optic disc swelling (papilledema); the fundoscopic hallmark of malignant
//       hypertension. Flagged.

const GRADES = {
  1: { grade: '1', severe: false, text: 'Keith-Wagener-Barker grade 1 - mild generalized retinal arteriolar narrowing (and arteriovenous tortuosity).' },
  2: { grade: '2', severe: false, text: 'Keith-Wagener-Barker grade 2 - focal arteriolar narrowing and arteriovenous (AV) nicking.' },
  3: { grade: '3', severe: true, text: 'Keith-Wagener-Barker grade 3 - grade 2 changes plus retinal hemorrhages, cotton-wool spots, and hard exudates.' },
  4: { grade: '4', severe: true, text: 'Keith-Wagener-Barker grade 4 - grade 3 changes plus optic disc swelling (papilledema); the fundoscopic hallmark of malignant hypertension.' },
};

const NOTE = 'The Keith-Wagener-Barker classification (Keith, Wagener & Barker 1939) grades the retinal changes of systemic hypertension on fundoscopy. 1: mild generalized arteriolar narrowing. 2: focal narrowing and arteriovenous nicking. 3: hemorrhages, cotton-wool spots, and exudates. 4: plus optic disc swelling (papilledema), the hallmark of malignant hypertension. Grades 3-4 signal active end-organ injury; grade 4 is a clinical emergency assessed on its own. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4',
  I: '1', II: '2', III: '3', IV: '4',
};

// input:
//   grade: '1'-'4' (also accepts roman I-IV; case-insensitive)
export function kwbRetinopathy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Keith-Wagener-Barker grade (1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    severe: g.severe,
    abnormal: g.severe,
    bandLabel: `Keith-Wagener-Barker grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

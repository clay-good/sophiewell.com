// spec-v425: the International Reflux Study grading of vesicoureteral reflux (VUR) on a voiding
// cystourethrogram (VCUG), by the extent of reflux and the degree of ureteral/pelvicalyceal dilatation —
// grades I / II / III / IV / V. It is the standard grading a radiologist reports on a pediatric VCUG.
// "vesicoureteral reflux grade" / "vur grade" routed to nothing.
//
// HIGH-STAKES: this reports the imaging GRADE the radiologist has determined from the VCUG, NOT a diagnosis,
// a treatment decision (medical prophylaxis vs surgical reimplantation), or a prognosis for an individual
// patient (spec-v11 §5.3). The management decision stays with the pediatric urology / nephrology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - International Reflux Study Committee. Medical versus surgical treatment of primary vesicoureteral
//     reflux. Pediatrics. 1981;67(3):392-400 (the five-grade international VUR grading used on VCUG).
//   - Pediatric urology / radiology references reproducing the same ureter-only (I) / up-to-pelvis-no-
//     dilatation (II) / mild-moderate-dilatation (III) / moderate-dilatation-tortuosity (IV) / gross-
//     dilatation-tortuosity (V) grading.
//
// Grades (on VCUG):
//   I   : reflux into the ureter only, not reaching the renal pelvis.
//   II  : reflux up to the renal pelvis, no dilatation, normal fornices.
//   III : mild to moderate dilatation of the ureter and pelvis, slight or no blunting of the fornices.
//   IV  : moderate dilatation and tortuosity of the ureter with dilatation of the pelvis and calyces, fornices
//         obliterated but papillary impressions preserved.
//   V   : gross dilatation and tortuosity of the ureter with gross dilatation of the pelvis and calyces,
//         papillary impressions lost, intrarenal reflux.

const GRADES = {
  I: { grade: 'I', text: 'VUR grade I - reflux into the ureter only, not reaching the renal pelvis.' },
  II: { grade: 'II', text: 'VUR grade II - reflux up to the renal pelvis, no dilatation, normal fornices.' },
  III: { grade: 'III', text: 'VUR grade III - mild to moderate dilatation of the ureter and pelvis, slight or no blunting of the fornices.' },
  IV: { grade: 'IV', text: 'VUR grade IV - moderate dilatation and tortuosity of the ureter with dilatation of the pelvis and calyces, fornices obliterated but papillary impressions preserved.' },
  V: { grade: 'V', text: 'VUR grade V - gross dilatation and tortuosity of the ureter with gross dilatation of the pelvis and calyces, papillary impressions lost, intrarenal reflux.' },
};

const NOTE = 'The International Reflux Study grading (1981) grades vesicoureteral reflux on a voiding cystourethrogram by the extent of reflux and the degree of ureteral/pelvicalyceal dilatation. I: ureter only. II: up to the pelvis, no dilatation. III: mild-to-moderate dilatation. IV: moderate dilatation and tortuosity, fornices obliterated. V: gross dilatation and tortuosity, intrarenal reflux. This reports the grade the radiologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' / 'V' (case-insensitive; also accepts 1-5).
export function vurGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the vesicoureteral reflux grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `VUR grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

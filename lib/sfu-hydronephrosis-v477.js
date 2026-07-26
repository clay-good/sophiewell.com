// spec-v477: the Society for Fetal Urology (SFU) ultrasound grading of hydronephrosis, by the degree of renal
// pelvis / calyceal dilatation and parenchymal thinning — grades 0 / 1 / 2 / 3 / 4. It is the standard
// pediatric hydronephrosis grade and joins the pediatric-urology tiles. "sfu" / "hydronephrosis grade" routed
// to nothing.
//
// HIGH-STAKES: this reports the ultrasound GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// urology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Fernbach SK, Maizels M, Conway JJ. Ultrasound grading of hydronephrosis: introduction to the system
//     used by the Society for Fetal Urology. Pediatr Radiol. 1993;23(6):478-480.
//   - Pediatric-urology references reproducing the same intact (0) / pelvis-only (1) / pelvis-plus-some-calyces
//     (2) / pelvis-plus-all-calyces (3) / plus-parenchymal-thinning (4) grading.
//
// Grades (renal-sinus/calyceal dilatation):
//   0 : no hydronephrosis; intact central renal complex.
//   1 : slight splitting of the central renal complex (renal pelvis only).
//   2 : dilatation of the renal pelvis and a few calyces.
//   3 : dilatation of the renal pelvis and all calyces, which are uniformly dilated; normal parenchyma.
//   4 : as grade 3, plus thinning of the renal parenchyma.

const GRADES = {
  0: { grade: '0', text: 'SFU grade 0 - no hydronephrosis; intact central renal complex.' },
  1: { grade: '1', text: 'SFU grade 1 - slight splitting of the central renal complex (renal pelvis only).' },
  2: { grade: '2', text: 'SFU grade 2 - dilatation of the renal pelvis and a few calyces.' },
  3: { grade: '3', text: 'SFU grade 3 - dilatation of the renal pelvis and all calyces, which are uniformly dilated; normal renal parenchyma.' },
  4: { grade: '4', text: 'SFU grade 4 - as grade 3, plus thinning of the renal parenchyma.' },
};

const NOTE = 'The Society for Fetal Urology (SFU) grading (Fernbach 1993) grades hydronephrosis on ultrasound by renal-sinus and calyceal dilatation and parenchymal thinning. 0: intact central renal complex. 1: renal pelvis only. 2: pelvis and a few calyces. 3: pelvis and all calyces uniformly dilated, normal parenchyma. 4: as grade 3 plus parenchymal thinning. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: 0-4.
export function sfuHydronephrosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the SFU grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `SFU grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

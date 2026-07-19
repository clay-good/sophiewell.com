// spec-v436: the Biffl (Denver) grading scale for blunt cerebrovascular injury (BCVI), by the angiographic
// appearance of the carotid or vertebral artery injury — grades I / II / III / IV / V. It is the injury-
// severity grading that follows a positive BCVI screen; it companions the expanded Denver screening criteria
// (denver-bcvi). "biffl grade" / "BCVI injury grade" routed to nothing.
//
// HIGH-STAKES: this reports the angiographic injury GRADE the clinician / radiologist has determined, NOT a
// diagnosis, a treatment decision (antithrombotic, endovascular, surgical), or a prognosis for an individual
// patient (spec-v11 §5.3). The management decision stays with the trauma / neurosurgery / neurointervention
// team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Biffl WL, Moore EE, Offner PJ, Brega KE, Franciose RJ, Burch JM. Blunt carotid arterial injuries:
//     implications of a new grading scale. J Trauma. 1999;47(5):845-853.
//   - Trauma / neuroradiology references reproducing the same irregularity (I) / dissection-with-stenosis
//     (II) / pseudoaneurysm (III) / occlusion (IV) / transection (V) grading.
//
// Grades (angiographic appearance):
//   I   : luminal irregularity or dissection with less than 25% luminal narrowing.
//   II  : dissection or intramural hematoma with 25% or more luminal narrowing, intraluminal thrombus, or a
//         raised intimal flap.
//   III : pseudoaneurysm.
//   IV  : occlusion.
//   V   : transection with free extravasation.

const GRADES = {
  I: { grade: 'I', text: 'Biffl grade I - luminal irregularity or dissection with less than 25% luminal narrowing.' },
  II: { grade: 'II', text: 'Biffl grade II - dissection or intramural hematoma with 25% or more luminal narrowing, intraluminal thrombus, or a raised intimal flap.' },
  III: { grade: 'III', text: 'Biffl grade III - pseudoaneurysm.' },
  IV: { grade: 'IV', text: 'Biffl grade IV - occlusion.' },
  V: { grade: 'V', text: 'Biffl grade V - transection with free extravasation.' },
};

const NOTE = 'The Biffl (Denver) grading scale (Biffl 1999) grades blunt cerebrovascular injury by the angiographic appearance. I: luminal irregularity or dissection <25% narrowing. II: dissection/intramural hematoma with >=25% narrowing, thrombus, or raised intimal flap. III: pseudoaneurysm. IV: occlusion. V: transection with extravasation. It follows a positive BCVI screen. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' / 'V' (case-insensitive; also accepts 1-5).
export function bifflBcvi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Biffl BCVI grade (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Biffl grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

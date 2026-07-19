// spec-v430: the Papile grading of germinal matrix / intraventricular hemorrhage (IVH) in the preterm
// newborn, by the extent of the hemorrhage on cranial imaging — grades I / II / III / IV. It is a standard
// grading in neonatal neuroimaging and companions the Sarnat HIE staging (sarnat-hie). "papile grade" /
// "intraventricular hemorrhage grade" routed to nothing.
//
// This tile reports the ORIGINAL Papile (1978) four-grade scheme. A later scheme (Volpe) re-grades IVH and
// treats parenchymal involvement as periventricular hemorrhagic infarction rather than a simple "grade IV
// extension"; that scheme is not reported here.
//
// HIGH-STAKES: this reports the imaging GRADE the radiologist / clinician has determined, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual infant (spec-v11 §5.3). The management decision stays
// with the neonatology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Papile LA, Burstein J, Burstein R, Koffler H. Incidence and evolution of subependymal and
//     intraventricular hemorrhage: a study of infants with birth weights less than 1,500 gm. J Pediatr.
//     1978;92(4):529-534.
//   - Neonatology / neuroradiology references reproducing the same germinal-matrix (I) / IVH-without-
//     dilatation (II) / IVH-with-dilatation (III) / parenchymal-extension (IV) grading.
//
// Grades (cranial imaging):
//   I   : hemorrhage confined to the germinal matrix (subependymal).
//   II  : intraventricular hemorrhage without ventricular dilatation.
//   III : intraventricular hemorrhage with ventricular dilatation.
//   IV  : intraventricular hemorrhage with parenchymal (intraparenchymal) extension.

const GRADES = {
  I: { grade: 'I', text: 'Papile grade I - hemorrhage confined to the germinal matrix (subependymal).' },
  II: { grade: 'II', text: 'Papile grade II - intraventricular hemorrhage without ventricular dilatation.' },
  III: { grade: 'III', text: 'Papile grade III - intraventricular hemorrhage with ventricular dilatation.' },
  IV: { grade: 'IV', text: 'Papile grade IV - intraventricular hemorrhage with parenchymal (intraparenchymal) extension.' },
};

const NOTE = 'The Papile grading (Papile 1978) grades germinal matrix / intraventricular hemorrhage in the preterm newborn on cranial imaging. I: confined to the germinal matrix (subependymal). II: IVH without ventricular dilatation. III: IVH with ventricular dilatation. IV: IVH with parenchymal extension. This reports the original four-grade scheme; a later scheme (Volpe) treats parenchymal involvement as periventricular hemorrhagic infarction. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function papileIvh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Papile grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Papile grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

// spec-v419: Myer-Cotton (Cotton-Myer) grading of subglottic stenosis, by the percent obstruction of the
// subglottic airway lumen — grades I / II / III / IV. It is graded endoscopically (classically by the
// largest endotracheal tube that passes with an appropriate leak, versus the age-expected size). It joins
// the airway / otolaryngology tiles. "cotton-myer" / "subglottic stenosis grade" routed to nothing.
//
// HIGH-STAKES: this reports the GRADE the clinician has determined at airway evaluation, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The airway-management
// decision stays with the otolaryngology / airway team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Myer CM 3rd, O'Connor DM, Cotton RT. Proposed grading system for subglottic stenosis based on
//     endotracheal tube sizes. Ann Otol Rhinol Laryngol. 1994;103(4 Pt 1):319-323.
//   - Otolaryngology / airway references reproducing the same 0-50% (I) / 51-70% (II) / 71-99% (III) /
//     no-detectable-lumen (IV) grouping.
//
// Grades (percent obstruction of the subglottic lumen):
//   I   : 0% to 50% obstruction.
//   II  : 51% to 70% obstruction.
//   III : 71% to 99% obstruction.
//   IV  : no detectable lumen (complete obstruction).

const GRADES = {
  I: { grade: 'I', text: 'Cotton-Myer grade I - 0% to 50% obstruction of the subglottic lumen.' },
  II: { grade: 'II', text: 'Cotton-Myer grade II - 51% to 70% obstruction of the subglottic lumen.' },
  III: { grade: 'III', text: 'Cotton-Myer grade III - 71% to 99% obstruction of the subglottic lumen.' },
  IV: { grade: 'IV', text: 'Cotton-Myer grade IV - no detectable lumen (complete obstruction).' },
};

const NOTE = 'The Myer-Cotton grading (Myer-Cotton 1994) grades subglottic stenosis by the percent obstruction of the subglottic lumen, classically from the largest endotracheal tube that passes with an appropriate leak versus the age-expected size. I: 0-50%. II: 51-70%. III: 71-99%. IV: no detectable lumen. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function cottonMyer(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Cotton-Myer grade (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Cotton-Myer grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

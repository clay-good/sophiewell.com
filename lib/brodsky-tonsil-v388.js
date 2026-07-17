// spec-v388: Brodsky grading scale for palatine tonsil size (grades 0-4), by the percentage of the
// oropharyngeal width the tonsils occupy — the most validated tonsillar-hypertrophy classification, used
// in the assessment of pediatric sleep-disordered breathing and the need for tonsillectomy. It sits
// beside the airway / ENT tiles in the catalog. "brodsky" / "tonsil size grade" routed to nothing.
//
// HIGH-STAKES: this reports the Brodsky GRADE the clinician has determined on exam, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Grades 3-4 are the
// classically "obstructive" sizes, but the management decision stays with the treating team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Brodsky L. Modern assessment of tonsils and adenoids. Pediatr Clin North Am. 1989;36(6):1551-1569
//     (the 0-4 scale by percentage of the oropharyngeal width).
//   - ENT / sleep-medicine references reproducing the same 0 (in the fossa) / 1 (<25%) / 2 (25-50%) / 3
//     (50-75%) / 4 (>75%, "kissing tonsils") grading and the non-obstructive (0-2) vs obstructive (3-4)
//     split.
//
// Grades (percentage of the oropharyngeal width the tonsils occupy):
//   0 : tonsils within the tonsillar fossa; do not obstruct the airway.
//   1 : occupy less than 25% of the oropharyngeal width.
//   2 : occupy 25-50%.
//   3 : occupy 50-75%. Flagged (obstructive).
//   4 : occupy more than 75% ("kissing tonsils"). Flagged (obstructive).

const GRADES = {
  0: { grade: '0', obstructive: false, text: 'Brodsky grade 0 - tonsils within the tonsillar fossa; they do not obstruct the airway.' },
  1: { grade: '1', obstructive: false, text: 'Brodsky grade 1 - tonsils occupy less than 25% of the oropharyngeal width.' },
  2: { grade: '2', obstructive: false, text: 'Brodsky grade 2 - tonsils occupy 25-50% of the oropharyngeal width.' },
  3: { grade: '3', obstructive: true, text: 'Brodsky grade 3 - tonsils occupy 50-75% of the oropharyngeal width (obstructive).' },
  4: { grade: '4', obstructive: true, text: 'Brodsky grade 4 - tonsils occupy more than 75% of the oropharyngeal width ("kissing tonsils"; obstructive).' },
};

const NOTE = 'The Brodsky scale grades palatine tonsil size 0-4 by the percentage of the oropharyngeal width the tonsils occupy: 0 within the fossa, 1 <25%, 2 25-50%, 3 50-75%, 4 >75% ("kissing tonsils"). Grades 0-2 are non-obstructive; 3-4 are obstructive. This grouping is the classically taught pattern, not an order. This reports the grade the clinician has determined on exam, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4' };

// input:
//   grade: '0'..'4'
export function brodskyTonsil(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Brodsky grade (0 to 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    obstructive: g.obstructive,
    abnormal: g.obstructive,
    bandLabel: `Brodsky grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

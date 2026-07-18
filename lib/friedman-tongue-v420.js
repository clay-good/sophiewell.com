// spec-v420: Friedman tongue position (FTP), the anatomical grade of what the observer can visualize of the
// oropharynx with the mouth open, no tongue protrusion — grades I / II / III / IV. It is used in the
// preoperative staging of obstructive sleep apnea (a higher grade = a more crowded oropharynx). It joins the
// airway / otolaryngology tiles (Cotton-Myer, Brodsky). "friedman tongue position" / "FTP grade" routed to
// nothing.
//
// This tile reports the BASE four-grade Friedman tongue position. Some sources subdivide grade II into IIa
// (most of the uvula) and IIb (the entire soft palate to the uvular base); the widely published base grading
// uses the single grade II reproduced here.
//
// HIGH-STAKES: this reports the anatomical GRADE the clinician has observed, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). It is one input to OSA staging, not the
// stage itself; the management decision stays with the sleep / otolaryngology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Friedman M, Ibrahim H, Bass L. Clinical staging for sleep-disordered breathing. Otolaryngol Head Neck
//     Surg. 2002;127(1):13-21 (the Friedman tongue position used in the clinical OSA staging).
//   - Sleep-surgery / otolaryngology references reproducing the same uvula-and-tonsils (I) / uvula (II) /
//     soft-palate (III) / hard-palate-only (IV) grading.
//
// Grades (what the observer can visualize, mouth open, no protrusion/phonation):
//   I   : the entire uvula and the tonsils / pillars.
//   II  : the uvula but not the tonsils / pillars.
//   III : the soft palate but not the uvula.
//   IV  : only the hard palate.

const GRADES = {
  I: { grade: 'I', text: 'Friedman tongue position I - the observer can visualize the entire uvula and the tonsils / pillars.' },
  II: { grade: 'II', text: 'Friedman tongue position II - the observer can visualize the uvula but not the tonsils / pillars.' },
  III: { grade: 'III', text: 'Friedman tongue position III - the observer can visualize the soft palate but not the uvula.' },
  IV: { grade: 'IV', text: 'Friedman tongue position IV - the observer can visualize only the hard palate.' },
};

const NOTE = 'The Friedman tongue position (Friedman 2002) grades what the observer can visualize of the oropharynx with the mouth open, no tongue protrusion. I: the entire uvula and the tonsils / pillars. II: the uvula but not the tonsils. III: the soft palate but not the uvula. IV: only the hard palate. It is one input to the Friedman OSA clinical stage (with tonsil size and BMI), not the stage itself. This reports the grade the clinician has observed, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function friedmanTongue(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Friedman tongue position (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Friedman tongue position ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

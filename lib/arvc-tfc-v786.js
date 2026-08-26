// spec-v786: 2010 Task Force Criteria for arrhythmogenic right ventricular cardiomyopathy.
//
// Source:
//   Marcus FI, McKenna WJ, Sherrill D, et al. Diagnosis of arrhythmogenic right
//   ventricular cardiomyopathy/dysplasia: proposed modification of the Task Force
//   Criteria. Eur Heart J. 2010;31(7):806-814. (PMID 20172912.)
//
// Six categories. Within EACH category a patient fulfils a major criterion, a minor
// criterion, or neither - never both. That per-category cap is the rule most often
// missed: three separate major findings inside one category still count once.
//
//   I    global or regional dysfunction and structural alterations (echo, MRI, angiography)
//   II   tissue characterization of the wall (biopsy)
//   III  repolarization abnormalities (T-wave inversion)
//   IV   depolarization or conduction abnormalities (epsilon wave, late potentials,
//        terminal activation duration)
//   V    arrhythmias (VT morphology, PVC burden)
//   VI   family history, including genetics
//
// Major counts 2 points, minor 1. The published combinations map exactly onto that
// arithmetic:
//   definite    2 major, or 1 major + 2 minor, or 4 minor        = 4 or more points
//   borderline  1 major + 1 minor, or 3 minor                    = 3 points
//   possible    1 major, or 2 minor                              = 2 points
//   below that, the criteria are not met
//
// Pure: no DOM, no clock, no network.

export const ARVC_NOTE = 'The 2010 Task Force Criteria for arrhythmogenic right ventricular cardiomyopathy (Marcus FI, McKenna WJ, Sherrill D, et al, Eur Heart J 2010;31(7):806-814) sort the evidence into six categories: structure and function on imaging, tissue on biopsy, repolarization on the ECG, depolarization or conduction on the ECG, arrhythmias, and family history including genetics. Within each category a patient fulfils a major criterion, a minor criterion, or neither, never both, so several major findings inside one category still count only once. A major criterion is worth 2 points and a minor 1, and the published combinations follow that arithmetic exactly: 4 or more points is a definite diagnosis, 3 is borderline and 2 is possible. It is a diagnostic framework applied to findings a clinician has already gathered and interpreted; it does not read an image, an ECG or a biopsy, and it makes no decision about defibrillators, exercise restriction or family screening.';

export const CATEGORIES = [
  { arg: 'structural', roman: 'I', label: 'Global or regional dysfunction and structural alterations' },
  { arg: 'tissue', roman: 'II', label: 'Tissue characterization of the wall' },
  { arg: 'repolarization', roman: 'III', label: 'Repolarization abnormalities' },
  { arg: 'depolarization', roman: 'IV', label: 'Depolarization or conduction abnormalities' },
  { arg: 'arrhythmias', roman: 'V', label: 'Arrhythmias' },
  { arg: 'family', roman: 'VI', label: 'Family history' },
];

const LEVELS = { none: 0, minor: 1, major: 2 };

export function arvcTfc(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let points = 0;
  let majors = 0;
  let minors = 0;
  const met = [];
  for (const c of CATEGORIES) {
    const raw = o[c.arg] === undefined || o[c.arg] === null || o[c.arg] === '' ? 'none' : String(o[c.arg]).trim();
    if (!Object.prototype.hasOwnProperty.call(LEVELS, raw)) {
      return { valid: false, code: 'INVALID_INPUT', field: c.arg, message: `Category ${c.roman} must be none, minor or major.`, note: ARVC_NOTE };
    }
    points += LEVELS[raw];
    if (raw === 'major') { majors += 1; met.push(`${c.roman} major`); }
    if (raw === 'minor') { minors += 1; met.push(`${c.roman} minor`); }
  }

  let tier, label;
  if (points >= 4) { tier = 'definite'; label = 'definite ARVC'; }
  else if (points === 3) { tier = 'borderline'; label = 'borderline ARVC'; }
  else if (points === 2) { tier = 'possible'; label = 'possible ARVC'; }
  else { tier = 'not-met'; label = 'criteria not met'; }

  return {
    valid: true,
    points,
    majors,
    minors,
    tier,
    met,
    abnormal: points >= 4,
    bandLabel: `ARVC Task Force ${points} points`,
    band: `ARVC Task Force ${points} points (${majors} major, ${minors} minor) — ${label}.`,
    detail: 'Each of the six categories contributes at most one criterion, major or minor, never both. Major counts 2 points and minor 1. Definite is 2 major, or 1 major plus 2 minor, or 4 minor, which is 4 or more points; borderline is 1 major plus 1 minor or 3 minor, which is 3 points; possible is 1 major or 2 minor, which is 2 points.',
    note: ARVC_NOTE,
  };
}

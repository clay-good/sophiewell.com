// spec-v493: the Lown grading system for ventricular ectopy (ventricular premature beats on ambulatory ECG /
// Holter monitoring) - grades 0 / 1 / 2 / 3 / 4A / 4B / 5. It joins the cardiology rhythm tiles. "lown" /
// "ventricular ectopy grade" routed to nothing.
//
// HIGH-STAKES: this reports the ectopy GRADE the clinician has determined from the recording, NOT a diagnosis,
// an antiarrhythmic decision, or a sudden-death risk prediction for an individual patient (spec-v11 section
// 5.3). The management decision stays with the cardiology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lown B, Wolf M. Approaches to sudden death from coronary heart disease. Circulation. 1971;44(1):130-142.
//   - Cardiology references reproducing the same none (0) / occasional (1) / frequent (2) / multiform (3) /
//     couplets (4A) / runs of VT (4B) / R-on-T (5) grouping.
//
// Grades (ventricular ectopic beats, abbreviated VEBs, on the recording):
//   0  : no ventricular ectopic beats.
//   1  : occasional, isolated VEBs - fewer than 30 per hour.
//   2  : frequent VEBs - 30 or more per hour.
//   3  : multiform (polymorphic) VEBs.
//   4A : couplets - two consecutive VEBs.
//   4B : salvos - three or more consecutive VEBs (a run of ventricular tachycardia).
//   5  : the R-on-T phenomenon - an early VEB falling on the T wave of the preceding beat.

const GRADES = {
  '0': { grade: '0', text: 'Lown grade 0 - no ventricular ectopic beats on the recording.' },
  '1': { grade: '1', text: 'Lown grade 1 - occasional, isolated ventricular ectopic beats: fewer than 30 per hour.' },
  '2': { grade: '2', text: 'Lown grade 2 - frequent ventricular ectopic beats: 30 or more per hour.' },
  '3': { grade: '3', text: 'Lown grade 3 - multiform (polymorphic) ventricular ectopic beats.' },
  '4A': { grade: '4A', text: 'Lown grade 4A - couplets: two consecutive ventricular ectopic beats.' },
  '4B': { grade: '4B', text: 'Lown grade 4B - salvos: three or more consecutive ventricular ectopic beats, a run of ventricular tachycardia.' },
  '5': { grade: '5', text: 'Lown grade 5 - the R-on-T phenomenon: an early ventricular ectopic beat falling on the T wave of the preceding beat.' },
};

const NOTE = 'The Lown grading system (Lown and Wolf 1971) grades ventricular ectopy on an ambulatory ECG recording. 0: none. 1: occasional isolated beats, fewer than 30 per hour. 2: frequent beats, 30 or more per hour. 3: multiform beats. 4A: couplets. 4B: salvos, three or more consecutive beats. 5: the R-on-T phenomenon. This reports the grade the clinician has determined, not a diagnosis, an antiarrhythmic decision, or a risk prediction.';

const ALIAS = {
  '0': '0', '1': '1', '2': '2', '3': '3', '5': '5',
  '4A': '4A', '4B': '4B',
};

// input:
//   grade: '0' / '1' / '2' / '3' / '4A' / '4B' / '5' (case-insensitive; bare '4' is ambiguous and rejected).
export function lownEctopy(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Lown grade (0, 1, 2, 3, 4A, 4B, or 5).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Lown grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

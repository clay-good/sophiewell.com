// spec-v437: the Goutallier classification of rotator cuff muscle fatty infiltration on CT/MRI, by the amount
// of fat relative to muscle in the cuff belly — grades 0 / 1 / 2 / 3 / 4. It is a standard descriptor in
// shoulder imaging and cuff-repair planning. "goutallier" / "fatty infiltration grade" routed to nothing.
//
// HIGH-STAKES: this reports the imaging GRADE the radiologist has determined, NOT a diagnosis, a treatment or
// reparability decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision
// stays with the orthopedic / shoulder team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Goutallier D, Postel JM, Bernageau J, Lavau L, Voisin MC. Fatty muscle degeneration in cuff ruptures.
//     Pre- and postoperative evaluation by CT scan. Clin Orthop Relat Res. 1994;(304):78-83.
//   - Radiology / orthopedic references reproducing the same normal (0) to more-fat-than-muscle (4) grading
//     (Fuchs later adapted the same grades to MRI).
//
// Grades (fat relative to muscle in the cuff belly):
//   0 : normal muscle, no fatty streaks.
//   1 : some fatty streaks.
//   2 : less fat than muscle (more muscle than fat).
//   3 : as much fat as muscle (fat equals muscle).
//   4 : more fat than muscle.

const GRADES = {
  0: { grade: '0', text: 'Goutallier grade 0 - normal muscle, no fatty streaks.' },
  1: { grade: '1', text: 'Goutallier grade 1 - some fatty streaks.' },
  2: { grade: '2', text: 'Goutallier grade 2 - less fat than muscle (more muscle than fat).' },
  3: { grade: '3', text: 'Goutallier grade 3 - as much fat as muscle (fat equals muscle).' },
  4: { grade: '4', text: 'Goutallier grade 4 - more fat than muscle.' },
};

const NOTE = 'The Goutallier classification (Goutallier 1994) grades rotator cuff muscle fatty infiltration on CT/MRI by the amount of fat relative to muscle. 0: normal, no fatty streaks. 1: some fatty streaks. 2: less fat than muscle. 3: fat equals muscle. 4: more fat than muscle. This reports the grade the radiologist has determined, not a diagnosis, a reparability or treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
};

// input:
//   grade: '0' / '1' / '2' / '3' / '4'.
export function goutallier(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Goutallier grade (0, 1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Goutallier grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

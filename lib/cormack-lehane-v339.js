// spec-v339: Cormack-Lehane classification of the laryngeal view at direct laryngoscopy (grades
// 1-4). The standard grading of how much of the glottis the laryngoscopist can see, which
// documents and predicts difficult tracheal intubation: grade 1 is a full glottic view; grades 3-4
// (only the epiglottis, or neither glottis nor epiglottis) are difficult views. The catalog carries
// airway-difficulty predictors (Mallampati, El-Ganzouri/Wilson via the airway tiles) but had no
// Cormack-Lehane laryngoscopy grade; "cormack" / "laryngoscopy grade" routed to nothing.
//
// HIGH-STAKES: this reports the laryngeal-view GRADE the laryngoscopist has observed, NOT a
// diagnosis, an airway-management plan, or an intubation-success prediction for an individual
// patient (spec-v11 §5.3). The airway plan stays with the anesthetist / proceduralist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Cormack RS, Lehane J. Difficult tracheal intubation in obstetrics. Anaesthesia.
//     1984;39(11):1105-1111 (the original grades 1-4).
//   - Yentis SM, Lee DJ. Evaluation of an improved scoring system for the grading of direct
//     laryngoscopy. Anaesthesia. 1998;53(11):1041-1044 (the modified 2a/2b subdivision), and Cook
//     TM (Anaesthesia 2000) for the 3a/3b subdivision — surfaced in the tile note.
//
// Grades (original 1984):
//   1: most of the glottis (vocal cords) is visible.
//   2: only the posterior portion of the glottis or only the arytenoid cartilages are visible
//      (modified: 2a part of the cords visible / 2b only the arytenoids).
//   3: only the epiglottis is visible; no part of the glottis (modified: 3a epiglottis can be
//      lifted / 3b epiglottis adherent to the pharynx). A difficult view.
//   4: neither the glottis nor the epiglottis can be seen (only the soft palate). A difficult view.

const GRADES = {
  1: { grade: '1', difficult: false, text: 'Cormack-Lehane grade 1 — most of the glottis (vocal cords) is visible. A full laryngeal view.' },
  2: { grade: '2', difficult: false, text: 'Cormack-Lehane grade 2 — only the posterior glottis or the arytenoid cartilages are visible (modified: 2a part of the cords visible; 2b only the arytenoids).' },
  3: { grade: '3', difficult: true, text: 'Cormack-Lehane grade 3 — only the epiglottis is visible; no part of the glottis (modified: 3a epiglottis liftable; 3b epiglottis adherent to the pharynx). A difficult laryngoscopy view.' },
  4: { grade: '4', difficult: true, text: 'Cormack-Lehane grade 4 — neither the glottis nor the epiglottis can be seen (only the soft palate). A difficult laryngoscopy view.' },
};

const NOTE = 'Cormack-Lehane classification (Cormack & Lehane 1984) grades the laryngeal view at direct laryngoscopy. 1: most of the glottis visible. 2: only the posterior glottis / arytenoids (modified 2a part of cords, 2b only arytenoids). 3: only the epiglottis, no glottis (modified 3a liftable, 3b adherent). 4: neither glottis nor epiglottis (only soft palate). Grades 1-2 are usually straightforward views; grades 3-4 indicate a difficult laryngoscopy and predict difficult intubation. This reports the view the laryngoscopist has observed, not a diagnosis, an airway-management plan, or an intubation-success prediction.';

// input:
//   grade: 1-4 (numeric or string; also accepts modified 2a/2b/3a/3b, mapped to the parent grade)
const ALIAS = { '2A': 2, '2B': 2, '3A': 3, '3B': 3 };

export function cormackLehane(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  let key = null;
  if (/^[1-4]$/.test(raw)) key = Number(raw);
  else if (Object.prototype.hasOwnProperty.call(ALIAS, raw)) key = ALIAS[raw];
  const g = key == null ? null : GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Cormack-Lehane grade (1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    difficult: g.difficult,
    abnormal: g.difficult,
    bandLabel: `Cormack-Lehane grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

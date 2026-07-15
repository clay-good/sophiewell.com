// spec-v318: Los Angeles (LA) classification of erosive (reflux) esophagitis. The
// endoscopist selects the grade (A-D) from the mucosal-break findings; the tile reports
// the grade and its standard definition. The catalog had no LA-grade tile ("Los Angeles"
// corpus hits were all the LAMS stroke motor scale); it is the erosive-esophagitis peer
// of the existing endoscopic-grading tiles (e.g. forrest-classification).
//
// HIGH-STAKES: this reports the CLASSIFICATION GRADE the endoscopist has determined, NOT
// a diagnosis or a treatment order (spec-v11 §5.3). The break-size / fold / circumference
// judgment is the endoscopist's; the tile echoes the grade's definition.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across sources that agree:
//   - Lundell LR, Dent J, Bennett JR, et al. Endoscopic assessment of oesophagitis:
//     clinical and functional correlates and further validation of the Los Angeles
//     classification. Gut. 1999;45(2):172-180.
//   - IWGCO LA classification (Armstrong 1996 / Lundell 1999), endoscopy-campus reference.
//
// Grades (extent of mucosal breaks is the sole determinant):
//   A : one or more mucosal breaks <= 5 mm, not extending between the tops of two folds.
//   B : one or more mucosal breaks > 5 mm, not extending between the tops of two folds.
//   C : mucosal break(s) continuous between the tops of >= 2 folds, but < 75% circumference.
//   D : mucosal break(s) involving >= 75% of the esophageal circumference.

const GRADES = {
  A: {
    label: 'LA grade A',
    text: 'LA grade A — one or more mucosal breaks <= 5 mm long, none extending between the tops of two mucosal folds. The mildest erosive esophagitis.',
    severe: false,
  },
  B: {
    label: 'LA grade B',
    text: 'LA grade B — one or more mucosal breaks > 5 mm long, none extending between the tops of two mucosal folds.',
    severe: false,
  },
  C: {
    label: 'LA grade C',
    text: 'LA grade C — mucosal break(s) continuous between the tops of two or more mucosal folds, but involving less than 75% of the esophageal circumference.',
    severe: true,
  },
  D: {
    label: 'LA grade D',
    text: 'LA grade D — mucosal break(s) involving at least 75% of the esophageal circumference. The most severe erosive esophagitis.',
    severe: true,
  },
};

const NOTE = 'Los Angeles (LA) classification of erosive esophagitis (Lundell 1999, Gut; IWGCO). The extent of mucosal breaks is the sole determinant. Grade A: break(s) <= 5 mm not between two fold tops. Grade B: break(s) > 5 mm not between two fold tops. Grade C: break(s) continuous between >= 2 fold tops but < 75% of the circumference. Grade D: break(s) >= 75% of the circumference. Grades A-B are mild and C-D are severe erosive disease. It grades erosive esophagitis, not non-erosive reflux (a normal-appearing mucosa is not graded here) or Barrett esophagus. This reports the grade the endoscopist has determined, not a diagnosis or a treatment order.';

// input:
//   grade: 'A' | 'B' | 'C' | 'D'
export function laEsophagitis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the LA grade (A, B, C, or D).' };
  }
  return {
    valid: true,
    grade: key,
    severe: g.severe,
    abnormal: g.severe,
    bandLabel: g.label,
    band: g.text,
    note: NOTE,
  };
}

// spec-v390: Knosp grading of cavernous sinus invasion by a pituitary adenoma (grades 0-4), on coronal
// MRI, using the internal carotid artery (ICA) as the landmark — the standard classification that
// predicts cavernous-sinus invasion and surgical remission. It is the imaging companion to the other
// pituitary/neurosurgery grading tiles in the catalog. "knosp" / "pituitary adenoma cavernous sinus
// grade" routed to nothing.
//
// HIGH-STAKES: this reports the Knosp GRADE the clinician has determined from the MRI, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Grades 3-4 predict true
// cavernous-sinus invasion (and lower surgical remission), but the management decision stays with the
// neurosurgical / endocrine team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Knosp E, Steiner E, Kitz K, Matula C. Pituitary adenomas with invasion of the cavernous sinus
//     space: a magnetic resonance imaging classification compared with surgical findings. Neurosurgery.
//     1993;33(4):610-617 (the 0-4 grading by ICA tangent lines).
//   - Neurosurgery / neuroradiology references reproducing the same medial-tangent / intercarotid-line /
//     lateral-tangent / encasement landmarks (revised Knosp adds 3A superior / 3B inferior subtypes).
//
// Grades (position of the tumor relative to the intra- and supracavernous ICA on coronal MRI):
//   0 : no cavernous sinus involvement; tumor medial to the medial tangent of the ICA.
//   1 : extends past the medial tangent but not past the intercarotid line (the center-to-center line of
//       the ICA segments).
//   2 : extends past the intercarotid line but not past the lateral tangent of the ICA.
//   3 : extends lateral to the lateral tangent of the ICA (revised: 3A superior, 3B inferior compartment).
//       Flagged (cavernous-sinus invasion likely).
//   4 : total encasement of the intracavernous ICA. Flagged.

const GRADES = {
  0: { grade: '0', invasion: false, text: 'Knosp grade 0 - no cavernous sinus involvement; the tumor is medial to the medial tangent of the internal carotid artery.' },
  1: { grade: '1', invasion: false, text: 'Knosp grade 1 - extends past the medial tangent but not past the intercarotid line (the center-to-center line of the ICA).' },
  2: { grade: '2', invasion: false, text: 'Knosp grade 2 - extends past the intercarotid line but not past the lateral tangent of the internal carotid artery.' },
  3: { grade: '3', invasion: true, text: 'Knosp grade 3 - extends lateral to the lateral tangent of the internal carotid artery (revised: 3A superior, 3B inferior compartment); cavernous-sinus invasion is likely.' },
  4: { grade: '4', invasion: true, text: 'Knosp grade 4 - total encasement of the intracavernous internal carotid artery.' },
};

const NOTE = 'The Knosp classification grades cavernous-sinus invasion by a pituitary adenoma on coronal MRI, using the internal carotid artery as the landmark. 0: medial to the medial tangent. 1: past the medial tangent, not past the intercarotid line. 2: past the intercarotid line, not past the lateral tangent. 3: lateral to the lateral tangent (3A superior / 3B inferior). 4: total ICA encasement. Grades 3-4 predict true invasion and lower surgical remission - the classically taught pattern, not an order. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4',
  '3A': '3', '3B': '3',
};

// input:
//   grade: '0'..'4' (also accepts the 3A/3B subgrades -> 3)
export function knospAdenoma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Knosp grade (0 to 4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    cavernousInvasion: g.invasion,
    abnormal: g.invasion,
    bandLabel: `Knosp grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

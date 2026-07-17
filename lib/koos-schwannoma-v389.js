// spec-v389: Koos grading of a vestibular schwannoma (grades I-IV), by extrameatal extension and
// brainstem involvement — the standard classification used to stratify these tumors (e.g. for
// radiosurgery vs microsurgery planning). It sits beside the other neuro-oncology / neurosurgery grading
// tiles in the catalog. "koos" / "vestibular schwannoma grade" / "acoustic neuroma grade" routed to
// nothing.
//
// HIGH-STAKES: this reports the Koos GRADE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// rising-size / brainstem-involvement association (I -> IV) is the classically taught pattern, not an
// order; the management decision stays with the neurosurgical / neuro-otology team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Koos WT, Day JD, Matula C, Levy DI. Neurotopographic considerations in the microsurgical treatment
//     of small acoustic neurinomas. J Neurosurg. 1998;88(3):506-512 (the I-IV grading).
//   - Neurosurgery / radiology reliability studies reproducing the same intracanalicular (I) /
//     extrameatal-no-brainstem-contact (II) / brainstem-contact-no-displacement (III) /
//     brainstem-compression (IV) grading.
//
// Grades (extrameatal extension + brainstem involvement):
//   I   : intracanalicular — limited to the internal auditory canal, no extrameatal extension.
//   II  : extends into the cerebellopontine angle (intra- and extra-meatal) but does not contact the
//         brainstem.
//   III : occupies the cerebellopontine cistern and contacts the brainstem but does not displace it.
//         Flagged (brainstem contact).
//   IV  : large tumor that compresses the brainstem and displaces the fourth ventricle. Flagged
//         (brainstem compression).

const GRADES = {
  I: { grade: 'I', brainstem: false, text: 'Koos grade I - intracanalicular; limited to the internal auditory canal, with no extrameatal extension.' },
  II: { grade: 'II', brainstem: false, text: 'Koos grade II - extends into the cerebellopontine angle (intra- and extra-meatal) but does not contact the brainstem.' },
  III: { grade: 'III', brainstem: true, text: 'Koos grade III - occupies the cerebellopontine cistern and contacts the brainstem but does not displace it.' },
  IV: { grade: 'IV', brainstem: true, text: 'Koos grade IV - a large tumor that compresses the brainstem and displaces the fourth ventricle.' },
};

const NOTE = 'The Koos classification grades a vestibular schwannoma by extrameatal extension and brainstem involvement. I: intracanalicular (within the internal auditory canal). II: extends into the cerebellopontine angle, no brainstem contact. III: contacts the brainstem without displacing it. IV: compresses the brainstem and displaces the fourth ventricle. Size and brainstem involvement rise I to IV, which is the classically taught pattern, not an order. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
  '2A': 'II', '2B': 'II', IIA: 'II', IIB: 'II',
};

// input:
//   grade: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4, and the 2a/2b subgrades -> II)
export function koosSchwannoma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Koos grade (I, II, III, or IV; equivalently 1-4).' };
  }
  return {
    valid: true,
    grade: g.grade,
    brainstemInvolvement: g.brainstem,
    abnormal: g.brainstem,
    bandLabel: `Koos grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}

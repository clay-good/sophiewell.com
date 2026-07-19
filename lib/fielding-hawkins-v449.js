// spec-v449: the Fielding-Hawkins classification of atlantoaxial rotatory subluxation / fixation, by the
// direction and degree of atlas displacement on the axis — types I / II / III / IV. It joins the
// craniocervical tiles (Traynelis, Anderson-Montesano). "fielding hawkins" / "atlantoaxial rotatory
// subluxation type" routed to nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the clinician / radiologist has determined, NOT a diagnosis, a
// stability determination, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3).
// The management decision stays with the spine / neurosurgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Fielding JW, Hawkins RJ. Atlanto-axial rotatory fixation. (Fixed rotatory subluxation of the
//     atlanto-axial joint). J Bone Joint Surg Am. 1977;59(1):37-44.
//   - Spine / neuroradiology references reproducing the same no-displacement (I) / 3-5 mm (II) / > 5 mm (III)
//     / posterior (IV) grouping.
//
// Types (atlantoaxial relationship):
//   I   : rotatory fixation without anterior displacement of the atlas (atlanto-dental interval <= 3 mm); the
//         odontoid is the pivot, transverse ligament intact. Most common.
//   II  : rotatory fixation with anterior displacement of 3 to 5 mm; one lateral mass is the pivot, with
//         deficiency of the transverse ligament.
//   III : rotatory fixation with anterior displacement greater than 5 mm; deficiency of both the transverse
//         and the alar ligaments.
//   IV  : rotatory fixation with posterior displacement of the atlas; associated with a deficient or absent
//         odontoid.

const TYPES = {
  I: { type: 'I', text: 'Fielding-Hawkins type I - rotatory fixation without anterior displacement of the atlas (atlanto-dental interval <= 3 mm); the odontoid is the pivot, transverse ligament intact.' },
  II: { type: 'II', text: 'Fielding-Hawkins type II - rotatory fixation with anterior displacement of 3 to 5 mm; one lateral mass is the pivot, with deficiency of the transverse ligament.' },
  III: { type: 'III', text: 'Fielding-Hawkins type III - rotatory fixation with anterior displacement greater than 5 mm; deficiency of both the transverse and the alar ligaments.' },
  IV: { type: 'IV', text: 'Fielding-Hawkins type IV - rotatory fixation with posterior displacement of the atlas; associated with a deficient or absent odontoid.' },
};

const NOTE = 'The Fielding-Hawkins classification (Fielding & Hawkins 1977) groups atlantoaxial rotatory subluxation/fixation by atlas displacement. I: no anterior displacement (ADI <= 3 mm). II: anterior 3-5 mm (transverse ligament deficient). III: anterior > 5 mm (transverse and alar ligaments deficient). IV: posterior displacement. This reports the type the clinician has determined, not a diagnosis, a stability determination, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function fieldingHawkins(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Fielding-Hawkins type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Fielding-Hawkins type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

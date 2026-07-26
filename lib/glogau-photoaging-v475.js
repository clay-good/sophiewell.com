// spec-v475: the Glogau classification of photoaging, by the severity of wrinkles, keratoses, and dyschromia —
// types I / II / III / IV. It is the standard cosmetic-dermatology grade of sun-related skin aging and
// companions the Fitzpatrick skin phototype tile. "glogau" / "photoaging type" routed to nothing.
//
// HIGH-STAKES: this reports the photoaging TYPE the clinician has determined on examination, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the dermatology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Glogau RG. Aesthetic and anatomic analysis of the aging skin. Semin Cutan Med Surg. 1996;15(3):134-138.
//   - Dermatology references reproducing the same no-wrinkles (I) / wrinkles-in-motion (II) /
//     wrinkles-at-rest (III) / only-wrinkles (IV) grouping.
//
// Types (severity of photoaging):
//   I   : "no wrinkles" - early photoaging; mild pigment changes, no keratoses, minimal wrinkles (typically age
//         20s-30s).
//   II  : "wrinkles in motion" - early to moderate photoaging; early actinic keratoses, early lentigines,
//         wrinkles with movement (dynamic; typically age 30s-40s).
//   III : "wrinkles at rest" - advanced photoaging; obvious dyschromia, telangiectasias, visible keratoses,
//         wrinkles present even at rest (static; typically age 50s and older).
//   IV  : "only wrinkles" - severe photoaging; yellow-gray skin, prior skin malignancies, wrinkles throughout
//         with no normal skin (typically age 60s-70s).

const TYPES = {
  I: { type: 'I', text: 'Glogau type I - "no wrinkles": early photoaging; mild pigment changes, no keratoses, minimal wrinkles (typically age 20s-30s).' },
  II: { type: 'II', text: 'Glogau type II - "wrinkles in motion": early to moderate photoaging; early actinic keratoses and lentigines, wrinkles with movement (dynamic; typically age 30s-40s).' },
  III: { type: 'III', text: 'Glogau type III - "wrinkles at rest": advanced photoaging; obvious dyschromia, telangiectasias, visible keratoses, wrinkles present even at rest (static; typically age 50s and older).' },
  IV: { type: 'IV', text: 'Glogau type IV - "only wrinkles": severe photoaging; yellow-gray skin, prior skin malignancies, wrinkles throughout with no normal skin (typically age 60s-70s).' },
};

const NOTE = 'The Glogau classification (Glogau 1996) grades photoaging by wrinkles, keratoses, and dyschromia. I: no wrinkles (mild pigment changes, minimal wrinkles). II: wrinkles in motion (early keratoses, dynamic wrinkles). III: wrinkles at rest (dyschromia, telangiectasias, static wrinkles). IV: only wrinkles (yellow-gray skin, prior malignancies, wrinkles throughout). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function glogauPhotoaging(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Glogau type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Glogau type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

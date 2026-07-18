// spec-v416: Russe classification of scaphoid (carpal navicular) fractures, by the orientation of the
// fracture line relative to the long axis of the scaphoid — horizontal oblique / transverse / vertical
// oblique. The orientation determines whether compressive or shear forces predominate across the fracture
// (its intrinsic stability). It joins the wrist/carpal cluster (Mayfield perilunar staging, Geissler
// arthroscopic grading). "russe" / "scaphoid fracture classification" routed to nothing.
//
// HIGH-STAKES: this reports the fracture ORIENTATION the clinician has determined from imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// cast-vs-fixation decision stays with the hand / orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Russe O. Fracture of the carpal navicular: diagnosis, non-operative treatment, and operative
//     treatment. J Bone Joint Surg Am. 1960;42-A:759-768 (the horizontal-oblique / transverse /
//     vertical-oblique classification by fracture-line orientation).
//   - Hand-surgery / radiology references reproducing the same orientation-and-stability grouping.
//
// Types (fracture-line orientation relative to the scaphoid long axis / predominant force):
//   horizontal oblique : the line runs obliquely in the horizontal plane; compressive forces predominate,
//                        the most stable Russe pattern.
//   transverse         : the line runs transversely across the scaphoid; both compressive and shear forces
//                        act, intermediate stability.
//   vertical oblique   : the line runs obliquely in the vertical plane; shear forces predominate, the least
//                        stable Russe pattern.

const TYPES = {
  HO: { type: 'horizontal oblique', text: 'Russe horizontal oblique - the fracture line runs obliquely in the horizontal plane; compressive forces predominate across it, the most stable Russe pattern.' },
  T: { type: 'transverse', text: 'Russe transverse - the fracture line runs transversely across the scaphoid; both compressive and shear forces act across it, intermediate stability.' },
  VO: { type: 'vertical oblique', text: 'Russe vertical oblique - the fracture line runs obliquely in the vertical plane; shear forces predominate across it, the least stable Russe pattern.' },
};

const NOTE = 'The Russe classification (Russe 1960) groups a scaphoid fracture by the orientation of the fracture line relative to the scaphoid long axis, which sets whether compressive or shear forces predominate across it. Horizontal oblique: compressive forces predominate (most stable). Transverse: both compressive and shear (intermediate). Vertical oblique: shear predominates (least stable). The stability is intrinsic to the pattern, a classically taught association, not a prognosis for an individual patient. This reports the orientation the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  HO: 'HO', T: 'T', VO: 'VO',
  'HORIZONTAL OBLIQUE': 'HO', 'HORIZONTAL': 'HO', 'OBLIQUE HORIZONTAL': 'HO',
  TRANSVERSE: 'T',
  'VERTICAL OBLIQUE': 'VO', 'VERTICAL': 'VO', 'OBLIQUE VERTICAL': 'VO',
  1: 'HO', 2: 'T', 3: 'VO',
};

// input:
//   type: 'horizontal oblique' / 'transverse' / 'vertical oblique' (case-insensitive; also accepts HO / T /
//   VO and 1-3, where 1 = horizontal oblique, 2 = transverse, 3 = vertical oblique).
export function russeScaphoid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Russe type (horizontal oblique, transverse, or vertical oblique).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Russe ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

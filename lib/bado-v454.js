// spec-v454: the Bado classification of Monteggia fractures (the Monteggia lesion), by the direction of
// radial-head dislocation and the level of the ulnar fracture — types I / II / III / IV. It is the standard
// grading of Monteggia forearm fracture-dislocations and joins the elbow/forearm fracture tiles.
// "bado" / "monteggia" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Bado JL. The Monteggia lesion. Clin Orthop Relat Res. 1967;50:71-86.
//   - Orthopedic / radiology references reproducing the same anterior-dislocation (I) / posterior-dislocation
//     (II) / lateral-dislocation (III) / both-bone (IV) grouping.
//
// Types (radial-head dislocation direction + ulnar fracture):
//   I   : anterior dislocation of the radial head with an anteriorly angulated ulnar diaphyseal fracture
//         (the most common, roughly 60%).
//   II  : posterior or posterolateral dislocation of the radial head with a posteriorly angulated ulnar
//         diaphyseal fracture.
//   III : lateral or anterolateral dislocation of the radial head with an ulnar metaphyseal fracture
//         (usually in children).
//   IV  : anterior dislocation of the radial head with fractures of the proximal thirds of both the radius
//         and the ulna at the same level.

const TYPES = {
  I: { type: 'I', text: 'Bado type I - anterior dislocation of the radial head with an anteriorly angulated ulnar diaphyseal fracture (the most common, roughly 60%).' },
  II: { type: 'II', text: 'Bado type II - posterior or posterolateral dislocation of the radial head with a posteriorly angulated ulnar diaphyseal fracture.' },
  III: { type: 'III', text: 'Bado type III - lateral or anterolateral dislocation of the radial head with an ulnar metaphyseal fracture (usually in children).' },
  IV: { type: 'IV', text: 'Bado type IV - anterior dislocation of the radial head with fractures of the proximal thirds of both the radius and the ulna at the same level.' },
};

const NOTE = 'The Bado classification (Bado 1967) grades Monteggia fractures by the direction of radial-head dislocation and the ulnar fracture. I: anterior dislocation, anterior ulnar angulation (most common). II: posterior dislocation, posterior ulnar angulation. III: lateral dislocation with an ulnar metaphyseal fracture. IV: anterior dislocation with both-bone proximal-third fractures. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I'..'IV' (case-insensitive; also accepts 1-4).
export function bado(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Bado type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Bado type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

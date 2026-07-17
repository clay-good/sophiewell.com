// spec-v404: Regan-Morrey classification of coronoid process fractures of the ulna, by the height of the
// coronoid fragment — types I / II / III. It complements the Mason radial-head classification already in
// the catalog (both are components of the "terrible triad" elbow injury). "regan morrey" / "coronoid
// fracture" / "coronoid process fracture" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Larger fragments (type III)
// are classically less stable, but this reports the type; the management decision stays with the orthopedic
// team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Regan W, Morrey B. Fractures of the coronoid process of the ulna. J Bone Joint Surg Am.
//     1989;71(9):1348-1354 (the type I / II / III classification by coronoid height).
//   - Orthopedic references reproducing the same tip (I) / <=50% (II) / >50% (III) grouping, each
//     subdivided A (no elbow dislocation) / B (with dislocation).
//
// Types (height of the coronoid fragment):
//   I   : avulsion fracture of the tip of the coronoid process.
//   II  : fracture involving 50% or less of the coronoid height.
//   III : fracture involving more than 50% of the coronoid height.
//   (Each type is further subdivided A = without an associated elbow dislocation, B = with a dislocation.)

const TYPES = {
  I: { type: 'I', text: 'Regan-Morrey type I - avulsion fracture of the tip of the coronoid process.' },
  II: { type: 'II', text: 'Regan-Morrey type II - fracture involving 50% or less of the coronoid height.' },
  III: { type: 'III', text: 'Regan-Morrey type III - fracture involving more than 50% of the coronoid height.' },
};

const NOTE = 'The Regan-Morrey classification (Regan-Morrey 1989) groups a coronoid process fracture of the ulna by the height of the fragment. I: avulsion of the coronoid tip. II: 50% or less of the coronoid height. III: more than 50% of the coronoid height. Each type is subdivided A (no associated elbow dislocation) or B (with a dislocation). Larger fragments are classically less stable, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis. Companion: the Mason radial-head classification (both are terrible-triad components).';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
  IA: 'I', IB: 'I', IIA: 'II', IIB: 'II', IIIA: 'III', IIIB: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3 and the A/B subtypes -> the base type).
export function reganMorrey(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Regan-Morrey type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Regan-Morrey type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

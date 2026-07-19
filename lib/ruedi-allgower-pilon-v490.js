// spec-v490: the Ruedi-Allgower classification of tibial pilon (plafond) fractures, by the displacement and
// comminution of the distal tibial articular surface - types I / II / III. It is the classic pilon-fracture
// classification and joins the ankle fracture tiles (Lauge-Hansen, Weber). "ruedi allgower" / "pilon fracture
// type" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 section 5.3). The management decision stays with
// the orthopedic-trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ruedi TP, Allgower M. The operative treatment of intra-articular fractures of the lower end of the tibia.
//     Clin Orthop Relat Res. 1979;(138):105-110.
//   - Orthopedic-trauma references reproducing the same nondisplaced-cleavage (I) / displaced-minimal-
//     comminution (II) / comminuted-impacted (III) grouping.
//
// Types (articular displacement and comminution):
//   I   : a cleavage (split) fracture of the distal tibial articular surface without significant displacement.
//   II  : significant displacement of the articular surface, but with minimal comminution or impaction.
//   III : comminution and impaction of the distal tibial articular surface (the most severe).

const TYPES = {
  I: { type: 'I', text: 'Ruedi-Allgower type I - a cleavage (split) fracture of the distal tibial articular surface without significant displacement.' },
  II: { type: 'II', text: 'Ruedi-Allgower type II - significant displacement of the articular surface, but with minimal comminution or impaction.' },
  III: { type: 'III', text: 'Ruedi-Allgower type III - comminution and impaction of the distal tibial articular surface (the most severe).' },
};

const NOTE = 'The Ruedi-Allgower classification (Ruedi and Allgower 1979) grades tibial pilon (plafond) fractures by articular displacement and comminution. I: nondisplaced cleavage fracture. II: significant displacement with minimal comminution. III: comminution and impaction of the articular surface. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function ruediAllgowerPilon(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Ruedi-Allgower type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Ruedi-Allgower type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

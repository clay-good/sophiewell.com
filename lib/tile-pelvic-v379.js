// spec-v379: Tile (AO/Tile) classification of a pelvic ring injury (types A/B/C), by the mechanical
// stability of the posterior pelvic ring — the standard classification that stratifies pelvic-ring
// instability (and, with it, mortality). It sits beside the other fracture-eponym / trauma tiles in the
// catalog. "tile classification" / "pelvic ring fracture stability" routed to nothing.
//
// HIGH-STAKES: this reports the Tile TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// rising-instability association (A -> C) is the classically taught pattern, not an order; the management
// decision stays with the orthopedic / trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Tile M. Acute pelvic fractures: I. Causation and classification. J Am Acad Orthop Surg.
//     1996;4(3):143-151 (the A/B/C stability grouping; adopted by the AO/OTA comprehensive
//     classification).
//   - Orthopedic / trauma references reproducing the same posterior-ring stability grouping (type A
//     stable, B rotationally unstable / vertically stable, C rotationally and vertically unstable), with
//     mortality rising A -> C.
//
// Types (mechanical stability of the posterior pelvic ring):
//   A : stable; the posterior ring is intact (e.g. avulsion, iliac-wing, or transverse sacrococcygeal
//       fracture).
//   B : rotationally unstable but vertically stable; the posterior ring is INCOMPLETELY disrupted (e.g.
//       open-book / anteroposterior-compression, or lateral-compression). Flagged (unstable).
//   C : rotationally AND vertically unstable; the posterior ring is COMPLETELY disrupted. Flagged.

const TYPES = {
  A: { type: 'A', unstable: false, text: 'Tile type A - a stable pelvic ring injury; the posterior ring is intact (e.g. an avulsion, iliac-wing, or transverse sacrococcygeal fracture).' },
  B: { type: 'B', unstable: true, text: 'Tile type B - rotationally unstable but vertically stable; the posterior ring is incompletely disrupted (e.g. open-book / anteroposterior-compression, or lateral-compression).' },
  C: { type: 'C', unstable: true, text: 'Tile type C - rotationally and vertically unstable; the posterior ring is completely disrupted.' },
};

const NOTE = 'The Tile (AO/Tile) classification groups a pelvic ring injury by the mechanical stability of the posterior ring. A: stable, posterior ring intact. B: rotationally unstable, vertically stable (incomplete posterior disruption; open-book or lateral-compression). C: rotationally and vertically unstable (complete posterior disruption). Instability, and reported mortality, rise A to C, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C',
  1: 'A', 2: 'B', 3: 'C',
};

// input:
//   type: 'A' / 'B' / 'C' (case-insensitive; also accepts 1-3)
export function tilePelvic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Tile type (A, B, or C; equivalently 1-3).' };
  }
  return {
    valid: true,
    type: t.type,
    unstable: t.unstable,
    abnormal: t.unstable,
    bandLabel: `Tile type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

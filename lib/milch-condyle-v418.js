// spec-v418: Milch classification of lateral humeral condyle fractures (a common pediatric elbow injury),
// by whether the fracture line reaches the trochlear groove and involves the lateral trochlear ridge —
// types I and II. The ridge's involvement determines whether the elbow stays stable. It joins the elbow
// cluster (Mason radial head, Regan-Morrey coronoid). "milch" / "lateral condyle fracture" routed to
// nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The reduction / fixation
// decision stays with the orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Milch H. Fractures and fracture dislocations of the humeral condyles. J Trauma. 1964;4:592-607 (the
//     type I / type II classification by involvement of the lateral trochlear ridge).
//   - Pediatric-orthopedic / radiology references reproducing the same lateral-to-the-groove (I, stable) vs
//     into-the-groove (II, unstable) grouping.
//
// Types (does the line reach the trochlear groove / is the lateral trochlear ridge involved):
//   I  : the fracture line runs lateral to the trochlear groove and does not reach it; the lateral
//        trochlear ridge is intact, so the elbow stays stable.
//   II : the fracture line extends medially into the trochlear groove; the lateral trochlear ridge is
//        involved, so the elbow becomes unstable and the forearm can translate / dislocate laterally.

const TYPES = {
  I: { type: 'I', text: 'Milch type I - the fracture line runs lateral to the trochlear groove and does not reach it; the lateral trochlear ridge is intact, so the elbow stays stable.' },
  II: { type: 'II', text: 'Milch type II - the fracture line extends medially into the trochlear groove; the lateral trochlear ridge is involved, so the elbow becomes unstable and the forearm can translate / dislocate laterally.' },
};

const NOTE = 'The Milch classification (Milch 1964) groups a lateral humeral condyle fracture by whether the fracture line reaches the trochlear groove and involves the lateral trochlear ridge. I: lateral to the groove, ridge intact - the elbow stays stable. II: into the groove, ridge involved - the elbow becomes unstable and the forearm can translate laterally. The stability is intrinsic to the pattern, a classically taught association. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II',
  1: 'I', 2: 'II',
};

// input:
//   type: 'I' / 'II' (case-insensitive; also accepts 1 / 2).
export function milchCondyle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Milch type (I or II).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Milch type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

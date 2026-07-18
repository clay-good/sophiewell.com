// spec-v412: Myerson classification (a modification of the Hardcastle / Quenu-Kuss classification) of a
// Lisfranc (tarsometatarsal, TMT) injury, by the pattern and direction of the tarsometatarsal
// incongruity — types A / B1 / B2 / C1 / C2. It joins the foot-injury cluster (Lauge-Hansen ankle,
// Sanders calcaneal, Hawkins talar, Meyers-McKeever tibial-eminence). "lisfranc" / "myerson" /
// "tarsometatarsal injury" routed to nothing.
//
// HIGH-STAKES: this reports the injury TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The operative-vs-nonoperative
// decision stays with the foot-and-ankle team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Myerson MS, Fisher RT, Burgess AR, Kenzora JE. Fracture dislocations of the tarsometatarsal joints:
//     end results correlated with pathology and treatment. Foot Ankle. 1986;6(5):225-242 (the Myerson
//     modification of Hardcastle's classification of Quenu and Kuss).
//   - StatPearls (Lisfranc dislocation) and orthopedic/radiology references reproducing the same total (A) /
//     partial-medial (B1) / partial-lateral (B2) / divergent-partial (C1) / divergent-total (C2) grouping.
//
// Types (pattern and direction of the tarsometatarsal incongruity):
//   A  : total incongruity - all five metatarsals displaced in the same direction (homolateral), usually
//        lateral or dorsoplantar.
//   B1 : partial incongruity, medial - medial displacement of the first metatarsal (the medial column),
//        often with intercuneiform diastasis; the lateral joints stay congruous.
//   B2 : partial incongruity, lateral - lateral displacement of one or more of the lateral four metatarsals;
//        the first tarsometatarsal joint stays congruous.
//   C1 : divergent, partial - a divergent pattern (medial and lateral displacement) involving only some of
//        the metatarsals.
//   C2 : divergent, total - a divergent pattern involving all five metatarsals.

const TYPES = {
  A: { type: 'A', text: 'Myerson type A - total incongruity: all five metatarsals displaced in the same direction (homolateral), usually lateral or dorsoplantar.' },
  B1: { type: 'B1', text: 'Myerson type B1 - partial incongruity, medial: medial displacement of the first metatarsal (medial column), often with intercuneiform diastasis; the lateral joints stay congruous.' },
  B2: { type: 'B2', text: 'Myerson type B2 - partial incongruity, lateral: lateral displacement of one or more of the lateral four metatarsals; the first tarsometatarsal joint stays congruous.' },
  C1: { type: 'C1', text: 'Myerson type C1 - divergent, partial: a divergent pattern (medial and lateral displacement) involving only some of the metatarsals.' },
  C2: { type: 'C2', text: 'Myerson type C2 - divergent, total: a divergent pattern involving all five metatarsals.' },
};

const NOTE = 'The Myerson classification (Myerson 1986, a modification of the Hardcastle / Quenu-Kuss classification) groups a Lisfranc (tarsometatarsal) injury by the pattern and direction of the tarsometatarsal incongruity. A: total incongruity, all five metatarsals displaced the same direction. B1: partial, medial displacement of the first metatarsal. B2: partial, lateral displacement of one or more of the lateral four metatarsals. C1: divergent, partial. C2: divergent, total (all five metatarsals). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
  1: 'A',
  B: 'B1', C: 'C1',
};

// input:
//   type: 'A' / 'B1' / 'B2' / 'C1' / 'C2' (case-insensitive). Bare 'B' resolves to B1 and bare 'C' to C1
//   (the partial patterns); the lateral / total variants must be given as B2 / C2.
export function lisfrancMyerson(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Myerson type (A, B1, B2, C1, or C2).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Myerson type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

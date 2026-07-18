// spec-v411: Levine-Edwards classification of traumatic spondylolisthesis of the axis (the "hangman's
// fracture" - a bilateral C2 pars/pedicle fracture), by displacement and angulation — types I / II / IIa /
// III. It is the companion to the Anderson-D'Alonzo odontoid classification (both are C2 fractures).
// "levine edwards" / "hangman's fracture" / "traumatic spondylolisthesis of the axis" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Type IIa is the classic
// "do-not-apply-traction" pattern, but this reports the type; the management decision stays with the spine
// team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Levine AM, Edwards CC. The management of traumatic spondylolisthesis of the axis. J Bone Joint Surg
//     Am. 1985;67(2):217-226 (the type I / II / IIa / III classification, refining Effendi).
//   - Spine / radiology references reproducing the same minimal (I) / translation+angulation (II) /
//     flexion-angulation-without-translation (IIa) / with-facet-dislocation (III) grouping.
//
// Types (displacement and angulation of the C2-on-C3 spondylolisthesis):
//   I   : a fracture through the pars with less than 3 mm of translation and no significant angulation.
//         Stable.
//   II  : more than 3 mm of translation with significant angulation (disc / posterior-longitudinal-ligament
//         disruption). Unstable.
//   IIa : minimal translation but severe angulation (a flexion-distraction pattern) - axial traction is
//         contraindicated (it worsens the angulation).
//   III : a type I fracture line plus bilateral C2-C3 facet dislocation. The most severe; usually needs
//         open reduction.

const TYPES = {
  I: { type: 'I', text: 'Levine-Edwards type I - a fracture through the pars with less than 3 mm of translation and no significant angulation. Stable.' },
  II: { type: 'II', text: 'Levine-Edwards type II - more than 3 mm of translation with significant angulation (disc / posterior-longitudinal-ligament disruption). Unstable.' },
  IIA: { type: 'IIa', text: 'Levine-Edwards type IIa - minimal translation but severe angulation (a flexion-distraction pattern); axial traction is contraindicated because it worsens the angulation.' },
  III: { type: 'III', text: 'Levine-Edwards type III - a type I fracture line plus bilateral C2-C3 facet dislocation. The most severe; usually needs open reduction.' },
};

const NOTE = 'The Levine-Edwards classification (Levine-Edwards 1985) groups a traumatic spondylolisthesis of the axis (hangman\'s fracture) by translation and angulation. I: <3 mm translation, no angulation (stable). II: >3 mm translation with angulation (unstable). IIa: minimal translation but severe angulation (flexion-distraction) - traction is contraindicated. III: a type I fracture plus bilateral C2-C3 facet dislocation (most severe). The stability / traction teaching points are classically taught associations, not orders; the management decision stays with the spine team. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', IIA: 'IIA', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
  '2A': 'IIA',
};

// input:
//   type: 'I' / 'II' / 'IIa' / 'III' (case-insensitive; also accepts 1-3 and 2a). Bare 'II' resolves to
//   type II (the translation+angulation pattern); the flexion pattern must be given as IIa.
export function levineEdwards(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Levine-Edwards type (I, II, IIa, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Levine-Edwards type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

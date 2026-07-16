// spec-v343: Sanders classification of an intra-articular calcaneal fracture (types I-IV) — the
// CT-based grade of posterior-facet fragmentation of a fracture of the heel bone. Sanders grades the
// fracture on the coronal CT image at the widest undersurface of the posterior facet of the talus,
// counting the fragments of the posterior facet. The catalog carries the talar-neck (Hawkins), ankle
// (Danis-Weber), tibial-plateau (Schatzker), femoral-neck (Garden), physeal (Salter-Harris),
// proximal-humerus (Neer), and radial-head (Mason) fracture classifications but had no calcaneal
// classification (the foot-trauma companion to Hawkins). "sanders classification" / "calcaneal
// fracture type" routed to nothing.
//
// HIGH-STAKES: this reports the Sanders TYPE the clinician has determined from the CT, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// prognostic / operative implications each type carries are the classically taught association, not
// an order; the management decision stays with the surgeon and depends on displacement, joint
// congruity, soft tissues, and associated injuries.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sanders R, Fortin P, DiPasquale T, Walling A. Operative treatment in 120 displaced
//     intraarticular calcaneal fractures. Results using a prognostic computed tomography scan
//     classification. Clin Orthop Relat Res. 1993;(290):87-95 (the four CT types + A/B/C fracture
//     lines).
//   - Foot-and-ankle trauma references (OrthoConsult / Radiopaedia / UW emergency radiology)
//     reproducing the same type-I-IV coronal-CT definitions.
//
// Types (posterior-facet fragmentation on coronal CT):
//   I  : nondisplaced (< 2 mm), regardless of the number of fracture lines.
//   II : two-part (one fracture line) fracture of the posterior facet (subtypes IIA/IIB/IIC by
//        fracture-line position).
//   III: three-part (two fracture lines) fracture, with a centrally depressed middle fragment
//        (subtypes IIIAB/IIIAC/IIIBC).
//   IV : four or more parts (three or more fracture lines); highly comminuted.

const TYPES = {
  I: { type: 'I', severe: false, text: 'Sanders type I — nondisplaced (< 2 mm) intra-articular calcaneal fracture, regardless of the number of fracture lines.' },
  II: { type: 'II', severe: false, text: 'Sanders type II — two-part fracture of the posterior facet (one fracture line; subtypes IIA/IIB/IIC by fracture-line position).' },
  III: { type: 'III', severe: true, text: 'Sanders type III — three-part fracture (two fracture lines) with a centrally depressed middle fragment (subtypes IIIAB/IIIAC/IIIBC). A more comminuted pattern.' },
  IV: { type: 'IV', severe: true, text: 'Sanders type IV — four or more parts (three or more fracture lines); highly comminuted. The most severe pattern.' },
};

const NOTE = 'The Sanders classification (Sanders 1993) grades an intra-articular calcaneal fracture by the fragmentation of the posterior facet on the coronal CT image at the widest undersurface of the posterior facet of the talus (fracture lines labeled A/B/C). I: nondisplaced (< 2 mm). II: two-part (one fracture line). III: three-part (two fracture lines) with a depressed middle fragment. IV: four or more parts (highly comminuted). Higher types are more comminuted and classically carry a worse prognosis. The prognostic and operative implications are the classically taught association, not an order; the management decision stays with the surgeon. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   type: 'I' .. 'IV' (case-insensitive; also accepts 1-4)
export function sandersCalcaneal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Sanders type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    severe: t.severe,
    abnormal: t.severe,
    bandLabel: `Sanders type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

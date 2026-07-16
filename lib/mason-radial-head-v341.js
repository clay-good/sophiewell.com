// spec-v341: Mason-Johnston classification of a radial head fracture (types I-IV) — the anatomic
// pattern of a fracture of the head of the radius, graded by displacement, comminution, and the
// presence of an associated elbow dislocation. The catalog carries the Garden (femoral neck),
// Danis-Weber (ankle), Schatzker (tibial plateau), Salter-Harris (physis), and Neer (proximal
// humerus) fracture classifications but had no elbow / radial-head classification. "mason
// classification" / "radial head fracture type" routed to nothing.
//
// HIGH-STAKES: this reports the Mason TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// management shorthand each type carries (early motion vs. fixation vs. replacement) is the
// classically taught association, not an order; the operative decision stays with the surgeon and
// depends on displacement, mechanical block, elbow stability, and associated injuries.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Mason ML. Some observations on fractures of the head of the radius with a review of one
//     hundred cases. Br J Surg. 1954;42(172):123-132 (the original three types).
//   - Johnston GW. A follow-up of one hundred cases of fracture of the head of the radius with a
//     review of the literature. Ulster Med J. 1962;31:51-56 (adds type IV — with dislocation).
//   - Elbow-trauma references (OrthoConsult / review articles) reproducing the same type-I-IV
//     definitions and the modified (Hotchkiss) displacement / mechanical-block refinement.
//
// Types (fracture pattern):
//   I  : nondisplaced or minimally displaced (classically < 2 mm), no mechanical block to forearm
//        rotation. Typically early range of motion.
//   II : displaced (> 2 mm) partial-articular (marginal) fracture; may create a mechanical block.
//        Often amenable to open reduction and internal fixation.
//   III: comminuted fracture of the entire radial head; usually not reconstructable — excision or
//        radial-head replacement. Flagged.
//   IV : radial head fracture with an associated elbow (ulnohumeral) dislocation (Johnston). The
//        combined injury; assess ligamentous / elbow stability. Flagged.

const TYPES = {
  I: { type: 'I', severe: false, text: 'Mason type I — nondisplaced or minimally displaced (classically < 2 mm) radial head fracture, with no mechanical block to forearm rotation. Classically managed with early range of motion.' },
  II: { type: 'II', severe: false, text: 'Mason type II — displaced (> 2 mm) partial-articular (marginal) fracture of the radial head, which may create a mechanical block. Classically amenable to open reduction and internal fixation.' },
  III: { type: 'III', severe: true, text: 'Mason type III — comminuted fracture of the entire radial head, usually not reconstructable; classically managed by excision or radial-head replacement. A more severe pattern.' },
  IV: { type: 'IV', severe: true, text: 'Mason type IV (Johnston) — radial head fracture with an associated elbow (ulnohumeral) dislocation. The combined injury; ligamentous and elbow stability must be assessed. A more severe pattern.' },
};

const NOTE = 'The Mason classification (Mason 1954; type IV added by Johnston 1962) describes the fracture pattern of a fracture of the head of the radius. I: nondisplaced / minimally displaced, no mechanical block. II: displaced (> 2 mm) partial-articular fracture, may block motion. III: comminuted whole-head fracture, usually not reconstructable. IV: any radial head fracture with an associated elbow dislocation. The management shorthand each type carries (early motion / fixation / excision or replacement) is the classically taught association, not an order; the operative decision stays with the surgeon and depends on displacement, mechanical block, elbow stability, and associated injuries. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   type: 'I' .. 'IV' (case-insensitive; also accepts 1-4)
export function masonRadialHead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Mason type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    severe: t.severe,
    abnormal: t.severe,
    bandLabel: `Mason type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

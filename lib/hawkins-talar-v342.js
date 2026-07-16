// spec-v342: Hawkins classification of a talar neck fracture (types I-IV) — the fracture pattern of a
// fracture of the neck of the talus, graded by displacement and the joints dislocated, which
// correlates with the risk of avascular necrosis (AVN) of the talar body. The catalog carries the
// Garden (femoral neck), Danis-Weber (ankle), Schatzker (tibial plateau), Salter-Harris (physis),
// Neer (proximal humerus), and Mason (radial head) fracture classifications but had no talar-neck
// classification. "hawkins classification" / "talar neck fracture type" routed to nothing.
//
// HIGH-STAKES: this reports the Hawkins TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The AVN
// risk each type carries is the classically reported range across case series, not a per-patient
// prediction; the operative decision (urgent anatomic reduction and fixation for displaced patterns)
// stays with the surgeon.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Hawkins LG. Fractures of the neck of the talus. J Bone Joint Surg Am. 1970;52(5):991-1002 (the
//     original three types).
//   - Canale ST, Kelly FB Jr. Fractures of the neck of the talus. Long-term evaluation of
//     seventy-one cases. J Bone Joint Surg Am. 1978;60(2):143-156 (adds type IV).
//   - Foot-and-ankle trauma references (LITFL / Wheeless / review articles) reproducing the same
//     type-I-IV definitions and the AVN-risk gradient.
//
// Types (fracture pattern; joints involved):
//   I  : nondisplaced talar neck fracture, no subluxation or dislocation. AVN risk ~0-15%.
//   II : displaced talar neck fracture with subtalar joint subluxation or dislocation. AVN ~20-50%.
//   III: displaced talar neck fracture with dislocation of the talar body from both the subtalar and
//        the ankle (tibiotalar) joints. AVN ~70-100%. Flagged.
//   IV : type III plus subluxation or dislocation of the talonavicular joint (head fragment)
//        (Canale-Kelly). The highest AVN risk. Flagged.

const TYPES = {
  I: { type: 'I', severe: false, avn: '~0-15%', text: 'Hawkins type I — nondisplaced talar neck fracture, without subluxation or dislocation. Classically the lowest avascular-necrosis risk (~0-15%).' },
  II: { type: 'II', severe: false, avn: '~20-50%', text: 'Hawkins type II — displaced talar neck fracture with subluxation or dislocation of the subtalar joint. Avascular-necrosis risk classically ~20-50%.' },
  III: { type: 'III', severe: true, avn: '~70-100%', text: 'Hawkins type III — displaced talar neck fracture with dislocation of the talar body from both the subtalar and the ankle (tibiotalar) joints. High avascular-necrosis risk (~70-100%). A more severe pattern.' },
  IV: { type: 'IV', severe: true, avn: '~70-100%', text: 'Hawkins type IV (Canale-Kelly) — type III plus subluxation or dislocation of the talonavicular joint (head fragment). The highest avascular-necrosis risk. A more severe pattern.' },
};

const NOTE = 'The Hawkins classification (Hawkins 1970; type IV added by Canale-Kelly 1978) describes the fracture pattern of a fracture of the neck of the talus and correlates with the risk of avascular necrosis (AVN) of the talar body. I: nondisplaced, no dislocation (AVN ~0-15%). II: displaced with subtalar dislocation (~20-50%). III: displaced with dislocation from the subtalar and ankle joints (~70-100%). IV: type III plus talonavicular dislocation (highest). The AVN-risk ranges are the classically reported case-series figures, not a per-patient prediction; displaced patterns (II-IV) classically warrant urgent anatomic reduction and fixation, but the operative decision stays with the surgeon. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', I: 'I', II: 'II', III: 'III', IV: 'IV' };

// input:
//   type: 'I' .. 'IV' (case-insensitive; also accepts 1-4)
export function hawkinsTalar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Hawkins type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    severe: t.severe,
    abnormal: t.severe,
    avnRisk: t.avn,
    bandLabel: `Hawkins type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

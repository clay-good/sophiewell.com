// spec-v455: the Nunley-Vertullo classification of midfoot (Lisfranc) sprains in athletes, by weightbearing-
// radiograph diastasis and arch height — stages I / II / III. It is the standard staging of the athletic
// Lisfranc sprain and companions the Lisfranc/Myerson fracture tile. "nunley" / "midfoot sprain" routed to
// nothing.
//
// HIGH-STAKES: this reports the STAGE the clinician has determined from the imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the orthopedic team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Nunley JA, Vertullo CJ. Classification, investigation, and management of midfoot sprains: Lisfranc
//     injuries in the athlete. Am J Sports Med. 2002;30(6):871-878.
//   - Sports-medicine / orthopedic references reproducing the same no-diastasis (I) / 1-5 mm-diastasis (II) /
//     >5 mm-diastasis-with-arch-loss (III) grouping.
//
// Stages (weightbearing radiograph):
//   I   : Lisfranc-ligament sprain without diastasis or loss of arch height (no displacement on
//         weightbearing films); a dorsal capsular tear.
//   II  : 1 to 5 mm of diastasis between the first and second metatarsal bases, without loss of arch height.
//   III : more than 5 mm of diastasis with loss of the medial longitudinal arch height (tarsometatarsal
//         instability).

const STAGES = {
  I: { stage: 'I', text: 'Nunley-Vertullo stage I - Lisfranc-ligament sprain without diastasis or loss of arch height (no displacement on weightbearing films); a dorsal capsular tear.' },
  II: { stage: 'II', text: 'Nunley-Vertullo stage II - 1 to 5 mm of diastasis between the first and second metatarsal bases, without loss of arch height.' },
  III: { stage: 'III', text: 'Nunley-Vertullo stage III - more than 5 mm of diastasis with loss of the medial longitudinal arch height (tarsometatarsal instability).' },
};

const NOTE = 'The Nunley-Vertullo classification (Nunley & Vertullo 2002) stages the athletic midfoot (Lisfranc) sprain on weightbearing radiographs. I: no diastasis or arch-height loss. II: 1 to 5 mm diastasis, no arch-height loss. III: more than 5 mm diastasis with arch-height loss. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   stage: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function nunleyVertullo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Nunley-Vertullo stage (I, II, or III).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Nunley-Vertullo stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}

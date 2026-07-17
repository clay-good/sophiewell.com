// spec-v364: Clinical Activity Score (CAS) for thyroid eye disease / Graves orbitopathy (7-item initial
// assessment). Each of seven inflammatory signs/symptoms present in the study eye scores 1 point; the
// sum (0-7) grades disease ACTIVITY, and a CAS of 3 or more indicates active disease (the threshold at
// which anti-inflammatory / immunosuppressive treatment is usually considered). The catalog carries
// other ophthalmology grades but no thyroid-eye activity score. "clinical activity score" / "cas thyroid
// eye" / "graves orbitopathy activity" routed to nothing.
//
// HIGH-STAKES: this reports the CAS the clinician has assembled from the exam, NOT a diagnosis, a
// treatment decision, or a prognosis (spec-v11 §5.3). The CAS >= 3 activity threshold is the classically
// taught cutoff for considering treatment, not an order; the management decision stays with the treating
// clinician.
//
// ITEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Mourits MP, Koornneef L, Wiersinga WM, et al. Clinical criteria for the assessment of disease
//     activity in Graves' ophthalmopathy: a novel approach. Br J Ophthalmol. 1989;73(8):639-644.
//   - EUGOGO and thyroid-eye-disease references reproducing the same seven initial-assessment items and
//     the CAS >= 3 (of 7) active threshold.
//
// The seven initial-visit items (each 1 point; a follow-up 10-item version adds change-over-time items,
// out of scope):
//   1 spontaneous orbital (retrobulbar) pain
//   2 gaze-evoked orbital pain (pain on eye movement)
//   3 eyelid swelling attributed to active TED
//   4 eyelid erythema
//   5 conjunctival redness attributed to active TED (ignore equivocal)
//   6 chemosis
//   7 inflammation of the caruncle or plica

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

const ITEMS = [
  ['pain', 'spontaneous orbital (retrobulbar) pain'],
  ['gazePain', 'gaze-evoked orbital pain'],
  ['lidSwelling', 'eyelid swelling (active TED)'],
  ['lidErythema', 'eyelid erythema'],
  ['conjRedness', 'conjunctival redness (active TED)'],
  ['chemosis', 'chemosis'],
  ['caruncle', 'inflammation of the caruncle or plica'],
];

const NOTE = 'The Clinical Activity Score (Mourits 1989; EUGOGO) grades thyroid-eye-disease (Graves orbitopathy) ACTIVITY. Each of seven inflammatory items present in the study eye scores 1 point (spontaneous orbital pain, gaze-evoked orbital pain, eyelid swelling, eyelid erythema, conjunctival redness, chemosis, caruncle/plica inflammation). CAS of 3 or more (of 7) indicates active disease, the classically taught threshold for considering anti-inflammatory / immunosuppressive treatment. The 10-item follow-up version adds change-over-time items (out of scope). This reports the score the clinician has assembled, not a diagnosis, a treatment decision, or a prognosis.';

// input: seven booleans keyed as in ITEMS (pain, gazePain, lidSwelling, lidErythema, conjRedness,
// chemosis, caruncle)
export function casTed(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const present = [];
  for (const [key, label] of ITEMS) {
    if (onFlag(o[key])) { total += 1; present.push(label); }
  }
  const active = total >= 3;
  return {
    valid: true,
    total,
    active,
    abnormal: active,
    present,
    bandLabel: `CAS ${total} of 7`,
    band: `Clinical Activity Score ${total} of 7 - ${active ? 'active thyroid eye disease (CAS >= 3)' : 'inactive by CAS (below the >= 3 activity threshold)'}.`,
    note: NOTE,
  };
}

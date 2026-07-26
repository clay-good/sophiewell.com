// spec-v447: the Anderson-Montesano classification of occipital condyle fractures, by the fracture morphology
// and mechanism — types I / II / III. It is a standard classification on craniocervical-junction CT and joins
// the spine / trauma fracture tiles. "anderson montesano" / "occipital condyle fracture type" routed to
// nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the clinician / radiologist has determined, NOT a diagnosis, a
// stability determination, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3).
// Craniocervical stability is judged with the full clinical and imaging picture; the management decision
// stays with the spine / neurosurgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Anderson PA, Montesano PX. Morphology and treatment of occipital condyle fractures. Spine (Phila Pa
//     1976). 1988;13(7):731-736.
//   - Neuroradiology / spine references reproducing the same impaction (I) / basioccipital-extension (II) /
//     alar-ligament-avulsion (III) grouping.
//
// Types (occipital condyle fracture morphology):
//   I   : impacted, comminuted occipital condyle fracture from axial loading; typically stable.
//   II  : occipital condyle fracture as part of (extending from) a basioccipital / skull-base fracture;
//         usually stable.
//   III : avulsion fracture of the occipital condyle at the alar ligament insertion; potentially unstable
//         (craniocervical instability).

const TYPES = {
  I: { type: 'I', text: 'Anderson-Montesano type I - impacted, comminuted occipital condyle fracture from axial loading; typically stable.' },
  II: { type: 'II', text: 'Anderson-Montesano type II - occipital condyle fracture extending from a basioccipital / skull-base fracture; usually stable.' },
  III: { type: 'III', text: 'Anderson-Montesano type III - avulsion fracture of the occipital condyle at the alar ligament insertion; potentially unstable (craniocervical instability).' },
};

const NOTE = 'The Anderson-Montesano classification (Anderson & Montesano 1988) groups occipital condyle fractures by morphology and mechanism. I: impacted/comminuted from axial load (typically stable). II: extending from a basioccipital/skull-base fracture (usually stable). III: alar-ligament avulsion (potentially unstable). Stability is judged with the full clinical and imaging picture. This reports the type the clinician has determined, not a diagnosis, a stability determination, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function andersonMontesano(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Anderson-Montesano type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Anderson-Montesano type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

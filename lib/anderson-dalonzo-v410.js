// spec-v410: Anderson-D'Alonzo classification of odontoid process (dens) fractures of the axis (C2), by
// the level of the fracture line — types I / II / III. A cervical-spine-trauma classification the clinician
// determines from imaging. "anderson d'alonzo" / "odontoid fracture" / "dens fracture" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Type II is classically the
// most prone to non-union, but this reports the type; the management decision stays with the spine team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Anderson LD, D'Alonzo RT. Fractures of the odontoid process of the axis. J Bone Joint Surg Am.
//     1974;56(8):1663-1674 (the type I / II / III classification by fracture level).
//   - Spine / radiology references reproducing the same tip (I) / base-of-dens (II) / extension-into-C2-
//     body (III) grouping.
//
// Types (level of the odontoid fracture line):
//   I   : oblique fracture through the tip of the odontoid, above the transverse ligament (avulsion of an
//         apical / alar ligament attachment). Rare; usually stable.
//   II  : fracture through the base (neck) of the odontoid, at its junction with the C2 body. The most
//         common; the highest non-union risk.
//   III : fracture extending into the cancellous body of C2 (often through the superior articular facets).
//         Usually heals with immobilization.

const TYPES = {
  I: { type: 'I', text: 'Anderson-D\'Alonzo type I - an oblique fracture through the tip of the odontoid, above the transverse ligament (avulsion of an apical / alar ligament attachment). Rare; usually stable.' },
  II: { type: 'II', text: 'Anderson-D\'Alonzo type II - a fracture through the base (neck) of the odontoid, at its junction with the C2 body. The most common type and the most prone to non-union.' },
  III: { type: 'III', text: 'Anderson-D\'Alonzo type III - a fracture extending into the cancellous body of C2 (often through the superior articular facets). Usually heals with immobilization.' },
};

const NOTE = 'The Anderson-D\'Alonzo classification (Anderson-D\'Alonzo 1974) groups an odontoid (dens) fracture of C2 by the level of the fracture line. I: through the tip, above the transverse ligament (rare, usually stable). II: through the base / neck of the dens (most common, highest non-union risk). III: extending into the C2 body (usually heals with immobilization). The non-union association is the classically taught teaching point, not an order; the management decision stays with the spine team. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
  IIA: 'II',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3; the IIA unstable-subtype maps to II).
export function andersonDalonzo(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Anderson-D\'Alonzo type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Anderson-D'Alonzo type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

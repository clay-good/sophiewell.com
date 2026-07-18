// spec-v408: Meyers-McKeever (with the Zaricznyj type IV) classification of tibial intercondylar-eminence
// fractures (the bony ACL avulsion off the tibia), by the displacement of the avulsed fragment — types
// I / II / III / IV. A pediatric/adolescent knee-injury classification the clinician determines from
// imaging. "meyers mckeever" / "tibial eminence fracture" / "tibial spine avulsion" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Displaced types are
// classically less stable, but this reports the type; the management decision stays with the orthopedic
// team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Meyers MH, McKeever FM. Fracture of the intercondylar eminence of the tibia. J Bone Joint Surg Am.
//     1959;41-A:209-222 (the original I / II / III grading by fragment displacement).
//   - Zaricznyj B. Avulsion fracture of the tibial eminence: treatment by open reduction and pinning. J
//     Bone Joint Surg Am. 1977;59(8):1111-1114 (the added type IV, comminuted).
//
// Types (displacement of the avulsed intercondylar-eminence fragment):
//   I   : minimally displaced / non-displaced fragment.
//   II  : the anterior third to half of the fragment is elevated, producing a beak (hinged posteriorly).
//   III : the fragment is completely separated / displaced from its bed, with no bony apposition.
//   IV  : comminuted fragment (Zaricznyj modification).

const TYPES = {
  I: { type: 'I', text: 'Meyers-McKeever type I - a minimally displaced or non-displaced intercondylar-eminence fragment.' },
  II: { type: 'II', text: 'Meyers-McKeever type II - the anterior third to half of the fragment is elevated, producing a beak (hinged posteriorly).' },
  III: { type: 'III', text: 'Meyers-McKeever type III - the fragment is completely separated / displaced from its bed, with no bony apposition.' },
  IV: { type: 'IV', text: 'Meyers-McKeever type IV (Zaricznyj) - a comminuted intercondylar-eminence fragment.' },
};

const NOTE = 'The Meyers-McKeever classification (Meyers-McKeever 1959; type IV added by Zaricznyj 1977) groups a tibial intercondylar-eminence fracture (the bony ACL avulsion off the tibia) by the displacement of the fragment. I: minimally / non-displaced. II: anterior beak, hinged posteriorly. III: completely displaced, no bony apposition. IV: comminuted. Displaced types (III-IV) are classically less stable and more often operative, but this reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function meyersMckeever(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Meyers-McKeever type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Meyers-McKeever type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}

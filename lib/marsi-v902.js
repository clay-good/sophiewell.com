// spec-v902: medical adhesive-related skin injury (MARSI).
//
// Source:
//   McNichol L, Lund C, Rosen T, Gray M. Medical adhesives and patient safety: state of the
//   science. Consensus statements for the assessment, prevention, and treatment of adhesive-
//   related skin injuries. J Wound Ostomy Continence Nurs. 2013;40(4):365-380.
//
//   MARSI is erythema or another skin abnormality that PERSISTS 30 MINUTES OR MORE after an
//   adhesive is removed. The consensus groups the injuries in three families:
//     Mechanical  skin stripping, tension injury or blister, skin tear.
//     Dermatitis  irritant contact dermatitis, allergic dermatitis.
//     Other       maceration, folliculitis.
//
// THE THIRTY-MINUTE RULE IS THE DIAGNOSTIC CRITERION, AND THAT IS WHY THIS TILE EXISTS. Erythema
// under a dressing that fades within half an hour of removal is not an injury; calling it one
// inflates the count and moves attention away from the ones that are real.
//
// IRRITANT AND ALLERGIC DERMATITIS ARE TOLD APART BY DISTRIBUTION AND TIMING. An irritant
// reaction stays inside the adhesive footprint and appears quickly. An allergic reaction extends
// beyond the footprint and needs prior sensitization, so it appears later and recurs faster on
// re-exposure.
//
// A SKIN TEAR CAUSED BY ADHESIVE REMOVAL IS BOTH THINGS AT ONCE. It is a mechanical MARSI and an
// ISTAP-classifiable skin tear, and recording only one of them loses either the mechanism or the
// wound.
//
// IT IS MOSTLY A TECHNIQUE PROBLEM. Removal angle, skin preparation, adhesive selection and
// whether the skin was allowed to dry are what change the rate, so the category is the start of
// that question.
//
// Pure: no DOM, no clock, no network.

export const MARSI_NOTE = 'Medical adhesive-related skin injury is defined by the 2013 consensus statement as erythema or another skin abnormality that persists thirty minutes or more after an adhesive is removed. The injuries fall in three families: mechanical, covering skin stripping, tension injury or blister, and skin tear; dermatitis, covering irritant contact and allergic reactions; and other, covering maceration and folliculitis. Four things about it are worth stating plainly. The thirty-minute rule is the diagnostic criterion, so erythema under a dressing that fades within half an hour of removal is not an injury, and calling it one inflates the count and moves attention away from the injuries that are real. Irritant and allergic dermatitis are told apart by distribution and timing, since an irritant reaction stays inside the adhesive footprint and appears quickly while an allergic reaction extends beyond it, needs prior sensitization, appears later and recurs faster on re-exposure. A skin tear caused by adhesive removal is both things at once, a mechanical injury of this kind and a classifiable skin tear, and recording only one of them loses either the mechanism or the wound. And it is mostly a technique problem, since removal angle, skin preparation, adhesive selection and whether the skin was allowed to dry are what change the rate. It records a finding against a published consensus. It does not diagnose an allergy, and it does not choose an adhesive.';

export const PERSISTENCE_MINUTES = 30;

export const INJURIES = [
  { value: 'skin-stripping', family: 'Mechanical', text: 'Skin stripping: one or more layers of epidermis removed with the adhesive' },
  { value: 'tension-injury', family: 'Mechanical', text: 'Tension injury or blister: the adhesive did not move with the skin beneath it' },
  { value: 'skin-tear', family: 'Mechanical', text: 'Skin tear caused by the adhesive or its removal' },
  { value: 'irritant-dermatitis', family: 'Dermatitis', text: 'Irritant contact dermatitis: confined to the adhesive footprint' },
  { value: 'allergic-dermatitis', family: 'Dermatitis', text: 'Allergic dermatitis: extending beyond the adhesive footprint' },
  { value: 'maceration', family: 'Other', text: 'Maceration: skin softened and wrinkled by trapped moisture' },
  { value: 'folliculitis', family: 'Other', text: 'Folliculitis: inflamed hair follicles under the adhesive' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function marsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const persists = on(o.persistsThirtyMinutes);
  const injury = oneOf(INJURIES, o.injury, null);
  const row = injury ? INJURIES.find((i) => i.value === injury) : null;

  const verdict = !persists
    ? 'not-marsi'
    : !row
      ? 'marsi-uncategorized'
      : 'marsi';

  const action = {
    'not-marsi': `Not recorded as persisting ${PERSISTENCE_MINUTES} minutes or more after removal. Erythema that fades within half an hour is not a medical adhesive-related skin injury, and recording it as one inflates the count.`,
    'marsi-uncategorized': `Persisting ${PERSISTENCE_MINUTES} minutes or more after removal, so this is a medical adhesive-related skin injury. Which of the seven injuries it is has not been recorded.`,
    marsi: row ? `${row.family} injury: ${row.text.split(':')[0].toLowerCase()}. It persists ${PERSISTENCE_MINUTES} minutes or more after removal, which is what makes it a medical adhesive-related skin injury.` : '',
  }[verdict];

  // The reason the tile exists, on every result.
  const persistenceNote = `The ${PERSISTENCE_MINUTES}-minute rule is the diagnostic criterion. Erythema under a dressing that fades within half an hour of removal is not an injury, and calling it one moves attention away from the injuries that are real.`;

  const dermatitisNote = injury === 'irritant-dermatitis' || injury === 'allergic-dermatitis'
    ? 'Irritant and allergic reactions are told apart by distribution and timing. An irritant reaction stays inside the adhesive footprint and appears quickly; an allergic reaction extends beyond it, needs prior sensitization, appears later, and recurs faster on re-exposure. This records which was seen, not which was proven.'
    : null;

  const skinTearNote = injury === 'skin-tear'
    ? 'A skin tear caused by adhesive removal is both things at once: a mechanical injury of this kind and a classifiable skin tear. Recording only one of them loses either the mechanism or the wound, so record both.'
    : null;

  const techniqueNote = 'It is mostly a technique problem. Removal angle, skin preparation, adhesive selection and whether the skin was allowed to dry are what change the rate, so the category is the start of that question rather than the end of it.';

  const scopeNote = 'This records a finding against a published consensus. It does not diagnose an allergy, and it does not choose an adhesive.';

  return {
    valid: true,
    persists,
    injury,
    family: row ? row.family : null,
    verdict,
    action,
    persistenceNote,
    dermatitisNote,
    skinTearNote,
    techniqueNote,
    scopeNote,
    abnormal: verdict === 'marsi' || verdict === 'marsi-uncategorized',
    bandLabel: {
      'not-marsi': 'Not a MARSI',
      'marsi-uncategorized': 'MARSI, not yet categorized',
      marsi: row ? `MARSI, ${row.family.toLowerCase()}` : 'MARSI',
    }[verdict],
    band: action,
    detail: `Medical adhesive-related skin injury is erythema or another skin abnormality persisting ${PERSISTENCE_MINUTES} minutes or more after an adhesive is removed. Mechanical injuries are skin stripping, tension injury or blister, and skin tear. Dermatitis is irritant or allergic. Other covers maceration and folliculitis.`,
    note: MARSI_NOTE,
  };
}

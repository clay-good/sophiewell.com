// spec-v900: the ISTAP classification of a skin tear.
//
// Source:
//   LeBlanc K, Baranoski S, Christensen D, et al. International Skin Tear Advisory Panel: a tool
//   kit to aid in the prevention, assessment, and treatment of skin tears using a simplified
//   classification system. Adv Skin Wound Care. 2013;26(10):459-476.
//
//   Type 1  no skin loss: the flap can be repositioned to cover the wound bed.
//   Type 2  partial flap loss: the flap cannot be repositioned to cover the whole wound bed.
//   Type 3  total flap loss: the wound bed is entirely exposed.
//
// A SKIN TEAR IS NOT STAGED LIKE A PRESSURE INJURY, AND THAT IS WHY THIS TILE EXISTS. It is an
// acute traumatic wound, and calling it a "stage 2" borrows a vocabulary built for a different
// mechanism. The staging systems are not interchangeable, and the documentation error travels
// into the care plan and the incident report.
//
// THE TYPE DESCRIBES THE FLAP, NOT THE DEPTH OR THE CAUSE. A type 3 is not "worse tissue"; it is
// a flap that is gone.
//
// THE CLASSIFICATION DOES NOT CHOOSE A DRESSING. It records what was found so the next person
// sees the same thing.
//
// A SKIN TEAR IS PREVENTABLE HARM IN MOST SETTINGS, and the classification is the start of asking
// why it happened, not the end of it.
//
// Pure: no DOM, no clock, no network.

export const SKIN_TEAR_NOTE = 'The International Skin Tear Advisory Panel classification sorts a skin tear by what has happened to the flap: type 1 is no skin loss, with the flap able to be repositioned to cover the wound bed; type 2 is partial flap loss, where the flap cannot be repositioned to cover the whole bed; type 3 is total flap loss, with the wound bed entirely exposed. Four things about it are worth stating plainly. A skin tear is not staged like a pressure injury: it is an acute traumatic wound, and calling it a stage 2 borrows a vocabulary built for a different mechanism, so the two systems are not interchangeable and the documentation error travels into the care plan and the incident report. The type describes the flap rather than the depth or the cause, so a type 3 is not worse tissue but a flap that is gone. The classification does not choose a dressing; it records what was found so that the next person sees the same thing. And a skin tear is preventable harm in most settings, so the classification is the start of asking why it happened rather than the end of it. It records a finding against a published classification. It does not choose a dressing, and it does not stage a pressure injury.';

export const TYPES = [
  { value: 'type-1', number: 1, text: 'No skin loss: the flap can be repositioned to cover the wound bed' },
  { value: 'type-2', number: 2, text: 'Partial flap loss: the flap cannot be repositioned to cover the whole wound bed' },
  { value: 'type-3', number: 3, text: 'Total flap loss: the wound bed is entirely exposed' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function skinTear(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const flapPresent = on(o.flapPresent);
  const coversWholeBed = on(o.flapCoversWholeBed);
  const explicit = oneOf(TYPES, o.type, null);

  // A type can be given directly, or derived from the two observations a nurse actually makes.
  const derived = !flapPresent
    ? 'type-3'
    : coversWholeBed
      ? 'type-1'
      : 'type-2';

  const type = explicit || derived;
  const row = TYPES.find((t) => t.value === type);

  const action = `Type ${row.number}. ${row.text}.`;

  // The reason the tile exists, on every result.
  const notPressureNote = 'A skin tear is not staged like a pressure injury. It is an acute traumatic wound, and calling it a stage 2 borrows a vocabulary built for a different mechanism. The two systems are not interchangeable, and the error travels into the care plan and the incident report.';

  const flapNote = 'The type describes the flap, not the depth or the cause. A type 3 is not worse tissue; it is a flap that is gone.';

  const dressingNote = 'The classification does not choose a dressing. It records what was found, so the next person sees the same thing and can tell whether the flap has survived.';

  const preventionNote = 'A skin tear is preventable harm in most settings. The classification is the start of asking why it happened, not the end of it.';

  const derivationNote = explicit
    ? `Type ${row.number} was entered directly. Recorded from the flap: ${flapPresent ? (coversWholeBed ? 'present and covering the whole bed' : 'present but not covering the whole bed') : 'absent'}, which reads as ${TYPES.find((t) => t.value === derived).value.replace('type-', 'type ')}.`
    : `Derived from the flap: ${flapPresent ? (coversWholeBed ? 'present, and it covers the whole wound bed' : 'present, but it does not cover the whole wound bed') : 'absent, so the wound bed is entirely exposed'}.`;

  const disagreementNote = explicit && explicit !== derived
    ? 'The type entered and the type the flap description implies do not agree. The flap is what the classification is built on, so it is worth re-reading the wound before the type is recorded.'
    : null;

  const scopeNote = 'This records a finding against a published classification. It does not choose a dressing, and it does not stage a pressure injury.';

  return {
    valid: true,
    type,
    typeNumber: row.number,
    derivedType: derived,
    flapPresent,
    coversWholeBed,
    action,
    derivationNote,
    disagreementNote,
    notPressureNote,
    flapNote,
    dressingNote,
    preventionNote,
    scopeNote,
    abnormal: row.number >= 2,
    bandLabel: `ISTAP type ${row.number}`,
    band: action,
    detail: 'Type 1 is no skin loss, with the flap able to cover the wound bed. Type 2 is partial flap loss, where it cannot cover the whole bed. Type 3 is total flap loss. The type describes the flap, not the depth, and a skin tear is not staged like a pressure injury.',
    note: SKIN_TEAR_NOTE,
  };
}

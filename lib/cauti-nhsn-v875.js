// spec-v875: the NHSN catheter-associated urinary tract infection (CAUTI) definition.
//
// Source:
//   CDC National Healthcare Safety Network. Urinary Tract Infection (Catheter-Associated Urinary
//   Tract Infection and Non-Catheter-Associated Urinary Tract Infection) Event. NHSN Patient
//   Safety Component Manual, Chapter 7.
//
//   All three must hold on the date of event:
//     Device      an indwelling urinary catheter in place for more than two consecutive calendar
//                 days, and either still in place that day or removed the day before.
//     Symptom     at least one of fever above 100.4 F, suprapubic tenderness, costovertebral
//                 angle pain or tenderness, urinary urgency, urinary frequency, or dysuria.
//     Culture     no more than two species, at least one of them a bacterium at 100,000 CFU/mL
//                 or more.
//
// URGENCY, FREQUENCY AND DYSURIA DO NOT COUNT WHILE THE CATHETER IS IN PLACE, AND THAT IS WHY
// THIS TILE EXISTS. A catheterized bladder cannot produce a meaningful urgency or dysuria
// complaint, so NHSN accepts those three only once the catheter is out.
//
// MORE THAN TWO SPECIES EXCLUDES THE EVENT. A mixed culture is not a CAUTI, however it is
// treated.
//
// YEAST IS NOT A BACTERIUM. At least one organism has to be bacterial at the threshold; candiduria
// alone does not meet the definition.
//
// IT IS A SURVEILLANCE DEFINITION, NOT A CLINICAL DIAGNOSIS, and it is not a decision about
// treating asymptomatic bacteriuria.
//
// Pure: no DOM, no clock, no network.

export const CAUTI_NOTE = 'The NHSN definition of a catheter-associated urinary tract infection requires three things together on the date of event. An indwelling urinary catheter must have been in place for more than two consecutive calendar days, and must be either still in place that day or removed the day before. There must be at least one of fever above 100.4 F, suprapubic tenderness, costovertebral angle pain or tenderness, urinary urgency, urinary frequency, or dysuria. And there must be a urine culture with no more than two species, at least one of which is a bacterium at 100,000 colony-forming units per milliliter or more. Four things about the definition are worth stating plainly. Urgency, frequency and dysuria are not counted while the catheter is in place, because a catheterized bladder cannot produce a meaningful complaint of them, so NHSN accepts those three only once the catheter is out. A culture growing more than two species excludes the event, however it is treated clinically. Yeast is not a bacterium, so candiduria alone does not meet the definition even at a high colony count. And it is a surveillance definition rather than a clinical diagnosis, and it is not a decision about whether to treat asymptomatic bacteriuria. It applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a catheter.';

// The three that NHSN accepts only once the catheter is out.
export const CATHETER_OUT_ONLY = ['urgency', 'frequency', 'dysuria'];

export const SYMPTOMS = [
  { key: 'fever', text: 'Fever above 100.4 F (38.0 C)' },
  { key: 'suprapubicTenderness', text: 'Suprapubic tenderness' },
  { key: 'cvaTenderness', text: 'Costovertebral angle pain or tenderness' },
  { key: 'urgency', text: 'Urinary urgency' },
  { key: 'frequency', text: 'Urinary frequency' },
  { key: 'dysuria', text: 'Dysuria' },
];

export const CULTURE_RESULTS = [
  { value: 'none', text: 'No qualifying culture' },
  { value: 'bacterium-threshold', text: 'One or two species, at least one a bacterium at 100,000 CFU/mL or more' },
  { value: 'yeast-only', text: 'Yeast only, at any colony count' },
  { value: 'below-threshold', text: 'Bacterial growth below 100,000 CFU/mL' },
  { value: 'more-than-two-species', text: 'More than two species' },
];

export const DEVICE_DAY_MINIMUM = 2;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function cautiNhsn(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const catheterDays = num(o.catheterDays);
  if (catheterDays !== null && (catheterDays < 0 || catheterDays > 3650)) {
    return { valid: false, message: 'Enter the number of consecutive calendar days the catheter has been in place, between 0 and 3650.' };
  }

  const stillInPlace = on(o.catheterStillInPlace);
  const removedDayBefore = on(o.catheterRemovedDayBefore);
  const culture = oneOf(CULTURE_RESULTS, o.culture, 'none');

  const dayRuleMet = catheterDays !== null && catheterDays > DEVICE_DAY_MINIMUM;
  const timingMet = stillInPlace || removedDayBefore;
  const deviceMet = dayRuleMet && timingMet;

  const claimed = SYMPTOMS.filter((s) => on(o[s.key]));
  // The rule the definition is most often read past.
  const discounted = stillInPlace ? claimed.filter((s) => CATHETER_OUT_ONLY.includes(s.key)) : [];
  const counted = claimed.filter((s) => !discounted.includes(s));

  const cultureMet = culture === 'bacterium-threshold';

  const classification = deviceMet && counted.length > 0 && cultureMet
    ? 'cauti'
    : 'not-met';

  const missing = [];
  if (classification === 'not-met') {
    if (!deviceMet) {
      missing.push(!dayRuleMet
        ? `the catheter has been in place ${catheterDays === null ? 'for a number of days that is not entered' : `${catheterDays} calendar day${catheterDays === 1 ? '' : 's'}`} and the rule asks for more than ${DEVICE_DAY_MINIMUM}`
        : 'the catheter was neither in place on the date of event nor removed the day before');
    }
    if (!counted.length) {
      missing.push(discounted.length
        ? 'the only symptoms recorded are ones the definition does not count while the catheter is in place'
        : 'no accepted symptom is recorded');
    }
    if (!cultureMet) {
      missing.push({
        none: 'no qualifying urine culture is recorded',
        'yeast-only': 'the culture grew yeast only, and at least one organism has to be a bacterium at the threshold',
        'below-threshold': 'the bacterial growth is below 100,000 CFU/mL',
        'more-than-two-species': 'the culture grew more than two species, which excludes the event',
      }[culture]);
    }
  }

  const action = classification === 'cauti'
    ? 'Catheter-associated urinary tract infection: the device, symptom and culture criteria are all met on the date of event.'
    : `The definition is not met: ${missing.join('; ')}.`;

  // The reason the tile exists.
  const catheterOutNote = discounted.length
    ? `Urgency, frequency and dysuria are not counted while the catheter is in place, and ${discounted.length === 1 ? 'one recorded symptom was' : `${discounted.length} recorded symptoms were`} set aside for that reason. A catheterized bladder cannot produce a meaningful complaint of them; NHSN accepts those three only once the catheter is out.`
    : 'Urgency, frequency and dysuria are counted only once the catheter is out. Fever, suprapubic tenderness and costovertebral angle tenderness count either way.';

  const speciesNote = culture === 'more-than-two-species'
    ? 'More than two species excludes the event under this definition, however the culture is treated clinically.'
    : null;

  const yeastNote = culture === 'yeast-only'
    ? 'Yeast is not a bacterium. Candiduria alone does not meet the definition at any colony count, and it is separately a poor reason to treat.'
    : null;

  const surveillanceNote = 'This is a surveillance definition, not a clinical diagnosis, and it is not a decision about whether to treat asymptomatic bacteriuria.';

  const deviceRuleNote = `The device rule counts the day of insertion as day 1, so the catheter must have been in place into day ${DEVICE_DAY_MINIMUM + 1}, and must be either still in place on the date of event or removed the day before.`;

  const recordedNote = `Recorded: ${counted.length} accepted symptom${counted.length === 1 ? '' : 's'}${discounted.length ? ` (${discounted.length} set aside)` : ''}, and a catheter in place ${catheterDays === null ? 'for an unstated number of days' : `${catheterDays} calendar day${catheterDays === 1 ? '' : 's'}`}.`;

  const scopeNote = 'This applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a catheter.';

  return {
    valid: true,
    classification,
    deviceMet,
    dayRuleMet,
    cultureMet,
    catheterDays,
    culture,
    counted: counted.map((s) => s.text),
    discounted: discounted.map((s) => s.text),
    action,
    recordedNote,
    catheterOutNote,
    speciesNote,
    yeastNote,
    surveillanceNote,
    deviceRuleNote,
    scopeNote,
    abnormal: classification === 'cauti',
    bandLabel: classification === 'cauti' ? 'CAUTI' : 'Definition not met',
    band: action,
    detail: `All three on the date of event: an indwelling catheter in place more than ${DEVICE_DAY_MINIMUM} consecutive calendar days and either still in place or removed the day before; at least one of fever, suprapubic tenderness, costovertebral angle tenderness, urgency, frequency or dysuria, with the last three counted only once the catheter is out; and a culture of no more than two species with at least one bacterium at 100,000 CFU/mL or more.`,
    note: CAUTI_NOTE,
  };
}

// spec-v874: the NHSN central line-associated bloodstream infection (CLABSI) definition.
//
// Source:
//   CDC National Healthcare Safety Network. Bloodstream Infection Event (Central Line-Associated
//   Bloodstream Infection and Non-central Line Associated Bloodstream Infection). NHSN Patient
//   Safety Component Manual, Chapter 4.
//
//   LCBI 1  a recognized pathogen from one or more blood cultures, not related to an infection at
//           another site. No sign or symptom is required.
//   LCBI 2  a common commensal from two or more blood cultures drawn on separate occasions on the
//           same or consecutive days, WITH at least one sign or symptom, not related to an
//           infection at another site.
//   Central line association: the line was in place for more than two consecutive calendar days
//           (so day 3 onward, counting the day of insertion as day 1) AND was in place on the day
//           of the event or the day before.
//
// IT IS A SURVEILLANCE DEFINITION, NOT A CLINICAL DIAGNOSIS, AND THAT IS WHY THIS TILE EXISTS.
// "Central line-associated" is an attribution rule about timing, not a statement that the line
// caused the infection. A patient can have a real line infection that is not a CLABSI, and a
// CLABSI whose source was somewhere else.
//
// ONE CULTURE IS ENOUGH FOR A RECOGNIZED PATHOGEN, AND TWO ARE REQUIRED FOR A COMMON COMMENSAL.
// A single commensal culture is a contaminant under this definition however the patient looks.
//
// SIGNS AND SYMPTOMS ARE REQUIRED ONLY FOR THE COMMENSAL ROUTE, and the accepted list differs by
// age.
//
// AN ORGANISM RELATED TO AN INFECTION AT ANOTHER SITE IS A SECONDARY BLOODSTREAM INFECTION AND IS
// NOT AN LCBI AT ALL.
//
// Pure: no DOM, no clock, no network.

export const CLABSI_NOTE = 'The NHSN definition of a central line-associated bloodstream infection has two parts, and both must hold. The laboratory part is a laboratory-confirmed bloodstream infection: LCBI 1 is a recognized pathogen from one or more blood cultures with no sign or symptom required, and LCBI 2 is a common commensal from two or more blood cultures drawn on separate occasions on the same or consecutive days together with at least one sign or symptom. In either case the organism must not be related to an infection at another site. The device part is that the central line was in place for more than two consecutive calendar days, counting the day of insertion as day one, and was in place on the day of the event or the day before. Four things about the definition are worth stating plainly. It is a surveillance definition and not a clinical diagnosis: central line-associated is an attribution rule about timing, not a statement that the line caused the infection, so a patient can have a real line infection that is not a CLABSI and a CLABSI whose source was somewhere else. One culture is enough for a recognized pathogen and two are required for a common commensal, so a single commensal culture is a contaminant under this definition however the patient looks. Signs and symptoms are required only for the commensal route, and the accepted list differs by age. And an organism related to an infection at another site is a secondary bloodstream infection and is not an LCBI at all. It applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a line.';

export const ADULT_SIGNS = [
  { key: 'fever', text: 'Fever above 100.4 F (38.0 C)' },
  { key: 'chills', text: 'Chills' },
  { key: 'hypotension', text: 'Hypotension' },
];

export const INFANT_SIGNS = [
  { key: 'fever', text: 'Fever above 100.4 F (38.0 C)' },
  { key: 'hypothermia', text: 'Hypothermia below 96.8 F (36.0 C)' },
  { key: 'apnea', text: 'Apnea' },
  { key: 'bradycardia', text: 'Bradycardia' },
];

export const ORGANISM_TYPES = [
  { value: 'none', text: 'No positive blood culture' },
  { value: 'recognized-pathogen', text: 'Recognized pathogen' },
  { value: 'common-commensal', text: 'Common commensal' },
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

export function clabsiLcbi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const infant = o.age === 'infant';
  const signs = infant ? INFANT_SIGNS : ADULT_SIGNS;
  const organism = oneOf(ORGANISM_TYPES, o.organism, 'none');
  const lineDays = num(o.lineDays);

  if (lineDays !== null && (lineDays < 0 || lineDays > 3650)) {
    return { valid: false, message: 'Enter the number of consecutive calendar days the central line has been in place, between 0 and 3650.' };
  }

  const secondarySite = on(o.secondarySite);
  const twoCultures = on(o.commensalTwoCultures);
  const presentOnOrBefore = on(o.linePresentOnOrDayBefore);
  const signsPresent = signs.filter((s) => on(o[s.key]));

  const lcbi = secondarySite
    ? null
    : organism === 'recognized-pathogen'
      ? 1
      : organism === 'common-commensal' && twoCultures && signsPresent.length > 0
        ? 2
        : null;

  const dayRuleMet = lineDays !== null && lineDays > DEVICE_DAY_MINIMUM;
  const deviceAssociated = dayRuleMet && presentOnOrBefore;

  const classification = lcbi && deviceAssociated
    ? 'clabsi'
    : lcbi
      ? 'lcbi-not-device-associated'
      : secondarySite
        ? 'secondary'
        : 'not-an-lcbi';

  const action = {
    clabsi: `Central line-associated bloodstream infection: LCBI ${lcbi}, with the central line in place for more than ${DEVICE_DAY_MINIMUM} consecutive calendar days and present on the day of the event or the day before.`,
    'lcbi-not-device-associated': `LCBI ${lcbi} is met, but the device rule is not: ${!dayRuleMet ? `the line has been in place ${lineDays === null ? 'for a number of days that is not entered' : `${lineDays} calendar day${lineDays === 1 ? '' : 's'}`}, and the rule asks for more than ${DEVICE_DAY_MINIMUM}` : 'the line was not in place on the day of the event or the day before'}. It is a bloodstream infection that is not counted as central line-associated.`,
    secondary: 'The organism is related to an infection at another site. That is a secondary bloodstream infection, and it is not an LCBI at all.',
    'not-an-lcbi': organism === 'common-commensal'
      ? `No LCBI: a common commensal needs two or more blood cultures drawn on separate occasions on the same or consecutive days${twoCultures ? '' : ', which is not recorded'}${signsPresent.length ? '' : ', and at least one sign or symptom, which is not recorded'}.`
      : 'No LCBI is met by what was entered. The laboratory part of the definition begins with a positive blood culture.',
  }[classification];

  // The reason the tile exists, on every result.
  const surveillanceNote = 'This is a surveillance definition, not a clinical diagnosis. Central line-associated is an attribution rule about timing, not a statement that the line caused the infection: a patient can have a real line infection that is not a CLABSI, and a CLABSI whose source was somewhere else.';

  const cultureCountNote = organism === 'common-commensal'
    ? 'A common commensal needs two or more blood cultures drawn on separate occasions on the same or consecutive days. A single commensal culture is a contaminant under this definition however the patient looks.'
    : organism === 'recognized-pathogen'
      ? 'One culture is enough for a recognized pathogen, and no sign or symptom is required. The two-culture rule and the sign requirement belong to the commensal route only.'
      : null;

  const signsNote = organism === 'common-commensal'
    ? `Accepted signs here are the ${infant ? 'list for a patient one year old or younger: fever, hypothermia, apnea, or bradycardia' : 'adult list: fever, chills, or hypotension'}. The list differs by age, and only the commensal route needs one at all.`
    : null;

  const deviceRuleNote = `The device rule counts the day of insertion as day 1, so the line must have been in place into day ${DEVICE_DAY_MINIMUM + 1}, and it must also have been in place on the day of the event or the day before.`;

  const secondaryNote = !secondarySite && lcbi
    ? 'This assumes the organism is not related to an infection at another site. If it is, the event is a secondary bloodstream infection and is attributed to that site instead.'
    : null;

  const recordedNote = `Recorded: ${organism === 'none' ? 'no positive blood culture' : organism === 'recognized-pathogen' ? 'a recognized pathogen' : 'a common commensal'}, ${signsPresent.length} accepted sign${signsPresent.length === 1 ? '' : 's'}, and a line in place ${lineDays === null ? 'for an unstated number of days' : `${lineDays} calendar day${lineDays === 1 ? '' : 's'}`}.`;

  const scopeNote = 'This applies a published surveillance definition to findings already recorded. It does not diagnose an infection, and it does not decide whether to treat or to remove a line.';

  return {
    valid: true,
    classification,
    lcbi,
    deviceAssociated,
    dayRuleMet,
    infant,
    organism,
    lineDays,
    signsPresent: signsPresent.map((s) => s.text),
    action,
    recordedNote,
    surveillanceNote,
    cultureCountNote,
    signsNote,
    deviceRuleNote,
    secondaryNote,
    scopeNote,
    abnormal: classification === 'clabsi',
    bandLabel: {
      clabsi: 'CLABSI',
      'lcbi-not-device-associated': 'LCBI, not central line-associated',
      secondary: 'Secondary bloodstream infection',
      'not-an-lcbi': 'Not an LCBI',
    }[classification],
    band: action,
    detail: `LCBI 1 is a recognized pathogen from one or more blood cultures, with no sign or symptom required. LCBI 2 is a common commensal from two or more cultures drawn on separate occasions on the same or consecutive days, with at least one sign or symptom. Neither may be related to an infection at another site. It is central line-associated when the line has been in place more than ${DEVICE_DAY_MINIMUM} consecutive calendar days and was in place on the day of the event or the day before.`,
    note: CLABSI_NOTE,
  };
}

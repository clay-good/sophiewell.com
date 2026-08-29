// spec-v872: the CDC/CSTE measles case definition.
//
// Source:
//   Council of State and Territorial Epidemiologists / CDC. Measles (Rubeola) Case Definition.
//   CDC National Notifiable Diseases Surveillance System.
//
//   Clinical criteria: in the absence of a more likely diagnosis, an acute febrile rash illness
//   with a temperature at or above 101 F (38.3 C), a generalized maculopapular rash lasting at
//   least three days, and cough, coryza or conjunctivitis.
//
//   Suspect    any febrile illness accompanied by rash.
//   Probable   the clinical criteria, with no contributory laboratory testing and no
//              epidemiologic link to a laboratory-confirmed case.
//   Confirmed  an acute febrile rash illness with virus isolation, detection of measles nucleic
//              acid, a positive IgM, or IgG seroconversion; or a direct epidemiologic link to a
//              laboratory-confirmed case.
//
// SUSPECT IS ANY FEBRILE RASH ILLNESS, AND THAT IS WHY THIS TILE EXISTS. The bar to place a
// patient in airborne isolation and notify public health is far lower than the bar to classify a
// case, and neither waits on the other.
//
// A NEGATIVE IgM IN THE FIRST 72 HOURS AFTER RASH ONSET DOES NOT EXCLUDE MEASLES. It is drawn
// too early in a substantial share of real cases.
//
// A POSITIVE IgM IN A LOW-PREVALENCE SETTING IS NOT CONCLUSIVE ON ITS OWN. Its positive
// predictive value falls with incidence, which is why RT-PCR and an epidemiologic link matter.
//
// VACCINATION DOES NOT EXCLUDE MEASLES. A rash 7 to 14 days after vaccination with vaccine
// strain identified is a vaccine reaction and is not counted; a vaccination history on its own
// is not that.
//
// Pure: no DOM, no clock, no network.

export const MEASLES_NOTE = 'The CDC and CSTE measles case definition (National Notifiable Diseases Surveillance System) classifies a case as suspect, probable, or confirmed. Suspect is any febrile illness accompanied by rash. The clinical criteria are, in the absence of a more likely diagnosis, a temperature at or above 101 F, a generalized maculopapular rash lasting at least three days, and cough, coryza or conjunctivitis; a case meeting them with no contributory laboratory testing and no epidemiologic link is probable. A case is confirmed by an acute febrile rash illness with virus isolation, detection of measles nucleic acid, a positive IgM or IgG seroconversion, or by a direct epidemiologic link to a laboratory-confirmed case. Four things about the definition are worth stating plainly. Suspect is any febrile rash illness, so the bar to place a patient in airborne isolation and notify public health is far lower than the bar to classify a case, and neither waits on the other. A negative IgM in the first seventy-two hours after rash onset does not exclude measles, because it is drawn too early in a substantial share of real cases. A positive IgM in a low-prevalence setting is not conclusive on its own, since its positive predictive value falls with incidence, which is why nucleic acid detection and an epidemiologic link matter. And vaccination does not exclude measles: only a rash seven to fourteen days after vaccination with vaccine strain identified is a vaccine reaction rather than a case. It applies a published surveillance definition to findings already recorded. It does not diagnose measles, and it does not decide isolation or reporting, both of which start on suspicion.';

export const CLINICAL_CRITERIA = [
  { key: 'fever101', text: 'Temperature at or above 101 F (38.3 C)' },
  { key: 'rashThreeDays', text: 'Generalized maculopapular rash lasting at least three days' },
  { key: 'cccSymptom', text: 'Cough, coryza, or conjunctivitis' },
];

export const LABORATORY_EVIDENCE = [
  { key: 'virusDetected', text: 'Measles virus isolated, or measles nucleic acid detected' },
  { key: 'igmPositive', text: 'Positive serologic test for measles IgM' },
  { key: 'iggSeroconversion', text: 'IgG seroconversion, or a significant rise in measles IgG' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const pick = (list, o) => list.filter((i) => on(o[i.key]));

export function measlesCaseDefinition(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const clinicalMet = pick(CLINICAL_CRITERIA, o);
  const lab = pick(LABORATORY_EVIDENCE, o);
  const epiLink = on(o.epiLink);
  const moreLikely = on(o.moreLikelyDiagnosis);
  const vaccineStrain = on(o.vaccineStrainRash);
  const febrileRash = on(o.febrileRashIllness);

  const clinical = !moreLikely && clinicalMet.length === CLINICAL_CRITERIA.length;
  // The confirmed tier asks only for an acute febrile rash illness, not the full clinical set.
  const acuteFebrileRash = febrileRash || (on(o.fever101) && on(o.rashThreeDays));

  const classification = vaccineStrain
    ? 'vaccine-reaction'
    : acuteFebrileRash && (lab.length || epiLink)
      ? 'confirmed'
      : clinical
        ? 'probable'
        : febrileRash
          ? 'suspect'
          : 'not-met';

  const routes = [];
  if (classification === 'confirmed') {
    if (lab.length) routes.push(lab.map((i) => i.text.toLowerCase()).join(', '));
    if (epiLink) routes.push('a direct epidemiologic link to a laboratory-confirmed case');
  }

  const action = {
    'vaccine-reaction': 'A rash 7 to 14 days after vaccination with vaccine strain identified is a vaccine reaction. It is not counted as a case.',
    confirmed: `Confirmed measles, on an acute febrile rash illness with ${routes.join(', and with ')}.`,
    probable: 'Probable measles: the clinical criteria are met, with no contributory laboratory testing and no epidemiologic link to a laboratory-confirmed case.',
    suspect: 'Suspect measles: a febrile illness accompanied by rash. That is the whole suspect definition, and it is enough to act on.',
    'not-met': 'No tier of the case definition is met by what was entered.',
  }[classification];

  // The reason the tile exists, on every result.
  const isolationNote = 'Suspect is any febrile rash illness. Airborne isolation and notification of public health start on suspicion, not on classification, and neither waits on the other.';

  const igmEarlyNote = !on(o.igmPositive)
    ? 'A negative IgM in the first seventy-two hours after rash onset does not exclude measles; it is drawn too early in a substantial share of real cases. Nucleic acid detection from a throat or nasopharyngeal swab and urine is the more sensitive early test.'
    : null;

  const igmPpvNote = on(o.igmPositive) && !on(o.virusDetected) && !epiLink
    ? 'A positive IgM on its own is not conclusive in a low-prevalence setting: its positive predictive value falls with incidence. Nucleic acid detection or an epidemiologic link is what settles it.'
    : null;

  const vaccineNote = 'Vaccination does not exclude measles. Only a rash seven to fourteen days after vaccination with vaccine strain identified is a vaccine reaction; a vaccination history on its own is not that.';

  const rashDurationNote = classification === 'suspect'
    ? 'The clinical criteria ask for a rash lasting at least three days, so a patient seen on the first day cannot yet meet them. That is what the suspect tier is for.'
    : null;

  const moreLikelyNote = moreLikely
    ? 'A more likely diagnosis has been recorded, and the clinical criteria begin by excluding one. The laboratory and epidemiologic-link routes to confirmed do not depend on it.'
    : null;

  const recordedNote = `Recorded: ${clinicalMet.length} of ${CLINICAL_CRITERIA.length} clinical criteria, ${lab.length} laboratory result${lab.length === 1 ? '' : 's'}${epiLink ? ', and an epidemiologic link' : ', and no epidemiologic link'}.`;

  const scopeNote = 'This applies a published surveillance definition to findings already recorded. It does not diagnose measles, and it does not decide isolation or reporting, both of which start on suspicion.';

  return {
    valid: true,
    classification,
    clinical,
    clinicalMet: clinicalMet.map((i) => i.text),
    laboratory: lab.map((i) => i.text),
    epiLink,
    action,
    recordedNote,
    isolationNote,
    igmEarlyNote,
    igmPpvNote,
    vaccineNote,
    rashDurationNote,
    moreLikelyNote,
    scopeNote,
    abnormal: classification === 'confirmed' || classification === 'probable' || classification === 'suspect',
    bandLabel: {
      'vaccine-reaction': 'Vaccine reaction, not a case',
      confirmed: 'Confirmed',
      probable: 'Probable',
      suspect: 'Suspect',
      'not-met': 'Definition not met',
    }[classification],
    band: action,
    detail: 'Suspect is any febrile illness accompanied by rash. The clinical criteria are a temperature at or above 101 F, a generalized maculopapular rash lasting at least three days, and cough, coryza or conjunctivitis, absent a more likely diagnosis; meeting them with no laboratory result and no epidemiologic link is probable. Virus isolation, nucleic acid detection, a positive IgM, IgG seroconversion, or a direct epidemiologic link confirms.',
    note: MEASLES_NOTE,
  };
}

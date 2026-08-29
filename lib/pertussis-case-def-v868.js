// spec-v868: the CDC/CSTE pertussis surveillance case definition.
//
// Source:
//   Council of State and Territorial Epidemiologists / CDC. Pertussis (Whooping Cough)
//   (Bordetella pertussis) 2020 Case Definition. CDC National Notifiable Diseases
//   Surveillance System.
//
//   Clinical criteria: in the absence of a more likely diagnosis, a cough illness lasting at
//   least two weeks with at least one of paroxysms of coughing, inspiratory whoop, post-tussive
//   vomiting, or apnea (infants under one year only).
//
//   Confirmed: an acute cough illness of any duration with isolation of B. pertussis on culture;
//     or the clinical criteria plus a positive PCR; or the clinical criteria plus an
//     epidemiologic link to a laboratory-confirmed case.
//   Probable: the clinical criteria, with neither laboratory confirmation nor an epidemiologic
//     link.
//
// IT IS A SURVEILLANCE DEFINITION, NOT A TREATMENT THRESHOLD, AND THAT IS WHY THIS TILE EXISTS.
// Treatment and post-exposure prophylaxis are decided on clinical suspicion and do not wait for
// a case to be classified.
//
// A NEGATIVE TEST DOES NOT MOVE A CASE OUT OF PROBABLE. Culture and PCR yield falls once the
// cough has run three to four weeks or antibiotics have started; the definition is built to
// classify those cases on clinical grounds instead.
//
// SEROLOGY IS NOT IN THE DEFINITION. It appears in no branch of it.
//
// THE TWO-WEEK COUGH IS AN ADULT AND OLDER-CHILD SHAPE. A young infant may present with apnea
// and little cough, which is why apnea counts only under one year and why the culture branch
// accepts a cough illness of any duration.
//
// Pure: no DOM, no clock, no network.

export const PERTUSSIS_NOTE = 'The CDC and CSTE pertussis case definition (2020, National Notifiable Diseases Surveillance System) classifies a case as confirmed, probable, or not meeting the definition. Its clinical criteria are, in the absence of a more likely diagnosis, a cough illness lasting at least two weeks together with at least one of paroxysms of coughing, inspiratory whoop, post-tussive vomiting, or apnea in an infant under one year. A case is confirmed by an acute cough illness of any duration with a positive culture, or by the clinical criteria together with either a positive PCR or an epidemiologic link to a laboratory-confirmed case; it is probable when the clinical criteria are met with neither. Four things about it are worth stating plainly. It is a surveillance definition and not a treatment threshold, so treatment and post-exposure prophylaxis are decided on clinical suspicion and do not wait for a classification. A negative test does not move a case out of probable, because culture and PCR yield falls once the cough has run three to four weeks or antibiotics have started, and the definition is built to classify those cases on clinical grounds instead. Serology appears in no branch of the definition. And the two-week cough is an older-child and adult shape, which is why apnea counts only under one year and why the culture branch accepts a cough illness of any duration. It applies a published surveillance definition to findings already recorded. It does not diagnose pertussis, and it does not decide whether to treat.';

export const SYMPTOMS = [
  { key: 'paroxysms', text: 'Paroxysms of coughing' },
  { key: 'whoop', text: 'Inspiratory whoop' },
  { key: 'postTussiveVomiting', text: 'Post-tussive vomiting' },
  { key: 'apnea', text: 'Apnea, with or without cyanosis', infantOnly: true },
];

export const LAB_RESULTS = [
  { value: 'none', text: 'No positive test' },
  { value: 'culture', text: 'Culture positive for Bordetella pertussis' },
  { value: 'pcr', text: 'PCR positive for Bordetella pertussis' },
];

export const CLINICAL_COUGH_WEEKS = 2;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function pertussisCaseDefinition(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const infant = o.age === 'infant';
  const weeks = num(o.coughWeeks);

  if (weeks !== null && (weeks < 0 || weeks > 104)) {
    return { valid: false, message: 'Enter the duration of the cough illness in weeks, between 0 and 104.' };
  }

  const lab = o.lab === 'culture' || o.lab === 'pcr' ? o.lab : 'none';
  const epiLink = on(o.epiLink);
  const moreLikely = on(o.moreLikelyDiagnosis);

  // Apnea counts only in an infant under one year. Ticked for an older child it is a real
  // finding that this definition does not accept, and saying so is the point of the branch.
  const counted = SYMPTOMS.filter((s) => on(o[s.key]) && (!s.infantOnly || infant));
  const apneaDiscounted = on(o.apnea) && !infant;

  const coughIllness = weeks !== null && weeks > 0;
  const twoWeekCough = weeks !== null && weeks >= CLINICAL_COUGH_WEEKS;
  const clinical = !moreLikely && twoWeekCough && counted.length > 0;

  const cultureRoute = lab === 'culture' && coughIllness;
  const pcrRoute = clinical && lab === 'pcr';
  const linkRoute = clinical && epiLink;

  const classification = cultureRoute || pcrRoute || linkRoute
    ? 'confirmed'
    : clinical
      ? 'probable'
      : 'not-met';

  const routes = [];
  if (cultureRoute) routes.push('an acute cough illness of any duration with a positive culture');
  if (pcrRoute) routes.push('the clinical criteria with a positive PCR');
  if (linkRoute) routes.push('the clinical criteria with an epidemiologic link to a laboratory-confirmed case');

  const action = classification === 'confirmed'
    ? `Confirmed pertussis by ${routes.join(', and by ')}.`
    : classification === 'probable'
      ? 'Probable pertussis: the clinical criteria are met, with neither laboratory confirmation nor an epidemiologic link.'
      : 'The case definition is not met by what was entered.';

  // Why the clinical branch failed, said in the terms the definition uses.
  const shortfall = [];
  if (classification === 'not-met') {
    if (moreLikely) shortfall.push('a more likely diagnosis has been recorded, and the clinical criteria begin by excluding one');
    if (!twoWeekCough) shortfall.push(`the cough illness is ${weeks === null ? 'not entered' : `${weeks} week${weeks === 1 ? '' : 's'}`} and the clinical criteria ask for at least ${CLINICAL_COUGH_WEEKS}`);
    if (!counted.length) shortfall.push(`none of the four accepted signs is recorded${apneaDiscounted ? ', and apnea counts only in an infant under one year' : ''}`);
  }
  const shortfallNote = shortfall.length ? `Why: ${shortfall.join('; ')}.` : null;

  // The reason the tile exists, on every result.
  const notATreatmentNote = 'This is a surveillance definition, not a treatment threshold. Treatment and post-exposure prophylaxis are decided on clinical suspicion and do not wait for a case to be classified.';

  // The misread that costs a real case, and it is worst on the results that are not confirmed.
  const negativeTestNote = classification === 'confirmed'
    ? null
    : 'A negative test does not move a case out of probable. Culture and PCR yield falls once the cough has run three to four weeks or antibiotics have started, and the definition is built to classify those cases on clinical grounds instead.';

  const serologyNote = 'Serology is not in this definition. It appears in no branch of it.';

  const apneaNote = apneaDiscounted
    ? 'Apnea was recorded but not counted: the definition accepts it only in an infant under one year. It remains a reason to escalate care whatever this classification says.'
    : null;

  const infantNote = infant
    ? 'Read for an infant under one year: apnea counts as an accepted sign, and a young infant may present with apnea and little cough, which the two-week requirement does not describe.'
    : null;

  const countedNote = counted.length
    ? `Accepted signs recorded: ${counted.map((s) => s.text.toLowerCase()).join('; ')}.`
    : 'No accepted sign was recorded.';

  // What the classification was read from, echoed back so the reader can see which duration and
  // which age branch it used.
  const readNote = `Read from a cough illness of ${weeks === null ? 'no stated duration' : `${weeks} week${weeks === 1 ? '' : 's'}`}, ${infant ? 'in an infant under one year' : 'at one year and older'}, with ${lab === 'culture' ? 'a positive culture' : lab === 'pcr' ? 'a positive PCR' : 'no positive test'}${epiLink ? ' and an epidemiologic link' : ''}.`;

  const scopeNote = 'This applies a published surveillance definition to findings already recorded. It does not diagnose pertussis, and it does not decide whether to treat.';

  return {
    valid: true,
    classification,
    clinical,
    infant,
    coughWeeks: weeks,
    lab,
    epiLink,
    counted: counted.map((s) => s.text),
    apneaDiscounted,
    action,
    countedNote,
    readNote,
    shortfallNote,
    notATreatmentNote,
    negativeTestNote,
    serologyNote,
    apneaNote,
    infantNote,
    scopeNote,
    abnormal: classification !== 'not-met',
    bandLabel: classification === 'confirmed' ? 'Confirmed' : classification === 'probable' ? 'Probable' : 'Definition not met',
    band: action,
    detail: 'Clinical criteria: in the absence of a more likely diagnosis, a cough illness of at least two weeks with paroxysms, an inspiratory whoop, post-tussive vomiting, or apnea in an infant under one year. Confirmed by a positive culture with a cough illness of any duration, or by the clinical criteria with a positive PCR or an epidemiologic link. Probable when the clinical criteria stand alone.',
    note: PERTUSSIS_NOTE,
  };
}

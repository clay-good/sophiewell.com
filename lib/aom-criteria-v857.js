// spec-v857: the AAP criteria for acute otitis media, and the observation option.
//
// Source:
//   Lieberthal AS, Carroll AE, Chonmaitree T, et al. The diagnosis and management of acute
//   otitis media. Pediatrics. 2013;131(3):e964-e999.
//
//   DIAGNOSIS. There must be objective evidence of a middle-ear effusion, and then one of:
//     moderate to severe bulging of the drum
//     new otorrhea not from otitis externa
//     MILD bulging AND ear pain starting within 48 hours, or intense erythema
//
//   SEVERE. Moderate or severe ear pain, OR pain for 48 hours or more, OR a temperature of
//   102.2 F (39 C) or higher.
//
//   MANAGEMENT.
//     severe, any age                     antibiotics recommended
//     6-23 months, BILATERAL              antibiotics recommended, mild or not
//     6-23 months, unilateral, mild       observation is an option
//     24 months and over, mild            observation is an option
//   Observation always carries a backup prescription or a review in 48 to 72 hours.
//
// A RED DRUM IS NOT OTITIS MEDIA, AND THAT IS THE POINT OF THIS TILE. Erythema alone meets none
// of the three criteria, and the guideline says outright that the diagnosis should not be made
// without objective evidence of an effusion. A crying child has a red drum.
//
// MILD BULGING IS NOT ENOUGH ON ITS OWN. It is diagnostic only paired with recent pain or
// intense erythema.
//
// LATERALITY DECIDES THE ANSWER AT 6 TO 23 MONTHS AND NOWHERE ELSE.
//
// UNDER 6 MONTHS IS OUTSIDE THE GUIDELINE, which covers 6 months through 12 years.
//
// Pure: no DOM, no clock, no network.

export const AOM_NOTE = 'The criteria for acute otitis media (Lieberthal AS, Carroll AE, Chonmaitree T, et al, Pediatrics 2013;131(3):e964-e999) begin with objective evidence of fluid behind the eardrum. Given that, the diagnosis is made by moderate to severe bulging of the drum, by new drainage from the ear that is not from an outer-ear infection, or by mild bulging together with ear pain that started within the last 48 hours or intense redness of the drum. Redness on its own meets none of those, and the guideline says plainly that the diagnosis should not be made without objective evidence of fluid; a crying child has a red drum. Severe disease is moderate or severe ear pain, or pain lasting 48 hours or more, or a temperature of 102.2 degrees Fahrenheit, which is 39 degrees Celsius, or higher. Where the disease is severe the guideline recommends antibiotics at any age. Between 6 and 23 months it also recommends them when both ears are affected, however mild, and that is the one place where which ears are involved changes the answer. A child of 6 to 23 months with one ear affected and mild disease, and a child of 24 months or older with mild disease, may instead be observed with close follow-up, which always carries either a prescription held in reserve or a review within 48 to 72 hours. The guideline covers children from 6 months through 12 years, so below 6 months the management recommendation does not apply. It reports a published criterion and a published option. It does not prescribe and it does not select an antibiotic or a dose.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

const FEVER_F = 102.2;

export function aomCriteria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const ageMonths = num(o.ageMonths);
  // spec-v930: a blank select is not a chosen option. An empty string is a string, so it
  // reached the comparisons below as a value nobody picked.
  const bulging = typeof o.bulging === 'string' && o.bulging.trim() !== '' ? o.bulging : 'none';
  const otorrhea = truthy(o.otorrhea);
  const recentPain = truthy(o.recentPain);
  const erythema = truthy(o.intenseErythema);
  const effusionSeen = truthy(o.effusion);
  const bilateral = truthy(o.bilateral);
  const severePain = truthy(o.moderateOrSeverePain);
  const painFortyEight = truthy(o.painFortyEightHours);
  const tempF = num(o.temperatureF);

  if (ageMonths !== null && (ageMonths < 0 || ageMonths > 216)) {
    return { valid: false, message: 'The age is outside a plausible range of 0 to 216 months.' };
  }
  if (tempF !== null && (tempF < 90 || tempF > 110)) {
    return { valid: false, message: 'The temperature is outside a plausible range of 90 to 110 degrees Fahrenheit.' };
  }
  if (!['none', 'mild', 'moderate-severe'].includes(bulging)) {
    return { valid: false, message: 'Bulging has to be none, mild, or moderate to severe.' };
  }

  // Drainage from the middle ear is itself objective evidence of an effusion.
  const effusion = effusionSeen || otorrhea;

  const bulgingRoute = bulging === 'moderate-severe';
  const otorrheaRoute = otorrhea;
  const mildRoute = bulging === 'mild' && (recentPain || erythema);
  const anyRoute = bulgingRoute || otorrheaRoute || mildRoute;
  const diagnosed = effusion && anyRoute;

  const severe = severePain || painFortyEight || (tempF !== null && tempF >= FEVER_F);
  const severeReasons = [];
  if (severePain) severeReasons.push('moderate or severe ear pain');
  if (painFortyEight) severeReasons.push('pain lasting 48 hours or more');
  if (tempF !== null && tempF >= FEVER_F) severeReasons.push(`a temperature of ${tempF} degrees Fahrenheit`);

  const met = [];
  if (bulgingRoute) met.push('moderate to severe bulging of the drum');
  if (otorrheaRoute) met.push('new drainage from the ear');
  if (mildRoute) met.push(`mild bulging with ${recentPain ? 'ear pain that started within 48 hours' : 'intense redness of the drum'}`);

  let route = null;
  let management = null;
  let outOfScope = false;
  if (diagnosed) {
    if (ageMonths === null) {
      management = 'Enter the age in months. Which management route applies turns on it, and between 6 and 23 months it also turns on whether both ears are affected.';
    } else if (ageMonths < 6) {
      outOfScope = true;
      management = 'This guideline covers children from 6 months through 12 years, so its management recommendation does not apply below 6 months. The diagnostic finding above stands; the decision does not come from this guideline.';
    } else if (severe) {
      route = 'antibiotics';
      management = `The guideline recommends antibiotics: the disease is severe on ${severeReasons.join(' and ')}. Observation is not offered for severe disease at any age.`;
    } else if (ageMonths < 24 && bilateral) {
      route = 'antibiotics';
      management = 'The guideline recommends antibiotics: between 6 and 23 months, both ears affected calls for them however mild the illness is. This is the one place where which ears are involved changes the answer.';
    } else if (ageMonths < 24) {
      route = 'observation-option';
      management = 'Observation with close follow-up is an option: this child is 6 to 23 months old with one ear affected and mild disease. If observation is chosen it carries either a prescription held in reserve or a review within 48 to 72 hours.';
    } else {
      route = 'observation-option';
      management = 'Observation with close follow-up is an option: this child is 24 months or older with mild disease, one ear or both. If observation is chosen it carries either a prescription held in reserve or a review within 48 to 72 hours.';
    }
  }

  // The error this tile exists to prevent: a red drum called an ear infection.
  let notMetReason = null;
  if (!diagnosed) {
    if (!effusion) {
      notMetReason = 'There is no objective evidence of fluid behind the eardrum, and the guideline says the diagnosis should not be made without it. Redness on its own meets none of the three criteria, and a crying child has a red drum.';
    } else if (bulging === 'mild') {
      notMetReason = 'Mild bulging is diagnostic only when it comes with ear pain that started within the last 48 hours, or with intense redness of the drum. Neither is recorded.';
    } else {
      notMetReason = 'None of the three criteria are met: moderate to severe bulging of the drum, new drainage from the ear that is not from an outer-ear infection, or mild bulging with recent pain or intense redness.';
    }
  }

  const erythemaNote = erythema && !diagnosed
    ? 'Intense redness of the drum is only ever half of the third criterion. It is never diagnostic on its own.'
    : null;

  const lateralityNote = diagnosed && ageMonths !== null && ageMonths >= 24 && bilateral && !severe
    ? 'Both ears are affected, and from 24 months that does not change the answer. Laterality removes the observation option only between 6 and 23 months.'
    : null;

  const otorrheaEffusionNote = otorrhea && !effusionSeen
    ? 'Drainage from the ear is itself objective evidence of fluid behind the drum, so the effusion requirement is met by it.'
    : null;

  const scopeNote = 'This reports a published criterion and a published option. It does not prescribe, and it does not select an antibiotic or a dose.';

  const state = diagnosed
    ? `the criteria are met on ${met.join(' and ')}${severe ? ', and the disease is severe' : ''}`
    : 'the criteria are not met';

  return {
    valid: true,
    diagnosed,
    effusion,
    severe,
    severeReasons,
    metCriteria: met,
    ageMonths,
    bilateral,
    route,
    outOfScope,
    state,
    management,
    notMetReason,
    erythemaNote,
    lateralityNote,
    otorrheaEffusionNote,
    scopeNote,
    abnormal: diagnosed,
    bandLabel: diagnosed ? (severe ? 'Criteria met, severe' : 'Criteria met') : 'Criteria not met',
    band: `Acute otitis media — ${state}.`,
    detail: 'The diagnosis needs objective evidence of fluid behind the eardrum plus one of moderate to severe bulging, new drainage from the ear not from an outer-ear infection, or mild bulging with ear pain starting within 48 hours or intense redness. Severe is moderate or severe pain, pain for 48 hours or more, or a temperature of 102.2 degrees Fahrenheit or higher. Antibiotics are recommended for severe disease at any age and between 6 and 23 months when both ears are affected; otherwise observation with close follow-up is an option from 6 months.',
    note: AOM_NOTE,
  };
}

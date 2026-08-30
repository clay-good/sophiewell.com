// spec-v896: lipid emulsion rescue for local anesthetic systemic toxicity.
//
// Source:
//   Neal JM, Neal EJ, Weinberg GL. American Society of Regional Anesthesia and Pain Medicine
//   local anesthetic systemic toxicity checklist: 2020 version.
//   Reg Anesth Pain Med. 2021;46(1):81-82.
//
//   20% lipid emulsion, by weight:
//     70 kg or more   100 mL bolus over 2 to 3 minutes, then 200 to 250 mL over 15 to 20 minutes.
//     under 70 kg     1.5 mL/kg bolus over 2 to 3 minutes, then 0.25 mL/kg per minute.
//   Re-bolus once or twice, and double the infusion rate, for persistent instability.
//   Upper limit approximately 12 mL/kg.
//
// LIPID GOES EARLY, NOT AT CARDIAC ARREST, AND THAT IS WHY THIS TILE EXISTS. The checklist starts
// lipid emulsion at the first sign of serious toxicity. Waiting for arrest is the delay the
// checklist was written to prevent.
//
// THE EPINEPHRINE DOSE IS REDUCED, NOT THE STANDARD ONE. In this arrest, boluses are 1 microgram
// per kilogram or less -- roughly a tenth of the usual dose -- because larger doses impair
// resuscitation from local anesthetic toxicity.
//
// PROPOFOL IS NOT A SUBSTITUTE FOR LIPID EMULSION. Its lipid content is far too low to matter,
// and it is harmful in a patient who is cardiovascularly unstable.
//
// VASOPRESSIN, CALCIUM CHANNEL BLOCKERS, BETA BLOCKERS AND FURTHER LOCAL ANESTHETIC ARE AVOIDED.
//
// Pure: no DOM, no clock, no network. It computes volumes from a weight; it does not prescribe.

export const LAST_NOTE = 'The 2020 checklist of the American Society of Regional Anesthesia and Pain Medicine treats local anesthetic systemic toxicity with 20 percent lipid emulsion, dosed by weight: at 70 kg or above, a 100 mL bolus over 2 to 3 minutes then 200 to 250 mL over 15 to 20 minutes; under 70 kg, a 1.5 mL per kilogram bolus then 0.25 mL per kilogram per minute. A re-bolus once or twice and a doubled infusion rate are used for persistent instability, and the upper limit is approximately 12 mL per kilogram. Four things about the checklist are worth stating plainly. Lipid goes early rather than at cardiac arrest, because the checklist starts it at the first sign of serious toxicity and waiting for arrest is the delay it was written to prevent. The epinephrine dose is reduced rather than standard: boluses are 1 microgram per kilogram or less, roughly a tenth of the usual dose, because larger doses impair resuscitation from this particular toxicity. Propofol is not a substitute for lipid emulsion, since its lipid content is far too low to matter and it is harmful in a cardiovascularly unstable patient. And vasopressin, calcium channel blockers, beta blockers and any further local anesthetic are avoided. It computes volumes from a weight against a published checklist. It does not prescribe, and it does not replace the checklist at the bedside or the help that should already have been called.';

export const WEIGHT_BREAK_KG = 70;
export const BOLUS_ML_PER_KG = 1.5;
export const INFUSION_ML_PER_KG_MIN = 0.25;
export const MAX_ML_PER_KG = 12;
export const EPI_MCG_PER_KG_MAX = 1;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const round1 = (n) => Math.round(n * 10) / 10;

export function lastLipid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const weight = num(o.weightKg);
  if (weight === null) {
    return { valid: false, message: 'Enter the patient weight in kilograms.' };
  }
  if (weight <= 0 || weight > 300) {
    return { valid: false, message: 'Enter the patient weight in kilograms, above 0 and no more than 300.' };
  }

  const heavy = weight >= WEIGHT_BREAK_KG;
  const bolusMl = heavy ? 100 : round1(BOLUS_ML_PER_KG * weight);
  const infusionText = heavy
    ? '200 to 250 mL over 15 to 20 minutes'
    : `${round1(INFUSION_ML_PER_KG_MIN * weight)} mL per minute`;
  const maxMl = round1(MAX_ML_PER_KG * weight);
  const epiMaxMcg = round1(EPI_MCG_PER_KG_MAX * weight);

  const arrest = on(o.cardiacArrest);

  const action = `20 percent lipid emulsion at ${weight} kg: a ${bolusMl} mL bolus over 2 to 3 minutes, then ${infusionText}. The upper limit is about ${maxMl} mL.`;

  // The reason the tile exists, on every result.
  const earlyNote = 'Lipid goes early, not at cardiac arrest. The checklist starts it at the first sign of serious toxicity, and waiting for arrest is the delay it was written to prevent.';

  const epinephrineNote = arrest
    ? `In this arrest the epinephrine dose is reduced: boluses of ${EPI_MCG_PER_KG_MAX} microgram per kilogram or less, so no more than about ${epiMaxMcg} micrograms here. That is roughly a tenth of the usual dose, because larger doses impair resuscitation from this toxicity.`
    : `If arrest occurs, the epinephrine dose is reduced to ${EPI_MCG_PER_KG_MAX} microgram per kilogram or less, about ${epiMaxMcg} micrograms at this weight, and not the standard dose.`;

  const avoidNote = 'Vasopressin, calcium channel blockers, beta blockers and any further local anesthetic are avoided. Propofol is not a substitute for lipid emulsion: its lipid content is far too low to matter, and it is harmful in a cardiovascularly unstable patient.';

  const persistentNote = `For persistent instability the checklist re-boluses once or twice and doubles the infusion rate, within that ${maxMl} mL upper limit.`;

  const stopNote = 'The first step is not on this page: stop injecting the local anesthetic, call for help, and get the rescue kit. Airway management with 100 percent oxygen, and benzodiazepines for seizures, come before any arithmetic here.';

  const monitorNote = 'Monitoring continues after the event: at least four to six hours after a cardiovascular event, and at least two hours after a limited event confined to the nervous system.';

  const scopeNote = 'This computes volumes from a weight against a published checklist. It does not prescribe, and it does not replace the checklist at the bedside or the help that should already have been called.';

  return {
    valid: true,
    weightKg: weight,
    bolusMl,
    infusionText,
    maxMl,
    epiMaxMcg,
    cardiacArrest: arrest,
    action,
    stopNote,
    earlyNote,
    epinephrineNote,
    avoidNote,
    persistentNote,
    monitorNote,
    scopeNote,
    abnormal: true,
    bandLabel: `${bolusMl} mL bolus`,
    band: action,
    detail: `At ${WEIGHT_BREAK_KG} kg or above: a 100 mL bolus over 2 to 3 minutes, then 200 to 250 mL over 15 to 20 minutes. Under ${WEIGHT_BREAK_KG} kg: ${BOLUS_ML_PER_KG} mL per kilogram, then ${INFUSION_ML_PER_KG_MIN} mL per kilogram per minute. Upper limit about ${MAX_ML_PER_KG} mL per kilogram. Epinephrine in arrest is reduced to ${EPI_MCG_PER_KG_MAX} microgram per kilogram or less.`,
    note: LAST_NOTE,
  };
}

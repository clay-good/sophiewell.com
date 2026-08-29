// spec-v863: the CDC blood lead reference value and what a result means against it.
//
// Source:
//   Centers for Disease Control and Prevention. Blood Lead Reference Value. Atlanta: CDC; 2021.
//   (Updated from 5 to 3.5 micrograms per deciliter on the recommendation of the Lead Exposure
//   and Prevention Advisory Committee.)
//
//     under 3.5   below the reference value
//     3.5 and up  AT OR ABOVE the reference value -- identify and remove the source
//     45 and up   the level at which chelation is considered
//     70 and up   a medical emergency
//
// THE REFERENCE VALUE IS 3.5, NOT 5, AND THAT IS WHY THIS TILE EXISTS. It was lowered in 2021.
// A result read against the old line of 5 leaves every child between 3.5 and 5 looking normal.
//
// THE REFERENCE VALUE IS NOT A SAFE LEVEL AND NOT A TREATMENT THRESHOLD. It is the 97.5th
// percentile of the blood lead distribution in young children in the United States -- a
// statistical marker for identifying children with more exposure than most. No level of lead in
// blood is known to be without effect.
//
// A CAPILLARY RESULT IS NOT A DIAGNOSIS. Lead on the skin contaminates a fingerstick, so an
// elevated capillary result is confirmed venous before it is acted on.
//
// Pure: no DOM, no clock, no network.

export const LEAD_NOTE = 'The blood lead reference value published by the Centers for Disease Control and Prevention is 3.5 micrograms per deciliter. It was lowered from 5 in 2021, so a result read against the old line leaves every child between 3.5 and 5 looking normal. Three things about it are commonly got wrong. It is not a safe level: it is the 97.5th percentile of the blood lead distribution among young children in the United States, a statistical marker for identifying the children with more exposure than most, and no level of lead in blood is known to be without effect. It is not a treatment threshold either; chelation is considered at 45 micrograms per deciliter and above, and 70 and above is a medical emergency, while everything at or above the reference value calls for finding and removing the source rather than for a drug. And a capillary result is not a diagnosis, because lead on the skin contaminates a fingerstick, so an elevated capillary result is confirmed on a venous sample before it is acted on. The value has been lowered before, from 10 to 5 and then to 3.5, and it is expected to fall again as exposure in the population falls. It reads a result against the published reference value. It does not schedule confirmatory testing, choose a chelating agent, or replace the local health department, the regional poison center, or a lead program.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const REFERENCE_VALUE = 3.5;
const CHELATION_CONSIDERED = 45;
const EMERGENCY = 70;
const OLD_REFERENCE = 5;

export function bloodLead(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const level = num(o.level);
  if (level === null) {
    return { valid: false, message: 'Enter the blood lead level in micrograms per deciliter.' };
  }
  if (level < 0 || level > 500) {
    return { valid: false, message: 'The blood lead level is outside a plausible range of 0 to 500 micrograms per deciliter.' };
  }

  const sample = o.sample === 'capillary' || o.sample === 'venous' ? o.sample : null;

  const atOrAbove = level >= REFERENCE_VALUE;
  const emergency = level >= EMERGENCY;
  const chelationRange = level >= CHELATION_CONSIDERED;

  const state = emergency
    ? `${level} micrograms per deciliter, a medical emergency`
    : chelationRange
      ? `${level} micrograms per deciliter, in the range where chelation is considered`
      : atOrAbove
        ? `${level} micrograms per deciliter, at or above the reference value of ${REFERENCE_VALUE}`
        : `${level} micrograms per deciliter, below the reference value of ${REFERENCE_VALUE}`;

  // The band the old line hides. This is the reason the tile exists.
  const loweredNote = atOrAbove && level < OLD_REFERENCE
    ? `A level of ${level} is at or above the reference value of ${REFERENCE_VALUE} and below the old line of ${OLD_REFERENCE}. Read against the value in use before 2021 this would have looked normal. That whole band is what the change was made to find.`
    : null;

  const notSafeNote = 'The reference value is not a safe level. It is the 97.5th percentile of the blood lead distribution among young children in the United States, which makes it a marker for identifying the children with more exposure than most. No level of lead in blood is known to be without effect.';

  const actionNote = emergency
    ? `A level of ${level} is at or above ${EMERGENCY} and is treated as a medical emergency. Contact the regional poison center and arrange care immediately.`
    : chelationRange
      ? `A level of ${level} is at or above ${CHELATION_CONSIDERED}, the level at which chelation is considered. That decision is made with a specialist, not from a number alone.`
      : atOrAbove
        ? 'At or above the reference value the response is to find and remove the source of the exposure. It is not a threshold for a drug.'
        : 'Below the reference value the response is still prevention: no level of lead in blood is known to be without effect, and a result below the value does not mean there is no exposure.';

  const capillaryNote = sample === 'capillary' && atOrAbove
    ? 'This is a capillary result. Lead on the skin contaminates a fingerstick, so an elevated capillary result is confirmed on a venous sample before it is acted on.'
    : sample === null && atOrAbove
      ? 'The sample type was not entered. An elevated capillary result is confirmed on a venous sample before it is acted on, because lead on the skin contaminates a fingerstick.'
      : null;

  const historyNote = 'The reference value has been lowered before, from 10 to 5 and then to 3.5 in 2021, and it falls as exposure in the population falls. Check that the value a result is being read against is the current one.';

  const scopeNote = 'This reads a result against the published reference value. It does not schedule confirmatory testing, choose a chelating agent, or replace the local health department, the regional poison center, or a lead program.';

  return {
    valid: true,
    level,
    sample,
    referenceValue: REFERENCE_VALUE,
    atOrAbove,
    chelationRange,
    emergency,
    state,
    loweredNote,
    notSafeNote,
    actionNote,
    capillaryNote,
    historyNote,
    scopeNote,
    abnormal: atOrAbove,
    bandLabel: emergency ? 'Medical emergency' : chelationRange ? 'Chelation considered' : atOrAbove ? 'At or above the reference value' : 'Below the reference value',
    band: `Blood lead ${state}.`,
    detail: `The reference value is ${REFERENCE_VALUE} micrograms per deciliter, lowered from ${OLD_REFERENCE} in 2021. At or above it, the response is to find and remove the source. Chelation is considered at ${CHELATION_CONSIDERED} and above, and ${EMERGENCY} and above is a medical emergency.`,
    note: LEAD_NOTE,
  };
}

// spec-v903: the cuff leak test before extubation.
//
// Source:
//   Girard TD, Alhazzani W, Kress JP, et al. An Official American Thoracic Society/American
//   College of Chest Physicians Clinical Practice Guideline: Liberation from Mechanical
//   Ventilation in Critically Ill Adults. Rehabilitation Protocols, Ventilator Liberation
//   Protocols, and Cuff Leak Tests. Am J Respir Crit Care Med. 2017;195(1):120-133.
//
//   The leak volume is the difference between the inspired tidal volume with the cuff up and the
//   averaged expired tidal volume over several breaths with the cuff down. A small leak suggests
//   laryngeal edema. Two thresholds are in common use and the guideline does not fix one:
//   an absolute leak under 110 mL, and a leak under 10 to 15 percent of the inspired volume.
//
// THE GUIDELINE RECOMMENDS THE TEST ONLY IN PATIENTS AT HIGH RISK OF POST-EXTUBATION STRIDOR, AND
// THAT IS WHY THIS TILE EXISTS. Performed on everybody it delays extubations that did not need
// delaying, because most patients who fail it never develop stridor.
//
// A FAILED TEST IS NOT AN INSTRUCTION TO KEEP THE TUBE IN. For a patient who fails and is
// otherwise ready, the guideline suggests systemic steroids at least four hours before
// extubation, and extubation need not be deferred beyond that.
//
// THE POSITIVE PREDICTIVE VALUE IS POOR. A small leak raises the probability of stridor; it does
// not establish it, and a normal leak does not exclude it either.
//
// THE THRESHOLD IS NOT SETTLED. Both the absolute and the percentage cutoffs are in use, and this
// reports against both rather than choosing.
//
// Pure: no DOM, no clock, no network.

export const CUFF_LEAK_NOTE = 'The cuff leak test estimates the volume that escapes around a deflated endotracheal tube cuff, as the difference between the inspired tidal volume with the cuff up and the averaged expired volume with the cuff down. A small leak suggests laryngeal edema. Two thresholds are in common use and the 2017 liberation guideline does not fix one: an absolute leak under 110 mL, and a leak under 10 to 15 percent of the inspired volume. Four things about the test are worth stating plainly. The guideline recommends performing it only in patients at high risk of post-extubation stridor, because performed on everybody it delays extubations that did not need delaying. A failed test is not an instruction to keep the tube in: for a patient who fails and is otherwise ready, the guideline suggests systemic steroids at least four hours before extubation, and extubation need not be deferred beyond that. The positive predictive value is poor, so a small leak raises the probability of stridor without establishing it, and a normal leak does not exclude it. And the threshold is not settled, so this reports against both the absolute and the percentage cutoff rather than choosing between them. It computes a published comparison from two volumes already measured. It does not decide whether to extubate.';

export const ABSOLUTE_ML = 110;
export const PERCENT_LOW = 10;
export const PERCENT_HIGH = 15;
export const STEROID_HOURS = 4;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const round1 = (n) => Math.round(n * 10) / 10;

export function cuffLeak(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const inspired = num(o.inspiredMl);
  const expired = num(o.expiredCuffDownMl);
  const highRisk = on(o.highRisk);

  for (const [label, v] of [['inspired tidal volume', inspired], ['averaged expired volume with the cuff down', expired]]) {
    if (v !== null && (v < 0 || v > 2000)) {
      return { valid: false, message: `Enter the ${label} in mL, between 0 and 2000.` };
    }
  }
  if (inspired === null || expired === null) {
    return { valid: false, message: 'Enter the inspired tidal volume and the averaged expired volume with the cuff down, both in mL.' };
  }
  if (expired > inspired) {
    return { valid: false, message: 'The expired volume with the cuff down is larger than the inspired volume, which cannot produce a leak. Check which value went in which field.' };
  }

  const leakMl = round1(inspired - expired);
  const leakPercent = inspired > 0 ? round1((leakMl / inspired) * 100) : null;

  const failsAbsolute = leakMl < ABSOLUTE_ML;
  const failsPercentLow = leakPercent !== null && leakPercent < PERCENT_LOW;
  const failsPercentHigh = leakPercent !== null && leakPercent < PERCENT_HIGH;

  const agreement = failsAbsolute === failsPercentHigh ? 'agree' : 'disagree';

  const action = `A leak of ${leakMl} mL, ${leakPercent} percent of the inspired volume. Against the absolute cutoff of ${ABSOLUTE_ML} mL this is ${failsAbsolute ? 'a small leak' : 'not a small leak'}; against the ${PERCENT_LOW} to ${PERCENT_HIGH} percent cutoff it is ${failsPercentLow ? 'a small leak' : failsPercentHigh ? 'small by the 15 percent line and not by the 10 percent one' : 'not a small leak'}.`;

  // The reason the tile exists, on every result.
  const whoToTestNote = highRisk
    ? 'Recorded as a high-risk patient, which is the group the guideline recommends testing. Performed on everybody the test delays extubations that did not need delaying.'
    : 'The guideline recommends this test only in patients at high risk of post-extubation stridor, and high risk is not recorded here. Performed on everybody it delays extubations that did not need delaying, because most patients who fail it never develop stridor.';

  const failNote = failsAbsolute || failsPercentHigh
    ? `A small leak is not an instruction to keep the tube in. For a patient who fails and is otherwise ready, the guideline suggests systemic steroids at least ${STEROID_HOURS} hours before extubation, and extubation need not be deferred beyond that.`
    : null;

  const predictiveNote = 'The positive predictive value is poor. A small leak raises the probability of post-extubation stridor without establishing it, and a normal leak does not exclude it.';

  const thresholdNote = agreement === 'disagree'
    ? `The two cutoffs disagree at this value, which is the point of reporting both: the guideline does not fix one, and neither is offered here as the answer.`
    : `Both cutoffs agree at this value. They do not always: the guideline does not fix one, which is why both are reported.`;

  const techniqueNote = 'The expired volume is averaged over several breaths rather than taken from one, and secretions, tube size and patient effort all move it. A single discordant breath is not a result.';

  const scopeNote = 'This computes a published comparison from two volumes already measured. It does not decide whether to extubate.';

  return {
    valid: true,
    inspiredMl: inspired,
    expiredCuffDownMl: expired,
    leakMl,
    leakPercent,
    failsAbsolute,
    failsPercentLow,
    failsPercentHigh,
    agreement,
    highRisk,
    action,
    whoToTestNote,
    failNote,
    predictiveNote,
    thresholdNote,
    techniqueNote,
    scopeNote,
    abnormal: failsAbsolute || failsPercentHigh,
    bandLabel: failsAbsolute && failsPercentHigh ? 'Small leak by both cutoffs' : failsAbsolute || failsPercentHigh ? 'Small leak by one cutoff' : 'Leak above both cutoffs',
    band: action,
    detail: `The leak volume is the inspired tidal volume minus the averaged expired volume with the cuff down. A leak under ${ABSOLUTE_ML} mL, or under ${PERCENT_LOW} to ${PERCENT_HIGH} percent of the inspired volume, is the commonly used definition of a small leak. The guideline recommends the test only in patients at high risk of post-extubation stridor.`,
    note: CUFF_LEAK_NOTE,
  };
}

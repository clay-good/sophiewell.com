// spec-v880: the EWGSOP2 diagnostic algorithm for sarcopenia.
//
// Source:
//   Cruz-Jentoft AJ, Bahat G, Bauer J, et al. Sarcopenia: revised European consensus on
//   definition and diagnosis. Age Ageing. 2019;48(1):16-31.
//
//   Find      SARC-F at 4 or more, or clinical suspicion.
//   Assess    low muscle STRENGTH: grip strength below 27 kg in men or 16 kg in women, or five
//             chair rises taking more than 15 seconds. Low strength alone is PROBABLE sarcopenia.
//   Confirm   low muscle QUANTITY or quality: appendicular skeletal muscle mass below 20 kg in
//             men or 15 kg in women, or an index below 7.0 in men or 5.5 in women kg per square
//             meter. Strength plus quantity is CONFIRMED sarcopenia.
//   Severity  low physical PERFORMANCE: gait speed at or below 0.8 meters per second, a Short
//             Physical Performance Battery at or below 8, a Timed Up and Go at or above 20
//             seconds, or failure of a 400 meter walk. That grades it SEVERE.
//
// STRENGTH COMES FIRST, NOT MASS, AND THAT IS WHY THIS TILE EXISTS. The 2019 revision moved
// strength ahead of muscle mass deliberately; the 2010 consensus led with mass. Low strength on
// its own is probable sarcopenia, and EWGSOP2 says intervention can begin there without waiting
// for imaging.
//
// PERFORMANCE GRADES SEVERITY, IT DOES NOT DIAGNOSE. A slow gait speed with normal strength is
// not sarcopenia by this algorithm, however much it matters clinically.
//
// EVERY CUTOFF IS SEX-SPECIFIC. Reading a woman against the men's grip threshold is the easy
// error, so the tile states which set it used.
//
// Pure: no DOM, no clock, no network.

export const EWGSOP2_NOTE = 'The EWGSOP2 algorithm (Cruz-Jentoft and colleagues, Age and Ageing, 2019) finds, assesses, confirms and grades sarcopenia. Low muscle strength is a grip strength below 27 kg in men or 16 kg in women, or five chair rises taking more than 15 seconds, and low strength on its own is probable sarcopenia. Low muscle quantity is an appendicular skeletal muscle mass below 20 kg in men or 15 kg in women, or an index below 7.0 in men or 5.5 in women kg per square meter, and strength together with quantity is confirmed sarcopenia. Low physical performance is a gait speed at or below 0.8 meters per second, a Short Physical Performance Battery at or below 8, a Timed Up and Go at or above 20 seconds, or failure of a 400 meter walk, and that grades the sarcopenia as severe. Three things about the algorithm are worth stating plainly. Strength comes first and not mass: the 2019 revision moved strength ahead of muscle mass deliberately, where the 2010 consensus led with mass, and probable sarcopenia on low strength alone is enough for intervention to begin without waiting for imaging. Performance grades severity rather than diagnosing, so a slow gait speed with normal strength is not sarcopenia by this algorithm however much it matters clinically. And every cutoff is sex-specific, so reading a woman against the threshold for men is the easy error. It applies a published algorithm to measurements already taken. It does not decide treatment.';

export const CUTOFFS = {
  male: { grip: 27, asm: 20, asmi: 7.0 },
  female: { grip: 16, asm: 15, asmi: 5.5 },
};
export const CHAIR_RISE_SECONDS = 15;
export const GAIT_SPEED = 0.8;
export const SPPB = 8;
export const TUG_SECONDS = 20;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function ewgsop2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const sex = o.sex === 'female' ? 'female' : 'male';
  const cut = CUTOFFS[sex];

  const grip = num(o.gripStrength);
  const chairRise = num(o.chairRiseSeconds);
  const asm = num(o.asm);
  const asmi = num(o.asmi);
  const gait = num(o.gaitSpeed);
  const sppb = num(o.sppb);
  const tug = num(o.tugSeconds);

  for (const [label, v, lo, hi] of [
    ['grip strength in kg', grip, 0, 150],
    ['five chair rises in seconds', chairRise, 0, 300],
    ['appendicular skeletal muscle mass in kg', asm, 0, 100],
    ['muscle mass index in kg per square meter', asmi, 0, 30],
    ['gait speed in meters per second', gait, 0, 5],
    ['Short Physical Performance Battery score', sppb, 0, 12],
    ['Timed Up and Go in seconds', tug, 0, 300],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const lowStrength = (grip !== null && grip < cut.grip) || (chairRise !== null && chairRise > CHAIR_RISE_SECONDS);
  const lowQuantity = (asm !== null && asm < cut.asm) || (asmi !== null && asmi < cut.asmi);
  const lowPerformance = (gait !== null && gait <= GAIT_SPEED)
    || (sppb !== null && sppb <= SPPB)
    || (tug !== null && tug >= TUG_SECONDS)
    || on(o.fourHundredMeterWalkFailed);

  const stage = lowStrength && lowQuantity && lowPerformance
    ? 'severe'
    : lowStrength && lowQuantity
      ? 'confirmed'
      : lowStrength
        ? 'probable'
        : 'not-met';

  const strengthReasons = [];
  if (grip !== null && grip < cut.grip) strengthReasons.push(`a grip strength of ${grip} kg, below the ${sex === 'male' ? 'male' : 'female'} cutoff of ${cut.grip}`);
  if (chairRise !== null && chairRise > CHAIR_RISE_SECONDS) strengthReasons.push(`five chair rises in ${chairRise} seconds, above ${CHAIR_RISE_SECONDS}`);

  const action = {
    severe: `Severe sarcopenia: low strength (${strengthReasons.join('; ')}), low muscle quantity, and low physical performance.`,
    confirmed: `Confirmed sarcopenia: low strength (${strengthReasons.join('; ')}) with low muscle quantity. Performance is what would grade it severe, and it is not low here.`,
    probable: `Probable sarcopenia: low strength (${strengthReasons.join('; ')}). This is a working diagnosis, and EWGSOP2 says intervention can begin here without waiting for a muscle-mass measurement.`,
    'not-met': lowQuantity || lowPerformance
      ? 'Sarcopenia is not met. Muscle strength is the entry criterion, and it is not low here: low mass or low performance without low strength does not diagnose sarcopenia by this algorithm.'
      : 'Sarcopenia is not met by what was entered. The algorithm starts with muscle strength.',
  }[stage];

  // The reason the tile exists, on every result.
  const strengthFirstNote = 'Strength comes first, not mass. The 2019 revision moved strength ahead of muscle mass deliberately, where the 2010 consensus led with mass. Nothing downstream is read until strength is low.';

  const probableNote = stage === 'probable'
    ? 'Probable sarcopenia is actionable. Confirmation needs a muscle-mass measurement, and EWGSOP2 says that in practice intervention need not wait for it.'
    : null;

  const performanceNote = 'Physical performance grades severity; it does not diagnose. A slow gait speed with normal strength is not sarcopenia by this algorithm, however much it matters clinically.';

  const sexNote = `Read against the ${sex === 'male' ? 'male' : 'female'} cutoffs: grip below ${cut.grip} kg, appendicular muscle mass below ${cut.asm} kg, index below ${cut.asmi} kg per square meter. Every cutoff in this algorithm is sex-specific.`;

  const findNote = 'The case-finding step is SARC-F at 4 or more, or clinical suspicion. It is a prompt to measure, not part of the diagnosis.';

  const recordedNote = `Recorded: grip ${grip === null ? 'not entered' : `${grip} kg`}, chair rises ${chairRise === null ? 'not entered' : `${chairRise} s`}, muscle mass ${asm === null ? 'not entered' : `${asm} kg`}, index ${asmi === null ? 'not entered' : asmi}.`;

  const scopeNote = 'This applies a published algorithm to measurements already taken. It does not decide treatment.';

  return {
    valid: true,
    stage,
    sex,
    lowStrength,
    lowQuantity,
    lowPerformance,
    cutoffs: cut,
    action,
    recordedNote,
    strengthFirstNote,
    probableNote,
    performanceNote,
    sexNote,
    findNote,
    scopeNote,
    abnormal: stage !== 'not-met',
    bandLabel: {
      severe: 'Severe sarcopenia',
      confirmed: 'Confirmed sarcopenia',
      probable: 'Probable sarcopenia',
      'not-met': 'Not met',
    }[stage],
    band: action,
    detail: `Low muscle strength is a grip below ${CUTOFFS.male.grip} kg in men or ${CUTOFFS.female.grip} kg in women, or five chair rises above ${CHAIR_RISE_SECONDS} seconds, and alone it is probable sarcopenia. Adding low muscle quantity confirms it. Adding low physical performance, a gait speed at or below ${GAIT_SPEED} meters per second, a battery score at or below ${SPPB}, a Timed Up and Go at or above ${TUG_SECONDS} seconds, or a failed 400 meter walk, grades it severe.`,
    note: EWGSOP2_NOTE,
  };
}

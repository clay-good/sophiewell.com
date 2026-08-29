// spec-v876: the NHSN ventilator-associated event (VAE) algorithm.
//
// Source:
//   CDC National Healthcare Safety Network. Ventilator-Associated Event (VAE) Protocol.
//   NHSN Patient Safety Component Manual, Chapter 10.
//
//   VAC  after at least two calendar days of stable or decreasing daily minimum FiO2 and PEEP,
//        a rise in the DAILY MINIMUM FiO2 of at least 20 points, or in the DAILY MINIMUM PEEP of
//        at least 3 cmH2O, sustained for at least two calendar days.
//   IVAC VAC, plus a temperature above 100.4 F or below 96.8 F, or a white cell count at or above
//        12,000 or at or below 4,000 per cubic millimeter; and a NEW antimicrobial started and
//        continued for at least four calendar days.
//   PVAP IVAC plus a qualifying microbiological criterion.
//
// NHSN REPLACED VENTILATOR-ASSOCIATED PNEUMONIA WITH THIS, AND THAT IS WHY THIS TILE EXISTS. The
// algorithm uses NO CHEST RADIOGRAPH and no clinical judgment at any step. It was built that way
// on purpose, because the old pneumonia definition could not be applied consistently.
//
// THE THRESHOLDS ARE ON THE DAILY MINIMUM, not on any value recorded that day. A transient spike
// during a turn or a suction does not start a VAE.
//
// PEEP VALUES BELOW 5 ARE TREATED AS 5 in the comparison. Without that floor a change from 0 to 3
// would look like a qualifying rise, and it is not one.
//
// A STABILITY PERIOD IS REQUIRED. Without at least two calendar days of stable or decreasing
// daily minimums there is no baseline, and therefore no event, however sick the patient becomes.
//
// PVAP IS "POSSIBLE VAP". It is a surveillance tier, not a diagnosis of pneumonia.
//
// Pure: no DOM, no clock, no network.

export const VAE_NOTE = 'The NHSN ventilator-associated event algorithm has three nested tiers. A ventilator-associated condition is, after at least two calendar days of stable or decreasing daily minimum settings, a rise in the daily minimum FiO2 of at least 20 points or in the daily minimum PEEP of at least 3 cmH2O, sustained for at least two calendar days. An infection-related ventilator-associated complication is that condition plus a temperature above 100.4 F or below 96.8 F, or a white cell count at or above 12,000 or at or below 4,000 per cubic millimeter, together with a new antimicrobial started and continued for at least four calendar days. Possible ventilator-associated pneumonia is that complication plus a qualifying microbiological criterion. Four things about the algorithm are worth stating plainly. NHSN replaced ventilator-associated pneumonia with it for adult surveillance, and it uses no chest radiograph and no clinical judgment at any step, deliberately, because the old pneumonia definition could not be applied consistently. The thresholds are on the daily minimum rather than on any value recorded that day, so a transient rise during a turn or a suction does not start an event. PEEP values below 5 are treated as 5 in the comparison, because without that floor a change from 0 to 3 would look like a qualifying rise. And a stability period is required: without at least two calendar days of stable or decreasing daily minimums there is no baseline and therefore no event, however sick the patient becomes. It applies a published surveillance algorithm to values already recorded. It does not diagnose pneumonia, and it does not decide whether to treat.';

export const FIO2_RISE_POINTS = 20;
export const PEEP_RISE_CMH2O = 3;
export const PEEP_FLOOR = 5;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function nhsnVae(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const baseFio2 = num(o.baselineFio2);
  const eventFio2 = num(o.eventFio2);
  const basePeep = num(o.baselinePeep);
  const eventPeep = num(o.eventPeep);

  for (const [label, v, lo, hi] of [
    ['baseline daily minimum FiO2', baseFio2, 21, 100],
    ['event daily minimum FiO2', eventFio2, 21, 100],
    ['baseline daily minimum PEEP', basePeep, 0, 40],
    ['event daily minimum PEEP', eventPeep, 0, 40],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  const stability = on(o.stabilityPeriod);
  const sustained = on(o.sustainedTwoDays);

  const fio2Rise = baseFio2 !== null && eventFio2 !== null ? eventFio2 - baseFio2 : null;
  // The floor is the point of the rule: without it a 0 to 3 change reads as qualifying.
  const flooredBase = basePeep === null ? null : Math.max(basePeep, PEEP_FLOOR);
  const flooredEvent = eventPeep === null ? null : Math.max(eventPeep, PEEP_FLOOR);
  const peepRise = flooredBase !== null && flooredEvent !== null ? flooredEvent - flooredBase : null;

  const fio2Qualifies = fio2Rise !== null && fio2Rise >= FIO2_RISE_POINTS;
  const peepQualifies = peepRise !== null && peepRise >= PEEP_RISE_CMH2O;
  const oxygenationQualifies = fio2Qualifies || peepQualifies;

  const vac = stability && sustained && oxygenationQualifies;
  const inflammation = on(o.temperatureAbnormal) || on(o.whiteCountAbnormal);
  const antimicrobial = on(o.newAntimicrobialFourDays);
  const ivac = vac && inflammation && antimicrobial;
  const pvap = ivac && on(o.microbiologicalCriterion);

  const tier = pvap ? 'pvap' : ivac ? 'ivac' : vac ? 'vac' : 'none';

  const routes = [];
  if (fio2Qualifies) routes.push(`a daily minimum FiO2 rise of ${fio2Rise} points`);
  if (peepQualifies) routes.push(`a daily minimum PEEP rise of ${peepRise} cmH2O after the floor of ${PEEP_FLOOR} is applied`);

  const action = {
    pvap: `Possible ventilator-associated pneumonia, on ${routes.join(' and ')} with the inflammation, antimicrobial and microbiological criteria met.`,
    ivac: `Infection-related ventilator-associated complication, on ${routes.join(' and ')} with the inflammation and antimicrobial criteria met.`,
    vac: `Ventilator-associated condition, on ${routes.join(' and ')}.`,
    none: 'No ventilator-associated event is met by what was entered.',
  }[tier];

  const missing = [];
  if (tier === 'none') {
    if (!stability) missing.push('no stability period of at least two calendar days of stable or decreasing daily minimums is recorded, and without one there is no baseline');
    if (!oxygenationQualifies) {
      missing.push(fio2Rise === null && peepRise === null
        ? 'no daily minimum settings are entered'
        : `the rise is ${fio2Rise === null ? 'unknown' : `${fio2Rise} points of FiO2`} and ${peepRise === null ? 'unknown' : `${peepRise} cmH2O of PEEP`}, against thresholds of ${FIO2_RISE_POINTS} and ${PEEP_RISE_CMH2O}`);
    }
    if (stability && oxygenationQualifies && !sustained) missing.push('the rise is not recorded as sustained for at least two calendar days');
  }
  const missingNote = missing.length ? `Why: ${missing.join('; ')}.` : null;

  // The reason the tile exists, on every result.
  const noRadiographNote = 'NHSN replaced ventilator-associated pneumonia with this algorithm for adult surveillance. It uses no chest radiograph and no clinical judgment at any step, deliberately, because the old definition could not be applied consistently.';

  const dailyMinimumNote = 'Every threshold here is on the daily minimum, not on any value recorded that day. A transient rise during a turn or a suction does not start an event.';

  const peepFloorNote = (basePeep !== null && basePeep < PEEP_FLOOR) || (eventPeep !== null && eventPeep < PEEP_FLOOR)
    ? `A PEEP below ${PEEP_FLOOR} is treated as ${PEEP_FLOOR} in the comparison, so the values used here are ${flooredBase === null ? 'unknown' : flooredBase} and ${flooredEvent === null ? 'unknown' : flooredEvent}. Without that floor a change from 0 to 3 would read as a qualifying rise, and it is not one.`
    : null;

  const nextTierNote = tier === 'vac'
    ? 'The next tier needs both an inflammation criterion, a temperature or white count outside the stated bounds, and a NEW antimicrobial started and continued for at least four calendar days. Any antibiotic already running does not count.'
    : null;

  const pvapNote = tier === 'pvap'
    ? 'Possible ventilator-associated pneumonia is a surveillance tier, not a diagnosis of pneumonia. The word possible is doing work in it.'
    : null;

  const scopeNote = 'This applies a published surveillance algorithm to values already recorded. It does not diagnose pneumonia, and it does not decide whether to treat.';

  return {
    valid: true,
    tier,
    vac,
    ivac,
    pvap,
    fio2Rise,
    peepRise,
    flooredBaselinePeep: flooredBase,
    flooredEventPeep: flooredEvent,
    fio2Qualifies,
    peepQualifies,
    action,
    missingNote,
    noRadiographNote,
    dailyMinimumNote,
    peepFloorNote,
    nextTierNote,
    pvapNote,
    scopeNote,
    abnormal: tier !== 'none',
    bandLabel: {
      pvap: 'PVAP, possible ventilator-associated pneumonia',
      ivac: 'IVAC, infection-related complication',
      vac: 'VAC, ventilator-associated condition',
      none: 'No ventilator-associated event',
    }[tier],
    band: action,
    detail: `A ventilator-associated condition is, after at least two calendar days of stable or decreasing daily minimums, a rise of at least ${FIO2_RISE_POINTS} points in daily minimum FiO2 or at least ${PEEP_RISE_CMH2O} cmH2O in daily minimum PEEP, sustained two calendar days. Adding an abnormal temperature or white count with a new antimicrobial continued four days makes it infection-related; adding a qualifying microbiological result makes it possible pneumonia.`,
    note: VAE_NOTE,
  };
}

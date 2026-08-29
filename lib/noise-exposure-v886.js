// spec-v886: allowable occupational noise exposure under the NIOSH and OSHA limits.
//
// Sources:
//   NIOSH. Criteria for a Recommended Standard: Occupational Noise Exposure, Revised Criteria
//   1998. DHHS (NIOSH) Publication No. 98-126.
//   Occupational Safety and Health Administration. Occupational noise exposure.
//   29 CFR 1910.95.
//
//   NIOSH recommended exposure limit: 85 dBA for 8 hours, with a 3 dB exchange rate.
//     allowable minutes = 480 / 2 ^ ((L - 85) / 3)
//   OSHA permissible exposure limit: 90 dBA for 8 hours, with a 5 dB exchange rate.
//     allowable hours = 8 / 2 ^ ((L - 90) / 5)
//   OSHA action level: an 8-hour time-weighted average of 85 dBA, at which a hearing
//   conservation program is required.
//
// THE TWO STANDARDS USE DIFFERENT EXCHANGE RATES, AND THAT IS WHY THIS TILE EXISTS. The same
// measured level gives very different allowable durations: 100 dBA is fifteen minutes under NIOSH
// and two hours under OSHA. Neither number is quoted here as the answer, and a workplace that
// meets the legal limit may be well past the health-based one.
//
// THE OSHA LIMIT IS A LEGAL CEILING, NOT A SAFETY THRESHOLD. The NIOSH figure is the health-based
// recommendation, and the gap between them is the point.
//
// A HEARING PROTECTOR'S RATING MUST BE DERATED. OSHA's method for an A-weighted measurement is
// (NRR - 7) / 2, so a protector labeled 33 dB is credited with 13 dB, not 33.
//
// Pure: no DOM, no clock, no network.

export const NOISE_NOTE = 'Occupational noise exposure is judged against two limits that do not agree. The NIOSH recommended exposure limit is 85 dBA for eight hours with a 3 dB exchange rate, so the allowable time is 480 divided by 2 raised to the level minus 85 over 3, in minutes. The OSHA permissible exposure limit is 90 dBA for eight hours with a 5 dB exchange rate, so the allowable time is 8 divided by 2 raised to the level minus 90 over 5, in hours; OSHA also sets an action level of an 85 dBA eight-hour average, at which a hearing conservation program is required. Three things about them are worth stating plainly. The two standards use different exchange rates, so the same measured level gives very different allowable durations, and 100 dBA is fifteen minutes under NIOSH and two hours under OSHA; neither is quoted here as the answer, and a workplace that meets the legal limit may be well past the health-based one. The OSHA limit is a legal ceiling rather than a safety threshold, and the NIOSH figure is the health-based recommendation, so the gap between them is the point rather than a rounding difference. And a hearing protector rating must be derated: the OSHA method for an A-weighted measurement is the noise reduction rating minus 7, divided by 2, so a protector labeled 33 dB is credited with 13 dB and not 33. It computes published limits from a measured level. It does not certify compliance, and it does not select hearing protection.';

export const NIOSH_LIMIT_DBA = 85;
export const NIOSH_EXCHANGE_DB = 3;
export const OSHA_LIMIT_DBA = 90;
export const OSHA_EXCHANGE_DB = 5;
export const OSHA_ACTION_LEVEL_DBA = 85;

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const round1 = (n) => Math.round(n * 10) / 10;

function readableTime(minutes) {
  if (minutes >= 60 * 24) return 'more than a day';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes - h * 60);
    return m ? `${h} h ${m} min` : `${h} h`;
  }
  if (minutes >= 1) return `${round1(minutes)} min`;
  return `${Math.round(minutes * 60)} s`;
}

export function noiseExposure(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const level = num(o.levelDba);
  const hours = num(o.exposureHours);
  const nrr = num(o.protectorNrr);

  for (const [label, v, lo, hi] of [
    ['measured level in dBA', level, 40, 140],
    ['exposure duration in hours', hours, 0, 24],
    ['hearing protector noise reduction rating in dB', nrr, 0, 40],
  ]) {
    if (v !== null && (v < lo || v > hi)) {
      return { valid: false, message: `Enter the ${label} between ${lo} and ${hi}.` };
    }
  }

  if (level === null) {
    return { valid: false, message: 'Enter the measured sound level in dBA.' };
  }

  // OSHA's derating method for an A-weighted measurement.
  const derated = nrr === null ? null : Math.max(0, round1((nrr - 7) / 2));
  const effective = derated === null ? level : round1(Math.max(0, level - derated));

  const nioshMinutes = 480 / Math.pow(2, (effective - NIOSH_LIMIT_DBA) / NIOSH_EXCHANGE_DB);
  const oshaMinutes = 480 / Math.pow(2, (effective - OSHA_LIMIT_DBA) / OSHA_EXCHANGE_DB);

  const nioshText = readableTime(nioshMinutes);
  const oshaText = readableTime(oshaMinutes);

  const overNiosh = hours !== null && hours * 60 > nioshMinutes;
  const overOsha = hours !== null && hours * 60 > oshaMinutes;

  const status = overOsha ? 'over-both' : overNiosh ? 'over-niosh-only' : hours === null ? 'no-duration' : 'within-both';

  const action = {
    'no-duration': `At ${effective} dBA${derated !== null ? ' after derating' : ''}, the allowable time is ${nioshText} under the NIOSH limit and ${oshaText} under the OSHA limit.`,
    'within-both': `At ${effective} dBA${derated !== null ? ' after derating' : ''} for ${hours} h, this is within both: NIOSH allows ${nioshText} and OSHA allows ${oshaText}.`,
    'over-niosh-only': `At ${effective} dBA${derated !== null ? ' after derating' : ''} for ${hours} h, this exceeds the NIOSH allowance of ${nioshText} while remaining within the OSHA allowance of ${oshaText}. That gap is the two standards disagreeing, not a rounding difference.`,
    'over-both': `At ${effective} dBA${derated !== null ? ' after derating' : ''} for ${hours} h, this exceeds both: NIOSH allows ${nioshText} and OSHA allows ${oshaText}.`,
  }[status];

  // The reason the tile exists, on every result.
  const exchangeRateNote = `The two standards use different exchange rates, ${NIOSH_EXCHANGE_DB} dB for NIOSH and ${OSHA_EXCHANGE_DB} dB for OSHA, on top of different limits of ${NIOSH_LIMIT_DBA} and ${OSHA_LIMIT_DBA} dBA. The same level therefore gives very different allowable durations, and neither is offered here as the answer.`;

  const ceilingNote = 'The OSHA limit is a legal ceiling, not a safety threshold. The NIOSH figure is the health-based recommendation, so a workplace that meets the law may be well past what protects hearing.';

  const actionLevelNote = effective >= OSHA_ACTION_LEVEL_DBA
    ? `An eight-hour average at or above ${OSHA_ACTION_LEVEL_DBA} dBA is the OSHA action level, at which a hearing conservation program is required. Whether the average reaches it depends on the whole day, not on this one reading.`
    : null;

  const derateNote = derated !== null
    ? `A protector rated ${nrr} dB is credited with ${derated} dB by the OSHA method for an A-weighted measurement, which is the rating minus 7, halved. The label figure is a laboratory number and is not what the field allowance uses.`
    : 'A hearing protector rating must be derated before it is credited: the OSHA method for an A-weighted measurement is the rating minus 7, halved, so a protector labeled 33 dB is worth 13 dB and not 33.';

  const cumulativeNote = 'These allowances are for the whole working day. Noise dose is cumulative across every exposure in it, not a judgment about a single reading.';

  const scopeNote = 'This computes published limits from a measured level. It does not certify compliance, and it does not select hearing protection.';

  return {
    valid: true,
    levelDba: level,
    effectiveDba: effective,
    deratedBy: derated,
    nioshMinutes: round1(nioshMinutes),
    oshaMinutes: round1(oshaMinutes),
    nioshText,
    oshaText,
    status,
    action,
    exchangeRateNote,
    ceilingNote,
    actionLevelNote,
    derateNote,
    cumulativeNote,
    scopeNote,
    abnormal: status === 'over-both' || status === 'over-niosh-only',
    bandLabel: {
      'no-duration': `NIOSH ${nioshText}, OSHA ${oshaText}`,
      'within-both': 'Within both limits',
      'over-niosh-only': 'Over the NIOSH limit only',
      'over-both': 'Over both limits',
    }[status],
    band: action,
    detail: `NIOSH allows ${NIOSH_LIMIT_DBA} dBA for eight hours with a ${NIOSH_EXCHANGE_DB} dB exchange rate; OSHA allows ${OSHA_LIMIT_DBA} dBA for eight hours with a ${OSHA_EXCHANGE_DB} dB exchange rate, and sets an action level at an eight-hour average of ${OSHA_ACTION_LEVEL_DBA} dBA. A hearing protector's rating is derated as the rating minus 7, halved.`,
    note: NOISE_NOTE,
  };
}

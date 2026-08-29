// spec-v873: the CDC recommended serologic testing algorithm for Lyme disease.
//
// Sources:
//   CDC. Recommendations for Test Performance and Interpretation from the Second National
//   Conference on Serologic Diagnosis of Lyme Disease. MMWR Morb Mortal Wkly Rep. 1995;44(31):590-591.
//   Mead P, Petersen J, Hinckley A. Updated CDC Recommendation for Serologic Diagnosis of Lyme
//   Disease. MMWR Morb Mortal Wkly Rep. 2019;68(32):703.
//
//   Standard two-tier (STTT): an enzyme immunoassay or immunofluorescence assay first. If it is
//   negative, stop -- the result is negative. If it is positive or equivocal, run an IgM and IgG
//   immunoblot as the second tier.
//   Modified two-tier (MTTT, 2019): a second, different enzyme immunoassay may replace the
//   immunoblot as the second tier. It is an equal alternative, not a lesser test.
//
// ERYTHEMA MIGRANS IS A CLINICAL DIAGNOSIS AND SHOULD NOT BE SEROLOGY-TESTED, AND THAT IS WHY
// THIS TILE EXISTS. Antibodies take weeks to appear, so a test drawn at the rash is frequently
// negative in a patient who plainly has Lyme disease, and a negative result then gets used as an
// exclusion.
//
// THE SECOND TIER IS ONLY RUN, AND ONLY INTERPRETABLE, AFTER A POSITIVE OR EQUIVOCAL FIRST TIER.
// A standalone immunoblot means nothing.
//
// AN IgM RESULT IS ONLY USABLE WITHIN 30 DAYS OF SYMPTOM ONSET. After that, IgM reactivity
// without IgG is a false positive and does not support the diagnosis.
//
// SEROLOGY DOES NOT MEASURE TREATMENT RESPONSE. Antibodies persist for years after successful
// treatment, so a repeat titer answers nothing about cure.
//
// Pure: no DOM, no clock, no network.

export const LYME_NOTE = 'The CDC recommended serologic testing algorithm for Lyme disease is two-tiered. An enzyme immunoassay or immunofluorescence assay is run first; if it is negative the result is negative and no second test is done, and if it is positive or equivocal a second tier follows. In the standard algorithm the second tier is an IgM and IgG immunoblot; the 2019 update also accepts a second, different enzyme immunoassay in its place, as an equal alternative rather than a lesser test. Four things about the algorithm are worth stating plainly. Erythema migrans is a clinical diagnosis and should not be serology-tested at all, because antibodies take weeks to appear and a test drawn at the rash is frequently negative in a patient who plainly has the disease. The second tier is only run, and only interpretable, after a positive or equivocal first tier, so a standalone immunoblot means nothing. An IgM result is usable only within thirty days of symptom onset, and after that IgM reactivity without IgG is a false positive. And serology does not measure treatment response, since antibodies persist for years after successful treatment, so a repeat titer answers nothing about cure. It applies a published testing algorithm to results already obtained. It does not diagnose Lyme disease, and it does not decide whether to treat.';

export const FIRST_TIER_RESULTS = [
  { value: 'not-done', text: 'Not done' },
  { value: 'negative', text: 'Negative' },
  { value: 'equivocal', text: 'Equivocal' },
  { value: 'positive', text: 'Positive' },
];

export const SECOND_TIER_RESULTS = [
  { value: 'not-done', text: 'Not done' },
  { value: 'negative', text: 'Negative' },
  { value: 'igm-only', text: 'IgM reactive, IgG not reactive' },
  { value: 'igg', text: 'IgG reactive' },
];

export const IGM_WINDOW_DAYS = 30;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);

export function lymeTwoTier(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const first = oneOf(FIRST_TIER_RESULTS, o.firstTier, 'not-done');
  const second = oneOf(SECOND_TIER_RESULTS, o.secondTier, 'not-done');
  const days = num(o.daysSinceOnset);
  const erythemaMigrans = on(o.erythemaMigrans);

  if (days !== null && (days < 0 || days > 3650)) {
    return { valid: false, message: 'Enter the days since symptom onset, between 0 and 3650.' };
  }

  const withinIgmWindow = days !== null && days <= IGM_WINDOW_DAYS;
  const firstReactive = first === 'positive' || first === 'equivocal';

  // An IgM-only second tier counts only inside the thirty-day window, and only when the days
  // are known. Outside it, or unknown, it does not support the diagnosis.
  const igmCounts = second === 'igm-only' && withinIgmWindow;
  const secondSupports = second === 'igg' || igmCounts;

  const result = first === 'not-done'
    ? 'no-first-tier'
    : first === 'negative'
      ? 'negative'
      : second === 'not-done'
        ? 'second-tier-pending'
        : secondSupports
          ? 'positive'
          : 'negative-second-tier';

  const action = {
    'no-first-tier': 'No first-tier result is entered. The algorithm starts with an enzyme immunoassay or immunofluorescence assay, and nothing downstream can be read without it.',
    negative: 'Negative by the algorithm. A negative first tier ends the testing: no second tier is run, and a second-tier result would not be interpretable.',
    'second-tier-pending': `${first === 'equivocal' ? 'An equivocal' : 'A positive'} first tier calls for a second tier: an IgM and IgG immunoblot, or a second, different enzyme immunoassay under the 2019 modified algorithm.`,
    positive: second === 'igg'
      ? 'Positive by the algorithm: a reactive first tier with a reactive IgG second tier.'
      : `Positive by the algorithm: a reactive first tier with a reactive IgM second tier, within ${IGM_WINDOW_DAYS} days of symptom onset.`,
    'negative-second-tier': second === 'igm-only'
      ? `Negative by the algorithm. The second tier is IgM-reactive only, and IgM is interpretable only within ${IGM_WINDOW_DAYS} days of symptom onset.`
      : 'Negative by the algorithm: a reactive first tier with a negative second tier.',
  }[result];

  // The reason the tile exists, on every result.
  const emNote = erythemaMigrans
    ? 'Erythema migrans is a clinical diagnosis and should not be serology-tested. Antibodies take weeks to appear, so a test drawn at the rash is frequently negative in a patient who plainly has Lyme disease, and this algorithm should not be used to overturn that rash.'
    : 'Erythema migrans is a clinical diagnosis and is treated on sight, without serology. This algorithm is for later or non-specific presentations.';

  const orderNote = first === 'negative' || first === 'not-done'
    ? 'The second tier is only run, and only interpretable, after a positive or equivocal first tier. A standalone immunoblot means nothing.'
    : null;

  const igmNote = second === 'igm-only'
    ? (days === null
      ? `Days since symptom onset are not entered, and an IgM-only result cannot be read without them. Inside ${IGM_WINDOW_DAYS} days it supports the diagnosis; beyond ${IGM_WINDOW_DAYS} days, IgM reactivity without IgG is a false positive.`
      : withinIgmWindow
        ? `At ${days} days from onset the IgM result is inside the ${IGM_WINDOW_DAYS}-day window and counts.`
        : `At ${days} days from onset the IgM result is outside the ${IGM_WINDOW_DAYS}-day window. IgM reactivity without IgG beyond that point is a false positive and does not support the diagnosis.`)
    : null;

  const mtttNote = result === 'second-tier-pending' || result === 'positive' || result === 'negative-second-tier'
    ? 'The 2019 update accepts a second, different enzyme immunoassay in place of the immunoblot. It is an equal alternative, not a lesser test, and it removes the immunoblot reading step.'
    : null;

  const treatmentNote = 'Serology does not measure treatment response. Antibodies persist for years after successful treatment, so a repeat titer answers nothing about cure.';

  const earlyNote = days !== null && days <= 14 && (result === 'negative' || result === 'negative-second-tier')
    ? `At ${days} days from onset a negative result is early. Antibodies take weeks to appear, and in early disease a negative test does not exclude Lyme disease; convalescent testing two to three weeks later is the way to settle it.`
    : null;

  const scopeNote = 'This applies a published testing algorithm to results already obtained. It does not diagnose Lyme disease, and it does not decide whether to treat.';

  return {
    valid: true,
    result,
    firstTier: first,
    secondTier: second,
    daysSinceOnset: days,
    withinIgmWindow,
    action,
    emNote,
    orderNote,
    igmNote,
    mtttNote,
    earlyNote,
    treatmentNote,
    scopeNote,
    abnormal: result === 'positive',
    bandLabel: {
      'no-first-tier': 'No first-tier result',
      negative: 'Negative',
      'second-tier-pending': 'Second tier indicated',
      positive: 'Positive',
      'negative-second-tier': 'Negative',
    }[result],
    band: action,
    detail: `An enzyme immunoassay or immunofluorescence assay runs first. Negative ends it. Positive or equivocal calls for a second tier: an IgM and IgG immunoblot, or under the 2019 modified algorithm a second, different enzyme immunoassay. A reactive IgG second tier is positive; an IgM-only second tier is positive only within ${IGM_WINDOW_DAYS} days of symptom onset.`,
    note: LYME_NOTE,
  };
}

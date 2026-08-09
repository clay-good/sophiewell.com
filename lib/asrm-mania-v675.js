// spec-v675: Altman Self-Rating Mania Scale (ASRM).
//
// A patient self-report companion to the built clinician-rated Young Mania Rating
// Scale (ymrs). Five items, each rated 0-4, summed to 0-20; a total of 6 or more
// (the paper's ">5") screens positive for a manic or hypomanic condition. Source:
//   Altman EG, Hedeker D, Peterson JL, Davis JM. The Altman Self-Rating Mania Scale.
//   Biol Psychiatry. 1997;42(10):948-955. PMID 9359982.
//
// Item domains (topics only; no copyrighted statement text):
//   1. elevated/positive mood
//   2. increased self-confidence
//   3. decreased need for sleep
//   4. increased speech / talkativeness
//   5. increased activity level
// Cut of >= 6 gave sensitivity 85.5% and specificity 87.3% vs the clinician CARS-M.
// It covers the past week and is a screen, not a diagnosis.
//
// Pure: no DOM, no clock, no network.

export const ASRM_NOTE = 'Altman Self-Rating Mania Scale (Altman EG, et al., Biol Psychiatry 1997;42(10):948-955). A five-item patient self-report covering the past week: elevated or positive mood, increased self-confidence, decreased need for sleep, increased speech or talkativeness, and increased activity level. Each item is rated 0 (unchanged from usual self) to 4 (most severe), for a total of 0 to 20. A total of 6 or more (the study\'s cut of greater than 5) indicates a high probability of a manic or hypomanic condition and warrants clinical evaluation, with sensitivity about 85% and specificity about 87% against a clinician-rated scale; 0 to 5 suggests no significant manic symptoms, and severity rises with the score. It is a screening and monitoring tool that supports but does not replace clinical assessment, and it is not by itself a diagnosis of bipolar disorder or mania.';

const ITEMS = [
  { key: 'mood', label: 'elevated/positive mood' },
  { key: 'confidence', label: 'increased self-confidence' },
  { key: 'sleep', label: 'decreased need for sleep' },
  { key: 'speech', label: 'increased speech/talkativeness' },
  { key: 'activity', label: 'increased activity level' },
];

function intIn(v, lo, hi) {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < lo || n > hi) return NaN;
  return n;
}

export function asrmMania(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  for (const it of ITEMS) {
    const v = intIn(o[it.key], 0, 4);
    if (Number.isNaN(v)) {
      return { valid: false, code: 'MISSING_INPUT', field: it.key, message: `Rate "${it.label}" from 0 (unchanged) to 4 (most severe).` };
    }
    total += v;
  }
  const positive = total >= 6;
  return {
    valid: true,
    total,
    positive,
    // Flag a positive screen (>= 6).
    abnormal: positive,
    band: positive
      ? `ASRM ${total}/20 — positive screen (>= 6): high probability of a manic or hypomanic condition.`
      : `ASRM ${total}/20 — negative screen (0-5): no significant manic symptoms.`,
    detail: positive
      ? 'A total of 6 or more warrants clinical evaluation; severity rises with the score. This is a screen, not a diagnosis.'
      : 'A total of 0 to 5 suggests no significant manic symptoms over the past week.',
    note: ASRM_NOTE,
  };
}

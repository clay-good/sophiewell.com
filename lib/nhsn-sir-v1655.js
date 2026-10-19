// spec-v1655 tool 1: the NHSN standardized infection ratio, observed over predicted.
//
// Source: CDC NHSN, "The NHSN Standardized Infection Ratio (SIR): A Guide to the SIR", updated March 2024
// (cdc.gov/nhsn/pdfs/ps-analysis-resources/nhsn-sir-guide.pdf), read October 19, 2026:
//   "The SIR is calculated by dividing the number of observed infections by the number of predicted
//    infections." The predicted number comes from NHSN's regression models over the 2015 baseline,
//    applied inside NHSN; the reader copies it from the facility's report.
//   "SIRs are currently not calculated when the number of predicted infections is less than 1.0"
//    (a minimum precision criterion), with three alternatives: a longer period, infection rates, and
//    the TAP reports.
//   Worked example: 5 CLABSIs observed, 2.365 predicted, SIR 2.114.
// Not computed here: the p-value (NHSN uses a mid-P exact test) and the 95% interval, whose formula was
// not read in a source; and the cumulative attributable difference, whose one sentence in the guide
// can be read two ways and whose TAP guide was not read. The result points to the NHSN report for them.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'The predicted count is NHSN\'s, from its 2015-baseline models applied to the facility\'s own data; this tool does not estimate it. The p-value and 95% interval are on the NHSN report.';
const MIN_NOTE = 'Instead, NHSN suggests a longer time period, infection rates to track internal incidence, or the TAP reports.';

export function nhsnSir(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the observed infections', o.observed, 0, 100000, ''],
    ['the predicted infections', o.predicted, 0, 100000, ''],
  ]);
  if (f) return { valid: false, message: f };
  const obs = Number(o.observed);
  const pred = Number(o.predicted);
  if (!Number.isInteger(obs)) return { valid: false, message: 'The observed infections must be a whole number.' };
  if (pred < 1) {
    return {
      valid: true, flag: 'below-minimum', sir: null, abnormal: false,
      band: `No SIR: NHSN does not calculate an SIR when the number of predicted infections is less than 1.0, and ${pred} was entered.`,
      bandLabel: 'Not calculated', notes: [MIN_NOTE], note: NOTE,
    };
  }
  const sir = obs / pred;
  const r = Math.round(sir * 1000) / 1000;
  const reading = r > 1 ? 'more infections were observed than predicted'
    : r < 1 ? 'fewer infections were observed than predicted'
      : 'the same number of infections was observed as predicted';
  return {
    valid: true, flag: r > 1 ? 'above-one' : r < 1 ? 'below-one' : 'at-one', sir: r, abnormal: r > 1,
    band: `SIR ${r.toFixed(3)}: ${reading} (${obs} observed ÷ ${pred} predicted).`,
    bandLabel: r.toFixed(3),
    notes: ['Whether the SIR differs significantly from 1.0 is read from the p-value and 95% interval on the NHSN report, not from the ratio alone.'],
    note: NOTE,
  };
}

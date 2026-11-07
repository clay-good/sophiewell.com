// spec-v1636 tool 14: antimicrobial days per 1,000 days present, per 100 admissions, and the SAAR.
//
// Source: CDC NHSN, Antimicrobial Use and Resistance (AUR) Module protocol, July 2026
// (cdc.gov/nhsn/pdfs/pscmanual/11pscaurcurrent.pdf), re-read October 12, 2026, Table 4 and the SAAR
// section:
//   Rate of antimicrobial days per 1,000 days present = antimicrobial days / days present x 1000,
//    by patient care location or facility-wide inpatient.
//   Rate of antimicrobial days per 100 admissions = antimicrobial days / admissions x 100. "Only
//    calculate for facility-wide inpatient for the AU Option."
//   "it is not permissible to sum the individual days present for location-specific analyses to
//    achieve the facility-wide inpatient (FacWideIN) days present count. The calculation must be a
//    separate summation": transfers put one patient in two locations on one day.
//   "The SAAR is calculated by dividing observed antimicrobial use by predicted antimicrobial use",
//    where observed use is the antimicrobial days the facility reported.
// Predicted days come from CDC's models, applied inside NHSN. This tool does not predict; the
// predicted figure is the reader's, from the facility's own NHSN report.
//
// The SAAR's p-value and 95% interval (added November 7, 2026, spec-v1711): NHSN's Statistics Calculator guide
// (cdc.gov/nhsn/pdfs/ps-analysis-resources/StatsCalc.pdf, "Compare Single Standardized Ratio ... to 1") lists the
// SAAR among the ratios it tests, with the same p-value and interval as the SIR; the port of NHSN's macros and its
// checks against NHSN's printed figures are in lib/nhsn-sir-v1655.js. Computed up to 1,000,000 observed days
// (the interval's summation grows with the count), and only when 1 or more days are predicted, as the macro
// requires.
//
// Pure: no DOM, no clock, no network.

import { dpSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { nhsnMidP, nhsnMidPLimits } from './nhsn-sir-v1655.js';

export const SCOPES = [
  { value: 'one-location', text: 'One patient care location' },
  { value: 'facwidein-all-inpatient', text: 'Facility-wide inpatient (FacWideIN)' },
];
const NOTE = 'The protocol\'s arithmetic on the counts entered. NHSN computes these from the submitted data; a hand calculation is for checking and for local use. A rate or ratio is a measurement, not a judgment that use was appropriate.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
// The SAAR to three decimals, or more where three would show 1 for a ratio above or below 1.
const nS = (x) => dpSafe(x, [1], 3).toLocaleString('en-US', { maximumFractionDigits: 12 });
const n0 = (x) => Number(x).toLocaleString('en-US');

export function auRateSaar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const scope = SCOPES.find((s) => s.value === String(o.scope ?? '').trim());
  if (!scope) return { valid: false, message: 'Choose the scope: one patient care location, or facility-wide inpatient. Days present are counted differently for each.' };
  const f = inputFault([['the antimicrobial days', o.antimicrobialDays, 0, 100000000, ''], ['the days present', o.daysPresent, null, 100000000, '']]);
  if (f) return { valid: false, message: f };
  const days = Number(o.antimicrobialDays); const present = Number(o.daysPresent);
  const facility = scope.value === 'facwidein-all-inpatient';
  let admissions = null; let predicted = null;
  if (!blank(o.admissions)) {
    if (!facility) return { valid: false, message: 'The rate per 100 admissions is calculated for facility-wide inpatient only: clear the admissions, or choose the facility-wide scope.' };
    const af = inputFault([['the admissions', o.admissions, null, 10000000, '']]);
    if (af) return { valid: false, message: af };
    admissions = Number(o.admissions);
  }
  if (!blank(o.predictedDays)) {
    const pf = inputFault([['the predicted antimicrobial days', o.predictedDays, null, 100000000, '']]);
    if (pf) return { valid: false, message: pf };
    predicted = Number(o.predictedDays);
  }
  const rate = days / present * 1000;
  const perAdmission = admissions === null ? null : days / admissions * 100;
  const saar = predicted === null ? null : days / predicted;
  const notes = [`Antimicrobial days per 1,000 days present = ${n0(days)} ÷ ${n0(present)} × 1,000 = ${n2(rate)}.`];
  if (perAdmission !== null) notes.push(`Antimicrobial days per 100 admissions = ${n0(days)} ÷ ${n0(admissions)} × 100 = ${n2(perAdmission)}.`);
  else if (facility) notes.push('Admissions were not entered, so the rate per 100 admissions is not shown.');
  if (saar !== null) notes.push(`SAAR = observed ÷ predicted = ${n0(days)} ÷ ${n0(predicted)} = ${nS(saar)}. ${saar > 1 ? 'Above 1: more antimicrobial days were observed than predicted.' : saar < 1 ? 'Below 1: fewer antimicrobial days were observed than predicted.' : 'Equal to 1: observed equals predicted.'}`);
  let saarP = null; let saarLower = null; let saarUpper = null;
  if (saar !== null) {
    if (!Number.isInteger(days) || predicted < 1 || days > 1000000) {
      const why = [];
      if (!Number.isInteger(days)) why.push('NHSN\'s method needs a whole number of observed days');
      if (predicted < 1) why.push('NHSN\'s method needs 1 or more predicted days');
      if (days > 1000000) why.push('this tool computes it up to 1,000,000 observed days');
      notes.push(`No SAAR p-value or interval: ${why.join('; ')}.`);
    } else {
      const p = nhsnMidP(days, predicted);
      const lim = nhsnMidPLimits(days);
      if (p !== null && lim && Number.isFinite(lim.upper)) {
        saarP = Math.round(p * 10000) / 10000;
        saarLower = lim.lower === null ? null : Math.round((lim.lower / predicted) * 1000) / 1000;
        saarUpper = Math.round((lim.upper / predicted) * 1000) / 1000;
        notes.push(`SAAR p-value ${saarP.toFixed(4)} (two-sided, ${days <= 100 ? 'mid-P exact' : 'Byar approximation, used by NHSN above 100 observed'}); 95% interval ${saarLower === null ? `upper limit ${saarUpper.toFixed(3)}, with no lower limit at 0 observed days` : `${saarLower.toFixed(3)} to ${saarUpper.toFixed(3)}`} (NHSN's method, as its Statistics Calculator applies it to the SAAR). ${saarP <= 0.05 ? 'At 0.05 or less, observed use differs significantly from predicted.' : 'Above 0.05, observed use does not differ significantly from predicted.'}`);
      }
    }
  }
  if (saar === null) notes.push('No predicted antimicrobial days were entered, so no SAAR is shown. The predicted figure comes from CDC\'s models inside NHSN; this tool does not predict.');
  notes.push(facility
    ? 'Check: facility-wide days present are their own count (one per patient per calendar day in any inpatient location). They must not be the sum of the locations\' days present, which counts a transferred patient in two locations on one day and is higher.'
    : 'Check: one patient contributes one day present per calendar day to each location they were in. The rate per 100 admissions is facility-wide only and is not calculated for a single location.');
  if (days > present) notes.push('Antimicrobial days exceed days present. That is possible (a patient on two agents contributes two antimicrobial days to one day present) when the count is for all agents together; for a single agent it means a counting error.');
  return {
    valid: true, flag: 'rates', abnormal: false, ratePer1000DaysPresent: Number(rate.toFixed(2)), ratePer100Admissions: perAdmission === null ? null : Number(perAdmission.toFixed(2)), saar: saar === null ? null : dpSafe(saar, [1], 3), saarP, saarLower, saarUpper,
    band: `${n2(rate)} antimicrobial days per 1,000 days present${perAdmission !== null ? `; ${n2(perAdmission)} per 100 admissions` : ''}${saar !== null ? `; SAAR ${nS(saar)}` : ''}.`,
    bandLabel: saar !== null ? `SAAR ${nS(saar)}` : `${n2(rate)} per 1,000`, notes, note: NOTE,
  };
}

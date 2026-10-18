// spec-v1634 tool 29: medication reconciliation discrepancy rate (CBE 2456).
//
// Source: Medication Reconciliation: Number of Unintentional Medication Discrepancies per Medication Per Patient,
// CBE ID 2456, steward Brigham and Women's Hospital, endorsed (Fall 2019 cycle), measure page on the Partnership
// for Quality Measurement (p4qm.org/measures/2456), re-read October 17, 2026:
//   Numerator: for each sampled inpatient, the unintentional medication discrepancies in admission orders plus
//   those in discharge orders. Denominator: the medications in the gold standard medication lists plus the
//   unintentionally ordered additional medications, in a random sample of adults admitted. Sampling: 25 patients a
//   month recommended, about 1 a weekday. Worked example on the page: 110 gold standard medications, 40
//   unintentionally ordered additional medications, 75 unintentional discrepancies, 75/150 = 0.5. Excluded:
//   patients discharged or dying before a gold standard list can be obtained. No risk adjustment.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'CBE 2456 (formerly NQF 2456): unintentional discrepancies in admission and discharge orders, divided by the gold standard medications plus unintentionally ordered extra medications, over a monthly random sample of adult admissions. The gold standard list is a trained pharmacist\'s medication history. Patients discharged or dying before that list is taken are excluded.';

export function medrecDiscrepancyRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the number of unintentional discrepancies', o.discrepancies, 0, 1e6, ''],
    ['the number of gold standard medications', o.goldMeds, 0, 1e6, ''],
    ['the number of unintentionally ordered additional medications', o.extraMeds, 0, 1e6, ''],
  ]);
  if (f) return { valid: false, message: f };
  const d = Number(o.discrepancies); const g = Number(o.goldMeds); const x = Number(o.extraMeds);
  if (![d, g, x].every(Number.isInteger)) return { valid: false, message: 'Enter each count as a whole number.' };
  if (g + x === 0) return { valid: false, message: 'Enter at least one medication: the denominator is the gold standard medications plus the extra ones.' };
  const notes = [];
  const rawP = o.patients;
  if (rawP != null && String(rawP).trim() !== '') {
    const fp = inputFault([['the number of patients sampled', rawP, 1, 1e5, '']]);
    if (fp) return { valid: false, message: fp };
    const p = Number(rawP);
    if (!Number.isInteger(p)) return { valid: false, message: 'Enter the patients sampled as a whole number.' };
    if (p < 25) notes.push(`${p} patient${p === 1 ? '' : 's'} sampled; the measure recommends 25 a month, about 1 a weekday.`);
    else notes.push(`${p} patients sampled; the measure recommends 25 a month.`);
  } else {
    notes.push('The measure recommends sampling 25 patients a month, about 1 a weekday.');
  }
  const denom = g + x;
  const rate = d / denom;
  notes.unshift(`${d} / (${g} gold standard + ${x} unintentionally ordered additional medications) = ${d} / ${denom} = ${rate.toFixed(2)}.`);
  notes.push('Lower is better. The measure carries no risk adjustment and sets no target.');
  return {
    valid: true, rate: Number(rate.toFixed(4)), numerator: d, denominator: denom,
    band: `${rate.toFixed(2)} unintentional discrepancies per medication (${d} of ${denom}).`,
    bandLabel: rate.toFixed(2), abnormal: false, notes, note: NOTE,
  };
}

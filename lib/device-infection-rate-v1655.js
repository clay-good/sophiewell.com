// spec-v1655 tool 3: device-associated infection rate per 1,000 device days.
//
// Source: CDC NHSN Patient Safety Component Manual, January 2026, read October 19, 2026:
//   chapter 4: "The CLABSI rate per 1000 central line days is calculated by dividing the number of
//    CLABSIs by the number of central line days and multiplying the result by 1000."
//   chapter 7: "The CAUTI rate per 1000 urinary catheter days is calculated by dividing the number of
//    CAUTIs by the number of catheter days and multiplying the result by 1000."
//   chapter 10: "The VAE rate per 1000 ventilator days is calculated by dividing the number of VAEs by
//    the number of ventilator days and multiplying the result by 1000", and "The VAE rate per 100
//    episodes of mechanical ventilation (EMV) is calculated by dividing the number of VAEs by the number
//    of EMV and multiplying the result by 100."
// The NHSN SIR guide's own example (5 CLABSIs over 1,850 central line days) is the worked example.
// The 95% interval (added November 7, 2026, spec-v1710) is NHSN's mid-P exact interval from its published
// rateCIcomp.sas macro, whose header says NHSN's rate tables call it (StandardRateTable.sas); the port and its
// check against the macro guide's printed example (12 / 35 -> 185.767 to 582.877 per 1,000) are in
// lib/nhsn-sir-v1655.js. The macro rounds the limits to three decimals per 1,000 and has no lower limit at 0.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { nhsnMidPLimits } from './nhsn-sir-v1655.js';

export const DEVICES = [
  { value: 'central-line', text: 'Central line (CLABSI)', event: 'CLABSI', days: 'central line days' },
  { value: 'urinary-catheter', text: 'Indwelling urinary catheter (CAUTI)', event: 'CAUTI', days: 'urinary catheter days' },
  { value: 'ventilator', text: 'Ventilator (VAE)', event: 'VAE', days: 'ventilator days' },
];
const NOTE = 'A crude rate is for tracking within a unit over time. NHSN compares facilities with the SIR, which adjusts for risk.';

export function deviceInfectionRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dev = DEVICES.find((d) => d.value === String(o.device ?? '').trim());
  if (!dev) return { valid: false, message: 'Choose the device.' };
  const f = inputFault([
    [`the ${dev.event}s`, o.events, 0, 1000000, ''],
    [`the ${dev.days}`, o.deviceDays, null, 10000000, ''],
  ]);
  if (f) return { valid: false, message: f };
  const ev = Number(o.events);
  const dd = Number(o.deviceDays);
  if (!Number.isInteger(ev) || !Number.isInteger(dd)) return { valid: false, message: `The ${dev.event}s and ${dev.days} are whole-number counts.` };
  if (ev > dd) return { valid: false, message: `The ${dev.event}s (${ev}) cannot be more than the ${dev.days} (${dd}).` };
  const rate = Math.round((ev / dd) * 1000 * 100) / 100;
  const lim = nhsnMidPLimits(ev);
  const per = (x) => Math.round((x / dd) * 1000 * 1000) / 1000;
  const lower = lim && lim.lower !== null ? per(lim.lower) : null;
  const upper = lim ? per(lim.upper) : null;
  const notes = [];
  if (upper !== null && Number.isFinite(upper)) {
    notes.push(lower === null
      ? `95% interval (NHSN's mid-P exact method): upper limit ${upper.toFixed(3)} per 1,000 ${dev.days}, with no lower limit when there were no ${dev.event}s.`
      : `95% interval (NHSN's mid-P exact method): ${lower.toFixed(3)} to ${upper.toFixed(3)} per 1,000 ${dev.days}.`);
  }
  let emvRate = null;
  const rawEmv = o.episodes;
  if (dev.value === 'ventilator' && rawEmv != null && String(rawEmv).trim() !== '') {
    const fe = inputFault([['the episodes of mechanical ventilation', rawEmv, null, 1000000, '']]);
    if (fe) return { valid: false, message: fe };
    const emv = Number(rawEmv);
    if (!Number.isInteger(emv)) return { valid: false, message: 'The episodes of mechanical ventilation are a whole-number count.' };
    emvRate = Math.round((ev / emv) * 100 * 100) / 100;
    notes.push(`VAE rate per 100 episodes of mechanical ventilation: ${emvRate.toFixed(2)} (${ev} ÷ ${emv} × 100).`);
  }
  return {
    valid: true, flag: 'rate', rate, lower, upper, emvRate, abnormal: false,
    band: `${rate.toFixed(2)} ${dev.event}s per 1,000 ${dev.days} (${ev} ÷ ${dd.toLocaleString('en-US')} × 1,000).`,
    bandLabel: rate.toFixed(2), notes, note: NOTE,
  };
}

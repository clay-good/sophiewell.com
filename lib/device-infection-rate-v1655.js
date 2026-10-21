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
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

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
  const notes = [];
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
    valid: true, flag: 'rate', rate, emvRate, abnormal: false,
    band: `${rate.toFixed(2)} ${dev.event}s per 1,000 ${dev.days} (${ev} ÷ ${dd.toLocaleString('en-US')} × 1,000).`,
    bandLabel: rate.toFixed(2), notes, note: NOTE,
  };
}

// spec-v1655 tool 2: device utilization ratio, device days over patient days.
//
// Source: CDC NHSN Patient Safety Component Manual, January 2026, read October 19, 2026:
//   chapter 4 (CLABSI): "The Central Line Utilization Ratio is calculated by dividing the number of
//    central line catheter days by the number of patient days." DURs are "useful for the purposes of
//    tracking device use over shorter periods of time and for internal trend analyses."
//   chapter 7 (CAUTI): "The Urinary Catheter Utilization Ratio is calculated by dividing the number of
//    urinary catheter days by the number of patient days."
//   chapter 10 (VAE): "The Ventilator or Device Utilization Ratio (DUR) is calculated by dividing the
//    number of ventilator days by the number of patient days."
// The SUR, which compares device use between facilities, is modeled inside NHSN and is not computed here.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const DEVICES = [
  { value: 'central-line', text: 'Central line', days: 'central line days', ratio: 'Central Line Utilization Ratio' },
  { value: 'urinary-catheter', text: 'Indwelling urinary catheter', days: 'urinary catheter days', ratio: 'Urinary Catheter Utilization Ratio' },
  { value: 'ventilator', text: 'Ventilator', days: 'ventilator days', ratio: 'Ventilator Utilization Ratio' },
];
const NOTE = 'NHSN counts device days and patient days once a day, at the same time each day. A DUR tracks one unit\'s device use over time; comparing facilities uses the SUR, which NHSN models.';

export function deviceUtilizationRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const dev = DEVICES.find((d) => d.value === String(o.device ?? '').trim());
  if (!dev) return { valid: false, message: 'Choose the device.' };
  const f = inputFault([
    [`the ${dev.days}`, o.deviceDays, 0, 10000000, ''],
    ['the patient days', o.patientDays, null, 10000000, ''],
  ]);
  if (f) return { valid: false, message: f };
  const dd = Number(o.deviceDays);
  const pd = Number(o.patientDays);
  if (!Number.isInteger(dd) || !Number.isInteger(pd)) return { valid: false, message: 'Device days and patient days are whole-day counts.' };
  if (dd > pd) return { valid: false, message: `The ${dev.days} (${dd}) cannot be more than the patient days (${pd}): each device day is also a patient day.` };
  const dur = Math.round((dd / pd) * 100) / 100;
  return {
    valid: true, flag: 'dur', dur, abnormal: false,
    band: `${dev.ratio} ${dur.toFixed(2)}: a device on ${Math.round((dd / pd) * 1000) / 10}% of patient days (${dd.toLocaleString('en-US')} ${dev.days} ÷ ${pd.toLocaleString('en-US')} patient days).`,
    bandLabel: dur.toFixed(2), notes: [], note: NOTE,
  };
}

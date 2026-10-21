// spec-v1657 tool 7: occupancy, average daily census, average length of stay and bed turnover.
//
// Source: CMS, Hospital Provider Cost Report Data Dictionary (data.cms.gov, updated March 2024), read
// October 19, 2026:
//   "Number of Beds": "an adult bed, pediatric bed, birthing room, or newborn ICU bed (excluding newborn
//     bassinets) maintained in a patient care area for lodging patients"; labor room, post-anesthesia,
//     recovery, outpatient, emergency and ancillary areas are "not termed a bed".
//   "Total Bed Days Available": beds × days in the period, and when the count changed, "multiply the
//     number of beds available for each part of the cost reporting period by the number of days for
//     which that number of beds was available."
//   "Total Discharges": "including deaths (excluding newborn and DOAs)"; "a formal release of a patient."
// The ratios are identities: occupancy = inpatient days ÷ bed days available; average daily census =
// inpatient days ÷ days; average length of stay = inpatient days ÷ discharges; bed turnover = discharges
// ÷ beds.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// "40, 31" per line: beds, and the days that many beds were available.
export function parseBedPeriods(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length !== 2 || !/^\d+$/.test(c[0]) || !/^\d+$/.test(c[1])) return { error: `Line ${i + 1} needs whole numbers of beds and days, such as 40, 31.` };
    out.push({ beds: Number(c[0]), days: Number(c[1]) });
  }
  return { periods: out };
}

export function bedOccupancyAlos(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let bedDays;
  let days;
  let beds;
  if (!blank(o.bedPeriods)) {
    const p = parseBedPeriods(o.bedPeriods);
    if (p.error) return { valid: false, message: p.error };
    if (!p.periods.length) return { valid: false, message: 'Enter the beds and days for each part of the period.' };
    bedDays = p.periods.reduce((s, x) => s + x.beds * x.days, 0);
    days = p.periods.reduce((s, x) => s + x.days, 0);
    beds = p.periods[p.periods.length - 1].beds;
  } else {
    const f = inputFault([['the beds', o.beds, null, 1e5, ''], ['the days in the period', o.days, null, 3660, '']]);
    if (f) return { valid: false, message: f };
    beds = Number(o.beds);
    days = Number(o.days);
    bedDays = beds * days;
  }
  if (bedDays === 0 || days === 0) return { valid: false, message: 'The bed days available are zero. Check the beds and days.' };
  const f = inputFault([['the inpatient days', o.inpatientDays, 0, 1e8, '']]);
  if (f) return { valid: false, message: f };
  const ip = Number(o.inpatientDays);
  const occ = r1((ip / bedDays) * 100);
  const adc = r1(ip / days);
  const lines = [`Occupancy ${occ}% (${loc(ip)} inpatient days ÷ ${loc(bedDays)} bed days available); average daily census ${adc}.`];
  const notes = [];
  let alos = null;
  if (!blank(o.discharges)) {
    const g = inputFault([['the discharges', o.discharges, null, 1e7, '']]);
    if (g) return { valid: false, message: g };
    alos = r2(ip / Number(o.discharges));
    lines.push(beds > 0
      ? `Average length of stay ${alos} days; bed turnover ${r2(Number(o.discharges) / beds)} discharges per bed${blank(o.bedPeriods) ? '' : ' (beds at the end of the period)'}.`
      : `Average length of stay ${alos} days. No bed turnover: there were no beds at the end of the period.`);
  } else {
    notes.push('Enter the discharges, including deaths and excluding newborns and DOAs, for the average length of stay and bed turnover.');
  }
  if (occ > 100) notes.push('Over 100%: more inpatient days than bed days available, which happens with overflow or beds outside the cost report\'s definition.');
  notes.push('A bed, as the cost report counts it, is an adult, pediatric, birthing room or newborn ICU bed for lodging inpatients, not a labor, recovery, outpatient or emergency bed or a newborn bassinet.');
  return {
    valid: true, occupancy: occ, adc, alos, bedDays, abnormal: occ > 100,
    band: lines.join(' '), bandLabel: `${occ}% occupied`, notes,
    note: 'Definitions from the CMS hospital cost report data dictionary (Worksheet S-3 Part I).',
  };
}

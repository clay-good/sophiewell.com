// spec-v1635 tool 24: radioactive decay, precalibration and activity units.
//
//   A(t) = A0 x 2^(-t / T_half), forward or back;  time to a target = T_half x log2(A0 / A_target);
//   1 Ci = 3.7 x 10^10 Bq (the conversion the CFR uses: 0.005 microcurie = 185 Bq in 10 CFR 35.67).
//
// Half-lives: each is the physical half-life printed on an FDA label, re-read on DailyMed October 11,
// 2026, and each sits on a label row (spec-v1628 section 1): if the label's text changes, that
// nuclide's figure is withheld until it is re-read, and the reader can type a half-life instead.
//   Tc-99m 6.02 hours and Mo-99 66 hours (Technelite); F-18 109.8 minutes (Fludeoxyglucose F 18,
//   Biomedical Research Foundation; the PETNET label prints 109.7); I-131 8.02 days (Hicon); I-123
//   13.2 hours (AdreView); In-111 2.805 days, printed also as 67.32 hours (Octreoscan); Tl-201 72.9
//   hours (thallous chloride, Curium); Lu-177 6.647 days (Lutathera); Ra-223 11.4 days (Xofigo);
//   Rb-82 75 seconds and Sr-82 25 days (Cardiogen-82); Ga-68 68 minutes (Netspot); N-13 9.96 minutes
//   (Ammonia N 13, Ionetix).
// 10 CFR 35.92(a), read on eCFR as current October 8, 2026: material "with a physical half-life of
// less than or equal to 120 days" may be held for decay-in-storage and disposed of once a survey at
// the surface, with no interposed shielding, "cannot be distinguished from the background radiation
// level". The rule has no 10-half-life test, and the tool prints no such date.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const L = {
  technelite: { name: 'Technelite', setId: '3ae14c6b-3daf-4dd1-bbdb-e990fe8100e4' },
  fdg: { name: 'Fludeoxyglucose F 18', setId: '1deaaa92-1c98-4295-8aa6-7a70bc29f55d' },
  hicon: { name: 'Hicon', setId: '524a0dac-6e2b-2c0c-04b4-76d85dba63c5' },
  adreview: { name: 'AdreView', setId: 'c89d3ecc-4f4c-4566-8808-79152344194d' },
  octreoscan: { name: 'Octreoscan', setId: '93d8f3b2-1216-41dc-a63d-0e812b33891d' },
  thallium: { name: 'Thallous Chloride Tl 201', setId: '0da81fc0-a137-46d3-9378-d8053a82e61a' },
  lutathera: { name: 'Lutathera', setId: '72d1a024-00b7-418a-b36e-b2cb48f2ab55' },
  xofigo: { name: 'Xofigo', setId: 'a398400e-bd31-41a9-9696-4f7c06569ede' },
  cardiogen: { name: 'Cardiogen-82', setId: 'ee95aa18-9f2f-40eb-9b4c-583bea6f36bf' },
  netspot: { name: 'Netspot', setId: 'b2b3be70-17d8-4093-896c-f1c54a2cf242' },
  ammonia: { name: 'Ammonia N 13', setId: '61e196ba-3812-4ffd-8032-12b215378fef' },
};
// hours: the half-life in hours; said: the label's own figure.
export const NUCLIDES = [
  { value: 'tc-99m', text: 'Tc-99m (6.02 hours)', hours: 6.02, said: '6.02 hours', label: L.technelite },
  { value: 'mo-99', text: 'Mo-99 (66 hours)', hours: 66, said: '66 hours', label: L.technelite },
  { value: 'f-18', text: 'F-18 (109.8 minutes)', hours: 109.8 / 60, said: '109.8 minutes', label: L.fdg },
  { value: 'i-131', text: 'I-131 (8.02 days)', hours: 8.02 * 24, said: '8.02 days', label: L.hicon },
  { value: 'i-123', text: 'I-123 (13.2 hours)', hours: 13.2, said: '13.2 hours', label: L.adreview },
  { value: 'in-111', text: 'In-111 (2.805 days)', hours: 2.805 * 24, said: '2.805 days (67.32 hours)', label: L.octreoscan },
  { value: 'tl-201', text: 'Tl-201 (72.9 hours)', hours: 72.9, said: '72.9 hours', label: L.thallium },
  { value: 'lu-177', text: 'Lu-177 (6.647 days)', hours: 6.647 * 24, said: '6.647 days', label: L.lutathera },
  { value: 'ra-223', text: 'Ra-223 (11.4 days)', hours: 11.4 * 24, said: '11.4 days', label: L.xofigo },
  { value: 'rb-82', text: 'Rb-82 (75 seconds)', hours: 75 / 3600, said: '75 seconds', label: L.cardiogen },
  { value: 'sr-82', text: 'Sr-82 (25 days)', hours: 25 * 24, said: '25 days', label: L.cardiogen },
  { value: 'ga-68', text: 'Ga-68 (68 minutes)', hours: 68 / 60, said: '68 minutes', label: L.netspot },
  { value: 'n-13', text: 'N-13 (9.96 minutes)', hours: 9.96 / 60, said: '9.96 minutes', label: L.ammonia },
  { value: 'other', text: 'Another radionuclide (type its half-life)' },
];
export const HALF_LIFE_UNITS = [{ value: 'seconds', text: 'seconds', hours: 1 / 3600 }, { value: 'minutes', text: 'minutes', hours: 1 / 60 }, { value: 'hours', text: 'hours', hours: 1 }, { value: 'days', text: 'days', hours: 24 }];
// Each activity unit in becquerels.
export const ACTIVITY_UNITS = [
  { value: 'mci', text: 'mCi', bq: 3.7e7 }, { value: 'uci', text: 'µCi', bq: 3.7e4 }, { value: 'ci', text: 'Ci', bq: 3.7e10 },
  { value: 'mbq', text: 'MBq', bq: 1e6 }, { value: 'kbq', text: 'kBq', bq: 1e3 }, { value: 'gbq', text: 'GBq', bq: 1e9 }, { value: 'bq', text: 'Bq', bq: 1 },
];
const NOTE = 'Physical decay only: no biological clearance, no ingrowth of a daughter in a generator, and no measurement uncertainty. The two times are taken as clock times in one time zone. A computed activity does not replace the measurement of a dosage that the rules require.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// Shared with the dispense-volume tool. Anything that is not a finite number prints as nothing.
export const sig = (x) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toPrecision(4)).toLocaleString('en-US', { maximumSignificantDigits: 4 }) : '');

// A wall-clock date and time as entered (YYYY-MM-DDTHH:MM); no time zone is assumed or converted.
export function stamp(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(v ?? '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] && +m[4] < 24 && +m[5] < 60 && +m[1] > 1990 && +m[1] < 2100 ? d : null;
}
export const sayAt = (d) => `${d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' }).toLowerCase()}`;
// Both unit systems for an activity in becquerels, each in a readable multiple.
export function both(bq) {
  if (typeof bq !== 'number' || !Number.isFinite(bq)) return '';
  const ci = bq / 3.7e10;
  const c = ci >= 1 ? `${sig(ci)} Ci` : ci >= 1e-3 ? `${sig(ci * 1e3)} mCi` : `${sig(ci * 1e6)} µCi`;
  const b = bq >= 1e9 ? `${sig(bq / 1e9)} GBq` : bq >= 1e6 ? `${sig(bq / 1e6)} MBq` : bq >= 1e3 ? `${sig(bq / 1e3)} kBq` : `${sig(bq)} Bq`;
  return `${c} (${b})`;
}
function duration(hours) {
  if (hours >= 48) return `${sig(hours / 24)} days`;
  if (hours >= 1) return `${sig(hours)} hours`;
  if (hours >= 1 / 60) return `${sig(hours * 60)} minutes`;
  return `${sig(hours * 3600)} seconds`;
}

// The half-life in hours for a preset or a typed value: { hours, name, source, labelUrl } or { fault }
// or { withheld } when the preset's label row no longer answers.
export function halfLife(o, now, table) {
  const n = NUCLIDES.find((x) => x.value === String(o.nuclide ?? '').trim());
  if (!n) return { fault: 'Choose the radionuclide, or "another radionuclide" to type a half-life.' };
  if (n.value === 'other') {
    const u = HALF_LIFE_UNITS.find((x) => x.value === String(o.halfLifeUnit ?? '').trim());
    const f = inputFault([['the half-life', o.halfLife, null, 1e9, '']]);
    if (f) return { fault: f };
    if (!u) return { fault: 'Choose the unit of the half-life: seconds, minutes, hours or days.' };
    return { hours: Number(o.halfLife) * u.hours, name: 'the radionuclide', source: `Half-life as typed: ${Number(o.halfLife).toLocaleString('en-US')} ${u.text}.` };
  }
  const lr = labelRow(n.label.setId, now, table);
  const name = n.text.replace(/ \(.*$/, '');
  if (!lr.answers) return { withheld: `The ${name} half-life is withheld: ${lr.why}. Choose "another radionuclide" and type the half-life from the label in hand.`, labelUrl: lr.url };
  return { hours: n.hours, name, source: `Half-life of ${name}: ${n.said}, from the ${n.label.name} label (${lr.edition}).`, labelUrl: lr.url };
}

export function radioactiveDecay(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const hl = halfLife(o, now, table);
  if (hl.fault) return { valid: false, message: hl.fault };
  if (hl.withheld) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: hl.labelUrl, band: hl.withheld, bandLabel: 'Withheld', notes: [], note: NOTE };
  const unit = ACTIVITY_UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  const f = inputFault([['the activity', o.activity, null, 1e15, '']]);
  if (f) return { valid: false, message: f };
  if (!unit) return { valid: false, message: 'Choose the activity unit.' };
  const a0 = Number(o.activity) * unit.bq;
  const days = hl.hours / 24;
  const storage = days <= 120 ? `With a half-life of ${duration(hl.hours)}, ${hl.name} is within the 120-day limit for decay-in-storage (10 CFR 35.92). Disposal under that rule depends on a surface survey that cannot be told from background, not on a count of half-lives.` : `With a half-life of ${duration(hl.hours)}, ${hl.name} is over the 120-day limit, so 10 CFR 35.92 decay-in-storage does not apply.`;
  const base = { valid: true, abnormal: false, halfLifeHours: Number(hl.hours.toPrecision(8)), decayInStorageEligible: days <= 120, ...(hl.labelUrl ? { labelUrl: hl.labelUrl } : {}) };
  if (!blank(o.targetActivity)) {
    const tf = inputFault([['the target activity', o.targetActivity, null, 1e15, unit.text]]);
    if (tf) return { valid: false, message: tf };
    const at = Number(o.targetActivity) * unit.bq;
    const hours = hl.hours * Math.log2(a0 / at);
    const cal = blank(o.calibration) ? null : stamp(o.calibration);
    if (!blank(o.calibration) && !cal) return { valid: false, message: 'Enter the calibration date and time, or leave it blank.' };
    const when = cal ? new Date(cal.getTime() + hours * 3600000) : null;
    const dir = hours >= 0 ? 'after' : 'before';
    return { ...base, flag: 'time-to-target', hoursToTarget: Number(hours.toPrecision(8)), band: `${hl.name} reaches ${Number(o.targetActivity).toLocaleString('en-US')} ${unit.text} ${duration(Math.abs(hours))} ${dir} calibration${when ? `, on ${sayAt(when)}` : ''}.`, bandLabel: `${duration(Math.abs(hours))} ${dir}`, notes: [`${hl.source}`, `Time = half-life × log2(${Number(o.activity).toLocaleString('en-US')} ÷ ${Number(o.targetActivity).toLocaleString('en-US')}) = ${sig(Math.abs(hours) / hl.hours)} half-lives.`, storage], note: NOTE };
  }
  const cal = stamp(o.calibration); const target = stamp(o.target);
  if (!cal) return { valid: false, message: 'Enter the calibration date and time.' };
  if (!target) return { valid: false, message: 'Enter the target date and time, or a target activity.' };
  const hours = (target.getTime() - cal.getTime()) / 3600000;
  const factor = 2 ** (-hours / hl.hours);
  const at = a0 * factor;
  if (!Number.isFinite(at) || at > 1e25) return { valid: false, message: 'The target time is so far before calibration that the activity is not a usable number. Check the two times.' };
  return {
    ...base, flag: hours >= 0 ? 'decayed' : 'precalibration', activity: Number((at / unit.bq).toPrecision(8)), decayFactor: Number(factor.toPrecision(8)), elapsedHalfLives: Number((hours / hl.hours).toPrecision(8)),
    band: `${sig(at / unit.bq)} ${unit.text} of ${hl.name} on ${sayAt(target)}: ${both(at)}.`,
    bandLabel: `${sig(at / unit.bq)} ${unit.text}`,
    notes: [hl.source, `${duration(Math.abs(hours))} ${hours >= 0 ? 'after' : 'before'} calibration is ${sig(Math.abs(hours) / hl.hours)} half-lives; decay factor ${sig(factor)}. ${Number(o.activity).toLocaleString('en-US')} ${unit.text} × ${sig(factor)} = ${sig(at / unit.bq)} ${unit.text}.`, storage], note: NOTE,
  };
}

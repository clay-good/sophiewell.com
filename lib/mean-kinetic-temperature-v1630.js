// spec-v1630 tool 14: mean kinetic temperature of a storage log.
//
// ICH Q1A(R2), glossary, re-read on October 11, 2026: mean kinetic temperature is "a single derived
// temperature that, if maintained over a defined period of time, affords the same thermal challenge
// to a drug substance or drug product as would be experienced over a range of both higher and lower
// temperatures for an equivalent defined period", it "is higher than the arithmetic mean
// temperature and takes into account the Arrhenius equation", and "the formula of J. D. Haynes
// (J. Pharm. Sci., 60:927-929, 1971) can be used." ICH prints neither the formula nor an activation
// energy. Both are taken as printed in an open-access paper (CC BY 4.0), re-read the same day:
// Jenkins D, Cancel A, Layloff T, et al. BMC Public Health. 2022;22:300 (PMC8842539), equation 1:
//   Tk = (Ea / R) / -ln( (e^(-Ea/(R T1)) + e^(-Ea/(R T2)) + ... + e^(-Ea/(R Tn))) / n )
// with each T in kelvin, R = 0.0083144 kJ/(mol K), and "83.144 kJ/mol as a default Ea" used on the
// assumption "that stability data was unknown or unavailable from the product's manufacturer".
// Haynes 1971 itself was not opened.
//
// The formula weights every reading equally, so the readings must be at equal intervals. When each
// line carries its own duration, every term is weighted by it instead. The activation energy is
// required: the page offers 83.144 and the result always names the value used. No band is applied
// unless the reader enters the product's labeled limit.
//
// MKT does not decide whether a product is usable after an excursion, and it is not a method for
// vaccines; the result says both.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const GAS_CONSTANT = 0.0083144; // kJ/(mol K), as the paper prints it
export const DEFAULT_ACTIVATION_ENERGY = 83.144; // kJ/mol, the paper's default
export const UNITS = [
  { value: 'C', text: '°C' },
  { value: 'F', text: '°F' },
];
const NOTE = 'MKT summarizes a log; it does not decide whether a product is usable after an excursion (the manufacturer does), and it is not a method for vaccines. The formula and the 83.144 kJ/mol default are from Jenkins et al., BMC Public Health 2022.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const round = (x, d = 2) => Number(Number(x).toFixed(d));
const show = (x, d = 2) => round(x, d).toLocaleString('en-US', { maximumFractionDigits: d });
const toC = (x, unit) => (unit === 'F' ? (x - 32) / 1.8 : x);
const fromC = (c, unit) => (unit === 'F' ? c * 1.8 + 32 : c);

export function meanKineticTemperature(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = String(o.unit ?? '').trim();
  if (unit !== 'C' && unit !== 'F') return { valid: false, message: 'Choose the unit of the readings: °C or °F.' };
  const u = `°${unit}`;
  if (blank(o.activationEnergy)) return { valid: false, message: `Enter the activation energy in kJ/mol. ${DEFAULT_ACTIVATION_ENERGY} is the default used when the manufacturer's stability data are not available.` };
  const ef = inputFault([['the activation energy', o.activationEnergy, 1, 500, 'kJ/mol']]);
  if (ef) return { valid: false, message: ef };
  const ea = Number(o.activationEnergy);

  const lines = String(o.readings ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: false, message: 'Enter at least two readings, one per line. Readings must be at equal intervals, or each line may carry its own duration: temperature, hours.' };
  if (lines.length > 20000) return { valid: false, message: `${lines.length.toLocaleString('en-US')} lines is more than the 20,000 this tool reads.` };
  const [lo, hi] = unit === 'F' ? [-148, 212] : [-100, 100];
  const rows = []; let withDuration = null;
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length > 2) return { valid: false, message: `Line ${i + 1}: enter one temperature, or a temperature, a comma, then its duration in hours.` };
    const has = p.length === 2;
    if (withDuration === null) withDuration = has;
    else if (withDuration !== has) return { valid: false, message: `Line ${i + 1}: give a duration on every line or on none. Readings without durations must be at equal intervals.` };
    const tf = inputFault([[`the temperature on line ${i + 1}`, p[0], lo, hi, u]]);
    if (tf) return { valid: false, message: tf };
    let w = 1;
    if (has) {
      const df = inputFault([[`the duration on line ${i + 1}`, p[1], null, 1e6, 'hours']]);
      if (df) return { valid: false, message: df };
      w = Number(p[1]);
    }
    rows.push({ k: toC(Number(p[0]), unit) + 273.15, entered: Number(p[0]), w });
  }
  // Tk = (Ea/R) / -ln(weighted mean of e^(-Ea/(R T))); the largest exponent is factored out so the sum cannot underflow.
  const x = ea / GAS_CONSTANT;
  const exps = rows.map((r) => -x / r.k);
  const top = Math.max(...exps);
  const total = rows.reduce((s, r) => s + r.w, 0);
  const sum = rows.reduce((s, r, i) => s + r.w * Math.exp(exps[i] - top), 0);
  const mktK = x / -(top + Math.log(sum / total));
  const mktC = mktK - 273.15;
  const meanC = rows.reduce((s, r) => s + r.w * (r.k - 273.15), 0) / total;
  const min = Math.min(...rows.map((r) => r.entered)); const max = Math.max(...rows.map((r) => r.entered));
  const other = unit === 'F' ? `${show(mktC)} °C` : `${show(fromC(mktC, 'F'))} °F`;
  const mkt = fromC(mktC, unit);
  const notes = [
    `Mean kinetic temperature: ${show(mkt)} ${u} (${other}; ${show(mktK)} K), with an activation energy of ${show(ea, 3)} kJ/mol${ea === DEFAULT_ACTIVATION_ENERGY ? ', the default used when the manufacturer\'s stability data are not available' : ''} and R = ${GAS_CONSTANT} kJ/(mol·K).`,
    `${rows.length.toLocaleString('en-US')} readings${withDuration ? `, weighted by their durations (${show(total)} hours in all)` : ', weighted equally (taken to be at equal intervals)'}: arithmetic mean ${show(fromC(meanC, unit))} ${u}, lowest ${show(min)} ${u}, highest ${show(max)} ${u}.`,
  ];
  const out = { valid: true, mkt: round(mkt), mktC: round(mktC), mktF: round(fromC(mktC, 'F')), mktK: round(mktK), mean: round(fromC(meanC, unit)), min, max, n: rows.length, activationEnergy: ea, timeWeighted: withDuration };
  let band = `Mean kinetic temperature ${show(mkt)} ${u} (${other}) over ${rows.length.toLocaleString('en-US')} readings.`;
  if (!blank(o.limit)) {
    const lf = inputFault([['the labeled limit', o.limit, lo, hi, u]]);
    if (lf) return { valid: false, message: lf };
    const limit = Number(o.limit);
    const above = round(mkt) > limit;
    notes.push(`Your labeled limit: ${show(limit)} ${u}. The mean kinetic temperature is ${above ? 'above' : 'at or below'} it${max > limit ? `; the highest single reading, ${show(max)} ${u}, is above it` : ''}.`);
    band = `Mean kinetic temperature ${show(mkt)} ${u} (${other}), ${above ? 'above' : 'at or below'} your labeled limit of ${show(limit)} ${u}.`;
    Object.assign(out, { limit, aboveLimit: above, abnormal: above });
  }
  return { ...out, band, bandLabel: `${show(mkt)} ${u}`, notes, note: NOTE };
}

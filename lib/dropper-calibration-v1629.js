// spec-v1629 tool 21: dropper calibration and dose in drops.
//
// An arithmetic identity. Drops per mL is a property of one dropper with one liquid, so it is
// measured, not looked up:
//   drops per mL     = drops counted / the volume they made
//   drops for a dose = dose volume x drops per mL   (dose volume = dose in mg / concentration in mg/mL)
// The drops are shown unrounded and rounded to a whole drop, with the dose the whole drops deliver
// and the error that rounding makes. Nothing here is cited to a textbook or a compendium
// (spec-v1628 section 2).
//
// No default drops-per-mL figure, as in days-supply: no federal source gives one, and the familiar
// figure is a compendium's text. A dose that rounds to no drops is reported as not measurable with
// this dropper.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const DOSE_UNITS = [
  { value: 'mL', text: 'mL' },
  { value: 'mg', text: 'mg (with the concentration)' },
];
const IDENTITY_NOTE = 'An arithmetic identity. Drops per mL belongs to one dropper with one liquid, held the same way each time: measure it with the dropper and the liquid you will use. The tool does the arithmetic and does not say what to give.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function dropperCalibration(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of drops counted', o.drops, 1, 100000, ''], ['the volume those drops made', o.volume, null, 1000, 'mL']]);
  if (f) return { valid: false, message: `${f}${blank(o.drops) || blank(o.volume) ? ' There is no standard drops-per-mL figure to fall back on: count the drops your dropper makes with this liquid.' : ''}` };
  const perMl = Number(o.drops) / Number(o.volume);
  const notes = [`Drops per mL: ${show(Number(o.drops))} drops ÷ ${show(Number(o.volume))} mL = ${show(perMl)}.`];
  const base = { valid: true, dropsPerMl: sig(perMl), note: IDENTITY_NOTE };
  if (blank(o.dose)) {
    return { ...base, band: `This dropper gives ${show(perMl)} drops per mL of this liquid.`, bandLabel: `${show(perMl)} drops/mL`, notes };
  }
  const unit = String(o.doseUnit ?? '').trim();
  if (unit !== 'mL' && unit !== 'mg') return { valid: false, message: 'Choose the unit of the dose: mL, or mg with the concentration.' };
  const df = inputFault([['the dose', o.dose, null, 1e6, unit]]);
  if (df) return { valid: false, message: df };
  let doseMl = Number(o.dose);
  let conc = null;
  if (unit === 'mg') {
    const cf = inputFault([['the concentration', o.concentration, null, 1e6, 'mg/mL']]);
    if (cf) return { valid: false, message: cf };
    conc = Number(o.concentration);
    doseMl = Number(o.dose) / conc;
    notes.push(`Dose volume: ${show(Number(o.dose))} mg ÷ ${show(conc)} mg/mL = ${show(doseMl)} mL.`);
  }
  const exact = doseMl * perMl;
  const whole = Math.round(sig(exact));
  notes.push(`Drops for the dose: ${show(doseMl)} mL × ${show(perMl)} drops/mL = ${show(exact)} drops.`);
  if (whole < 1) {
    notes.push('That rounds to no drops, so it cannot be measured in whole drops with this dropper.');
    return { ...base, dropsExact: sig(exact), dropsWhole: 0, measurable: false, abnormal: true, band: `This dose is ${show(exact)} of a drop: not measurable with this dropper.`, bandLabel: 'Not measurable in drops', notes };
  }
  const deliveredMl = whole / perMl;
  const errorPct = (Math.abs(deliveredMl - doseMl) / doseMl) * 100;
  const delivered = conc === null ? `${show(deliveredMl)} mL` : `${show(deliveredMl)} mL (${show(deliveredMl * conc)} mg)`;
  notes.push(`${whole} whole drop${whole === 1 ? '' : 's'} deliver${whole === 1 ? 's' : ''} ${delivered}, ${sig(errorPct) === 0 ? 'exactly the dose' : `${show(errorPct)}% ${deliveredMl > doseMl ? 'over' : 'under'} the dose`}.`);
  return {
    ...base, dropsExact: sig(exact), dropsWhole: whole, deliveredMl: sig(deliveredMl), errorPercent: sig(errorPct), measurable: true,
    band: `${whole} drop${whole === 1 ? '' : 's'} (${show(exact)} before rounding), delivering ${delivered}.`,
    bandLabel: `${whole} drop${whole === 1 ? '' : 's'}`,
    notes,
  };
}

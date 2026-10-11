// spec-v1629 tool 9: minimum weighable (or measurable) quantity and percent error.
//
// An arithmetic identity, relative error:
//   minimum quantity = sensitivity / (largest error accepted / 100)
//   percent error    = |obtained - wanted| / wanted x 100
//   potential error  = sensitivity / quantity x 100
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2).
//
// Both the sensitivity and the error limit are reader input and start blank. The familiar balance
// figures are a compendium's text and are not shipped as defaults: the reader enters the balance's
// value from its certificate and the limit their standard sets.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'minimum', text: 'Smallest quantity inside an error limit' },
  { value: 'potential', text: 'Potential error of a quantity on this device' },
  { value: 'error', text: 'Percent error of a measurement made' },
];
export const UNITS = [
  { value: 'mg', text: 'mg (a balance)' },
  { value: 'g', text: 'g (a balance)' },
  { value: 'mL', text: 'mL (a measuring device)' },
];
const IDENTITY_NOTE = 'An arithmetic identity (relative error). The sensitivity comes from the device\'s certificate or calibration and the error limit from the standard you work to; neither is assumed here.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
// "At the limit" passes: 6 / 120 x 100 is 5.000000000000001 in floating point.
const within = (value, limit) => sig(value) <= sig(limit);

export function minWeighableQuantity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose what to work out: the smallest quantity, the potential error of a quantity, or the percent error of a measurement.' };
  const unit = String(o.unit ?? '').trim();
  if (!UNITS.some((u) => u.value === unit)) return { valid: false, message: 'Choose the unit the device measures in: mg, g or mL.' };

  if (mode === 'minimum') {
    const f = inputFault([['the device\'s sensitivity', o.sensitivity, null, 1e9, unit], ['the largest error accepted', o.errorLimit, null, 100, 'percent']]);
    if (f) return { valid: false, message: f };
    const s = Number(o.sensitivity); const e = Number(o.errorLimit);
    const min = s / (e / 100);
    return {
      valid: true, mode, minimum: sig(min),
      band: `Smallest quantity inside ${show(e)}% error: ${show(min)} ${unit}.`,
      bandLabel: `${show(min)} ${unit}`,
      notes: [`${show(s)} ${unit} ÷ (${show(e)} ÷ 100) = ${show(min)} ${unit}. Anything smaller carries a potential error above ${show(e)}% on this device.`],
      note: IDENTITY_NOTE,
    };
  }

  let limit = null;
  if (!blank(o.errorLimit)) {
    const lf = inputFault([['the largest error accepted', o.errorLimit, null, 100, 'percent']]);
    if (lf) return { valid: false, message: lf };
    limit = Number(o.errorLimit);
  }
  const verdict = (pct) => (limit === null ? 'No error limit was entered, so the error is not judged.' : within(pct, limit) ? `That is inside the ${show(limit)}% limit entered.` : `That is outside the ${show(limit)}% limit entered.`);

  if (mode === 'potential') {
    const f = inputFault([['the quantity', o.quantity, null, 1e9, unit], ['the device\'s sensitivity', o.sensitivity, null, 1e9, unit]]);
    if (f) return { valid: false, message: f };
    const q = Number(o.quantity); const s = Number(o.sensitivity);
    const pct = (s / q) * 100;
    return {
      valid: true, mode, percentError: sig(pct), insideLimit: limit === null ? null : within(pct, limit),
      band: `Potential error of ${show(q)} ${unit} on this device: ${show(pct)}%.`,
      bandLabel: `${show(pct)}%`,
      notes: [`${show(s)} ${unit} ÷ ${show(q)} ${unit} × 100 = ${show(pct)}%.`, verdict(pct)],
      note: IDENTITY_NOTE,
    };
  }

  const f = inputFault([['the quantity wanted', o.wanted, null, 1e9, unit], ['the quantity actually obtained', o.obtained, 0, 1e9, unit]]);
  if (f) return { valid: false, message: f };
  const w = Number(o.wanted); const got = Number(o.obtained);
  const pct = (Math.abs(got - w) / w) * 100;
  const way = got === w ? 'exactly the quantity wanted' : got > w ? 'over' : 'under';
  return {
    valid: true, mode, percentError: sig(pct), insideLimit: limit === null ? null : within(pct, limit),
    band: `Percent error: ${show(pct)}% (${way}).`,
    bandLabel: `${show(pct)}%`,
    notes: [`|${show(got)} − ${show(w)}| ÷ ${show(w)} × 100 = ${show(pct)}%.`, verdict(pct)],
    note: IDENTITY_NOTE,
  };
}

// spec-v1629 tool 3: serial dilution plan.
//
// An arithmetic identity, repeated dilution: each step's strength is the last one's divided by that
// step's factor, and the factors multiply to the total, stock / target. Nothing here is cited to a
// textbook or a compendium (spec-v1628 section 2).
//
//   Fixed factor f:    steps = ceiling(log(total) / log(f)); every step but the last uses f, and the
//                      last uses total / f^(steps - 1), so the product lands exactly on the target
//                      even when the total is not a power of f.
//   Minimum volume m:  the fewest equal steps for which every transfer is at or above m. With each
//                      step made to volume W, a step of factor g transfers W / g, so g may be at most
//                      W / m and steps = ceiling(log(total) / log(W / m)); each step then uses
//                      total^(1 / steps).
//
// A step's transfer is its volume divided by its factor, made up to that volume with diluent. Every
// step is made to the final volume unless the reader gives a different volume for the steps before the
// last; the result says which. A transfer larger than the step before it made is refused.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const UNITS = [
  { value: 'percent', text: '%' },
  { value: 'mg-ml', text: 'mg/mL' },
  { value: 'mcg-ml', text: 'mcg/mL' },
  { value: 'units-ml', text: 'units/mL' },
];
const SU = { percent: '%', 'mg-ml': ' mg/mL', 'mcg-ml': ' mcg/mL', 'units-ml': ' units/mL' };
const IDENTITY_NOTE = 'An arithmetic identity (repeated dilution): the step factors multiply to the total factor. The tool does the arithmetic; it does not say what to make. Make each step up to its volume; do not add the diluent as a separately measured volume where volumes are not additive.';
const MAX_STEPS = 20;

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
// ceiling that forgives the last bits of a logarithm: log(1000) / log(10) is 2.9999999999999996.
const ceilLog = (total, base) => Math.ceil(Math.log(total) / Math.log(base) - 1e-9);

export function serialDilution(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.unit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(SU, key)) return { valid: false, message: 'Choose the strength unit (the same for the stock and the target).' };
  const su = SU[key];
  const f = inputFault([['the stock strength', o.stock, null, 1e12, ''], ['the target strength', o.target, null, 1e12, ''], ['the volume wanted at the last step', o.finalVolume, null, 1e6, 'mL']]);
  if (f) return { valid: false, message: f };
  const stock = Number(o.stock); const target = Number(o.target); const V = Number(o.finalVolume);
  if (!(target < stock)) return { valid: false, message: 'The target strength must be below the stock strength.' };
  const total = stock / target;

  const haveF = !blank(o.factor); const haveM = !blank(o.minVolume);
  if (haveF === haveM) return { valid: false, message: 'Enter either a dilution factor per step or the smallest volume you can measure, not both and not neither.' };
  let W = V;
  if (!blank(o.stepVolume)) {
    const wf = inputFault([['the volume of each earlier step', o.stepVolume, null, 1e6, 'mL']]);
    if (wf) return { valid: false, message: wf };
    W = Number(o.stepVolume);
  }

  let factors;
  if (haveF) {
    const ff = inputFault([['the dilution factor per step', o.factor, 1, 1e6, '']]);
    if (ff) return { valid: false, message: ff };
    const step = Number(o.factor);
    if (!(step > 1)) return { valid: false, message: 'The dilution factor per step must be above 1.' };
    const n = Math.max(1, ceilLog(total, step));
    if (n > MAX_STEPS) return { valid: false, message: `That takes ${n} steps, more than the ${MAX_STEPS} this tool plans. Use a larger factor per step.` };
    factors = Array.from({ length: n }, (_, i) => (i < n - 1 ? step : total / step ** (n - 1)));
  } else {
    const mf = inputFault([['the smallest volume you can measure', o.minVolume, null, 1e6, 'mL']]);
    if (mf) return { valid: false, message: mf };
    const m = Number(o.minVolume);
    const room = Math.min(V, W) / m;
    if (!(room > 1)) return { valid: false, message: `A step of ${show(Math.min(V, W))} mL cannot be made from a transfer of at least ${show(m)} mL: the step volume must be larger than the smallest volume you can measure.` };
    const n = Math.max(1, ceilLog(total, room));
    if (n > MAX_STEPS) return { valid: false, message: `That takes ${n} steps, more than the ${MAX_STEPS} this tool plans. Use a larger step volume or a smaller measurable volume.` };
    factors = Array.from({ length: n }, () => total ** (1 / n));
  }

  const steps = [];
  let strength = stock;
  for (const [i, g] of factors.entries()) {
    const volume = i === factors.length - 1 ? V : W;
    const transfer = volume / g;
    const from = i === 0 ? 'stock' : `step ${i}`;
    if (i > 0 && transfer > steps[i - 1].volume * (1 + 1e-9)) {
      return { valid: false, message: `Step ${i + 1} needs ${show(transfer)} mL of step ${i}, which made only ${show(steps[i - 1].volume)} mL. Enter a larger volume for the earlier steps.` };
    }
    strength = i === factors.length - 1 ? target : strength / g;
    steps.push({ step: i + 1, from, factor: sig(g), transfer: sig(transfer), volume: sig(volume), strength: sig(strength) });
  }
  const notes = steps.map((s) => `Step ${s.step}: ${show(s.transfer)} mL of ${s.from}, made up to ${show(s.volume)} mL (1 in ${show(s.factor)}), gives ${show(s.strength)}${su}.`);
  notes.push(`Total factor: ${show(stock)} ÷ ${show(target)} = ${show(total)}; the step factors multiply to it.`);
  notes.push(blank(o.stepVolume) ? `Every step is made to ${show(V)} mL, the volume wanted at the last step, because no other volume was entered for the earlier steps.` : `The steps before the last are made to ${show(W)} mL each.`);
  if (haveM) notes.push(`With ${show(Number(o.minVolume))} mL as the smallest measurable volume, ${steps.length} step${steps.length === 1 ? ' is' : 's are'} the fewest in which every transfer is at or above it (smallest transfer ${show(Math.min(...steps.map((s) => s.transfer)))} mL).`);
  return {
    valid: true, steps, totalFactor: sig(total),
    band: `${steps.length} step${steps.length === 1 ? '' : 's'} from ${show(stock)}${su} to ${show(target)}${su}, a total dilution of 1 in ${show(total)}.`,
    bandLabel: `${steps.length} step${steps.length === 1 ? '' : 's'}`,
    notes, note: IDENTITY_NOTE,
  };
}

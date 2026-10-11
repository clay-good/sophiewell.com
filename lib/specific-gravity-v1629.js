// spec-v1629 tool 11: density, specific gravity and weight-to-volume.
//
// Definitions, not a cited source: density is mass per volume, and specific gravity is a liquid's
// density over water's. With water taken as 1 g/mL (the result says so):
//   weight (g) = volume (mL) x specific gravity        volume (mL) = weight (g) / specific gravity
//   specific gravity = (container filled with the liquid - empty) / (filled with water - empty)
//   % w/v = % w/w x specific gravity
// Nothing here is cited to a textbook or a compendium (spec-v1628 section 2).
//
// A measurement that gives a specific gravity of zero or less is refused: the container weights are
// wrong, and no liquid has one.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'weight', text: 'Weight of a volume' },
  { value: 'volume', text: 'Volume of a weight' },
  { value: 'measure', text: 'Specific gravity from three weighings' },
  { value: 'strength', text: '% w/w to % w/v' },
];
const WATER_NOTE = 'Water is taken as 1 g/mL, so a specific gravity and a density in g/mL are the same number here. Both change with temperature; use the value for the temperature you work at.';
const IDENTITY_NOTE = 'A definition (density is mass per volume; specific gravity is a liquid\'s density over water\'s). The tool does the arithmetic; it does not say what to make.';
const SG = ['the specific gravity', null, 25, ''];

const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });

export function specificGravity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose what to work out: a weight, a volume, a specific gravity from weighings, or % w/w to % w/v.' };
  const sgRow = [SG[0], o.specificGravity, SG[1], SG[2], SG[3]];
  const done = (band, bandLabel, notes, extra) => ({ valid: true, mode, ...extra, band, bandLabel, notes: [...notes, WATER_NOTE], note: IDENTITY_NOTE });

  if (mode === 'weight') {
    const f = inputFault([['the volume', o.volume, null, 1e9, 'mL'], sgRow]);
    if (f) return { valid: false, message: f };
    const g = Number(o.volume) * Number(o.specificGravity);
    return done(`${show(Number(o.volume))} mL weighs ${show(g)} g.`, `${show(g)} g`, [`${show(Number(o.volume))} mL × ${show(Number(o.specificGravity))} = ${show(g)} g.`], { weightG: sig(g) });
  }
  if (mode === 'volume') {
    const f = inputFault([['the weight', o.weight, null, 1e9, 'g'], sgRow]);
    if (f) return { valid: false, message: f };
    const mL = Number(o.weight) / Number(o.specificGravity);
    return done(`${show(Number(o.weight))} g occupies ${show(mL)} mL.`, `${show(mL)} mL`, [`${show(Number(o.weight))} g ÷ ${show(Number(o.specificGravity))} = ${show(mL)} mL.`], { volumeMl: sig(mL) });
  }
  if (mode === 'strength') {
    const f = inputFault([['the % w/w strength', o.percentWw, null, 100, ''], sgRow]);
    if (f) return { valid: false, message: f };
    const wv = Number(o.percentWw) * Number(o.specificGravity);
    return done(`${show(Number(o.percentWw))}% w/w is ${show(wv)}% w/v.`, `${show(wv)}% w/v`, [`${show(Number(o.percentWw))}% w/w × ${show(Number(o.specificGravity))} = ${show(wv)}% w/v (grams per 100 mL): 100 mL weighs ${show(100 * Number(o.specificGravity))} g, of which ${show(Number(o.percentWw))}% is solute.`], { percentWv: sig(wv) });
  }
  const f = inputFault([['the weight of the empty container', o.empty, 0, 1e9, 'g'], ['the weight of the container filled with the liquid', o.filled, null, 1e9, 'g'], ['the weight of the container filled with water', o.water, null, 1e9, 'g']]);
  if (f) return { valid: false, message: f };
  const empty = Number(o.empty); const filled = Number(o.filled); const water = Number(o.water);
  if (!(water > empty)) return { valid: false, message: 'The container filled with water must weigh more than the empty container. Check the weights entered.' };
  if (!(filled > empty)) return { valid: false, message: 'The container filled with the liquid must weigh more than the empty container: these weights give a specific gravity of zero or less, which no liquid has. Check the weights entered.' };
  const sg = (filled - empty) / (water - empty);
  if (sg > 25) return { valid: false, message: `These weights give a specific gravity of ${show(sg)}, above any liquid. Check the weights entered.` };
  return done(`Specific gravity: ${show(sg)}.`, show(sg), [`(${show(filled)} − ${show(empty)}) ÷ (${show(water)} − ${show(empty)}) = ${show(filled - empty)} ÷ ${show(water - empty)} = ${show(sg)}.`], { specificGravity: sig(sg) });
}

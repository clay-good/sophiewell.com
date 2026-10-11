// spec-v1629 tool 20: apothecary, avoirdupois and household measures.
//
// NIST Handbook 44 (2026 edition), Appendix C, "General Tables of Units of Measurement", read on
// October 10, 2026:
//   mass     1 grain = 64.798 91 mg (exactly), the same grain in every system
//            20 grains = 1 scruple; 3 scruples = 1 apothecaries dram (60 grains);
//            8 drams = 1 apothecaries ounce (480 grains, 31.103 476 8 g);
//            12 ounces = 1 apothecaries pound (5,760 grains)
//            1 avoirdupois ounce = 437.5 grains = 28.349 523 125 g; 1 avoirdupois pound = 7,000
//            grains = 453.592 37 g
//   volume   1 gallon = 3,785.411 784 mL; 1 liquid quart = 946.352 9 mL; 1 liquid pint = 473.176 5 mL;
//            1 fluid ounce = 29.573 53 mL; 1 fluid dram = 3.696 691 mL; 1 minim = 0.061 611 52 mL
//            (60 minims = 1 fluid dram; 8 fluid drams = 1 fluid ounce; 16 fluid ounces = 1 pint)
//   kitchen  "1 teaspoon, measuring: 1/3 tablespoon (exactly), 5 milliliters, 1 1/3 fluid drams";
//            "1 tablespoon, measuring: 3 teaspoons (exactly), 15 milliliters, 4 fluid drams, 1/2 fluid
//            ounce (exactly)"; "1 cup, measuring: 8 fluid ounces (exactly), 237 milliliters". The
//            appendix calls the tablespoon and teaspoon "imprecise units ... rounded to the nearest
//            milliliter".
// 21 CFR 101.9(b)(5)(viii), read the same day in the eCFR: "For nutrition labeling purposes, a
// teaspoon means 5 milliliters (mL), a tablespoon means 15 mL, a cup means 240 mL, 1 fl oz means
// 30 mL, and 1 oz in weight means 28 g."
//
// Every volume here is derived from the gallon (231 cubic inches, 3,785.411 784 mL exactly) and every
// mass from the grain, so the figures agree with the table to the digits it prints. Where two
// definitions exist (the fluid ounce, the cup, the ounce by weight) both are shown, each with its
// source: the labeling values are a rule for food labels, not a measuring device.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const GRAIN_MG = 64.79891;
const GALLON_ML = 3785.411784;
const FLOZ_ML = GALLON_ML / 128;
const HB44 = 'NIST Handbook 44 (2026), Appendix C';
const FDA = '21 CFR 101.9(b)(5)(viii), "for nutrition labeling purposes"';

// value -> { text, kind: 'mass' (mg) | 'volume' (mL), metric, how, also?: [{ metric, source, how }] }
const UNIT_TABLE = {
  grain: { text: 'grain', kind: 'mass', metric: GRAIN_MG, how: 'exactly' },
  scruple: { text: 'scruple', kind: 'mass', metric: 20 * GRAIN_MG, how: '20 grains' },
  'dram-ap': { text: 'apothecaries dram', kind: 'mass', metric: 60 * GRAIN_MG, how: '3 scruples, 60 grains' },
  'ounce-ap': { text: 'apothecaries ounce', kind: 'mass', metric: 480 * GRAIN_MG, how: '8 drams, 480 grains' },
  'pound-ap': { text: 'apothecaries pound', kind: 'mass', metric: 5760 * GRAIN_MG, how: '12 apothecaries ounces, 5,760 grains' },
  'ounce-av': { text: 'avoirdupois ounce', kind: 'mass', metric: 437.5 * GRAIN_MG, how: '437.5 grains', also: [{ metric: 28000, source: FDA, how: '"1 oz in weight means 28 g"' }] },
  'pound-av': { text: 'avoirdupois pound', kind: 'mass', metric: 7000 * GRAIN_MG, how: '16 avoirdupois ounces, 7,000 grains' },
  minim: { text: 'minim', kind: 'volume', metric: FLOZ_ML / 480, how: '1/60 fluid dram' },
  'fluid-dram': { text: 'fluid dram', kind: 'volume', metric: FLOZ_ML / 8, how: '60 minims' },
  'fluid-ounce': { text: 'fluid ounce', kind: 'volume', metric: FLOZ_ML, how: '8 fluid drams', also: [{ metric: 30, source: FDA, how: '"1 fl oz means 30 mL"' }] },
  pint: { text: 'liquid pint', kind: 'volume', metric: GALLON_ML / 8, how: '16 fluid ounces' },
  quart: { text: 'liquid quart', kind: 'volume', metric: GALLON_ML / 4, how: '2 pints' },
  gallon: { text: 'gallon', kind: 'volume', metric: GALLON_ML, how: '231 cubic inches, exactly' },
  teaspoon: { text: 'teaspoon', kind: 'volume', metric: 5, how: 'the measuring teaspoon, rounded to the nearest milliliter; also given as 1⅓ fluid drams', also: [{ metric: 5, source: FDA, how: '"a teaspoon means 5 milliliters"' }], spoon: true },
  tablespoon: { text: 'tablespoon', kind: 'volume', metric: 15, how: 'the measuring tablespoon, 3 teaspoons, rounded to the nearest milliliter; also given as 4 fluid drams', also: [{ metric: 15, source: FDA, how: '"a tablespoon means 15 mL"' }], spoon: true },
  cup: { text: 'cup', kind: 'volume', metric: 8 * FLOZ_ML, how: 'the measuring cup, 8 fluid ounces exactly (printed as 237 milliliters)', also: [{ metric: 240, source: FDA, how: '"a cup means 240 mL"' }] },
};
// The picklist shows each unit capitalized ("Grain", "Fluid dram"); sentences use it in lower case.
export const UNITS = Object.entries(UNIT_TABLE).map(([value, u]) => ({ value, text: `${u.text[0].toUpperCase()}${u.text.slice(1)}` }));
const NOTE = 'Conversions from NIST Handbook 44, Appendix C. The apothecaries ounce (480 grains) and the avoirdupois ounce (437.5 grains) are different weights; the grain is the same in both. A household spoon is not a measuring device: Handbook 44 calls the teaspoon and tablespoon imprecise units. The tool converts; it does not say what to give.';

// Eight significant figures: 0.06161152, 31.103477, 29.573530.
const sig = (x) => Number(Number(x).toPrecision(8));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 8 });
function metricText(value, kind) {
  if (kind === 'mass') return value >= 1000 ? `${show(value / 1000)} g` : `${show(value)} mg`;
  return value >= 1000 ? `${show(value / 1000)} L` : `${show(value)} mL`;
}

export function apothecaryHouseholdMeasures(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.unit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(UNIT_TABLE, key)) return { valid: false, message: 'Choose the unit to convert from.' };
  const f = inputFault([['the quantity', o.quantity, null, 1e9, '']]);
  if (f) return { valid: false, message: f };
  const q = Number(o.quantity); const u = UNIT_TABLE[key];
  const total = q * u.metric;
  const plural = q === 1 ? u.text : `${u.text}s`;
  const notes = [`1 ${u.text} = ${metricText(u.metric, u.kind)} (${u.how}; ${HB44}).`];
  const alternatives = [];
  for (const a of u.also || []) {
    alternatives.push({ value: sig(q * a.metric), unit: u.kind === 'mass' ? 'mg' : 'mL', source: a.source });
    notes.push(sig(a.metric) === sig(u.metric)
      ? `The food-labeling rule uses the same figure: ${a.how} (${a.source}).`
      : `By the food-labeling rule, ${a.how}: ${show(q)} ${plural} = ${metricText(q * a.metric, u.kind)} (${a.source}). That is a rule for nutrition labels, not a unit of measure.`);
  }
  if (u.spoon) notes.push('Old prescriptions use the dram sign for a teaspoonful, but Handbook 44 gives the measuring teaspoon as 1⅓ fluid drams, not 1. It calls the teaspoon and tablespoon imprecise units; a household spoon is not a measuring device.');
  if (key === 'ounce-ap' || key === 'ounce-av') notes.push(`The other ounce: 1 ${key === 'ounce-ap' ? 'avoirdupois ounce is 28.349523 g (437.5 grains)' : 'apothecaries ounce is 31.103477 g (480 grains)'}. A troy ounce is the apothecaries ounce.`);
  if (key === 'pound-ap' || key === 'pound-av') notes.push(`The other pound: 1 ${key === 'pound-ap' ? 'avoirdupois pound is 453.59237 g (7,000 grains)' : 'apothecaries pound is 373.24172 g (5,760 grains)'}.`);
  if (u.kind === 'mass' && key !== 'grain') notes.push(`In grains: ${show(q * u.metric / GRAIN_MG)}.`);
  return {
    valid: true, kind: u.kind, value: sig(total), unit: u.kind === 'mass' ? 'mg' : 'mL', alternatives,
    band: `${show(q)} ${plural} = ${metricText(total, u.kind)}.`,
    bandLabel: metricText(total, u.kind),
    notes, note: NOTE,
  };
}

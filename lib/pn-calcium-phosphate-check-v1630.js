// spec-v1630 tool 9: calcium and phosphate concentrations in a parenteral nutrition bag.
//
//   calcium, mEq/L    = calcium (mEq) / volume (L)
//   phosphate, mmol/L = phosphate (mmol) / volume (L)
//   amino acids, %    = grams / volume (mL) x 100
// The volume is the final volume, or the volume at the point of lowest dilution when one is entered
// (the moment during compounding when both ions are most concentrated).
//
// Calcium and phosphate may be entered as milliliters of three products. Their strengths are label
// rows (spec-v1628 section 1), each re-read on DailyMed on October 11, 2026:
//   Calcium Gluconate Injection (WG Critical Care, version 5): "100 mg of calcium gluconate per mL
//     which contains 9.3 mg (i.e., 0.465 mEq) of elemental calcium."
//   Potassium Phosphates Injection (Civica, version 2): "provides phosphorus 3 mmol/mL (potassium
//     4.4 mEq/mL)."
//   Sodium Phosphates Injection (Civica, version 1): "approximately 3 mM of phosphorus/mL plus ...
//     (4 mEq) of sodium/mL."
// A row answers only while its label stands (lib/label-row.js). When it does not, that product's
// strength is not used: the reader enters the figure from the vial in hand, or enters mEq or mmol.
//
// No solubility curve ships. Curves are specific to the amino acid product, its concentration,
// cysteine, pH and temperature, and no label read prints one. The limit is the reader's, from the
// site's own curve or compounder software, and starts blank; without it the tool reports the
// concentrations and says it cannot judge. A result under the limit never says "compatible".
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = {
  'mL-gluconate': { ion: 'calcium', perMl: 0.465, unit: 'mEq', name: 'calcium gluconate 10%', setId: '16307c00-d0d5-4e05-821f-17b0c1a29fc9' },
  'mL-kphos': { ion: 'phosphate', perMl: 3, unit: 'mmol', name: 'potassium phosphates', setId: 'f7702b2f-d0d1-4696-896d-571607fc0dc8' },
  'mL-naphos': { ion: 'phosphate', perMl: 3, unit: 'mmol', name: 'sodium phosphates', setId: '8fd901e6-30cb-411a-b820-b9e79625ec7c' },
};
export const CALCIUM_UNITS = [
  { value: 'mEq', text: 'mEq of calcium' },
  { value: 'mL-gluconate', text: 'mL of calcium gluconate 10%' },
];
export const PHOSPHATE_UNITS = [
  { value: 'mmol', text: 'mmol of phosphate' },
  { value: 'mL-kphos', text: 'mL of potassium phosphates' },
  { value: 'mL-naphos', text: 'mL of sodium phosphates' },
];
export const LIMIT_KINDS = [
  { value: 'max-calcium', text: 'Maximum calcium, mEq/L, at this phosphate' },
  { value: 'sum', text: 'Maximum sum: calcium mEq/L + phosphate mmol/L' },
];
const NOTE = 'No solubility curve is built in: precipitation depends on the amino acid product and its concentration, cysteine, pH, temperature and mixing order. The limit is your own. Being at or under it does not make an admixture compatible.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

// An amount of one ion: entered directly, or as milliliters of a product at its label strength.
function amount(ionLabel, unitKey, value, ownPerMl, now, table) {
  const p = PRODUCTS[unitKey];
  if (!p) {
    const f = inputFault([[`the ${ionLabel}`, value, 0, 1e5, unitKey]]);
    return f ? { fault: f } : { value: Number(value), line: null };
  }
  const f = inputFault([[`the volume of ${p.name}`, value, 0, 1e5, 'mL']]);
  if (f) return { fault: f };
  const row = labelRow(p.setId, now, table);
  let perMl = p.perMl; let from = `${row.edition}`;
  if (!row.answers) {
    if (blank(ownPerMl)) return { fault: `The ${p.name} strength is withheld: ${row.why}. Enter the ${p.unit} per mL from the vial in hand, or the ${ionLabel} in ${p.unit}.`, withheld: true, url: row.url };
    const of = inputFault([[`the ${p.unit} per mL on the ${p.name} label`, ownPerMl, null, 1000, `${p.unit}/mL`]]);
    if (of) return { fault: of };
    perMl = Number(ownPerMl); from = 'the figure you entered from the label in hand';
  }
  const v = Number(value) * perMl;
  return { value: v, line: `${ionLabel[0].toUpperCase()}${ionLabel.slice(1)}: ${show(Number(value))} mL of ${p.name} × ${show(perMl)} ${p.unit}/mL = ${show(v)} ${p.unit} (${from}).`, url: row.url, ownFigure: !row.answers };
}

export function pnCalciumPhosphateCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const vf = inputFault([['the final volume', o.finalVolume, null, 1e5, 'mL']]);
  if (vf) return { valid: false, message: vf };
  const cu = String(o.calciumUnit ?? '').trim();
  if (!CALCIUM_UNITS.some((u) => u.value === cu)) return { valid: false, message: 'Choose how the calcium is entered: mEq, or mL of calcium gluconate 10%.' };
  const pu = String(o.phosphateUnit ?? '').trim();
  if (!PHOSPHATE_UNITS.some((u) => u.value === pu)) return { valid: false, message: 'Choose how the phosphate is entered: mmol, or mL of potassium or sodium phosphates.' };
  const ca = amount('calcium', cu, o.calcium, o.calciumPerMl, now, table);
  if (ca.fault) return { valid: false, message: ca.fault, ...(ca.withheld ? { withheld: 'calcium', labelUrl: ca.url } : {}) };
  const ph = amount('phosphate', pu, o.phosphate, o.phosphatePerMl, now, table);
  if (ph.fault) return { valid: false, message: ph.fault, ...(ph.withheld ? { withheld: 'phosphate', labelUrl: ph.url } : {}) };

  const finalVolume = Number(o.finalVolume);
  let volume = finalVolume; let volumeNote = null;
  if (!blank(o.lowestVolume)) {
    const lf = inputFault([['the volume at the point of lowest dilution', o.lowestVolume, null, 1e5, 'mL']]);
    if (lf) return { valid: false, message: lf };
    volume = Number(o.lowestVolume);
    if (volume > finalVolume) return { valid: false, message: 'The volume at the point of lowest dilution cannot be more than the final volume.' };
    volumeNote = `Concentrations are on ${show(volume)} mL, the volume at the point of lowest dilution, not the final ${show(finalVolume)} mL.`;
  }
  const caL = ca.value / (volume / 1000); const phL = ph.value / (volume / 1000); const sum = caL + phL;
  const notes = [];
  if (ca.line) notes.push(ca.line);
  if (ph.line) notes.push(ph.line);
  notes.push(`Calcium ${show(ca.value)} mEq ÷ ${show(volume / 1000)} L = ${show(caL)} mEq/L. Phosphate ${show(ph.value)} mmol ÷ ${show(volume / 1000)} L = ${show(phL)} mmol/L. Sum ${show(sum)}.`);
  if (volumeNote) notes.push(volumeNote);
  const out = { valid: true, calciumMEqPerL: sig(caL), phosphateMmolPerL: sig(phL), sum: sig(sum), volumeUsed: sig(volume) };
  if (!blank(o.aminoAcidGrams)) {
    const af = inputFault([['the amino acid grams', o.aminoAcidGrams, 0, 1e4, 'g']]);
    if (af) return { valid: false, message: af };
    const pct = (Number(o.aminoAcidGrams) / finalVolume) * 100;
    // The most concentrated amino acid stock is 20%, so a final concentration above it cannot be made.
    if (pct > 20 + 1e-9) return { valid: false, message: `${show(Number(o.aminoAcidGrams))} g of amino acids in ${show(finalVolume)} mL is ${show(pct)}%, more than the most concentrated amino acid stock (20%) can give. Check the grams and the final volume.` };
    out.aminoAcidPercent = sig(pct);
    notes.push(`Amino acids: ${show(Number(o.aminoAcidGrams))} g in ${show(finalVolume)} mL is ${show(pct)}% final.`);
  }
  const head = `Calcium ${show(caL)} mEq/L and phosphate ${show(phL)} mmol/L (sum ${show(sum)})`;
  const kind = String(o.limitKind ?? '').trim();
  if (blank(o.limit) && !kind) {
    notes.push('No limit was entered, so the tool cannot place these against one: it reports the concentrations only.');
    return { ...out, band: `${head}. No limit entered: concentrations only.`, bandLabel: `Ca ${show(caL)} mEq/L, P ${show(phL)} mmol/L`, notes, note: NOTE };
  }
  if (!LIMIT_KINDS.some((k) => k.value === kind)) return { valid: false, message: 'Choose what your limit is: a maximum calcium at this phosphate, or a maximum sum of the two.' };
  const lf = inputFault([['your limit', o.limit, null, 1e4, kind === 'sum' ? '' : 'mEq/L']]);
  if (lf) return { valid: false, message: lf };
  const limit = Number(o.limit);
  const tested = kind === 'sum' ? sum : caL;
  const above = sig(tested) > limit;
  const what = kind === 'sum' ? `the sum, ${show(sum)},` : `calcium, ${show(caL)} mEq/L,`;
  notes.push(`Your limit: ${kind === 'sum' ? `a sum of ${show(limit)}` : `calcium ${show(limit)} mEq/L at this phosphate`}; ${what} is ${above ? 'above' : 'at or under'} it.`);
  return {
    ...out, limit, aboveLimit: above, abnormal: above,
    band: `${head}: ${above ? 'above' : 'at or under'} your limit of ${show(limit)}${kind === 'sum' ? ' for the sum' : ' mEq/L of calcium'}.`,
    bandLabel: above ? 'Above your limit' : 'At or under your limit',
    notes, note: NOTE,
  };
}

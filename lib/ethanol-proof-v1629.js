// spec-v1629 tool 19: alcohol proof, proof gallons, tax and dilution.
//
// The federal gauging rule, read on October 10, 2026 in the eCFR (27 CFR part 30) and in the 2024
// edition of the United States Code (26 U.S.C. 5001):
//   27 CFR 30.11   "Proof. The ethyl alcohol content of a liquid at 60 degrees Fahrenheit, stated as
//                  twice the percent of ethyl alcohol by volume." "Gallon or wine gallon. The liquid
//                  measure equivalent to the volume of 231 cubic inches." "Proof gallon. A United
//                  States gallon of proof spirits, or the alcoholic equivalent thereof."
//   27 CFR 30.31(a) "The proof of spirits shall be determined to the nearest tenth degree which shall
//                  be the proof used in determining the proof gallons."
//   27 CFR 30.66   Table 6: "divide the alcohol in the given strength by the alcohol in the required
//                  strength, multiply the quotient by the water in the required strength, and
//                  subtract the water in the given strength from the product. The remainder is the
//                  number of gallons of water to be added to 100 gallons of spirits".
//   26 U.S.C. 5001(a)(1) "a tax at the rate of $13.50 on each proof gallon"; (c)(1) reduced rates for
//                  a distilled spirits operation: $2.70 on the first 100,000 proof gallons and $13.34
//                  on the next 22,130,000.
//
// Proof gallons = wine gallons x proof / 100. A wine gallon of 231 cubic inches is 3.785411784 L
// (231 x 16.387064 mL, the inch being 2.54 cm exactly).
//
// Reduce mode exists because alcohol and water contract when mixed: C1V1 understates the water to
// add. Table 6's "alcohol" column is the proof divided by 2; its "water" column is not derivable and
// is reader input, from the table (a scanned 1918 table on ttb.gov that this tool does not ship).
// No intermediate value is rounded. The regulation's two worked examples print truncated figures
// (1.84 where the unrounded arithmetic gives 1.89; 12.42 where it gives 12.43); for those inputs the
// result prints the regulation's figure beside its own and says why they differ.
//
// The tax rate is reader input: the statute's general rate and the two reduced rates are named in
// the result, and which applies is the reader's to say. Tax-free alcohol and denatured formulas are
// not covered.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MODES = [
  { value: 'convert', text: 'Percent by volume and proof' },
  { value: 'gallons', text: 'Proof gallons' },
  { value: 'tax', text: 'Tax on proof gallons' },
  { value: 'reduce', text: 'Water to add to reduce proof (Table 6)' },
];
export const VOLUME_UNITS = [
  { value: 'gal', text: 'wine gallons' },
  { value: 'L', text: 'liters' },
];
export const LITERS_PER_GALLON = 3.785411784;
const RATES = 'The statute\'s general rate is $13.50 per proof gallon (26 U.S.C. 5001(a)(1)); for a distilled spirits operation the reduced rates are $2.70 on the first 100,000 proof gallons and $13.34 on the next 22,130,000 in a calendar year (5001(c)(1)), as printed in the 2024 edition of the United States Code.';
const NOTE = 'The federal gauging rule (27 CFR part 30). Proof is measured at 60 °F. The tool does the arithmetic; tax-free alcohol permits and denatured formulas are not covered.';
// The regulation's own worked reductions, whose printed answers come from truncated intermediates.
const REG_EXAMPLES = [
  { from: 191, to: 188, w1: 5.59, w2: 7.36, printed: 1.84, why: 'The regulation writes 95.5 ÷ 94.0 = 1.01596 as 1.01 and carries that through; without rounding the quotient the answer is' },
  { from: 112, to: 100, w1: 47.75, w2: 53.73, printed: 12.42, why: 'The regulation prints 1.12 × 53.73 − 47.75 as 12.42; the arithmetic gives 12.4276, which rounds to' },
];

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(8));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 8 });
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ethanolProof(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = String(o.mode ?? '').trim();
  if (!MODES.some((m) => m.value === mode)) return { valid: false, message: 'Choose what to work out: percent and proof, proof gallons, the tax, or the water to add to reduce proof.' };

  if (mode === 'convert') {
    const haveP = !blank(o.percent); const havePr = !blank(o.proof);
    if (haveP === havePr) return { valid: false, message: 'Enter either the percent of ethanol by volume or the proof, not both and not neither.' };
    if (haveP) {
      const f = inputFault([['the percent of ethanol by volume', o.percent, 0, 100, '']]);
      if (f) return { valid: false, message: f };
      const proof = 2 * Number(o.percent);
      return { valid: true, mode, proof: r1(proof), percent: Number(o.percent), band: `${show(Number(o.percent))}% by volume is ${r1(proof)} proof.`, bandLabel: `${r1(proof)} proof`, notes: [`Proof = 2 × ${show(Number(o.percent))} = ${show(proof)}, stated to the nearest tenth (27 CFR 30.31(a)).`], note: NOTE };
    }
    const f = inputFault([['the proof', o.proof, 0, 200, '']]);
    if (f) return { valid: false, message: f };
    const pct = Number(o.proof) / 2;
    return { valid: true, mode, proof: Number(o.proof), percent: sig(pct), band: `${show(Number(o.proof))} proof is ${show(pct)}% ethanol by volume.`, bandLabel: `${show(pct)}% by volume`, notes: [`Percent by volume = ${show(Number(o.proof))} ÷ 2 = ${show(pct)}.`], note: NOTE };
  }

  if (mode === 'gallons') {
    const unit = String(o.volumeUnit ?? '').trim();
    if (unit !== 'gal' && unit !== 'L') return { valid: false, message: 'Choose the unit of the volume: wine gallons or liters.' };
    const f = inputFault([['the volume', o.volume, null, 1e9, unit === 'gal' ? 'wine gallons' : 'liters'], ['the proof', o.proof, null, 200, '']]);
    if (f) return { valid: false, message: f };
    const gal = unit === 'gal' ? Number(o.volume) : Number(o.volume) / LITERS_PER_GALLON;
    // 27 CFR 30.31(a): the proof is determined to the nearest tenth degree, and that is the proof used for proof gallons.
    const proof = Math.round(Number(o.proof) * 10) / 10;
    const pg = gal * proof / 100;
    const notes = [];
    if (proof !== Number(o.proof)) notes.push(`Proof ${Number(o.proof)} is taken to the nearest tenth degree, ${show(proof)}, as 27 CFR 30.31(a) requires for proof gallons.`);
    if (unit === 'L') notes.push(`${show(Number(o.volume))} L ÷ ${LITERS_PER_GALLON} L per wine gallon (231 cubic inches) = ${show(gal)} wine gallon${sig(gal) === 1 ? '' : 's'}.`);
    notes.push(`Proof gallons = ${show(gal)} wine gallon${sig(gal) === 1 ? '' : 's'} × ${show(proof)} ÷ 100 = ${show(pg)}.`);
    return { valid: true, mode, wineGallons: sig(gal), proofGallons: sig(pg), band: `${show(pg)} proof gallons.`, bandLabel: `${show(pg)} proof gallons`, notes, note: NOTE };
  }

  if (mode === 'tax') {
    const f = inputFault([['the proof gallons', o.proofGallons, null, 1e9, '']]);
    if (f) return { valid: false, message: f };
    // Kept short: a refusal over 280 characters is taken for a static note and lifted out of the result area.
    if (blank(o.rate)) return { valid: false, message: 'Enter the tax rate in dollars per proof gallon. The statute\'s general rate is $13.50; reduced rates of $2.70 and $13.34 apply to a distilled spirits operation\'s first proof gallons (26 U.S.C. 5001). Which rate applies is yours to say.' };
    const rf = inputFault([['the tax rate', o.rate, 0, 1000, 'dollars per proof gallon']]);
    if (rf) return { valid: false, message: rf };
    const tax = Number(o.proofGallons) * Number(o.rate);
    return { valid: true, mode, tax: r2(tax), band: `Tax: ${money(r2(tax))}.`, bandLabel: money(r2(tax)), notes: [`${show(Number(o.proofGallons))} proof gallons × ${money(Number(o.rate))} = ${money(r2(tax))}.`, RATES], note: NOTE };
  }

  const f = inputFault([
    ['the starting proof', o.fromProof, null, 200, ''], ['the wanted proof', o.toProof, null, 200, ''],
    ['the gallons on hand', o.gallons, null, 1e9, 'wine gallons'],
    ['the parts water at the starting proof, from Table 6', o.waterFrom, 0, 100, ''],
    ['the parts water at the wanted proof, from Table 6', o.waterTo, 0, 100, ''],
  ]);
  if (f) return { valid: false, message: f };
  const from = Number(o.fromProof); const to = Number(o.toProof);
  if (!(to < from)) return { valid: false, message: 'The wanted proof must be below the starting proof: adding water cannot raise proof.' };
  const a1 = from / 2; const a2 = to / 2; const w1 = Number(o.waterFrom); const w2 = Number(o.waterTo);
  if (!(w2 > w1)) return { valid: false, message: 'Table 6 lists more parts water at a lower proof. The parts water at the wanted proof must be above those at the starting proof; check the two rows.' };
  const per100 = (a1 / a2) * w2 - w1;
  if (!(per100 > 0)) return { valid: false, message: 'These Table 6 values give no water to add. Check the two rows against the table.' };
  const water = per100 * Number(o.gallons) / 100;
  const notes = [
    `Parts alcohol are the proof ÷ 2: ${show(a1)} at ${show(from)} proof and ${show(a2)} at ${show(to)} proof.`,
    `Water per 100 gallons: (${show(a1)} ÷ ${show(a2)}) × ${show(w2)} − ${show(w1)} = ${r2(per100)} gallons (27 CFR 30.66). No intermediate value is rounded.`,
    `For ${show(Number(o.gallons))} gallons: ${r2(per100)} × ${show(Number(o.gallons))} ÷ 100 = ${r2(water)} gallons of water.`,
    'Alcohol and water contract when mixed, so this is more water than a plain dilution formula gives, and the product measures less than the two volumes added.',
  ];
  const ex = REG_EXAMPLES.find((e) => e.from === from && e.to === to && e.w1 === w1 && e.w2 === w2);
  if (ex) notes.push(`This is the regulation's own example, which prints ${ex.printed} gallons per 100. ${ex.why} ${r2(per100)}.`);
  return {
    valid: true, mode, waterPer100: r2(per100), water: r2(water), regulationPrints: ex ? ex.printed : null,
    band: `Add ${r2(water)} gallons of water to ${show(Number(o.gallons))} gallons at ${show(from)} proof to reach ${show(to)} proof.`,
    bandLabel: `${r2(water)} gallons of water`,
    notes, note: NOTE,
  };
}

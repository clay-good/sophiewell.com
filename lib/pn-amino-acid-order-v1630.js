// spec-v1630 tool 6: parenteral nutrition amino acids (dose, nitrogen, volume and cysteine).
//
//   g/kg/day       = grams per day / weight
//   product volume = grams / the product's g per mL;  mL/kg/day = volume / weight
//   nitrogen       = volume x the product's own g of nitrogen per mL
//   Elcys          = grams of amino acids x 22 mg (under 12 years) or 7 mg (12 years and older)
//
// The figures are label rows (spec-v1628 section 1), re-read on DailyMed on October 11, 2026:
//   Travasol 10% (Baxter, version 16): "0.1 g protein/mL, which corresponds to 0.0165 g nitrogen/mL";
//     Tables 1 and 2, protein requirement in g/kg/day: adults, stable 0.8 to 1.0 and critically ill
//     1.5 to 2.0; under 1 month 3 to 4; 1 month to under 1 year 2 to 3; 1 to 10 years 1 to 2; over
//     10 to under 17 years 0.8 to 1.5. "A maximum fluid supply of 40 mL/kg/day of parenteral nutrition
//     solution, based on protein, should not be exceeded in adult patients".
//   Prosol 20% (Baxter, version 16): "0.2 g protein/mL, which corresponds to 0.032 g nitrogen/mL"; the
//     same requirement figures in its Tables 1 and 2 (its last pediatric row reads "11 to 17 years")
//     and the same 40 mL/kg/day sentence.
//   TrophAmine 10% (B. Braun, version 10): 100 g of amino acids and 15.5 g of nitrogen per liter;
//     "2 to 2.5 g/kg/day for infants up to 10 kilograms", and above 10 kg "the 20 to 25 grams/day for
//     the first 10 kg of body weight plus 1 to 1.25 g/day for each kg of body weight over 10".
//   Elcys (Exela, version 3): "from birth to less than 12 years of age ... 22 mg/gram of amino acids.
//     For adults and pediatric patients 12 years of age and older ... 7 mg/gram"; Table 1 gives 0.44
//     and 0.14 mL per gram; 50 mg/mL of cysteine hydrochloride, so 15 and 5 mg of cysteine per gram.
//
// Nitrogen is not grams / 6.25: by their composition tables the three products hold 6.06, 6.23 and
// 6.45 g of amino acids per gram of nitrogen, and the tool uses each label's per-mL figure. A product's figures answer only while its label
// stands (lib/label-row.js); otherwise the dose per kilogram is still shown and the rest is withheld.
//
// The tool reports where an order sits against the label. It does not say what to give.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const BAXTER = { neonate: [3, 4], infant: [2, 3], child: [1, 2], adolescent: [0.8, 1.5], 'adult-stable': [0.8, 1], 'adult-critical': [1.5, 2] };
export const PRODUCTS = {
  travasol: { name: 'Travasol 10%', setId: '8543b5be-0f43-4891-9e56-d7c39fe839b5', gPerMl: 0.1, nPerMl: 0.0165, bands: BAXTER, adultMaxMlPerKg: 40 },
  prosol: { name: 'Prosol 20%', setId: 'cc2ace81-5881-43f1-ba94-41b674adc2fc', gPerMl: 0.2, nPerMl: 0.032, bands: BAXTER, adultMaxMlPerKg: 40 },
  trophamine: { name: 'TrophAmine 10%', setId: 'cb6d23ff-3ec5-445a-acbe-f88fd57949bf', gPerMl: 0.1, nPerMl: 0.0155, byWeight: true },
};
export const ELCYS = { setId: '52317b38-b2e6-4a1c-b5b0-43cada0d205e', mgPerMl: 50, 'under-12': { mgPerG: 22, mlPerG: 0.44, cysteineMgPerG: 15 }, '12-plus': { mgPerG: 7, mlPerG: 0.14, cysteineMgPerG: 5 } };
export const PRODUCT_OPTIONS = Object.entries(PRODUCTS).map(([value, p]) => ({ value, text: p.name }));
export const AGE_BANDS = [
  { value: 'neonate', text: 'Preterm or term infant under 1 month' },
  { value: 'infant', text: '1 month to under 1 year' },
  { value: 'child', text: '1 to 10 years' },
  { value: 'adolescent', text: 'Over 10 to under 17 years' },
  { value: 'adult-stable', text: 'Adult, stable' },
  { value: 'adult-critical', text: 'Adult, critically ill' },
];
export const ORDER_UNITS = [
  { value: 'g-kg-day', text: 'g/kg/day' },
  { value: 'g', text: 'g per day' },
];
export const CYSTEINE = [
  { value: 'no', text: 'No cysteine added' },
  { value: 'under-12', text: 'Elcys added, patient under 12 years' },
  { value: '12-plus', text: 'Elcys added, patient 12 years or older' },
];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The tool sets an order beside the label\'s figures; it does not say what to give. The labels give other figures for renal impairment and dialysis, and tie the dose to the patient\'s condition: read the label for those.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const has = (list, v) => list.some((x) => x.value === v);
const place = (x, [lo, hi]) => (sig(x) > hi ? 'above' : sig(x) < lo ? 'below' : 'within');

export function pnAminoAcidOrder(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.product ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, key)) return { valid: false, message: 'Choose the amino acid product: each label has its own strength and nitrogen content.' };
  const p = PRODUCTS[key];
  const band = String(o.ageBand ?? '').trim();
  if (!has(AGE_BANDS, band)) return { valid: false, message: 'Choose the age band: the label gives a range for each.' };
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };
  const ou = String(o.orderUnit ?? '').trim();
  if (!has(ORDER_UNITS, ou)) return { valid: false, message: 'Choose how the amino acids are ordered: g/kg/day or g per day.' };
  const of = inputFault([['the amino acids ordered', o.order, null, 2000, ou === 'g' ? 'g' : 'g/kg/day']]);
  if (of) return { valid: false, message: of };
  const cys = String(o.cysteine ?? '').trim();
  if (!has(CYSTEINE, cys)) return { valid: false, message: 'Choose whether Elcys (cysteine) is added, and if so whether the patient is under 12 years.' };

  const grams = ou === 'g' ? Number(o.order) : Number(o.order) * kg;
  const gKg = grams / kg;
  const adult = band.startsWith('adult');
  const notes = [`${show(grams)} g/day ÷ ${show(kg)} kg = ${show(gKg)} g/kg/day of amino acids.`];
  const out = { valid: true, gramsPerDay: sig(grams), gPerKgDay: sig(gKg), weightKg: sig(kg) };
  const flags = [];
  const row = labelRow(p.setId, now, table);
  const head = `${show(gKg)} g/kg/day of amino acids as ${p.name}`;
  if (!row.answers) {
    notes.push(`The ${p.name} label figures are withheld: ${row.why}.`, 'The label range, the nitrogen and the volume need those figures, so they are not shown.');
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label comparison is withheld.`, bandLabel: `${show(gKg)} g/kg/day`, notes, note: NOTE };
  }
  const from = `(${row.edition})`;
  if (p.byWeight) {
    if (adult) notes.push(`Dose: the ${p.name} label states its dosage for infants and young pediatric patients, so there is no adult figure to compare ${from}.`);
    else {
      const range = kg <= 10 ? [2 * kg, 2.5 * kg] : [20 + (kg - 10), 25 + (kg - 10) * 1.25];
      const where = place(grams, range);
      out.doseAgainst = where; out.labelRangeGramsPerDay = range.map(sig);
      if (where === 'above') flags.push('dose above the label range');
      notes.push(`Dose: ${show(grams)} g/day is ${where} the label's ${show(range[0])} to ${show(range[1])} g/day at ${show(kg)} kg (${kg <= 10 ? '2 to 2.5 g/kg/day up to 10 kg' : '20 to 25 g/day for the first 10 kg plus 1 to 1.25 g/day for each kg over 10'}) ${from}.`);
    }
  } else {
    const range = p.bands[band];
    const where = place(gKg, range);
    out.doseAgainst = where; out.labelRange = range;
    if (where === 'above') flags.push('dose above the label range');
    notes.push(`Dose: ${show(gKg)} g/kg/day is ${where} the label's ${show(range[0])} to ${show(range[1])} g/kg/day for ${AGE_BANDS.find((b) => b.value === band).text.toLowerCase().replace(/^adult,/, 'adults,')} ${from}.`);
  }
  const mL = grams / p.gPerMl; const nitrogen = mL * p.nPerMl; const mlKg = mL / kg;
  Object.assign(out, { productMl: sig(mL), mLPerKgDay: sig(mlKg), nitrogenGrams: sig(nitrogen) });
  notes.push(`Volume: ${show(grams)} g ÷ ${show(p.gPerMl)} g/mL = ${show(mL)} mL of ${p.name}, ${show(mlKg)} mL/kg/day.`);
  notes.push(`Nitrogen: ${show(mL)} mL × ${show(p.nPerMl)} g/mL = ${show(nitrogen)} g, at the label's own nitrogen figure, not grams ÷ 6.25.`);
  if (adult && p.adultMaxMlPerKg) {
    const over = sig(mlKg) > p.adultMaxMlPerKg;
    out.volumeAgainst = over ? 'above' : 'at or under';
    if (over) flags.push('volume above 40 mL/kg/day');
    notes.push(`The label says a maximum fluid supply of 40 mL/kg/day of parenteral nutrition solution, based on protein, should not be exceeded in adults: ${show(mlKg)} mL/kg/day of this product is ${over ? 'above' : 'at or under'} it.`);
  }
  if (cys !== 'no') {
    const e = ELCYS[cys]; const erow = labelRow(ELCYS.setId, now, table);
    if (!erow.answers) { notes.push(`The Elcys label figures are withheld: ${erow.why}.`); out.cysteineWithheld = true; out.labelUrl = erow.url; }
    else {
      const mg = grams * e.mgPerG; const eMl = grams * e.mlPerG;
      Object.assign(out, { elcysMg: sig(mg), elcysMl: sig(eMl), cysteineMg: sig(grams * e.cysteineMgPerG) });
      notes.push(`Elcys: ${show(grams)} g × ${e.mgPerG} mg/g = ${show(mg)} mg, which is ${show(eMl)} mL at the label's ${e.mlPerG} mL per gram (${show(grams * e.cysteineMgPerG)} mg of cysteine) (${erow.edition}).`);
    }
  }
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `${head}: ${show(nitrogen)} g of nitrogen in ${show(mL)} mL${out.elcysMl !== undefined ? `, with ${show(out.elcysMl)} mL of Elcys` : ''}${flags.length ? `; ${flags.join('; ')}` : out.doseAgainst ? `; ${out.doseAgainst} the label range` : ''}.`,
    bandLabel: `${show(nitrogen)} g nitrogen, ${show(mL)} mL`,
    notes, note: NOTE,
  };
}

// spec-v1630 tool 4: an IV phosphate order (dose, cation load, concentration and rate).
//
//   concentrate volume = phosphorus (mmol) / 3 mmol per mL
//   potassium = volume x 4.4 mEq/mL (potassium phosphates); sodium = volume x 4 mEq/mL (sodium phosphates)
//   concentration = phosphorus / final volume; rate = phosphorus / infusion hours
//
// Label rows (spec-v1628 section 1), re-read on DailyMed on October 11, 2026.
// Potassium Phosphates Injection (Civica, version 2), section 2:
//   "provides phosphorus 3 mmol/mL (potassium 4.4 mEq/mL)".
//   Table 1, maximum concentration: 12 years and older, peripheral 6.8 mmol/100 mL and central
//     18 mmol/100 mL; under 12 years, peripheral 0.27 mmol/10 mL and central 0.55 mmol/10 mL.
//   Table 2, initial or single dose by serum phosphorus: 1.8 mg/dL to the lower end of the reference
//     range 0.16 to 0.31 mmol/kg; 1 to 1.7 mg/dL 0.32 to 0.43; less than 1 mg/dL 0.44 to 0.64; "up to
//     a maximum of phosphorus 45 mmol (potassium 66 mEq) as a single dose". Its footnotes take 2.5
//     mg/dL as the lower end at 12 months and older and 4 mg/dL under 12 months, and actual body weight.
//   Table 3, maximum rate at 12 years and older: peripheral 6.8 mmol/hour, central 15 mmol/hour. No
//     rate table is printed under 12 years. "Continuous electrocardiographic (ECG) monitoring and
//     infusion through a central venous catheter is recommended for infusion rates higher than"
//     potassium 10 mEq/hour at 20 kg or greater, or 0.5 mEq/kg/hour under 20 kg.
//   "only for administration to a patient with a serum potassium concentration less than 4 mEq/dL".
//     The label prints the unit as mEq/dL; the reader's value is taken in mEq/L and compared with 4.
// Sodium Phosphates Injection (Civica, version 1), an older-format label: about 3 mM of phosphorus
//   and 4 mEq of sodium per mL, and no dose, concentration or rate table. Its two amounts are prose
//   for parenteral nutrition and are shown as label text.
//
// The parenteral nutrition daily amounts (the potassium label's Table 4) are not checked here. A
// label's figures answer only while it stands (lib/label-row.js); otherwise the arithmetic is still
// shown and the comparison withheld. The tool reports; it does not say what to give.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const SALTS = {
  potassium: { name: 'potassium phosphates', setId: 'f7702b2f-d0d1-4696-896d-571607fc0dc8', mmolPerMl: 3, cation: 'potassium', mEqPerMl: 4.4 },
  sodium: { name: 'sodium phosphates', setId: '8fd901e6-30cb-411a-b820-b9e79625ec7c', mmolPerMl: 3, cation: 'sodium', mEqPerMl: 4 },
};
export const SALT_OPTIONS = [
  { value: 'potassium', text: 'Potassium phosphates' },
  { value: 'sodium', text: 'Sodium phosphates' },
];
export const AGE_BANDS = [
  { value: 'under-12-months', text: 'Under 12 months' },
  { value: '1-to-11-years', text: '1 to under 12 years' },
  { value: '12-plus', text: '12 years and older' },
];
export const DOSE_UNITS = [
  { value: 'mmol', text: 'mmol of phosphorus' },
  { value: 'mmol-kg', text: 'mmol/kg' },
];
export const LINES = [
  { value: 'peripheral', text: 'Peripheral venous catheter' },
  { value: 'central', text: 'Central venous catheter' },
];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
// mmol per 100 mL, [peripheral, central]; the under-12 row is printed per 10 mL.
const MAX_CONC = { adult: { peripheral: 6.8, central: 18 }, child: { peripheral: 2.7, central: 5.5 } };
const MAX_RATE = { peripheral: 6.8, central: 15 };
const SINGLE_DOSE_MAX = 45;
const NOTE = 'The tool sets an order beside the label; it does not say what to give. The label also covers renal impairment, calcium, repeat doses and monitoring: read it for those.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const has = (list, v) => list.some((x) => x.value === v);

function doseRow(level, band) {
  const low = band === 'under-12-months' ? 4 : 2.5;
  // "Less than 1" and the top of the range are decided on the level as measured (0.96 is less than 1; 2.54 is above
  // 2.5). Only the gap the table leaves between its tenths, 1.7 to 1.8, is settled by rounding to a tenth.
  if (level < 1) return { range: [0.44, 0.64], text: 'less than 1 mg/dL' };
  if (level > low) return { range: null, low };
  const l = Math.round(level * 10) / 10;
  if (l <= 1.7) return { range: [0.32, 0.43], text: '1 mg/dL to 1.7 mg/dL' };
  if (l <= low) return { range: [0.16, 0.31], text: `1.8 mg/dL to the lower end of the reference range (${low} mg/dL at this age)` };
  return { range: null, low };
}

export function ivPhosphateOrderCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const saltKey = String(o.salt ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(SALTS, saltKey)) return { valid: false, message: 'Choose the salt: potassium phosphates or sodium phosphates.' };
  const s = SALTS[saltKey];
  const band = String(o.ageBand ?? '').trim();
  if (!has(AGE_BANDS, band)) return { valid: false, message: 'Choose the age band: the label\'s concentration and rate rows differ by age.' };
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };
  const du = String(o.doseUnit ?? '').trim();
  if (!has(DOSE_UNITS, du)) return { valid: false, message: 'Choose how the phosphorus is ordered: mmol or mmol/kg.' };
  const line = String(o.line ?? '').trim();
  if (!has(LINES, line)) return { valid: false, message: 'Choose the line: peripheral or central venous catheter.' };
  const f = inputFault([['the phosphorus dose', o.dose, null, 500, du === 'mmol' ? 'mmol' : 'mmol/kg'], ['the final volume', o.finalVolume, null, 20000, 'mL'], ['the infusion time', o.hours, null, 48, 'hours']]);
  if (f) return { valid: false, message: f };
  const mmol = du === 'mmol' ? Number(o.dose) : Number(o.dose) * kg;
  const perKg = mmol / kg; const volume = Number(o.finalVolume); const hours = Number(o.hours);
  const levels = {};
  for (const [k, label, hi, unit] of [['serumPhosphorus', 'the serum phosphorus', 20, 'mg/dL'], ['serumPotassium', 'the serum potassium', 12, 'mEq/L']]) {
    if (blank(o[k])) continue;
    const lf = inputFault([[label, o[k], 0, hi, unit]]);
    if (lf) return { valid: false, message: lf };
    levels[k] = Number(o[k]);
  }

  const mL = mmol / s.mmolPerMl; const cation = mL * s.mEqPerMl;
  const conc = (mmol / volume) * 100; const rate = mmol / hours; const cationRate = cation / hours;
  const notes = [
    `${show(mmol)} mmol of phosphorus (${show(perKg)} mmol/kg at ${show(kg)} kg) is ${show(mL)} mL of ${s.name} at 3 mmol/mL, carrying ${show(cation)} mEq of ${s.cation} (${show(s.mEqPerMl)} mEq/mL).`,
    `In ${show(volume)} mL: ${show(conc)} mmol per 100 mL. Over ${show(hours)} hours: ${show(rate)} mmol/hour, ${show(cationRate)} mEq of ${s.cation} per hour.`,
  ];
  const out = { valid: true, phosphorusMmol: sig(mmol), mmolPerKg: sig(perKg), concentrateMl: sig(mL), cationMEq: sig(cation), mmolPer100Ml: sig(conc), mmolPerHour: sig(rate), cationMEqPerHour: sig(cationRate), weightKg: sig(kg) };
  const head = `${show(mmol)} mmol of phosphorus as ${show(mL)} mL of ${s.name}, with ${show(cation)} mEq of ${s.cation}`;
  const row = labelRow(s.setId, now, table);
  if (!row.answers) {
    notes.push(`The ${s.name} label figures are withheld: ${row.why}. The strength used above is the product's 3 mmol/mL; check it against the vial in hand.`);
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label comparison is withheld.`, bandLabel: `${show(mL)} mL`, notes, note: NOTE };
  }
  const from = `(${row.edition})`;
  if (saltKey === 'sodium') {
    notes.push(`This sodium phosphates label ${from} prints no dose, concentration or rate limit, so none is applied.`);
    notes.push('What it does say, for parenteral nutrition: about 12 to 15 mmol of phosphorus per liter of TPN solution containing 250 g of dextrose is usually adequate, and the suggested dose for infants receiving TPN is 1.5 to 2 mmol/kg/day.');
    return { ...out, flags: [], abnormal: false, band: `${head}; ${show(conc)} mmol per 100 mL at ${show(rate)} mmol/hour. The label gives no limit to compare.`, bandLabel: `${show(mL)} mL, ${show(cation)} mEq sodium`, notes, note: NOTE };
  }

  const flags = [];
  const adult = band === '12-plus';
  if (mmol > SINGLE_DOSE_MAX) { flags.push('more than 45 mmol as a single dose'); out.singleDoseAgainst = 'above'; } else out.singleDoseAgainst = 'at or under';
  if (levels.serumPhosphorus !== undefined) {
    const d = doseRow(levels.serumPhosphorus, band);
    if (!d.range) notes.push(`Dose: at a serum phosphorus of ${show(levels.serumPhosphorus)} mg/dL the label's Table 2 gives no dose; its rows stop at the lower end of the reference range (${d.low} mg/dL at this age) ${from}.`);
    else {
      const where = sig(perKg) > d.range[1] ? 'above' : sig(perKg) < d.range[0] ? 'below' : 'within';
      out.doseAgainst = where; out.labelDoseRange = d.range;
      if (where === 'above') flags.push('dose above the label range');
      notes.push(`Dose: ${show(perKg)} mmol/kg is ${where} the label's ${d.range[0]} to ${d.range[1]} mmol/kg for a serum phosphorus of ${d.text}, by actual body weight ${from}.`);
    }
  } else notes.push('Dose: no serum phosphorus was entered, so the dose is not placed against the label\'s Table 2, which sets the range by the level.');
  notes.push(`Single dose: ${show(mmol)} mmol is ${mmol > SINGLE_DOSE_MAX ? 'above' : 'at or under'} the label's maximum of 45 mmol of phosphorus (potassium 66 mEq).`);
  const maxConc = MAX_CONC[adult ? 'adult' : 'child'][line];
  const overConc = sig(conc) > maxConc;
  out.concentrationAgainst = overConc ? 'above' : 'at or under'; out.labelMaxMmolPer100Ml = maxConc;
  if (overConc) flags.push('concentration above the label maximum');
  notes.push(`Concentration: ${show(conc)} mmol per 100 mL is ${overConc ? 'above' : 'at or under'} the label's maximum for a ${line} catheter ${adult ? 'at 12 years and older' : 'under 12 years'}, ${adult ? `${maxConc} mmol/100 mL` : `${maxConc / 10} mmol/10 mL`}.`);
  if (adult) {
    const maxRate = MAX_RATE[line]; const overRate = sig(rate) > maxRate;
    out.rateAgainst = overRate ? 'above' : 'at or under'; out.labelMaxMmolPerHour = maxRate;
    if (overRate) flags.push('rate above the label maximum');
    notes.push(`Rate: ${show(rate)} mmol/hour is ${overRate ? 'above' : 'at or under'} the label's maximum of ${maxRate} mmol/hour by ${line} catheter.`);
  } else notes.push('Rate: the label prints no maximum rate table for patients under 12 years.');
  const ecg = kg >= 20 ? cationRate > 10 : cationRate / kg > 0.5;
  out.ecgAndCentralRecommended = ecg;
  if (ecg) {
    notes.push(`Potassium is running at ${kg >= 20 ? `${show(cationRate)} mEq/hour, above 10 mEq/hour` : `${show(cationRate / kg)} mEq/kg/hour, above 0.5 mEq/kg/hour`}: the label recommends continuous ECG monitoring and a central venous catheter above that.`);
    if (line === 'peripheral') flags.push('potassium rate above the label\'s threshold for a central line and ECG');
  }
  if (levels.serumPotassium !== undefined) {
    const high = levels.serumPotassium >= 4;
    out.potassiumAgainst = high ? 'at or above 4' : 'under 4';
    if (high) flags.push('serum potassium 4 or more');
    notes.push(`Serum potassium ${show(levels.serumPotassium)} mEq/L: the label says the product is only for a patient with a serum potassium "less than 4 mEq/dL" (it prints the unit as mEq/dL); ${high ? 'at 4 or more it says to use another source of phosphorus' : 'this is under 4'}.`);
  }
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `${head}: ${flags.length ? flags.join('; ') : 'nothing above the label rows checked'}.`,
    bandLabel: flags.length ? `${flags.length} above the label` : 'Within the label rows checked',
    notes, note: NOTE,
  };
}

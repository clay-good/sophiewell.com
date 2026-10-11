// spec-v1634 tool 8: estimated daily infant dosage through breast milk and the relative infant dose.
//
// Source: FDA. Clinical Lactation Studies: Considerations for Study Design. Draft guidance for
// industry, May 2019 (https://www.fda.gov/media/124749/download), lines 289-292 and 339-366,
// re-read October 11, 2026:
//   Estimated daily infant dosage (mg/kg/day) = M/P x average maternal plasma concentration
//     x 150 mL/kg/day, where M/P is the milk-plasma ratio; with a measured milk concentration the
//     product M/P x plasma concentration is that concentration.
//   "a 150 mL/kg/day estimated milk intake is a reasonable assumption ... Additional consideration
//     should be given to estimates of infant risk based on a 200 mL/kg/day milk intake in early
//     infancy." Both are always shown.
//   Relative infant dose = infant dosage (mg/kg/day) / maternal dosage (mg/kg/day) x 100.
//   Where the drug has an approved dose under 1 year of age, the infant dosage is compared with it
//     as a percentage.
//   "The calculation of M/P should be based on AUC and on multiple time points over 24 hours and
//     not just a single point in time."
// The guidance gives no cutoff for the relative infant dose, so none is applied or quoted here.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// Each unit as mg per liter.
export const UNITS = [
  { value: 'ng-ml', text: 'ng/mL', perMgL: 0.001 },
  { value: 'mcg-l', text: 'mcg/L', perMgL: 0.001 },
  { value: 'mcg-ml', text: 'mcg/mL', perMgL: 1 },
  { value: 'mg-l', text: 'mg/L', perMgL: 1 },
];
const NOTE = 'An estimate of exposure, not of safety: the FDA guidance gives the formulas and no cutoff, and there is no single safe limit. It says nothing about how the infant absorbs or clears the drug, about preterm or ill infants, or about active metabolites. No drug data is included; the concentrations are the reader\'s.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });

export function relativeInfantDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hasMilk = !blank(o.milkConcentration); const hasMp = !blank(o.mpRatio) || !blank(o.plasmaConcentration);
  if (!hasMilk && !hasMp) return { valid: false, message: 'Enter the average milk concentration, or the milk-plasma ratio with the average maternal plasma concentration.' };
  if (hasMilk && hasMp) return { valid: false, message: 'Enter either the milk concentration, or the milk-plasma ratio with the plasma concentration, not both: the two routes can give different answers.' };
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the concentration unit: ng/mL, mcg/L, mcg/mL or mg/L.' };
  const f = inputFault([
    ...(hasMilk ? [['the average milk concentration', o.milkConcentration, null, 1e7, unit.text]] : [['the milk-plasma ratio', o.mpRatio, null, 1000, ''], ['the average maternal plasma concentration', o.plasmaConcentration, null, 1e7, unit.text]]),
    ['the maternal dose', o.maternalDose, null, 1e5, 'mg a day'], ['the maternal weight', o.maternalWeight, 20, 400, 'kg'],
  ]);
  if (f) return { valid: false, message: f };
  let approved = null;
  if (!blank(o.approvedInfantDose)) {
    const af = inputFault([['the approved infant dose', o.approvedInfantDose, null, 1e4, 'mg/kg a day']]);
    if (af) return { valid: false, message: af };
    approved = Number(o.approvedInfantDose);
  }
  const milk = (hasMilk ? Number(o.milkConcentration) : Number(o.mpRatio) * Number(o.plasmaConcentration)) * unit.perMgL; // mg/L
  const maternal = Number(o.maternalDose) / Number(o.maternalWeight); // mg/kg/day
  const at = (mlPerKg) => { const dose = milk * (mlPerKg / 1000); return { intake: mlPerKg, infantDose: dose, rid: (dose / maternal) * 100, ofApproved: approved === null ? null : (dose / approved) * 100 }; };
  const a = at(150); const b = at(200);
  const line = (r) => `At ${r.intake} mL/kg a day of milk: infant dosage ${sig(r.infantDose)} mg/kg a day, relative infant dose ${sig(r.rid)}%${r.ofApproved === null ? '' : `, which is ${sig(r.ofApproved)}% of the approved infant dose`}.`;
  const notes = [
    hasMilk ? `Milk concentration ${sig(milk)} mg/L (${Number(o.milkConcentration).toLocaleString('en-US')} ${unit.text}).` : `Milk concentration from the ratio: ${sig(Number(o.mpRatio))} × ${Number(o.plasmaConcentration).toLocaleString('en-US')} ${unit.text} = ${sig(milk)} mg/L. The guidance says the ratio should come from areas under the curve over multiple time points across 24 hours, not a single time point.`,
    `Maternal dosage: ${Number(o.maternalDose).toLocaleString('en-US')} mg a day ÷ ${Number(o.maternalWeight).toLocaleString('en-US')} kg = ${sig(maternal)} mg/kg a day.`,
    line(a), `${line(b)} The guidance asks for this higher intake to be considered in early infancy.`,
    'FDA. Clinical Lactation Studies: Considerations for Study Design (draft guidance, May 2019).',
  ];
  return {
    valid: true, flag: 'rid', abnormal: false,
    milkConcentrationMgL: Number(milk.toPrecision(6)), maternalDosageMgKgDay: Number(maternal.toPrecision(6)),
    infantDosageMgKgDay: Number(a.infantDose.toPrecision(6)), relativeInfantDosePercent: Number(a.rid.toPrecision(6)),
    infantDosageAt200: Number(b.infantDose.toPrecision(6)), relativeInfantDoseAt200: Number(b.rid.toPrecision(6)),
    ...(approved === null ? {} : { percentOfApprovedDose: Number(a.ofApproved.toPrecision(6)) }),
    band: `Relative infant dose ${sig(a.rid)}% at 150 mL/kg a day of milk (${sig(b.rid)}% at 200 mL/kg a day); estimated infant dosage ${sig(a.infantDose)} mg/kg a day.`,
    bandLabel: `${sig(a.rid)}%`,
    notes, note: NOTE,
  };
}

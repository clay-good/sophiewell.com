// spec-v1630 tool 5: lipid emulsion dose and rate against the label.
//
//   grams per day   = the order (g; or g/kg/day x weight; or mL x the product's g/mL)
//   g/kg/day        = grams per day / weight
//   mL/kg/hour      = (grams per day / g per mL) / weight / infusion hours
//   g/kg/hour       = g/kg/day / infusion hours
//   share of energy = mL x kcal per mL / total kcal
//
// The label figures are label rows (spec-v1628 section 1), each re-read on DailyMed on October 11,
// 2026, Table 1 of section 2 unless noted. Maximum g/kg/day by age (birth to under 2 years; 2 to
// under 12; 12 to 17; adults) and maximum direct infusion rate (pediatric; adult):
//   Intralipid 20% (version 3)   3, 2.5, 2, 2.5     0.75 and 0.5 mL/kg/hour
//   SMOFlipid (version 11)       3, 3, 2.5, 2.5     0.75 and 0.5 mL/kg/hour
//   Clinolipid (version 24)      3, 3, 3, 2.5       0.75 and 0.5 mL/kg/hour
//   Omegaven (version 6)         1 g/kg/day, "also the maximum daily dose"; pediatric only; 1.5 mL/kg/hour
//   Intralipid 30% (version 4)   3, 2.5, 2, 2.5; "for admixing only and is not intended for direct
//                                intravenous infusion"; diluted to 20%, "the hourly infusion rate should
//                                not exceed 0.125 g/kg/hour for neonates and infants"
// "Daily dosage should also not exceed a maximum of 60% of total energy requirements" is on the
// Intralipid 20% and 30%, SMOFlipid and Clinolipid tables. Intralipid 20%, SMOFlipid and Omegaven:
// "Complete the infusion within 12 hours when using a Y-connector and within 24 hours when used as
// part of an admixture"; Intralipid 30%: "Complete the infusion within 24 hours" (admixture).
// Clinolipid prints no such limit: "The recommended duration of infusion for a parenteral nutrition
// bag is between 12 and 24 hours" and "For preterm and term neonates ... 20 to 24 hours".
// Energy: 2,000 kcal/L (the three 20% products), 3,000 kcal/L (Intralipid 30%), 1.12 kcal/mL (Omegaven).
//
// A generic pediatric "3 g/kg/day" would be wrong for Intralipid from 2 to 17 years and for SMOFlipid
// from 12 to 17, which is why the check is by product. A product's figures answer only while its
// label stands (lib/label-row.js); when they do not, the arithmetic is still shown and the label
// comparison is withheld, or made against a maximum the reader enters from the label in hand.
//
// The tool reports where an order sits against the label. It does not say what to give.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const HANG = { 'y-site': 12, admixture: 24 };
export const PRODUCTS = {
  'intralipid-20': { name: 'Intralipid 20%', setId: '61e025f1-a38e-4af2-9e18-13ea12977cf5', gPerMl: 0.2, kcalPerMl: 2, max: [3, 2.5, 2, 2.5], rate: [0.75, 0.5], energyShare: 60, hang: HANG },
  smoflipid: { name: 'SMOFlipid', setId: 'e0e9d917-ff6f-488e-a6a8-0ad59dd17d80', gPerMl: 0.2, kcalPerMl: 2, max: [3, 3, 2.5, 2.5], rate: [0.75, 0.5], energyShare: 60, hang: HANG },
  clinolipid: { name: 'Clinolipid', setId: 'ae98eb03-c0e7-49d1-b024-77968e3d9d6e', gPerMl: 0.2, kcalPerMl: 2, max: [3, 3, 3, 2.5], rate: [0.75, 0.5], energyShare: 60, hang: null },
  omegaven: { name: 'Omegaven', setId: '5d9d0b24-e139-48bf-ab2d-536fb59cf8e0', gPerMl: 0.1, kcalPerMl: 1.12, max: [1, 1, 1, null], rate: [1.5, null], energyShare: null, hang: HANG },
  'intralipid-30': { name: 'Intralipid 30%', setId: '98460eae-5195-48d2-ab73-00d276879ef6', gPerMl: 0.3, kcalPerMl: 3, max: [3, 2.5, 2, 2.5], rate: null, infantGPerKgHour: 0.125, energyShare: 60, hang: { admixture: 24 }, admixtureOnly: true },
};
export const PRODUCT_OPTIONS = Object.entries(PRODUCTS).map(([value, p]) => ({ value, text: p.name }));
export const AGE_BANDS = [
  { value: 'birth-2', text: 'Birth to under 2 years' },
  { value: '2-11', text: '2 to under 12 years' },
  { value: '12-17', text: '12 to 17 years' },
  { value: 'adult', text: 'Adult' },
];
export const ORDER_UNITS = [
  { value: 'g-kg-day', text: 'g/kg/day' },
  { value: 'g', text: 'g per day' },
  { value: 'mL', text: 'mL per day' },
];
export const ROUTES = [
  { value: 'y-site', text: 'By Y-connector (direct infusion)' },
  { value: 'admixture', text: 'Inside a PN admixture' },
];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The tool sets an order beside the label\'s figures; it does not say what to give. Labels also give starting doses and slower starting rates, and tie the dose to triglycerides and tolerance: read the label for those.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const pick = (list, value) => list.findIndex((x) => x.value === value);

export function lipidEmulsionDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.product ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, key)) return { valid: false, message: 'Choose the product: the label maximums differ among them.' };
  const p = PRODUCTS[key];
  const band = pick(AGE_BANDS, String(o.ageBand ?? '').trim());
  if (band < 0) return { valid: false, message: 'Choose the age band: the label gives a maximum for each.' };
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };
  const ou = String(o.orderUnit ?? '').trim();
  if (pick(ORDER_UNITS, ou) < 0) return { valid: false, message: 'Choose how the lipid is ordered: g/kg/day, g per day or mL per day.' };
  const of = inputFault([['the ordered lipid', o.order, null, 1e5, ORDER_UNITS[pick(ORDER_UNITS, ou)].text]]);
  if (of) return { valid: false, message: of };
  const route = String(o.route ?? '').trim();
  if (pick(ROUTES, route) < 0) return { valid: false, message: 'Choose how it runs: by Y-connector, or inside a PN admixture.' };
  if (p.admixtureOnly && route !== 'admixture') return { valid: false, message: `${p.name} is for admixing only: its label says it is not intended for direct intravenous infusion. Choose "inside a PN admixture", or another product.` };
  const hf = inputFault([['the infusion hours', o.hours, null, 48, 'hours']]);
  if (hf) return { valid: false, message: hf };
  const hours = Number(o.hours);

  const order = Number(o.order);
  const grams = ou === 'g' ? order : ou === 'mL' ? order * p.gPerMl : order * kg;
  const mL = grams / p.gPerMl;
  const gKgDay = grams / kg; const mLKgHour = mL / kg / hours; const gKgHour = gKgDay / hours;
  const pediatric = band < 3;
  const notes = [
    `${p.name}, ${show(p.gPerMl)} g/mL: ${show(grams)} g/day is ${show(mL)} mL/day. ${show(grams)} g ÷ ${show(kg)} kg = ${show(gKgDay)} g/kg/day.`,
    `Over ${show(hours)} hours: ${show(mLKgHour)} mL/kg/hour, which is ${show(gKgHour)} g/kg/hour.`,
  ];
  const out = { valid: true, gramsPerDay: sig(grams), mLPerDay: sig(mL), gPerKgDay: sig(gKgDay), mLPerKgHour: sig(mLKgHour), gPerKgHour: sig(gKgHour), weightKg: sig(kg) };
  const flags = [];
  const row = labelRow(p.setId, now, table);
  const head = `${show(gKgDay)} g/kg/day and ${show(mLKgHour)} mL/kg/hour of ${p.name}`;

  if (!row.answers) {
    notes.push(`The ${p.name} label figures are withheld: ${row.why}.`);
    let own = null;
    if (!blank(o.ownMax)) {
      const mf = inputFault([['the label maximum you entered', o.ownMax, null, 20, 'g/kg/day']]);
      if (mf) return { valid: false, message: mf };
      own = Number(o.ownMax);
      const over = sig(gKgDay) > own;
      notes.push(`Against the maximum you entered from the label in hand, ${show(own)} g/kg/day: ${over ? 'above' : 'at or under'} it.`);
      return { ...out, withheld: true, labelUrl: row.url, doseAgainst: over ? 'above' : 'at or under', abnormal: over,
        band: `${head}: ${over ? 'above' : 'at or under'} the ${show(own)} g/kg/day you entered from the label in hand.`, bandLabel: over ? 'Above the maximum entered' : 'At or under the maximum entered', notes, note: NOTE };
    }
    notes.push('Enter the maximum g/kg/day from the label in hand to compare against it.');
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label comparison is withheld.`, bandLabel: `${show(gKgDay)} g/kg/day`, notes, note: NOTE };
  }

  const from = `(${row.edition})`;
  const max = p.max[band];
  if (max === null) {
    notes.push(`Dose: the ${p.name} label gives a pediatric dosage only, so there is no adult figure to compare ${from}.`);
  } else {
    const over = sig(gKgDay) > max;
    out.doseAgainst = over ? 'above' : 'at or under'; out.labelMaximum = max;
    if (over) flags.push('dose above the label maximum');
    notes.push(`Dose: ${show(gKgDay)} g/kg/day is ${over ? 'above' : 'at or under'} the label maximum of ${show(max)} g/kg/day for ${band === 3 ? 'adults' : AGE_BANDS[band].text.toLowerCase()} ${from}.`);
  }
  if (p.rate) {
    const maxRate = p.rate[pediatric ? 0 : 1];
    if (maxRate === null) notes.push('Rate: the label gives a pediatric rate only.');
    else {
      const over = sig(mLKgHour) > maxRate;
      out.rateAgainst = over ? 'above' : 'at or under'; out.labelMaximumRate = maxRate;
      if (over) flags.push('rate above the label maximum');
      notes.push(`Rate: ${show(mLKgHour)} mL/kg/hour is ${over ? 'above' : 'at or under'} the label's maximum direct infusion rate of ${show(maxRate)} mL/kg/hour${route === 'admixture' ? '; inside an admixture this is the lipid\'s own share of the flow' : ''}.`);
    }
  } else if (band === 0) {
    const over = sig(gKgHour) > p.infantGPerKgHour;
    out.rateAgainst = over ? 'above' : 'at or under';
    if (over) flags.push('hourly rate above the label figure');
    notes.push(`Rate: ${show(gKgHour)} g/kg/hour is ${over ? 'above' : 'at or under'} the ${show(p.infantGPerKgHour)} g/kg/hour the label says not to exceed for neonates and infants when diluted to 20%.`);
  } else {
    notes.push(`Rate: the label's hourly figure (${show(p.infantGPerKgHour)} g/kg/hour when diluted to 20%) is stated for neonates and infants; it is not applied to this age band.`);
  }
  if (p.hang && p.hang[route]) {
    const limit = p.hang[route]; const over = hours > limit;
    out.hangAgainst = over ? 'above' : 'at or under';
    if (over) flags.push('infusion longer than the label allows');
    notes.push(`Duration: ${show(hours)} hours is ${over ? 'longer than' : 'within'} the ${limit} hours the label gives to complete the infusion ${route === 'y-site' ? 'by Y-connector' : 'inside an admixture'}.`);
  } else if (!p.hang) {
    notes.push('Duration: this label prints no time limit by route. It recommends 12 to 24 hours for a parenteral nutrition bag, and 20 to 24 hours for preterm and term neonates.');
  }
  if (!blank(o.totalKcal)) {
    const kf = inputFault([['the total daily energy', o.totalKcal, null, 20000, 'kcal']]);
    if (kf) return { valid: false, message: kf };
    const kcal = mL * p.kcalPerMl; const share = (kcal / Number(o.totalKcal)) * 100;
    out.lipidKcal = sig(kcal); out.energySharePercent = sig(share);
    if (p.energyShare === null) notes.push(`Energy: ${show(mL)} mL × ${show(p.kcalPerMl)} kcal/mL = ${show(kcal)} kcal, ${show(share)}% of ${show(Number(o.totalKcal))} kcal. This label states no share-of-energy limit.`);
    else {
      const over = sig(share) > p.energyShare;
      if (over) flags.push('more than 60% of energy');
      notes.push(`Energy: ${show(mL)} mL × ${show(p.kcalPerMl)} kcal/mL = ${show(kcal)} kcal, ${show(share)}% of ${show(Number(o.totalKcal))} kcal: ${over ? 'above' : 'at or under'} the 60% of total energy the label says the daily dosage should not exceed.`);
    }
  }
  if (key === 'intralipid-20' && band === 3) notes.push('The label adds for adults: not more than 500 mL of Intralipid on the first day of therapy.');
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `${head}: ${flags.length ? flags.join('; ') : 'nothing above the label figures checked'}.`,
    bandLabel: flags.length ? `${flags.length} above the label` : 'Within the label figures checked',
    notes, note: NOTE,
  };
}

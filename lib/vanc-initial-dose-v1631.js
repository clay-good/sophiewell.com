// spec-v1631 tool 1: vancomycin first dose and starting regimen.
//
// Sources, each re-read on October 11, 2026:
//
// Rybak MJ, et al. Am J Health-Syst Pharm 2020;77:835-864 (ASHP/IDSA/PIDS/SIDP consensus guideline;
// the ASHP PDF):
//   Rec. 1: AUC/MIC 400 to 600; "Doses of 15 to 20 mg/kg (based on actual body weight) administered
//     every 8 to 12 hours ... for most patients with normal renal function."
//   Rec. 10-11: "a loading dose of 20 to 35 mg/kg can be considered" in critically ill patients;
//     "Loading doses should be based on actual body weight and not exceed 3,000 mg."
//   Rec. 12 (obese adults): loading "20 to 25 mg/kg using actual body weight, with a maximum dose of
//     3,000 mg"; maintenance "computed using a population PK estimate of vancomycin clearance and the
//     target AUC"; "usually do not exceed 4,500 mg/day"; early monitoring "when empiric doses exceed
//     4,000 mg/day."
//   Loading section: "infused over a period of not less than 60 minutes or at a rate of 10 to
//     15 mg/min (>=1 hour per 1,000 mg) ... Loading doses of 25 to 35 mg/kg will require infusion
//     times of at least 2 to 3 hours."
//   Pediatrics: "60 to 80 mg/kg/day, in divided doses given every 6 hours, for children 3 months to
//     less than 12 years or 60 to 70 mg/kg/day, in divided doses given every 6 to 8 hours, for those
//     >=12 years old"; "maximum empiric daily dose is usually 3,600 mg"; "Most children generally
//     should not require more than 3,000 mg/day"; early monitoring "when doses exceed 2,000 to
//     3,000 mg/day"; "dosages of >=100 mg/kg/day should be avoided"; rec. 24, "A loading dose of
//     20 mg/kg by total body weight is recommended in obese children."
//   Rec. 25 (neonates and infants up to 3 months): "10 to 20 mg/kg every 8 to 48 hours, depending on
//     postmenstrual age, weight, and SCr" (a range; no rule to compute).
//
// Matzke GR, et al. Antimicrob Agents Chemother 1984;25:433-437 (abstract, PMID 6732213): "CLS = 3.66
//   + 0.689 CLCR", both in mL/min.
// Rodvold KA, et al. Antimicrob Agents Chemother 1988;32:848-852 (abstract, PMID 3415206): "dose
//   (milligrams per kilogram per 24 h) = 0.227CLCR + 5.67, where CLCR is standardized to milliliters
//   per minute per 70 kg."
// Only the two abstracts were read; the full texts were not opened.
//
// Vancomycin Hydrochloride for Injection label (Gland, a label row, spec-v1628 section 1), Dosage and
// Administration: "about 15 times the glomerular filtration rate in mL/min" and LABEL_TABLE; "The
// initial dose should be no less than 15 mg/kg, even in patients with mild to moderate renal
// insufficiency. The table is not valid for functionally anephric patients ... The dose required to
// maintain stable concentrations is 1.9 mg/kg/24 hr"; "no more than 10 mg/min or over a period of at
// least 60 minutes, whichever is longer"; neonates, "an initial dose of 15 mg/kg ... followed by
// 10 mg/kg every 12 hours for neonates in the 1st week of life and every 8 hours thereafter up to
// the age of 1 month."
//
// The three adult maintenance estimates differ by design and the tool picks none. Reading the label
// table at the row at or below the entered clearance is this tool's rule, not the label's. The Crass
// 2018 obesity model is not included: its coefficients were not read (spec-v1631, Verify at build).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { setId: '00946db3-d6c5-4534-a870-1ec6e63eda43' };
// [creatinine clearance mL/min, vancomycin mg/24 h]
export const LABEL_TABLE = [[100, 1545], [90, 1390], [80, 1235], [70, 1080], [60, 925], [50, 770], [40, 620], [30, 465], [20, 310], [10, 155]];
export const POPULATIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'obese-adult', text: 'Obese adult' },
  { value: 'child', text: 'Child, 3 months or older' },
  { value: 'neonate', text: 'Neonate, up to 1 month' },
];
export const WEEKS = [
  { value: 'first', text: 'First week of life' },
  { value: 'later', text: 'After the first week, up to 1 month' },
];
export const GUIDE = { load: { adult: [20, 35], 'obese-adult': [20, 25] }, loadCap: 3000, auc: [400, 600], obeseDaily: 4500, obeseMonitor: 4000, childMax: 3600, childMost: 3000, childMonitor: 2000, childAvoid: 100 };
const NOTE = 'A starting regimen only: the guideline says to adjust on measured levels toward an AUC of 400 to 600 mg·h/L. The estimates differ by design and the tool picks none. It does the arithmetic on actual body weight; it does not choose the dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const perDose = (daily) => `every 8 hours ${show(daily / 3)} mg, every 12 hours ${show(daily / 2)} mg, every 24 hours ${show(daily)} mg, every 48 hours ${show(daily * 2)} mg`;
const minutes = (mg) => Math.max(60, mg / 10);
const INFUSE = 'Guideline: 10 to 15 mg/min, at least 1 hour per 1,000 mg; loading doses of 25 to 35 mg/kg need at least 2 to 3 hours.';

function neonate(o, kg, row) {
  const week = String(o.week ?? '').trim();
  if (week !== 'first' && week !== 'later') return { valid: false, message: 'Choose the neonate\'s age: the first week of life, or after it up to 1 month. The label\'s interval differs.' };
  const guide = 'Guideline (neonates and infants up to 3 months): 10 to 20 mg/kg every 8 to 48 hours, depending on postmenstrual age, weight and serum creatinine. It gives no rule to compute, so only the range is shown.';
  if (!row.answers) return { valid: true, withheld: true, labelUrl: row.url, band: 'The vancomycin label\'s neonatal doses are withheld, so no dose is worked out.', bandLabel: 'Withheld', notes: [`The label figures are withheld: ${row.why}.`, guide], note: NOTE };
  const every = week === 'first' ? 12 : 8;
  return {
    valid: true, population: 'neonate', initialDose: sig(15 * kg), maintenanceDose: sig(10 * kg), intervalHours: every,
    band: `Label: ${show(15 * kg)} mg first, then ${show(10 * kg)} mg every ${every} hours, each over 60 minutes.`,
    bandLabel: `${show(10 * kg)} mg every ${every} h`,
    notes: [
      `Label: initial dose 15 mg/kg × ${show(kg)} kg = ${show(15 * kg)} mg; then 10 mg/kg = ${show(10 * kg)} mg every ${every} hours (${week === 'first' ? 'first week of life' : 'after the first week, up to 1 month'}). Each dose over 60 minutes.`,
      'The label adds that premature infants may need longer intervals and that levels should be monitored closely.',
      guide, `Label: ${row.edition}.`,
    ],
    note: NOTE,
  };
}

function child(o, kg) {
  const f = inputFault([['the age', o.ageYears, 0.25, 17.99, 'years'], ['the daily dose', o.dailyPerKg, null, 200, 'mg/kg/day']]);
  if (f) return { valid: false, message: f };
  const age = Number(o.ageYears); const perKg = Number(o.dailyPerKg); const daily = perKg * kg;
  const older = age >= 12; const range = older ? [60, 70] : [60, 80];
  const notes = [
    `Daily dose: ${show(perKg)} mg/kg/day × ${show(kg)} kg = ${show(daily)} mg/day: every 6 hours ${show(daily / 4)} mg${older ? `, or every 8 hours ${show(daily / 3)} mg` : ''}.`,
    `Guideline at this age: ${older ? '60 to 70 mg/kg/day in divided doses every 6 to 8 hours (12 years and older)' : '60 to 80 mg/kg/day in divided doses every 6 hours (3 months to under 12 years)'}. Its summary table gives 60 to 80 mg/kg/day every 6 to 8 hours for all children.`,
  ];
  const flags = [];
  if (perKg >= GUIDE.childAvoid) flags.push('The guideline says dosages of 100 mg/kg/day or more should be avoided (projected median AUC 843 mg·h/L).');
  else if (perKg < range[0] || perKg > range[1]) flags.push(`${show(perKg)} mg/kg/day is outside the guideline's ${range[0]} to ${range[1]} mg/kg/day for this age.`);
  if (daily > GUIDE.childMax) flags.push(`${show(daily)} mg/day is above the guideline's usual maximum empiric daily dose of 3,600 mg in children with adequate renal function.`);
  else if (daily > GUIDE.childMost) flags.push(`${show(daily)} mg/day is above 3,000 mg/day, which the guideline says most children should not need.`);
  if (daily > GUIDE.childMonitor) flags.push('The guideline recommends early monitoring of levels when doses exceed 2,000 to 3,000 mg/day.');
  const out = { valid: true, population: 'child', dailyDose: sig(daily), doseEvery6h: sig(daily / 4) };
  if (!blank(o.loadPerKg)) {
    const lf = inputFault([['the loading dose', o.loadPerKg, null, 60, 'mg/kg']]);
    if (lf) return { valid: false, message: lf };
    const raw = Number(o.loadPerKg) * kg; const load = Math.min(raw, GUIDE.loadCap);
    out.loadingDose = sig(load);
    notes.push(`Loading: ${show(Number(o.loadPerKg))} mg/kg × ${show(kg)} kg = ${show(raw)} mg${raw > GUIDE.loadCap ? ', held to the guideline\'s 3,000 mg ceiling' : ''}, over at least ${show(minutes(load))} minutes. The guideline recommends a loading dose only in obese children: 20 mg/kg by total body weight.`);
  } else notes.push('No loading dose was entered. The guideline recommends one in obese children: 20 mg/kg by total body weight.');
  notes.push(...flags);
  return { ...out, flags, abnormal: flags.length > 0, band: `${show(daily)} mg/day (${show(perKg)} mg/kg/day): ${show(daily / 4)} mg every 6 hours.`, bandLabel: `${show(daily / 4)} mg every 6 h`, notes, note: NOTE };
}

export function vancInitialDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = String(o.population ?? '').trim();
  if (!POPULATIONS.some((p) => p.value === pop)) return { valid: false, message: 'Choose the population: adult, obese adult, child 3 months or older, or neonate.' };
  const wf = inputFault([['the actual body weight', o.weight, 0.4, 300, 'kg']]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight);
  const row = labelRow(LABEL.setId, now, table);
  if (pop === 'neonate') return neonate(o, kg, row);
  if (pop === 'child') return child(o, kg);

  if (blank(o.targetAuc)) return { valid: false, message: 'Enter the target AUC24. The guideline\'s range is 400 to 600 mg·h/L.' };
  const f = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min'], ['the loading dose', o.loadPerKg, null, 60, 'mg/kg'], ['the target AUC24', o.targetAuc, null, 1000, 'mg·h/L']]);
  if (f) return { valid: false, message: f };
  if (kg < 30) return { valid: false, message: 'An adult weight below 30 kg is outside what this tool works. Check the weight, or choose the child population.' };
  const crcl = Number(o.crcl); const loadKg = Number(o.loadPerKg); const auc = Number(o.targetAuc);
  const obese = pop === 'obese-adult'; const range = GUIDE.load[pop];
  const rawLoad = loadKg * kg; const load = Math.min(rawLoad, GUIDE.loadCap);
  const clMin = 3.66 + 0.689 * crcl; const clH = clMin * 0.06; const matzke = clH * auc;
  const crcl70 = crcl * 70 / kg; const rodvoldKg = 0.227 * crcl70 + 5.67; const rodvold = rodvoldKg * kg;
  const flags = [];
  const notes = [
    `Loading: ${show(loadKg)} mg/kg × ${show(kg)} kg = ${show(rawLoad)} mg${rawLoad > GUIDE.loadCap ? '; the guideline says loading doses should not exceed 3,000 mg, so 3,000 mg' : ''}. Infuse over at least ${show(minutes(load))} minutes (label: no more than 10 mg/min, and at least 60 minutes).`,
    INFUSE,
    `Maintenance, Matzke 1984 clearance × target AUC: (3.66 + 0.689 × ${show(crcl)}) = ${show(clMin)} mL/min = ${show(clH)} L/h; × ${show(auc)} mg·h/L = ${show(matzke)} mg/day (${perDose(matzke)}).`,
    `Maintenance, Rodvold 1988 (a dose equation from before AUC targets): 0.227 × ${show(crcl70)} + 5.67 = ${show(rodvoldKg)} mg/kg/24 h, with the clearance standardized to 70 kg; × ${show(kg)} kg = ${show(rodvold)} mg/day (${perDose(rodvold)}).`,
  ];
  const out = { valid: true, population: pop, loadingDose: sig(load), loadingCapped: rawLoad > GUIDE.loadCap, infusionMinutes: sig(minutes(load)), matzkeClearance: sig(clH), matzkeDailyDose: sig(matzke), rodvoldDailyDose: sig(rodvold) };
  let labelPart = 'label withheld';
  if (!row.answers) {
    out.labelWithheld = true; out.labelUrl = row.url;
    notes.push(`The label's renal dosing table is withheld: ${row.why}.`);
  } else {
    const product = 15 * crcl;
    const tr = LABEL_TABLE.find(([c]) => c <= crcl);
    out.labelProduct = sig(product);
    if (tr) {
      out.labelTableDose = tr[1];
      notes.push(`Maintenance, label: about 15 × the clearance = ${show(product)} mg/24 h; the label's table at ${tr[0]} mL/min gives ${show(tr[1])} mg/24 h${crcl > 100 ? ' (the table stops at 100 mL/min)' : tr[0] === crcl ? '' : ' (the row at or below the clearance entered, which is this tool\'s rule)'}.`);
      labelPart = `label table ${show(tr[1])}`;
    } else {
      notes.push(`Maintenance, label: about 15 × the clearance = ${show(product)} mg/24 h. The label's table starts at 10 mL/min and is not valid for functionally anephric patients: for them it gives an initial 15 mg/kg (${show(15 * kg)} mg), then 1.9 mg/kg/24 h (${show(1.9 * kg)} mg/24 h).`);
      labelPart = `label 15 × clearance ${show(product)}`;
    }
    notes.push(`The label says the initial dose should be no less than 15 mg/kg (${show(15 * kg)} mg), even in mild to moderate renal insufficiency.`);
  }
  notes.push(`Guideline, normal renal function: 15 to 20 mg/kg (${show(15 * kg)} to ${show(20 * kg)} mg) every 8 to 12 hours for most patients.`);
  notes.push('Matzke and Rodvold predate standardized creatinine assays. Only their abstracts were read; Matzke gives both clearances in mL/min.');
  if (loadKg < range[0] || loadKg > range[1]) flags.push(`A loading dose of ${show(loadKg)} mg/kg is outside the guideline's ${range[0]} to ${range[1]} mg/kg for ${obese ? 'obese adults' : 'critically ill adults on intermittent dosing'}.`);
  if (auc < GUIDE.auc[0] || auc > GUIDE.auc[1]) flags.push(`A target AUC24 of ${show(auc)} mg·h/L is outside the guideline's 400 to 600.`);
  if (obese) {
    const top = Math.max(matzke, rodvold);
    if (top > GUIDE.obeseDaily) flags.push('An estimate here is above 4,500 mg/day; the guideline says empiric maintenance doses for most obese patients usually do not exceed that.');
    if (top > GUIDE.obeseMonitor) flags.push('The guideline recommends early and frequent AUC monitoring in obese adults, especially when empiric doses exceed 4,000 mg/day.');
    notes.push('The obesity-specific clearance model the guideline cites (Crass 2018) is not included; its coefficients were not read.');
  }
  notes.push(...flags);
  if (row.answers) notes.push(`Label: ${row.edition}.`);
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `Load ${show(load)} mg over at least ${show(minutes(load))} minutes. Daily maintenance estimates: Matzke × AUC ${show(auc)} gives ${show(matzke)} mg, Rodvold ${show(rodvold)} mg, ${labelPart} mg.`.replace('label withheld mg', 'the label table is withheld'),
    bandLabel: `${show(load)} mg load`,
    notes, note: NOTE,
  };
}

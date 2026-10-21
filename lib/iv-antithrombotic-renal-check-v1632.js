// spec-v1632 tool 3: bivalirudin, eptifibatide, tirofiban and argatroban, the rate each label gives.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026. The tool reports the
// label's rate in the label's units and what it comes to at the weight entered. It gives no pump
// rate in mL/h and recommends nothing.
//
// Bivalirudin for injection (Dr. Reddy's, DailyMed version 10), sections 2.1 and 2.2: bolus
//   0.75 mg/kg, then 1.75 mg/kg/h for the procedure. "No reduction in the bolus dose is needed for
//   any degree of renal impairment." "creatinine clearance less than 30mL/min (by Cockcroft Gault
//   equation), reduce the infusion rate to 1 mg/kg/h"; "on hemodialysis, reduce the infusion rate to
//   0.25 mg/kg/h".
// Eptifibatide injection (Baxter, version 13), sections 2.1, 2.2, 2.3 (Table 1) and 4: 180 mcg/kg
//   bolus, then 2 mcg/kg/min, or 1 mcg/kg/min at a "Creatinine Clearance less than 50 mL/min"; for
//   PCI "a second bolus of 180 mcg/kg (given 10 minutes after the first bolus)". Table 1's last row,
//   above 121 kg: bolus 11.3 mL of 2 mg/mL (22.6 mg); infusion 20 mL/h of 0.75 mg/mL (15 mg/h), or
//   10 mL/h (7.5 mg/h) below 50 mL/min. Contraindicated: "Dependency on renal dialysis".
// Aggrastat (tirofiban; Medicure, version 18), sections 2.1 and 2.3: "25 mcg/kg administered
//   intravenously within 5 minutes and then 0.15 mcg/kg/min for up to 18 hours"; "CrCl <=60 mL/min
//   (calculated using the Cockcroft-Gault equation with actual body weight) ... 0.075 mcg/kg/min".
// Argatroban injection (Hikma, version 29), sections 2.2 and 2.4: HIT without hepatic impairment,
//   2 mcg/kg/min; "moderate or severe hepatic impairment (based on Child-Pugh classification), an
//   initial dose of 0.5 mcg/kg/min"; adjust to an aPTT of 1.5 to 3 times baseline, not above 100
//   seconds, and "not to exceed 10 mcg/kg/min". The label has no row for mild impairment.
//
// Pure: no DOM, no network; `now` is passed in.

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'bivalirudin', text: 'Bivalirudin', name: 'bivalirudin', setId: '19beb2ae-6064-3c24-fe50-0cee86896979' },
  { value: 'eptifibatide', text: 'Eptifibatide', name: 'eptifibatide', setId: '5f46b76b-5c83-49b9-ada8-4ad5cf81a38c' },
  { value: 'tirofiban', text: 'Tirofiban (Aggrastat)', name: 'Aggrastat', setId: 'fe0ced75-ccbf-4d2e-bd0d-b57e60ab913f' },
  { value: 'argatroban', text: 'Argatroban (heparin-induced thrombocytopenia)', name: 'argatroban', setId: '0cdf3f67-5bf3-4d58-b330-03febdc652bf' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const SETTINGS = [
  { value: 'acs', text: 'Acute coronary syndrome' },
  { value: 'pci', text: 'Percutaneous coronary intervention' },
];
export const HEPATIC = [
  { value: 'none', text: 'No hepatic impairment' },
  { value: 'mild', text: 'Mild (Child-Pugh A)' },
  { value: 'moderate-severe', text: 'Moderate or severe (Child-Pugh B or C)' },
];
export const EPTIFIBATIDE_TOP = { above: 121, bolusMg: 22.6, infusionMgH: 15, reducedMgH: 7.5 };
const NOTE = 'This reports the rate the label gives and what it comes to at the weight entered, in mass per time. It gives no pump rate in mL/h, is not a recommendation, and does not check contraindications other than the one named.';

const sig = (x) => Number(Number(x).toPrecision(4));
// 4 significant digits, or more where 4 would put a value on the other side of one of this label's edges
// (CrCl 29.9996 printed as "30" beside "below 30").
const EDGES = [30, 50, 60];
const show = (x) => sigSafe(Number(x), EDGES, 4).toLocaleString('en-US', { maximumSignificantDigits: 15 });

function bivalirudin(kg, crcl, dialysis) {
  const perKg = dialysis === 'yes' ? 0.25 : crcl < 30 ? 1 : 1.75;
  const rule = dialysis === 'yes' ? 'On hemodialysis.' : crcl < 30 ? `CrCl ${show(crcl)} mL/min is below 30.` : `CrCl ${show(crcl)} mL/min is 30 or above, not on hemodialysis.`;
  return {
    flag: 'dose', infusionPerKg: perKg, infusion: sig(perKg * kg), infusionUnit: 'mg/h', bolus: sig(0.75 * kg), bolusUnit: 'mg',
    text: `The bivalirudin label gives a 0.75 mg/kg bolus (${show(0.75 * kg)} mg), then ${perKg} mg/kg/h (${show(perKg * kg)} mg/h) for the procedure.`,
    rule,
    notes: [
      'The label says no reduction in the bolus is needed for any degree of renal impairment, and to monitor anticoagulant status in renal impairment.',
      `Five minutes after the bolus the label calls for an activated clotting time, with a further 0.3 mg/kg bolus (${show(0.3 * kg)} mg) if needed.`,
      'The label says to calculate the creatinine clearance with the Cockcroft-Gault equation.',
    ],
  };
}

function eptifibatide(o, kg, crcl, dialysis) {
  if (dialysis === 'yes') return { flag: 'contraindicated', text: 'The eptifibatide label lists dependency on renal dialysis as a contraindication.', rule: 'On dialysis.', notes: [] };
  const setting = String(o.setting ?? '').trim();
  if (setting !== 'acs' && setting !== 'pci') return { fault: 'Choose the setting for eptifibatide: acute coronary syndrome or PCI. The label adds a second bolus for PCI.' };
  const low = crcl < 50; const perKg = low ? 1 : 2;
  const notes = [];
  let bolusMg = (180 * kg) / 1000; let mgH = (perKg * kg * 60) / 1000;
  const top = kg > EPTIFIBATIDE_TOP.above;
  if (top) {
    notes.push(`By the per-kilogram figures: bolus ${show(bolusMg)} mg; infusion ${show(perKg * kg)} mcg/min (${show(mgH)} mg/h). The label's dosing chart has one row for every weight above 121 kg, which is what the result shows.`);
    bolusMg = EPTIFIBATIDE_TOP.bolusMg; mgH = low ? EPTIFIBATIDE_TOP.reducedMgH : EPTIFIBATIDE_TOP.infusionMgH;
  }
  notes.push(setting === 'pci'
    ? 'PCI: the label gives a second 180 mcg/kg bolus 10 minutes after the first, and an infusion until discharge or for up to 18 to 24 hours, with at least 12 hours recommended.'
    : 'Acute coronary syndrome: the label continues the infusion until discharge or bypass surgery, up to 72 hours.');
  return {
    flag: 'dose', infusionPerKg: perKg, infusion: sig(mgH), infusionUnit: 'mg/h', bolus: sig(bolusMg), bolusUnit: 'mg',
    text: top
      ? `For a weight above 121 kg the eptifibatide label's dosing chart gives one row: a ${show(bolusMg)} mg bolus${setting === 'pci' ? ', repeated once at 10 minutes,' : ''} then ${show(mgH)} mg/h (${show((mgH * 1000) / 60)} mcg/min).`
      : `The eptifibatide label gives a 180 mcg/kg bolus (${show(bolusMg)} mg)${setting === 'pci' ? ', repeated once at 10 minutes,' : ''} then ${perKg} mcg/kg/min (${show((mgH * 1000) / 60)} mcg/min, ${show(mgH)} mg/h).`,
    rule: low ? `CrCl ${show(crcl)} mL/min is below 50.` : `CrCl ${show(crcl)} mL/min is 50 or above.`,
    notes,
  };
}

function tirofiban(kg, crcl) {
  const low = crcl <= 60; const perKg = low ? 0.075 : 0.15;
  return {
    flag: 'dose', infusionPerKg: perKg, infusion: sig(perKg * kg), infusionUnit: 'mcg/min', bolus: sig(25 * kg), bolusUnit: 'mcg',
    text: `The Aggrastat label gives 25 mcg/kg within 5 minutes (${show(25 * kg)} mcg), then ${perKg} mcg/kg/min (${show(perKg * kg)} mcg/min) for up to 18 hours.`,
    rule: low ? `CrCl ${show(crcl)} mL/min is 60 or below.` : `CrCl ${show(crcl)} mL/min is above 60.`,
    notes: ['The label says to calculate the creatinine clearance with the Cockcroft-Gault equation and actual body weight.'],
  };
}

function argatroban(o, kg) {
  const hepatic = String(o.hepatic ?? '').trim();
  if (!HEPATIC.some((h) => h.value === hepatic)) return { fault: 'Choose the hepatic function for argatroban: the label\'s starting rate turns on it.' };
  const tail = ['The label adjusts the rate to an aPTT of 1.5 to 3 times baseline (not above 100 seconds), checked 2 hours after starting and after any change, and not above 10 mcg/kg/min.'];
  if (hepatic === 'mild') {
    return { flag: 'no-recommendation-given', text: 'The argatroban label gives 2 mcg/kg/min for patients without hepatic impairment and 0.5 mcg/kg/min for moderate or severe impairment; it has no row for mild impairment.', rule: 'Mild hepatic impairment (Child-Pugh A).', notes: [`At ${show(kg)} kg those two rates are ${show(2 * kg)} and ${show(0.5 * kg)} mcg/min.`, ...tail] };
  }
  const perKg = hepatic === 'none' ? 2 : 0.5;
  return {
    flag: 'dose', infusionPerKg: perKg, infusion: sig(perKg * kg), infusionUnit: 'mcg/min',
    text: `The argatroban label gives an initial ${perKg} mcg/kg/min (${show(perKg * kg)} mcg/min) as a continuous infusion for heparin-induced thrombocytopenia.`,
    rule: hepatic === 'none' ? 'No hepatic impairment.' : 'Moderate or severe hepatic impairment (Child-Pugh B or C).',
    notes: tail,
  };
}

export function ivAntithromboticRenalCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug: bivalirudin, eptifibatide, tirofiban or argatroban.' };
  const wf = inputFault([['the weight', o.weight, 20, 400, 'kg']]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight);
  const renal = drug.value !== 'argatroban';
  const asksDialysis = drug.value === 'bivalirudin' || drug.value === 'eptifibatide';
  let crcl = null; let dialysis = null;
  if (asksDialysis) {
    dialysis = String(o.dialysis ?? '').trim();
    if (dialysis !== 'no' && dialysis !== 'yes') return { valid: false, message: `Say whether the patient is on dialysis: the ${drug.name} label has its own line for it.` };
  }
  if (renal && dialysis !== 'yes') {
    const cf = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
    if (cf) return { valid: false, message: cf };
    crcl = Number(o.crcl);
  }
  const row = labelRow(drug.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, drug: drug.value, band: `The ${drug.name} label's rates are withheld, so no rate is reported.`, bandLabel: 'Withheld', notes: [`The ${drug.name} label rates are withheld: ${row.why}.`, 'Read the rate from the label in hand.'], note: NOTE };
  }
  const r = drug.value === 'bivalirudin' ? bivalirudin(kg, crcl, dialysis)
    : drug.value === 'eptifibatide' ? eptifibatide(o, kg, crcl, dialysis)
      : drug.value === 'tirofiban' ? tirofiban(kg, crcl) : argatroban(o, kg);
  if (r.fault) return { valid: false, message: r.fault };
  const { text, rule, notes, flag, ...extra } = r;
  const more = [];
  if (!renal && !(o.crcl === undefined || o.crcl === null || String(o.crcl).trim() === '')) more.push('The creatinine clearance entered is not used: the argatroban label\'s starting rate turns on hepatic function.');
  if (drug.value === 'tirofiban' && String(o.dialysis ?? '').trim() === 'yes') more.push('Dialysis was entered; the Aggrastat label\'s dosing section gives no separate line for it, so only the clearance rule is applied.');
  return {
    valid: true, drug: drug.value, flag, ...extra, abnormal: flag !== 'dose',
    band: text, bandLabel: flag === 'dose' ? `${show(extra.infusion)} ${extra.infusionUnit}` : flag === 'contraindicated' ? 'Contraindicated' : 'No rate given',
    notes: [rule, ...notes, ...more, `Label: ${row.edition}.`], note: NOTE,
  };
}

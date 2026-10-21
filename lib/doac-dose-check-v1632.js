// spec-v1632 tool 1: DOAC dose by indication and kidney function, read from each label.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026. The tool reports the row
// the label gives; it never recommends, and a drug whose label has changed stops answering.
//
// Eliquis (apixaban; E.R. Squibb, DailyMed version 30), sections 2.1 and 2.6:
//   AF: 5 mg twice daily; 2.5 mg twice daily "in patients with at least two of the following
//     characteristics: age greater than or equal to 80 years, body weight less than or equal to
//     60 kg, serum creatinine greater than or equal to 1.5 mg/dL". The rule sits under the AF heading
//     only. Hip or knee replacement: 2.5 mg twice daily (35 days hip, 12 days knee). DVT/PE: 10 mg
//     twice daily for 7 days, then 5 mg twice daily. Recurrence: 2.5 mg twice daily after at least 6
//     months. 2.6: on 5 or 10 mg twice daily "reduce the dose by 50%" with combined P-gp and strong
//     CYP3A4 inhibitors; "in patients already taking 2.5 mg twice daily, avoid coadministration".
//
// Xarelto (rivaroxaban; Janssen, version 65), section 2.1, Table 1 ("Calculate CrCl based on actual
//   weight"): AF CrCl >50, 20 mg once daily with the evening meal; CrCl <=50, 15 mg once daily
//   (CrCl <30 "not studied"). DVT/PE: CrCl >=15, 15 mg twice daily for 21 days, then 20 mg once
//   daily; <15 "Avoid Use". Recurrence, hip (35 days), knee (12 days), acutely ill medical (31 to 39
//   days): CrCl >=15, 10 mg once daily; <15 "Avoid Use". CAD and PAD: 2.5 mg twice daily plus
//   aspirin, "No dose adjustment needed based on CrCl".
//
// Pradaxa capsules (dabigatran; Boehringer Ingelheim, version 48), section 2.2: AF CrCl >30, 150 mg
//   twice daily; 15 to 30, 75 mg twice daily; <15 or on dialysis, "Dosing recommendations cannot be
//   provided"; with dronedarone or systemic ketoconazole, CrCl 30 to 50, 75 mg twice daily, and CrCl
//   <30, "Avoid coadministration". DVT/PE treatment and recurrence: CrCl >30, 150 mg twice daily;
//   <=30 or on dialysis, no recommendation; P-gp inhibitor with CrCl <50, avoid. Hip: CrCl >30,
//   110 mg then 220 mg once daily for 28 to 35 days; <=30, no recommendation; P-gp inhibitor with
//   CrCl <50, avoid.
//
// Savaysa (edoxaban; Daiichi Sankyo, version 28), sections 2.1, 2.2, 7.3, 8.6 and 14.2: AF 60 mg once
//   daily; "Do not use SAVAYSA in patients with CrCL > 95 mL/min"; 30 mg once daily for CrCL 15 to
//   50. DVT/PE: 60 mg once daily after 5 to 10 days of a parenteral anticoagulant; 30 mg once daily
//   for CrCL 15 to 50, weight <=60 kg, or "certain concomitant P-gp inhibitor medications" (14.2 names
//   the trial's: verapamil, quinidine, or short-term azithromycin, clarithromycin, erythromycin, oral
//   itraconazole or oral ketoconazole). 7.3: for AF "no dose reduction is recommended for concomitant
//   P-gp inhibitor use". 8.6: CrCL <15, "not recommended".
//
// Adults only: the pediatric weight tables are out of scope (spec-v1632, Rejected).
//
// Pure: no DOM, no network; `now` is passed in.

import { sigSafe } from './cut-display.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'apixaban', text: 'Apixaban (Eliquis)', brand: 'Eliquis', setId: 'e9481622-7cc6-418a-acb6-c5450daae9b0' },
  { value: 'rivaroxaban', text: 'Rivaroxaban (Xarelto)', brand: 'Xarelto', setId: '10db92f9-2300-4a80-836b-673e1ae91610' },
  { value: 'dabigatran', text: 'Dabigatran (Pradaxa capsules)', brand: 'Pradaxa', setId: 'ba74e3cd-b06f-4145-b284-5fd6b84ff3c9' },
  { value: 'edoxaban', text: 'Edoxaban (Savaysa)', brand: 'Savaysa', setId: 'e77d3400-56ad-11e3-949a-0800200c9a66' },
];
export const INDICATIONS = [
  { value: 'af', text: 'Nonvalvular atrial fibrillation', drugs: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'] },
  { value: 'vte-treatment', text: 'Treatment of DVT or PE', drugs: ['apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'] },
  { value: 'vte-recurrence', text: 'Reduction in the risk of recurrent DVT or PE', drugs: ['apixaban', 'rivaroxaban', 'dabigatran'] },
  { value: 'hip', text: 'DVT prophylaxis after hip replacement', drugs: ['apixaban', 'rivaroxaban', 'dabigatran'] },
  { value: 'knee', text: 'DVT prophylaxis after knee replacement', drugs: ['apixaban', 'rivaroxaban'] },
  { value: 'medical', text: 'VTE prophylaxis in acutely ill medical patients', drugs: ['rivaroxaban'] },
  { value: 'cad-pad', text: 'CAD or PAD (with aspirin)', drugs: ['rivaroxaban'] },
];
export const INTERACTIONS = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];
// What the "interacting drug" question means for each drug, in the label's words.
export const INTERACTION_MEANS = {
  apixaban: 'a combined P-gp and strong CYP3A4 inhibitor (the label\'s examples: ketoconazole, itraconazole, ritonavir)',
  rivaroxaban: 'an interacting drug',
  dabigatran: 'a P-gp inhibitor (for atrial fibrillation the label names dronedarone and systemic ketoconazole)',
  edoxaban: 'one of the P-gp inhibitors in the label\'s trial (verapamil, quinidine, or short-term azithromycin, clarithromycin, erythromycin, oral itraconazole or oral ketoconazole)',
};
const NOTE = 'This reports what section 2 of the label gives for the values entered. It is not a recommendation, it covers adults only, and it does not check contraindications, bleeding risk, valve disease or other interactions.';

const sig = (x) => Number(Number(x).toPrecision(4));
// 4 significant digits, or more where 4 would put a value on the other side of one of this label's edges
// (CrCl 29.9996 printed as "30" beside "below 30").
const EDGES = [15, 30, 50, 95];
const show = (x) => sigSafe(Number(x), EDGES, 4).toLocaleString('en-US', { maximumSignificantDigits: 15 });

// Each returns { flag, text, rule, notes[] } or { fault }.
function apixaban(o, ind, interaction) {
  const notes = [];
  let dose; let rule;
  if (ind === 'af') {
    const f = inputFault([['the age', o.age, 18, 120, 'years'], ['the weight', o.weight, 20, 400, 'kg'], ['the serum creatinine', o.creatinine, 0.1, 20, 'mg/dL']]);
    if (f) return { fault: `${f} The apixaban label's dose for atrial fibrillation turns on age, weight and serum creatinine.` };
    const met = [];
    if (Number(o.age) >= 80) met.push(`age ${show(Number(o.age))} is 80 years or more`);
    if (Number(o.weight) <= 60) met.push(`weight ${show(Number(o.weight))} kg is 60 kg or less`);
    if (Number(o.creatinine) >= 1.5) met.push(`serum creatinine ${show(Number(o.creatinine))} mg/dL is 1.5 or more`);
    dose = met.length >= 2 ? 2.5 : 5;
    rule = `${met.length} of the label's 3 characteristics met${met.length ? ` (${met.join('; ')})` : ''}; the label gives 2.5 mg twice daily with at least 2, and 5 mg twice daily otherwise.`;
  } else if (ind === 'vte-treatment') {
    dose = 10; rule = 'Treatment of DVT and PE: 10 mg twice daily for the first 7 days, then 5 mg twice daily. The label\'s age, weight and creatinine rule is for atrial fibrillation only and is not applied here.';
  } else {
    dose = 2.5;
    rule = ind === 'vte-recurrence' ? 'Reduction in the risk of recurrence: 2.5 mg twice daily after at least 6 months of treatment for DVT or PE.'
      : `Prophylaxis after ${ind} replacement: 2.5 mg twice daily, the first dose 12 to 24 hours after surgery, for ${ind === 'hip' ? 35 : 12} days.`;
  }
  const base = dose === 10 ? '10 mg twice daily for 7 days, then 5 mg twice daily' : `${dose} mg twice daily`;
  if (interaction === 'yes') {
    if (dose === 2.5) return { flag: 'avoid', text: `The Eliquis label gives ${base} here and says to avoid coadministration with combined P-gp and strong CYP3A4 inhibitors in patients already taking 2.5 mg twice daily.`, rule, notes };
    const halved = dose === 10 ? '5 mg twice daily for 7 days, then 2.5 mg twice daily' : '2.5 mg twice daily';
    return { flag: 'dose', text: `The Eliquis label gives ${base} here, reduced by 50% with a combined P-gp and strong CYP3A4 inhibitor: ${halved}.`, rule, notes };
  }
  return { flag: 'dose', text: `The Eliquis label gives ${base}.`, rule, notes };
}

function rivaroxaban(ind, crcl, interaction) {
  const notes = ['The Xarelto label says to calculate the creatinine clearance with actual body weight.'];
  if (interaction === 'yes') notes.push('Section 2 of the Xarelto label gives no dose change for an interacting drug; its interaction rules are in sections 5 and 7, which this tool does not read.');
  if (ind === 'cad-pad') return { flag: 'no-adjustment', text: 'The Xarelto label gives 2.5 mg twice daily plus aspirin (75 to 100 mg) once daily, with no dose adjustment needed based on CrCl.', rule: 'CAD or PAD: one dose at any creatinine clearance.', notes };
  if (ind === 'af') {
    if (crcl > 50) return { flag: 'dose', text: 'The Xarelto label gives 20 mg once daily with the evening meal.', rule: `CrCl ${show(crcl)} mL/min is above 50.`, notes };
    if (crcl < 30) notes.push('The label notes that patients with a CrCl below 30 mL/min were not studied; it expects concentrations similar to those at 30 to under 50 mL/min.');
    return { flag: 'dose', text: 'The Xarelto label gives 15 mg once daily with the evening meal.', rule: `CrCl ${show(crcl)} mL/min is 50 or below.`, notes };
  }
  if (crcl < 15) return { flag: 'avoid', text: 'The Xarelto label says to avoid use for this indication at a CrCl below 15 mL/min.', rule: `CrCl ${show(crcl)} mL/min is below 15.`, notes };
  const rows = {
    'vte-treatment': '15 mg twice daily with food for 21 days, then 20 mg once daily with food',
    'vte-recurrence': '10 mg once daily, after at least 6 months of standard anticoagulant treatment',
    hip: '10 mg once daily for 35 days, starting 6 to 10 hours after surgery once hemostasis is established',
    knee: '10 mg once daily for 12 days, starting 6 to 10 hours after surgery once hemostasis is established',
    medical: '10 mg once daily, in hospital and after discharge, for a total of 31 to 39 days',
  };
  return { flag: 'dose', text: `The Xarelto label gives ${rows[ind]}.`, rule: `CrCl ${show(crcl)} mL/min is 15 or above.`, notes };
}

function dabigatran(ind, crcl, interaction) {
  const notes = [];
  const none = (rule) => ({ flag: 'no-recommendation-given', text: 'The Pradaxa label says dosing recommendations cannot be provided for this creatinine clearance (or on dialysis).', rule, notes });
  if (ind === 'af') {
    if (interaction === 'yes') {
      notes.push('For atrial fibrillation the label\'s interaction rows name dronedarone and systemic ketoconazole.');
      if (crcl < 30) return { flag: 'avoid', text: 'The Pradaxa label says to avoid coadministration with a P-gp inhibitor at a CrCl below 30 mL/min.', rule: `CrCl ${show(crcl)} mL/min is below 30, with a P-gp inhibitor.`, notes };
      if (crcl <= 50) return { flag: 'dose', text: 'The Pradaxa label gives 75 mg twice daily when given with dronedarone or systemic ketoconazole at a CrCl of 30 to 50 mL/min.', rule: `CrCl ${show(crcl)} mL/min is 30 to 50, with a P-gp inhibitor.`, notes };
    }
    if (crcl > 30) return { flag: 'dose', text: 'The Pradaxa label gives 150 mg twice daily.', rule: `CrCl ${show(crcl)} mL/min is above 30.`, notes };
    if (crcl >= 15) return { flag: 'dose', text: 'The Pradaxa label gives 75 mg twice daily.', rule: `CrCl ${show(crcl)} mL/min is 15 to 30.`, notes };
    return none(`CrCl ${show(crcl)} mL/min is below 15.`);
  }
  if (interaction === 'yes' && crcl < 50) return { flag: 'avoid', text: 'The Pradaxa label says to avoid coadministration with a P-gp inhibitor at a CrCl below 50 mL/min for this indication.', rule: `CrCl ${show(crcl)} mL/min is below 50, with a P-gp inhibitor.`, notes };
  if (crcl <= 30) return none(`CrCl ${show(crcl)} mL/min is 30 or below.`);
  const text = ind === 'hip' ? 'The Pradaxa label gives 110 mg 1 to 4 hours after surgery once hemostasis is achieved, then 220 mg once daily for 28 to 35 days.'
    : ind === 'vte-treatment' ? 'The Pradaxa label gives 150 mg twice daily, after 5 to 10 days of parenteral anticoagulation.'
      : 'The Pradaxa label gives 150 mg twice daily after previous treatment.';
  return { flag: 'dose', text, rule: `CrCl ${show(crcl)} mL/min is above 30.`, notes };
}

function edoxaban(o, ind, crcl, interaction) {
  const notes = ['The Savaysa label says to assess the creatinine clearance with the Cockcroft-Gault equation before starting.'];
  if (crcl < 15) return { flag: 'not-recommended', text: 'The Savaysa label says edoxaban is not recommended at a CrCl below 15 mL/min (section 8.6; section 2 has no row for it).', rule: `CrCl ${show(crcl)} mL/min is below 15.`, notes };
  if (ind === 'af') {
    if (interaction === 'yes') notes.push('For atrial fibrillation the label says no dose reduction is recommended for concomitant P-gp inhibitor use (section 7.3).');
    if (crcl > 95) return { flag: 'not-recommended', text: 'The Savaysa label says do not use edoxaban for atrial fibrillation at a CrCl above 95 mL/min.', rule: `CrCl ${show(crcl)} mL/min is above 95.`, notes };
    if (crcl > 50) return { flag: 'dose', text: 'The Savaysa label gives 60 mg once daily.', rule: `CrCl ${show(crcl)} mL/min is above 50 and no more than 95.`, notes };
    return { flag: 'dose', text: 'The Savaysa label gives 30 mg once daily.', rule: `CrCl ${show(crcl)} mL/min is 15 to 50.`, notes };
  }
  const f = inputFault([['the weight', o.weight, 20, 400, 'kg']]);
  if (f) return { fault: `${f} The edoxaban label's dose for DVT or PE turns on weight.` };
  const why = [];
  if (crcl <= 50) why.push(`CrCl ${show(crcl)} mL/min is 15 to 50`);
  if (Number(o.weight) <= 60) why.push(`weight ${show(Number(o.weight))} kg is 60 kg or less`);
  if (interaction === 'yes') { why.push('a P-gp inhibitor from the label\'s trial list is in use'); notes.push('Section 2 says "certain concomitant P-gp inhibitor medications" without listing them; section 14.2 names the ones its trial used: verapamil, quinidine, or short-term azithromycin, clarithromycin, erythromycin, oral itraconazole or oral ketoconazole.'); }
  const after = ' after 5 to 10 days of initial therapy with a parenteral anticoagulant';
  if (why.length) return { flag: 'dose', text: `The Savaysa label gives 30 mg once daily${after}.`, rule: `Reduced-dose criteria met: ${why.join('; ')}.`, notes };
  return { flag: 'dose', text: `The Savaysa label gives 60 mg once daily${after}.`, rule: `No reduced-dose criterion met (CrCl ${show(crcl)} mL/min above 50, weight above 60 kg, no listed P-gp inhibitor).`, notes };
}

export function doacDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug: apixaban, rivaroxaban, dabigatran or edoxaban.' };
  const ind = INDICATIONS.find((i) => i.value === String(o.indication ?? '').trim());
  if (!ind) return { valid: false, message: 'Choose the indication. The label gives a different dose for each.' };
  if (!ind.drugs.includes(drug.value)) return { valid: false, message: `The ${drug.brand} label's adult dosing section has no row for "${ind.text}". Its indications here: ${INDICATIONS.filter((i) => i.drugs.includes(drug.value)).map((i) => i.text).join('; ')}.` };
  const interaction = String(o.interaction ?? '').trim();
  if (interaction !== 'no' && interaction !== 'yes') return { valid: false, message: `Say whether the patient takes ${INTERACTION_MEANS[drug.value]}: the label's row can change with it.` };
  let crcl = null;
  if (drug.value !== 'apixaban') {
    const f = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
    if (f) return { valid: false, message: f };
    crcl = Number(o.crcl);
  }
  const row = labelRow(drug.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, drug: drug.value, band: `The ${drug.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${drug.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  }
  const r = drug.value === 'apixaban' ? apixaban(o, ind.value, interaction)
    : drug.value === 'rivaroxaban' ? rivaroxaban(ind.value, crcl, interaction)
      : drug.value === 'dabigatran' ? dabigatran(ind.value, crcl, interaction)
        : edoxaban(o, ind.value, crcl, interaction);
  if (r.fault) return { valid: false, message: r.fault };
  const notes = [r.rule, ...r.notes];
  if (drug.value === 'apixaban' && !(o.crcl === undefined || o.crcl === null || String(o.crcl).trim() === '')) notes.push('The creatinine clearance entered is not used: section 2 of the Eliquis label gives no row by clearance.');
  notes.push(`Label: ${row.edition}.`);
  const short = { dose: 'Dose given', 'no-adjustment': 'No adjustment', avoid: 'Avoid', 'not-recommended': 'Not recommended', 'no-recommendation-given': 'No recommendation given' }[r.flag];
  return {
    valid: true, drug: drug.value, indication: ind.value, flag: r.flag, abnormal: r.flag !== 'dose' && r.flag !== 'no-adjustment',
    band: r.text, bandLabel: short,
    notes, note: NOTE,
  };
}

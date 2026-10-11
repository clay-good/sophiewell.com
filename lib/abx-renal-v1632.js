// spec-v1632 backfills 1 to 3: antibiotic dose by kidney function, read from each label's renal table
// through lib/label-dose.js. It replaces the four-row data/abx-renal table: the rows live here, each
// tied to a watched label edition (spec-v1628 section 1), and an indication is a choice, not a note.
//
// Twenty-two labels, each re-read on October 11, 2026 (Dosage and Administration unless noted):
//   Cefepime (Apotex), Table 2, four usual-dose columns, with CAPD and hemodialysis rows.
//   Piperacillin-tazobactam (Civica), Table 1: all indications, and nosocomial pneumonia.
//   Vancomycin injection (Gland): "The dosage ... per day in mg is about 15 times the glomerular
//     filtration rate in mL/min", with a table from 100 mL/min (1,545 mg) to 10 mL/min (155 mg). The
//     earlier row here said the label had no clearance table; it has one.
//   Ciprofloxacin injection (Hospira), Table 4: ">30 See Usual Dosage", "5 to 29". Exactly 30 is in
//     neither row. Cipro tablets (Bayer, version 32), Table 4: >50, 30-50, 5-29, dialysis.
//   Meropenem (B. Braun, version 25): >50, 26-50, 10-25, <10; "inadequate information" on dialysis.
//   Levofloxacin tablets (Aurobindo, version 23), Table 3, three usual-dose rows.
//   Bactrim (version 18): above 30, 15-30, below 15 "Use not recommended".
//   Macrobid (version 26), Contraindications: "creatinine clearance under 60 mL per minute".
//   Cubicin RF (version 22), Table 3. Invanz (version 42), 2.4 and 2.5, in mL/min/1.73 m2.
//   Cefazolin (WG Critical Care, version 21): 55 or greater, 35-54, 11-34, 10 or less.
//   Unasyn (version 46), Table 3, in mL/min/1.73 m2: >=30, 15-29, 5-14.
//   Tazicef (version 30), Table 4: "50 to 31", "30 to 16", "15 to 6", "less than 5".
//   Primaxin (version 34), Table 3, three regimens across four clearance columns.
//   Azactam (version 15), in mL/min/1.73 m2: "between 10 and 30", "less than 10".
//   Teflaro (version 43), Table 4. Amoxicillin (USAntibiotics, version 6), 2.4, and
//   amoxicillin-clavulanate (Sandoz, version 27), Table 4, by glomerular filtration rate.
//   Cephalexin (Aurobindo, version 19), Table 1. Coly-Mycin M (version 27), Table 1, colistin base.
//   Diflucan (version 57): >50 100%; <=50 (no dialysis) 50%; hemodialysis 100% after each session.
//
// Adults only. Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const CI = 'contraindicated'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D) => ({ from, to, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const gt = (from, text, flag = D) => ({ from, to: null, fromExclusive: true, text, flag });
const CRCL = { unit: 'mL/min', measure: 'creatinine clearance' };
const BSA = { unit: 'mL/min/1.73 m²', measure: 'creatinine clearance' };
const GFR = { unit: 'mL/min', measure: 'glomerular filtration rate' };

export const LABELS = {
  cefepime: { brand: 'cefepime (Apotex)', setId: '02aa374f-37b4-456a-b5de-cfd3bbb6ce6e', ...CRCL },
  piptazo: { brand: 'piperacillin-tazobactam (Civica)', setId: '19e89f8b-316b-4dd2-9724-bfe0faeba408', ...CRCL },
  vancomycin: { brand: 'vancomycin injection (Gland)', setId: '00946db3-d6c5-4534-a870-1ec6e63eda43', ...CRCL },
  ciproIv: { brand: 'ciprofloxacin injection (Hospira)', setId: 'cbbbf939-3219-4515-a48e-ca264daa4d07', ...CRCL },
  ciproOral: { brand: 'Cipro tablets', setId: '888dc7f9-ad9c-4c00-8d50-8ddfd9bd27c0', ...CRCL },
  meropenem: { brand: 'meropenem (B. Braun)', setId: '3b952a55-6ef7-45c8-be21-16eefe37ec2e', ...CRCL },
  levofloxacin: { brand: 'levofloxacin tablets (Aurobindo)', setId: '529ac72c-c4a0-4001-8cf9-b94f5bf7265c', ...CRCL },
  tmpSmx: { brand: 'Bactrim', setId: 'f59d0c04-9c66-4d53-a0e1-cb55570deb62', ...CRCL },
  nitrofurantoin: { brand: 'Macrobid', setId: '8f270a9f-12a1-44d4-bc7e-873613555801', ...CRCL },
  daptomycin: { brand: 'Cubicin RF', setId: '0b1a8885-2198-4a0e-8105-0c76c1cba6c2', ...CRCL },
  ertapenem: { brand: 'Invanz', setId: '33f3b99b-fa82-42e0-26bf-f49891ae3d22', ...BSA },
  cefazolin: { brand: 'cefazolin (WG Critical Care)', setId: 'f17160d4-fc42-4f9c-abb8-d04f01ae6dd1', ...CRCL },
  ampSulbactam: { brand: 'Unasyn', setId: '155c7ec0-5862-404f-b1d0-f278f8a8bbda', ...BSA },
  ceftazidime: { brand: 'Tazicef', setId: '1ab5ae3e-e303-4499-4c89-472d7cc1e46c', ...CRCL },
  imipenem: { brand: 'Primaxin', setId: 'f41d8abd-7792-4918-1b93-bd83ea01955e', ...CRCL },
  aztreonam: { brand: 'Azactam', setId: '9a105eaf-ee77-4016-beeb-d425a5565db2', ...BSA },
  ceftaroline: { brand: 'Teflaro', setId: '3ecde48b-75a2-4beb-9999-369f3f61bb8a', ...CRCL },
  amoxicillin: { brand: 'amoxicillin (USAntibiotics)', setId: '110ba6b1-f175-48a1-8e30-616c02212538', ...GFR },
  amoxClav: { brand: 'amoxicillin-clavulanate (Sandoz)', setId: '7cba82f0-9886-46e9-8dbd-43a448aade29', ...GFR },
  cephalexin: { brand: 'cephalexin (Aurobindo)', setId: '8e28f049-6110-4473-830f-c494191a7197', ...CRCL },
  colistimethate: { brand: 'Coly-Mycin M', setId: '6d6e13e2-dc33-4b7b-84d0-66146a57c552', ...CRCL },
  fluconazole: { brand: 'Diflucan', setId: 'f694c617-3383-416c-91b6-b94fda371204', ...CRCL },
};

// Cefepime, Table 2: one column per usual dose. [usual, 30 to 60, 11 to 29, below 11, CAPD, hemodialysis].
const CEFEPIME_HD = '1 g on day 1, then 500 mg every 24 hours, given after hemodialysis on hemodialysis days';
const cefepime = (value, text, [usual, mid, low, least, capd, hd]) => ({
  value, drug: 'cefepime', text: `Cefepime: usual dose ${text}`,
  bands: [gt(60, usual, NA), b(30, 60, mid), b(11, 29, low), lt(11, least)],
  hd: { text: hd, flag: D }, pd: { text: `${capd} (continuous ambulatory peritoneal dialysis)`, flag: D },
});
const piptazo = (value, text, [usual, mid, low, dialysis]) => ({
  value, drug: 'piptazo', text: `Piperacillin-tazobactam: ${text}`,
  bands: [gt(40, usual, NA), b(20, 40, mid), lt(20, low)],
  hd: { text: `${dialysis}, with 0.75 g after each hemodialysis session on hemodialysis days`, flag: D }, pd: { text: `${dialysis} (CAPD)`, flag: D },
});
const meropenem = (value, text, full, halfDose) => ({
  value, drug: 'meropenem', text: `Meropenem: ${text}`,
  bands: [gt(50, `${full} every 8 hours`, NA), b(26, 50, `${full} every 12 hours`), b(10, 25, `one-half the recommended dose (${halfDose}) every 12 hours`), lt(10, `one-half the recommended dose (${halfDose}) every 24 hours`)],
  hd: MERO_DIALYSIS, pd: MERO_DIALYSIS,
});
const MERO_DIALYSIS = { text: 'there is inadequate information regarding the use of meropenem in patients on hemodialysis or peritoneal dialysis', flag: NG };
const LEVO_250_DIALYSIS = { text: 'no information on dosing adjustment is available for the 250 mg dose in hemodialysis or CAPD', flag: NG };
const levo = (value, usual, mid, low, dialysis) => ({
  value, drug: 'levofloxacin', text: `Levofloxacin: usual dose ${usual}`,
  bands: [b(50, null, usual, NA), b(20, 49, mid.text, mid.flag), b(10, 19, low)],
  hd: dialysis, pd: dialysis,
});
const dapto = (value, text, mg) => ({
  value, drug: 'daptomycin', text: `Daptomycin: ${text}`,
  bands: [b(30, null, `${mg} mg/kg once every 24 hours`, NA), lt(30, `${mg} mg/kg once every 48 hours`)],
  hd: { text: `${mg} mg/kg once every 48 hours, given after hemodialysis on hemodialysis days when possible`, flag: D }, pd: { text: `${mg} mg/kg once every 48 hours (CAPD)`, flag: D },
});
const IMI_BELOW_15 = 'patients with creatinine clearance below 15 mL/min should not receive Primaxin unless hemodialysis is instituted within 48 hours';
const imipenem = (value, text, [a, c, d, e]) => ({
  value, drug: 'imipenem', text: `Imipenem-cilastatin: ${text}`,
  bands: [b(90, null, a, NA), { from: 60, to: 90, toExclusive: true, text: c, flag: D }, { from: 30, to: 60, toExclusive: true, text: d, flag: D }, { from: 15, to: 30, toExclusive: true, text: e, flag: D }, lt(15, IMI_BELOW_15, NR)],
  hd: { text: `${e} (the label's row for below 30 to 15 mL/min), given after hemodialysis and timed from the end of that session`, flag: D },
  pd: { text: 'there is inadequate information to recommend usage of Primaxin for patients undergoing peritoneal dialysis', flag: NG },
});
const AMOX_HD = { text: '500 mg or 250 mg every 24 hours, depending on the severity of the infection, with an additional dose both during and at the end of dialysis', flag: D };
const amox = (value, drug, text) => ({
  value, drug, text,
  bands: [gt(30, 'no reduction in dose (the label says a reduction is not generally required unless the impairment is severe)', NA), b(10, 30, '500 mg or 250 mg every 12 hours, depending on the severity of the infection'), lt(10, '500 mg or 250 mg every 24 hours, depending on the severity of the infection')],
  hd: AMOX_HD,
});
const NITRO_CI = 'Macrobid is contraindicated: anuria, oliguria, or significant impairment of renal function (creatinine clearance under 60 mL per minute or clinically significant elevated serum creatinine)';
const AZT_SEVERE = 'the usual dose of 500 mg, 1 g or 2 g initially, then one-fourth of the usual initial dose at the usual fixed interval of 6, 8 or 12 hours';
const CAZ_PD = '1 g loading dose, then 500 mg every 24 hours (intraperitoneal dialysis and CAPD)';

export const REGIMENS = [
  cefepime('cefepime-500mg-q12h', '500 mg every 12 hours', ['500 mg every 12 hours', '500 mg every 24 hours', '500 mg every 24 hours', '250 mg every 24 hours', '500 mg every 48 hours', CEFEPIME_HD]),
  cefepime('cefepime-1g-q12h', '1 g every 12 hours', ['1 g every 12 hours', '1 g every 24 hours', '500 mg every 24 hours', '250 mg every 24 hours', '1 g every 48 hours', CEFEPIME_HD]),
  cefepime('cefepime-2g-q12h', '2 g every 12 hours', ['2 g every 12 hours', '2 g every 24 hours', '1 g every 24 hours', '500 mg every 24 hours', '2 g every 48 hours', CEFEPIME_HD]),
  cefepime('cefepime-2g-q8h', '2 g every 8 hours (febrile neutropenia)', ['2 g every 8 hours', '2 g every 12 hours', '2 g every 24 hours', '1 g every 24 hours', '2 g every 48 hours', '1 g every 24 hours (febrile neutropenia), given after hemodialysis on hemodialysis days']),
  piptazo('piperacillin-tazobactam', 'all indications except nosocomial pneumonia', ['3.375 g every 6 hours', '2.25 g every 6 hours', '2.25 g every 8 hours', '2.25 g every 12 hours']),
  piptazo('piperacillin-tazobactam-nosocomial-pneumonia', 'nosocomial pneumonia', ['4.5 g every 6 hours', '3.375 g every 6 hours', '2.25 g every 6 hours', '2.25 g every 8 hours']),
  { value: 'vancomycin', drug: 'vancomycin', text: 'Vancomycin, intravenous', anyValue: true, bands: [b(null, null, 'a daily dose in mg of about 15 times the glomerular filtration rate in mL/min (its table runs from 1,545 mg per 24 hours at 100 mL/min to 155 mg at 10 mL/min), with an initial dose of no less than 15 mg/kg')] },
  { value: 'ciprofloxacin-iv', drug: 'ciproIv', text: 'Ciprofloxacin, intravenous', bands: [gt(30, 'the usual dosage (the label reads "See Usual Dosage")', NA), b(5, 29, '200 to 400 mg every 18 to 24 hours')] },
  { value: 'ciprofloxacin-oral', drug: 'ciproOral', text: 'Ciprofloxacin, oral', bands: [gt(50, 'the usual dosage (the label reads "See Usual Dosage")', NA), b(30, 50, '250 to 500 mg every 12 hours'), b(5, 29, '250 to 500 mg every 18 hours')], hd: { text: '250 to 500 mg every 24 hours, after dialysis', flag: D }, pd: { text: '250 to 500 mg every 24 hours, after dialysis', flag: D } },
  meropenem('meropenem-500mg', 'complicated skin infection, 500 mg', '500 mg', '250 mg'),
  meropenem('meropenem-1g', 'intra-abdominal infection, 1 g', '1 g', '500 mg'),
  levo('levofloxacin-750mg', '750 mg every 24 hours', { text: '750 mg every 48 hours', flag: D }, '750 mg initial dose, then 500 mg every 48 hours', { text: '750 mg initial dose, then 500 mg every 48 hours (hemodialysis or CAPD)', flag: D }),
  levo('levofloxacin-500mg', '500 mg every 24 hours', { text: '500 mg initial dose, then 250 mg every 24 hours', flag: D }, '500 mg initial dose, then 250 mg every 48 hours', { text: '500 mg initial dose, then 250 mg every 48 hours (hemodialysis or CAPD)', flag: D }),
  levo('levofloxacin-250mg', '250 mg every 24 hours', { text: 'no dosage adjustment required', flag: NA }, '250 mg every 48 hours; if treating uncomplicated urinary tract infection, no dosage adjustment is required', LEVO_250_DIALYSIS),
  { value: 'tmp-smx', drug: 'tmpSmx', text: 'Trimethoprim-sulfamethoxazole (Bactrim)', bands: [gt(30, 'the usual standard regimen', NA), b(15, 30, 'one-half the usual regimen'), lt(15, 'use not recommended', NR)] },
  { value: 'nitrofurantoin', drug: 'nitrofurantoin', text: 'Nitrofurantoin (Macrobid)', bands: [b(60, null, 'one 100 mg capsule every 12 hours for seven days (the label\'s dose; it gives no reduced dose)', NA), lt(60, NITRO_CI, CI)], hd: { text: NITRO_CI, flag: CI }, pd: { text: NITRO_CI, flag: CI } },
  dapto('daptomycin-4mg-kg', 'complicated skin infection, 4 mg/kg', 4),
  dapto('daptomycin-6mg-kg', 'S. aureus bloodstream infection, 6 mg/kg', 6),
  { value: 'ertapenem', drug: 'ertapenem', text: 'Ertapenem (Invanz)', bands: [gt(30, 'no dosage adjustment (1 g daily)', NA), b(null, 30, '500 mg daily')], hd: { text: '500 mg daily; if it is given within 6 hours before hemodialysis, a supplementary dose of 150 mg after the session', flag: D }, pd: { text: 'there are no data in patients undergoing peritoneal dialysis or hemofiltration', flag: NG } },
  { value: 'cefazolin', drug: 'cefazolin', text: 'Cefazolin', bands: [b(55, null, 'full doses', NA), b(35, 54, 'full doses, restricted to at least 8-hour intervals'), b(11, 34, 'one-half the usual dose every 12 hours'), b(null, 10, 'one-half the usual dose every 18 to 24 hours')] },
  { value: 'ampicillin-sulbactam', drug: 'ampSulbactam', text: 'Ampicillin-sulbactam (Unasyn)', bands: [b(30, null, '1.5 g to 3 g every 6 to 8 hours', NA), b(15, 29, '1.5 g to 3 g every 12 hours'), b(5, 14, '1.5 g to 3 g every 24 hours')] },
  { value: 'ceftazidime', drug: 'ceftazidime', text: 'Ceftazidime (Tazicef)', bands: [gt(50, 'the usual dosage (the label reduces the dose below 50 mL/min)', NA), b(31, 50, '1 gram every 12 hours'), b(16, 30, '1 gram every 24 hours'), b(6, 15, '500 mg every 24 hours'), lt(5, '500 mg every 48 hours')], hd: { text: '1 gram loading dose, then 1 gram after each hemodialysis period', flag: D }, pd: { text: CAZ_PD, flag: D } },
  imipenem('imipenem-500mg-q6h', 'susceptible organism, 500 mg every 6 hours', ['500 mg every 6 hours', '400 mg every 6 hours', '300 mg every 6 hours', '200 mg every 6 hours']),
  imipenem('imipenem-1000mg-q8h', 'susceptible organism, 1,000 mg every 8 hours', ['1,000 mg every 8 hours', '500 mg every 6 hours', '500 mg every 8 hours', '500 mg every 12 hours']),
  imipenem('imipenem-1000mg-q6h', 'intermediate susceptibility, 1,000 mg every 6 hours', ['1,000 mg every 6 hours', '750 mg every 8 hours', '500 mg every 6 hours', '500 mg every 12 hours']),
  { value: 'aztreonam', drug: 'aztreonam', text: 'Aztreonam (Azactam)', bands: [gt(30, 'the usual dosage (the label halves the dose between 10 and 30)', NA), b(10, 30, 'half the usual dose, after an initial loading dose of 1 g or 2 g'), lt(10, AZT_SEVERE)], hd: { text: `${AZT_SEVERE}; for serious or life-threatening infections, one-eighth of the initial dose after each hemodialysis session as well`, flag: D } },
  { value: 'ceftaroline', drug: 'ceftaroline', text: 'Ceftaroline (Teflaro)', bands: [gt(50, 'no dosage adjustment (600 mg every 12 hours)', NA), { from: 30, to: 50, fromExclusive: true, text: '400 mg every 12 hours', flag: D }, b(15, 30, '300 mg every 12 hours'), lt(15, '200 mg every 12 hours (end-stage renal disease, which the label defines as below 15 mL/min)')], hd: { text: '200 mg every 12 hours, given after hemodialysis on hemodialysis days', flag: D } },
  amox('amoxicillin', 'amoxicillin', 'Amoxicillin'),
  amox('amoxicillin-clavulanate', 'amoxClav', 'Amoxicillin-clavulanate'),
  { value: 'cephalexin', drug: 'cephalexin', text: 'Cephalexin', bands: [b(60, null, 'no dosage adjustment', NA), b(30, 59, 'no dosage adjustment; the maximum daily dose should not exceed 1 g'), b(15, 29, '250 mg every 8 hours or every 12 hours'), b(5, 14, '250 mg every 24 hours (not yet on dialysis)'), b(1, 4, '250 mg every 48 hours or every 60 hours (not yet on dialysis)')], hd: { text: 'there is insufficient information to make dose adjustment recommendations in patients on hemodialysis', flag: NG } },
  { value: 'colistimethate', drug: 'colistimethate', text: 'Colistimethate (Coly-Mycin M), as colistin base', bands: [b(80, null, '2.5 to 5 mg/kg per day of colistin base, divided into 2 to 4 doses', NA), b(50, 79, '2.5 to 3.8 mg/kg per day of colistin base, divided into 2 doses'), b(30, 49, '2.5 mg/kg per day of colistin base, once daily or divided into 2 doses'), b(10, 29, '1.5 mg/kg of colistin base every 36 hours')] },
  { value: 'fluconazole', drug: 'fluconazole', text: 'Fluconazole (Diflucan), multiple-dose therapy', bands: [gt(50, '100% of the recommended dose', NA), b(null, 50, '50% of the recommended dose, after a loading dose of 50 mg to 400 mg')], hd: { text: '100% of the recommended dose after each hemodialysis; on non-dialysis days, a reduced dose according to the creatinine clearance', flag: D } },
];
export { DIALYSIS };
const NOTE = 'This reports the row of the label\'s renal table for the values entered. It is not a recommendation, it covers adults only, and labels differ by manufacturer: check the one in hand and your stewardship guidance.';

function notesFor(reg, dialysis) {
  const notes = [];
  const d = reg.drug;
  if (d === 'cefepime' && dialysis === 'none') notes.push('The label gives the same initial dose as with a clearance above 60 mL/min; the table is the maintenance schedule.');
  if (d === 'vancomycin') {
    notes.push('The label says the table is not valid for functionally anephric patients: an initial dose of 15 mg/kg, then 1.9 mg/kg per 24 hours to maintain stable concentrations.');
    notes.push('Loading doses and AUC targets come from the 2020 vancomycin guideline, not the label: see Vancomycin Initial Dose.');
  }
  if (d === 'ciproIv') notes.push('Oral ciprofloxacin has its own label and its own rows.');
  if (d === 'ciproOral') notes.push('The label adds that in severe infections with severe renal impairment a unit dose of 750 mg may be given at the intervals noted, with careful monitoring.');
  if (d === 'meropenem') notes.push('The label says to use another formulation when less than a full 500 mg or 1 g dose is required.');
  if (d === 'tmpSmx' || d === 'cefazolin' || d === 'ampSulbactam' || d === 'colistimethate') notes.push(`The ${LABELS[d].brand} label's table has no dialysis line.`);
  if (d === 'cefazolin') notes.push('Reduced doses apply after an initial loading dose appropriate to the severity of the infection. The label also gives the bands by serum creatinine: 1.5 mg% or less, 1.6 to 3.0, 3.1 to 4.5, and 4.6 or greater.');
  if (d === 'ertapenem' || d === 'ampSulbactam' || d === 'aztreonam') notes.push(`The ${LABELS[d].brand} label states this clearance per 1.73 m² of body surface area.`);
  if (d === 'ceftazidime') notes.push('The label allows a 1 gram loading dose in suspected renal insufficiency, and says that when the usual dose is lower than the table\'s, the lower dose is used. For severe infections that would normally get 6 grams daily, the unit dose may be increased by 50% or the frequency increased.');
  if (d === 'imipenem') notes.push('The label notes an increased risk of seizures at clearances below 30 to 15 mL/min.');
  if (d === 'amoxicillin' || d === 'amoxClav') notes.push('Below a glomerular filtration rate of 30 mL/min the label says the 875 mg dose should not be given.');
  if (d === 'colistimethate') notes.push('Doses are colistin base activity, on ideal body weight in obesity. The label gives no row below 10 mL/min.');
  if (d === 'fluconazole') notes.push('Single-dose therapy for vaginal candidiasis needs no adjustment.');
  if (d === 'daptomycin') notes.push('The label gives no dose for pediatric patients with renal impairment.');
  return notes;
}

export function abxRenal(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}

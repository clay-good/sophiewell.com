// spec-v1632 tool 4: antiviral dose by kidney function, read from each label's renal table.
//
// Eight label rows (spec-v1628 section 1), each re-read on October 11, 2026; the bands and row text
// below are each label's own (lib/label-dose.js explains how edges and gaps are handled):
//   Acyclovir sodium injection (Eugia, DailyMed version 7), Table 5, CrCl in mL/min/1.73 m2.
//   Valtrex (valacyclovir; GlaxoSmithKline, version 32), section 2.4, Table 1.
//   Famciclovir tablets (Teva, version 19), Table 1.
//   Ganciclovir for injection (Fresenius Kabi, version 8), Table 1.
//   Valcyte (valganciclovir; version 24), section 2.5, Table 2.
//   Tamiflu (oseltamivir; version 45), sections 2.2 to 2.4, Table 2.
//   Paxlovid (nirmatrelvir and ritonavir; Pfizer, version 12), sections 2.2 and 2.3, Table 1 (eGFR).
//   Veklury (remdesivir; version 24): "No dosage adjustment of VEKLURY is recommended in patients
//     with any degree of renal impairment, including patients on dialysis."
//
// The tool reports the label's row. It computes no dose in milligrams from a weight, never falls back
// to a nearest band, and recommends nothing. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { findBands, describeBands, worstFlag } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D, extra = {}) => ({ from, to, text, flag, ...extra });
const gt = (from, to, text, flag = D) => ({ from, to, fromExclusive: true, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
// Valtrex Table 1: columns >= 50, 30-49, 10-29, < 10.
const valtrex = (a, c30, c10, c0) => [b(50, null, a), b(30, 49, c30, c30.startsWith('no reduction') ? NA : D), b(10, 29, c10), lt(10, c0)];
// Famciclovir Table 1: >= 60, 40-59, 20-39, < 20; or >= 40, 20-39, < 20.
const fam4 = (a, c40, c20, c0) => [b(60, null, a), b(40, 59, c40), b(20, 39, c20), lt(20, c0)];
const fam3 = (a, c20, c0) => [b(40, null, a), b(20, 39, c20), lt(20, c0)];

export const LABELS = {
  acyclovir: { brand: 'acyclovir injection', setId: 'ae921e4e-b8ae-4a45-acc1-32e5e719812b', unit: 'mL/min/1.73 m²', measure: 'creatinine clearance' },
  valacyclovir: { brand: 'Valtrex', setId: 'f8e0d8f8-cb73-4206-a484-88f5c4fbd719', unit: 'mL/min', measure: 'creatinine clearance' },
  famciclovir: { brand: 'famciclovir', setId: '3f02042f-8f51-4ccf-b608-5dcd75d100fb', unit: 'mL/min', measure: 'creatinine clearance' },
  ganciclovir: { brand: 'ganciclovir injection', setId: 'b47f5d1c-36b8-49b6-a410-3b3f4661dde7', unit: 'mL/min', measure: 'creatinine clearance' },
  valganciclovir: { brand: 'Valcyte', setId: '4c517a39-2ded-4c5a-8d56-276853414b31', unit: 'mL/min', measure: 'creatinine clearance' },
  oseltamivir: { brand: 'Tamiflu', setId: 'ee3c9555-60f2-4f82-a760-11983c86e97b', unit: 'mL/min', measure: 'creatinine clearance' },
  nirmatrelvir: { brand: 'Paxlovid', setId: '8a99d6d6-fd9e-45bb-b1bf-48c7f761232a', unit: 'mL/min', measure: 'eGFR' },
  remdesivir: { brand: 'Veklury', setId: 'c0978fa8-53ff-4ca2-82a7-567fd3e958ca', unit: 'mL/min', measure: 'kidney function' },
};

const ACY_HD = { text: 'The label says to adjust the schedule so that an additional dose is given after each hemodialysis.', flag: D };
const ACY_PD = { text: 'The label says no supplemental dose appears to be necessary after the dosing interval is adjusted.', flag: NA };
const VAL_HD = { text: 'The label says patients on hemodialysis should receive the recommended dose after hemodialysis.', flag: D };
const VAL_PD = { text: 'The label says supplemental doses should not be required after CAPD or CAVHD; it has no information specific to peritoneal dialysis.', flag: NA };
const hdRow = (text) => ({ text, flag: D });
const GAN_NOTE = 'The label says induction on hemodialysis should not exceed 1.25 mg/kg 3 times per week, given shortly after the session.';
const TAM_ESRD = 'For end-stage renal disease not on dialysis the label says Tamiflu is not recommended.';

// One entry per drug and indication. `bands` is the label's table; `hd` and `pd` are its dialysis lines.
export const REGIMENS = [
  { value: 'acyclovir-iv', drug: 'acyclovir', text: 'Acyclovir IV (any indication; percent of the usual dose)', bands: [gt(50, null, '100% of the recommended dose every 8 hours'), b(25, 50, '100% of the recommended dose every 12 hours'), b(10, 25, '100% of the recommended dose every 24 hours'), b(0, 10, '50% of the recommended dose every 24 hours')], hd: ACY_HD, pd: ACY_PD },
  { value: 'valacyclovir-cold-sores', drug: 'valacyclovir', text: 'Valacyclovir: cold sores', bands: valtrex('two 2 g doses 12 hours apart', 'two 1 g doses 12 hours apart', 'two 500 mg doses 12 hours apart', 'a single 500 mg dose'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-genital-initial', drug: 'valacyclovir', text: 'Valacyclovir: genital herpes, initial episode', bands: valtrex('1 g every 12 hours', 'no reduction (1 g every 12 hours)', '1 g every 24 hours', '500 mg every 24 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-genital-recurrent', drug: 'valacyclovir', text: 'Valacyclovir: genital herpes, recurrent episode', bands: valtrex('500 mg every 12 hours', 'no reduction (500 mg every 12 hours)', '500 mg every 24 hours', '500 mg every 24 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-suppression', drug: 'valacyclovir', text: 'Valacyclovir: genital herpes suppression, immunocompetent', bands: valtrex('1 g every 24 hours', 'no reduction (1 g every 24 hours)', '500 mg every 24 hours', '500 mg every 24 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-suppression-alternate', drug: 'valacyclovir', text: 'Valacyclovir: suppression, alternate dose (9 or fewer recurrences a year)', bands: valtrex('500 mg every 24 hours', 'no reduction (500 mg every 24 hours)', '500 mg every 48 hours', '500 mg every 48 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-suppression-hiv', drug: 'valacyclovir', text: 'Valacyclovir: genital herpes suppression, HIV-1 infection', bands: valtrex('500 mg every 12 hours', 'no reduction (500 mg every 12 hours)', '500 mg every 24 hours', '500 mg every 24 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'valacyclovir-zoster', drug: 'valacyclovir', text: 'Valacyclovir: herpes zoster', bands: valtrex('1 g every 8 hours', '1 g every 12 hours', '1 g every 24 hours', '500 mg every 24 hours'), hd: VAL_HD, pd: VAL_PD },
  { value: 'famciclovir-genital-recurrent', drug: 'famciclovir', text: 'Famciclovir: recurrent genital herpes', bands: fam4('1,000 mg every 12 hours for 1 day', '500 mg every 12 hours for 1 day', '500 mg as a single dose', '250 mg as a single dose'), hd: hdRow('250 mg as a single dose following dialysis') },
  { value: 'famciclovir-labialis', drug: 'famciclovir', text: 'Famciclovir: recurrent herpes labialis', bands: fam4('1,500 mg as a single dose', '750 mg as a single dose', '500 mg as a single dose', '250 mg as a single dose'), hd: hdRow('250 mg as a single dose following dialysis') },
  { value: 'famciclovir-zoster', drug: 'famciclovir', text: 'Famciclovir: herpes zoster', bands: fam4('500 mg every 8 hours', '500 mg every 12 hours', '500 mg every 24 hours', '250 mg every 24 hours'), hd: hdRow('250 mg following each dialysis') },
  { value: 'famciclovir-suppression', drug: 'famciclovir', text: 'Famciclovir: suppression of recurrent genital herpes', bands: fam3('250 mg every 12 hours', '125 mg every 12 hours', '125 mg every 24 hours'), hd: hdRow('125 mg following each dialysis') },
  { value: 'famciclovir-hiv', drug: 'famciclovir', text: 'Famciclovir: recurrent orolabial or genital herpes in HIV infection', bands: fam3('500 mg every 12 hours', '500 mg every 24 hours', '250 mg every 24 hours'), hd: hdRow('250 mg following each dialysis') },
  { value: 'ganciclovir-induction', drug: 'ganciclovir', text: 'Ganciclovir IV: induction', bands: [b(70, null, '5 mg/kg every 12 hours'), b(50, 69, '2.5 mg/kg every 12 hours'), b(25, 49, '2.5 mg/kg every 24 hours'), b(10, 24, '1.25 mg/kg every 24 hours'), lt(10, '1.25 mg/kg 3 times per week, following hemodialysis')], hd: hdRow('1.25 mg/kg 3 times per week, following hemodialysis'), note: GAN_NOTE },
  { value: 'ganciclovir-maintenance', drug: 'ganciclovir', text: 'Ganciclovir IV: maintenance', bands: [b(70, null, '5 mg/kg every 24 hours'), b(50, 69, '2.5 mg/kg every 24 hours'), b(25, 49, '1.25 mg/kg every 24 hours'), b(10, 24, '0.625 mg/kg every 24 hours'), lt(10, '0.625 mg/kg 3 times per week, following hemodialysis')], hd: hdRow('0.625 mg/kg 3 times per week, following hemodialysis') },
  { value: 'valganciclovir-induction', drug: 'valganciclovir', text: 'Valganciclovir: induction', bands: [b(60, null, '900 mg twice daily'), b(40, 59, '450 mg twice daily'), b(25, 39, '450 mg once daily'), b(10, 24, '450 mg every 2 days'), lt(10, 'not recommended (the table\'s row is for patients on hemodialysis)', NR)], hd: { text: 'Not recommended: the label says a dose recommendation cannot be given for adults on hemodialysis.', flag: NR } },
  { value: 'valganciclovir-maintenance', drug: 'valganciclovir', text: 'Valganciclovir: maintenance or prevention', bands: [b(60, null, '900 mg once daily'), b(40, 59, '450 mg once daily'), b(25, 39, '450 mg every 2 days'), b(10, 24, '450 mg twice weekly'), lt(10, 'not recommended (the table\'s row is for patients on hemodialysis)', NR)], hd: { text: 'Not recommended: the label says a dose recommendation cannot be given for adults on hemodialysis.', flag: NR } },
  { value: 'oseltamivir-treatment', drug: 'oseltamivir', text: 'Oseltamivir: treatment of influenza', bands: [gt(90, null, '75 mg twice daily for 5 days (the usual adult dose; the renal table starts at 90 mL/min)'), gt(60, 90, '75 mg twice daily for 5 days'), gt(30, 60, '30 mg twice daily for 5 days'), gt(10, 30, '30 mg once daily for 5 days'), b(null, 10, `the table's rows at 10 mL/min or below are for patients on dialysis. ${TAM_ESRD}`, NR)], hd: hdRow('30 mg immediately, then 30 mg after every hemodialysis cycle; treatment not to exceed 5 days'), pd: hdRow('a single 30 mg dose given immediately (CAPD)') },
  { value: 'oseltamivir-prophylaxis', drug: 'oseltamivir', text: 'Oseltamivir: prophylaxis of influenza', bands: [gt(90, null, '75 mg once daily (the usual adult dose; the renal table starts at 90 mL/min)'), gt(60, 90, '75 mg once daily'), gt(30, 60, '30 mg once daily'), gt(10, 30, '30 mg every other day'), b(null, 10, `the table's rows at 10 mL/min or below are for patients on dialysis. ${TAM_ESRD}`, NR)], hd: hdRow('30 mg immediately, then 30 mg after alternate hemodialysis cycles'), pd: hdRow('30 mg immediately, then 30 mg once weekly (CAPD)') },
  { value: 'nirmatrelvir-ritonavir', drug: 'nirmatrelvir', text: 'Nirmatrelvir with ritonavir (Paxlovid; by eGFR)', bands: [b(90, null, '300 mg nirmatrelvir with 100 mg ritonavir twice daily for 5 days (the usual dose)'), { from: 60, to: 90, toExclusive: true, text: 'no dosage adjustment (300 mg nirmatrelvir with 100 mg ritonavir twice daily for 5 days)', flag: NA }, { from: 30, to: 60, toExclusive: true, text: '150 mg nirmatrelvir with 100 mg ritonavir twice daily for 5 days', flag: D }, lt(30, '300 mg nirmatrelvir with 100 mg ritonavir once on day 1, then 150 mg nirmatrelvir with 100 mg ritonavir once daily on days 2 to 5')], hd: hdRow('300 mg nirmatrelvir with 100 mg ritonavir once on day 1, then 150 mg with 100 mg once daily on days 2 to 5, given after hemodialysis on dialysis days') },
  { value: 'remdesivir', drug: 'remdesivir', text: 'Remdesivir (Veklury)', bands: [b(null, null, 'no dosage adjustment at any degree of renal impairment', NA)], hd: { text: 'No dosage adjustment, including patients on dialysis; it may be given without regard to the timing of dialysis.', flag: NA }, pd: { text: 'No dosage adjustment, including patients on dialysis; it may be given without regard to the timing of dialysis.', flag: NA } },
];
export const DIALYSIS = [
  { value: 'none', text: 'Not on dialysis' },
  { value: 'hd', text: 'Hemodialysis' },
  { value: 'pd', text: 'Peritoneal dialysis' },
];
const NOTE = 'This reports the row of the label\'s renal table for the values entered. It is not a recommendation, it covers adults only, and where a label doses per kilogram it does not work out the milligrams.';
const SHORT = { dose: 'Dose given', 'no-adjustment': 'No adjustment', 'not-recommended': 'Not recommended', contraindicated: 'Contraindicated', 'no-recommendation-given': 'No row given' };

export function antiviralRenalDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the drug and indication. Each label gives its own table.' };
  const L = LABELS[reg.drug];
  const dialysis = String(o.dialysis ?? '').trim();
  if (!DIALYSIS.some((d) => d.value === dialysis)) return { valid: false, message: 'Say whether the patient is on dialysis: every one of these labels has its own line for it.' };
  let value = null;
  if (dialysis === 'none' && reg.drug !== 'remdesivir') {
    const f = inputFault([[`the ${L.measure}`, o.kidney, 0, 250, L.unit]]);
    if (f) return { valid: false, message: `${f} The ${L.brand} label's table is by ${L.measure} in ${L.unit}.` };
    value = Number(o.kidney);
  }
  const row = labelRow(L.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, regimen: reg.value, band: `The ${L.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  }
  const notes = [];
  let rows; let band;
  if (dialysis !== 'none') {
    const line = dialysis === 'hd' ? reg.hd : reg.pd;
    if (!line) {
      return { valid: true, regimen: reg.value, flag: NG, abnormal: true, band: `The ${L.brand} label's table has no line for peritoneal dialysis.`, bandLabel: SHORT[NG], notes: [`Its hemodialysis line reads: ${reg.hd.text}.`, `Label: ${row.edition}.`], note: NOTE };
    }
    rows = [line];
    band = `The ${L.brand} label, for ${dialysis === 'hd' ? 'hemodialysis' : 'peritoneal dialysis'}: ${line.text.replace(/\.$/, '')}.`;
    if (reg.drug === 'acyclovir' || reg.drug === 'valacyclovir') notes.push('The dialysis line adds to the label\'s table by clearance; it does not replace it.');
  } else if (reg.drug === 'remdesivir') {
    rows = reg.bands;
    band = 'The Veklury label gives no dosage adjustment at any degree of renal impairment, including patients on dialysis.';
  } else {
    const found = findBands(reg.bands, value);
    rows = found.rows;
    notes.push(describeBands(found, value, L.unit, `the ${L.brand} label's table`));
    if (found.outside) return { valid: true, regimen: reg.value, flag: NG, abnormal: true, band: `The ${L.brand} label's table gives no row for a ${L.measure} of ${value} ${L.unit}.`, bandLabel: SHORT[NG], notes: [...notes, `Label: ${row.edition}.`], note: NOTE };
    const plain = rows[0].flag === 'dose' || rows[0].flag === 'no-adjustment';
    band = rows.length > 1
      ? `The ${L.brand} label gives two rows here: ${rows.map((r) => r.text.replace(/\.$/, '')).join('; or ')}.`
      : plain ? `The ${L.brand} label gives ${rows[0].text.replace(/\.$/, '')}.`
        : `The ${L.brand} label's row here reads: ${rows[0].text.replace(/\.$/, '')}.`;
  }
  if (reg.note && dialysis === 'hd') notes.push(reg.note);
  if (reg.drug === 'acyclovir') notes.push('The acyclovir label states its bands in mL/min/1.73 m² and doses obese patients on ideal body weight.');
  if (reg.drug === 'nirmatrelvir') notes.push('The Paxlovid label\'s table is by eGFR, not creatinine clearance.');
  const flag = worstFlag(rows);
  return {
    valid: true, regimen: reg.value, drug: reg.drug, flag, rows: rows.map((r) => r.text), abnormal: flag !== 'dose' && flag !== 'no-adjustment',
    band, bandLabel: SHORT[flag],
    notes: [...notes, `Label: ${row.edition}.`], note: NOTE,
  };
}

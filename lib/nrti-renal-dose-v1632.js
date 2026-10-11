// spec-v1632 tool 5: tenofovir DF, emtricitabine/tenofovir DF, entecavir and lamivudine by creatinine
// clearance, read from each label's renal table through lib/label-dose.js.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Viread (tenofovir disoproxil fumarate; Gilead, DailyMed version 31), section 2.4, Table 3, with
//     the creatinine clearance "Calculated using ideal (lean) body weight": 50 or greater, every 24
//     hours; 30-49, every 48 hours; 10-29, every 72 to 96 hours; hemodialysis, "Every 7 days or after
//     a total of approximately 12 hours of dialysis"; "No data are available to make dosage
//     recommendations in patients with creatinine clearance below 10 mL/min who are not on
//     hemodialysis."
//   Truvada (emtricitabine/tenofovir DF; Gilead, version 32), sections 2.5 and 2.6, Table 2 (ideal
//     body weight): >=50 every 24 hours; 30-49 every 48 hours; "<30 (Including Patients Requiring
//     Hemodialysis)", not recommended. PrEP: "not recommended in HIV-1 uninfected individuals with
//     estimated creatinine clearance below 60 mL/min".
//   Baraclude (entecavir; E.R. Squibb, version 42), Table 2, usual and lamivudine-refractory columns.
//   Epivir (lamivudine; ViiV, version 24), section 2.3, Table 2; "No additional dosing of EPIVIR is
//     required after routine (4-hour) hemodialysis or peritoneal dialysis."
//
// Tenofovir alafenamide products were not read and are not here. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D) => ({ from, to, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const half = (from, to, text) => ({ from, to, toExclusive: true, text, flag: D });
const CRCL = { unit: 'mL/min', measure: 'creatinine clearance' };

export const LABELS = {
  tenofovir: { brand: 'Viread', setId: '33fd6418-fbdc-42ca-a50d-ce2a476a5418', ...CRCL },
  truvada: { brand: 'Truvada', setId: '54e82b13-a037-49ed-b4b3-030b37c0ecdd', ...CRCL },
  entecavir: { brand: 'Baraclude', setId: '046e61c9-9298-4b2e-b76e-b26b81fecd20', ...CRCL },
  lamivudine: { brand: 'Epivir', setId: '89226149-47fa-4f7d-bb1f-1aa7034486b8', ...CRCL },
};
const TRUVADA_NR = { text: 'Truvada is not recommended (the table\'s row below 30 mL/min includes patients requiring hemodialysis)', flag: NR };
const ETV_USUAL = '0.05 mg once daily (as the oral solution) or 0.5 mg every 7 days';
const ETV_REFRACTORY = '0.1 mg once daily (as the oral solution) or 1 mg every 7 days';
const etvDialysis = (text) => ({ text: `${text}; on a hemodialysis day, after the session`, flag: D });
const LAM_DIALYSIS = { text: 'no additional dose is required after routine (4-hour) hemodialysis or peritoneal dialysis; the dose itself follows the label\'s table by clearance', flag: NA };

export const REGIMENS = [
  { value: 'tenofovir-df', drug: 'tenofovir', text: 'Tenofovir DF 300 mg (Viread)', bands: [b(50, null, '300 mg every 24 hours'), b(30, 49, '300 mg every 48 hours'), b(10, 29, '300 mg every 72 to 96 hours'), lt(10, 'no data are available to make dosage recommendations below 10 mL/min for patients not on hemodialysis', NG)], hd: { text: '300 mg every 7 days or after a total of approximately 12 hours of dialysis, given after dialysis is complete', flag: D } },
  { value: 'truvada-treatment', drug: 'truvada', text: 'Emtricitabine/tenofovir DF (Truvada): HIV-1 treatment', bands: [b(50, null, 'one tablet every 24 hours'), b(30, 49, 'one tablet every 48 hours'), lt(30, TRUVADA_NR.text, NR)], hd: TRUVADA_NR },
  { value: 'truvada-prep', drug: 'truvada', text: 'Emtricitabine/tenofovir DF (Truvada): HIV-1 PrEP', bands: [b(60, null, 'one tablet once daily (the label\'s PrEP dose; it gives no reduced dose)'), lt(60, 'Truvada for PrEP is not recommended below an estimated creatinine clearance of 60 mL/min', NR)], hd: { text: 'Truvada for PrEP is not recommended below an estimated creatinine clearance of 60 mL/min', flag: NR }, pd: { text: 'Truvada for PrEP is not recommended below an estimated creatinine clearance of 60 mL/min', flag: NR } },
  { value: 'entecavir-usual', drug: 'entecavir', text: 'Entecavir (Baraclude): usual dose, 0.5 mg', bands: [b(50, null, '0.5 mg once daily'), half(30, 50, '0.25 mg once daily (as the oral solution) or 0.5 mg every 48 hours'), half(10, 30, '0.15 mg once daily (as the oral solution) or 0.5 mg every 72 hours'), lt(10, ETV_USUAL)], hd: etvDialysis(ETV_USUAL), pd: { text: ETV_USUAL, flag: D } },
  { value: 'entecavir-refractory', drug: 'entecavir', text: 'Entecavir (Baraclude): lamivudine-refractory or decompensated liver disease, 1 mg', bands: [b(50, null, '1 mg once daily'), half(30, 50, '0.5 mg once daily or 1 mg every 48 hours'), half(10, 30, '0.3 mg once daily (as the oral solution) or 1 mg every 72 hours'), lt(10, ETV_REFRACTORY)], hd: etvDialysis(ETV_REFRACTORY), pd: { text: ETV_REFRACTORY, flag: D } },
  { value: 'lamivudine', drug: 'lamivudine', text: 'Lamivudine (Epivir)', bands: [b(50, null, '150 mg twice daily or 300 mg once daily'), b(30, 49, '150 mg once daily'), b(15, 29, '150 mg for the first dose, then 100 mg once daily'), b(5, 14, '150 mg for the first dose, then 50 mg once daily'), lt(5, '50 mg for the first dose, then 25 mg once daily')], hd: LAM_DIALYSIS, pd: LAM_DIALYSIS },
];
export { DIALYSIS };
const NOTE = 'This reports the row of the label\'s renal table for the values entered. It is not a recommendation and it covers adults only. Tenofovir alafenamide products are not included.';

function notesFor(reg, dialysis) {
  const notes = [];
  if (reg.drug === 'tenofovir' || reg.drug === 'truvada') notes.push(`The ${LABELS[reg.drug].brand} label says to calculate the creatinine clearance with ideal (lean) body weight.`);
  if (reg.value === 'truvada-treatment' && dialysis === 'none') notes.push('The label says the 48-hour interval at 30 to 49 mL/min has not been clinically evaluated, and to monitor response and renal function closely.');
  if (reg.drug === 'entecavir') notes.push('The Baraclude label recommends the oral solution for doses below 0.5 mg.');
  return notes;
}

export function nrtiRenalDose(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}

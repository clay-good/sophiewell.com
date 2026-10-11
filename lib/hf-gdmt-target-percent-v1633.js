// spec-v1633 tool 23: percent of the guideline target dose in heart failure with reduced ejection
// fraction.
//
// Source: Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the Management
// of Heart Failure. Circulation 2022;145:e895-e1032 (doi 10.1161/CIR.0000000000001063), Table 14,
// "Drugs Commonly Used for HFrEF (Stage C HF)". Re-read on October 11, 2026 in the copublished
// J Am Coll Cardiol text (doi 10.1016/j.jacc.2021.12.012). Currency, checked the same day: PubMed
// lists three errata to the guideline and no later guideline or focused update that replaces it.
// The target doses are facts cited with attribution; the table's layout and footnotes are not
// reproduced.
//
//   percent of target = total daily dose / target total daily dose x 100
//
// Where the table prints a target range the percent is given against both ends; the tool does not
// pick one. Digoxin has no dose target in the table (a serum concentration) and is not scored. The
// tool does not judge why a dose is below target.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// target: total mg a day, [low, high] where the table prints a range. said: the table's own words.
// achieved: the table's "mean doses achieved in clinical trials" column, where it has a number.
export const DRUGS = [
  { arg: 'captopril', dom: 'captopril', text: 'Captopril', target: [150, 150], said: '50 mg 3 times daily', achieved: '122.7 mg total daily' },
  { arg: 'enalapril', dom: 'enalapril', text: 'Enalapril', target: [20, 40], said: '10 to 20 mg twice daily', achieved: '16.6 mg total daily' },
  { arg: 'fosinopril', dom: 'fosinopril', text: 'Fosinopril', target: [40, 40], said: '40 mg once daily' },
  { arg: 'lisinopril', dom: 'lisinopril', text: 'Lisinopril', target: [20, 40], said: '20 to 40 mg once daily', achieved: '32.5 to 35.0 mg total daily' },
  { arg: 'perindopril', dom: 'perindopril', text: 'Perindopril', target: [8, 16], said: '8 to 16 mg once daily' },
  { arg: 'quinapril', dom: 'quinapril', text: 'Quinapril', target: [40, 40], said: '20 mg twice daily' },
  { arg: 'ramipril', dom: 'ramipril', text: 'Ramipril', target: [10, 10], said: '10 mg once daily' },
  { arg: 'trandolapril', dom: 'trandolapril', text: 'Trandolapril', target: [4, 4], said: '4 mg once daily' },
  { arg: 'candesartan', dom: 'candesartan', text: 'Candesartan', target: [32, 32], said: '32 mg once daily', achieved: '24 mg total daily' },
  { arg: 'losartan', dom: 'losartan', text: 'Losartan', target: [50, 150], said: '50 to 150 mg once daily', achieved: '129 mg total daily' },
  { arg: 'valsartan', dom: 'valsartan', text: 'Valsartan', target: [320, 320], said: '160 mg twice daily', achieved: '254 mg total daily' },
  { arg: 'sacubitrilValsartan', dom: 'sacubitril-valsartan', text: 'Sacubitril-valsartan', entered: 'both components added (49/51 mg twice daily is 200)', target: [400, 400], said: '97 mg sacubitril and 103 mg valsartan twice daily', achieved: '182 mg sacubitril and 193 mg valsartan total daily' },
  { arg: 'bisoprolol', dom: 'bisoprolol', text: 'Bisoprolol', target: [10, 10], said: '10 mg once daily', achieved: '8.6 mg total daily' },
  { arg: 'carvedilol', dom: 'carvedilol', text: 'Carvedilol', target: [50, 100], said: '25 to 50 mg twice daily', achieved: '37 mg total daily' },
  { arg: 'carvedilolCr', dom: 'carvedilol-cr', text: 'Carvedilol CR', target: [80, 80], said: '80 mg once daily' },
  { arg: 'metoprololSuccinate', dom: 'metoprolol-succinate', text: 'Metoprolol succinate extended release', target: [200, 200], said: '200 mg once daily', achieved: '159 mg total daily' },
  { arg: 'spironolactone', dom: 'spironolactone', text: 'Spironolactone', target: [25, 50], said: '25 to 50 mg once daily', achieved: '26 mg total daily' },
  { arg: 'eplerenone', dom: 'eplerenone', text: 'Eplerenone', target: [50, 50], said: '50 mg once daily', achieved: '42.6 mg total daily' },
  { arg: 'dapagliflozin', dom: 'dapagliflozin', text: 'Dapagliflozin', target: [10, 10], said: '10 mg once daily', achieved: '9.8 mg total daily' },
  { arg: 'empagliflozin', dom: 'empagliflozin', text: 'Empagliflozin', target: [10, 10], said: '10 mg once daily' },
  { arg: 'isdnHydralazineFixed', dom: 'isdn-hydralazine-fixed', text: 'Isosorbide dinitrate/hydralazine fixed-dose combination', entered: 'the isosorbide dinitrate component (20 mg/37.5 mg 3 times daily is 60)', target: [120, 120], said: '40 mg isosorbide dinitrate and 75 mg hydralazine 3 times daily', achieved: '90 mg isosorbide dinitrate and about 175 mg hydralazine total daily' },
  { arg: 'isosorbideDinitrate', dom: 'isosorbide-dinitrate', text: 'Isosorbide dinitrate, given with separate hydralazine', target: [120, 120], said: '120 mg total daily in divided doses' },
  { arg: 'hydralazine', dom: 'hydralazine', text: 'Hydralazine, given with separate isosorbide dinitrate', target: [300, 300], said: '300 mg total daily in divided doses' },
  { arg: 'ivabradine', dom: 'ivabradine', text: 'Ivabradine', target: [15, 15], said: '7.5 mg twice daily', achieved: '12.8 mg total daily' },
  { arg: 'vericiguat', dom: 'vericiguat', text: 'Vericiguat', target: [10, 10], said: '10 mg once daily', achieved: '9.2 mg total daily' },
];
export const REVIEWED = '2026-10-11';
const NOTE = 'A comparison with the 2022 AHA/ACC/HFSA guideline table, read October 11, 2026. It does not say what dose a patient should take or why a dose is below target (blood pressure, heart rate, potassium and kidney function all limit it). Digoxin has no dose target in the table and is not scored.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const pct = (x) => `${(Math.round(x * 10) / 10).toLocaleString('en-US')}%`;
const mg = (x) => Number(x).toLocaleString('en-US');

export function hfGdmtTargetPercent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const given = DRUGS.filter((d) => !blank(o[d.arg]));
  if (!given.length) return { valid: false, message: 'Enter the total daily dose of at least one drug in the table.' };
  // Ten times the top target is far outside any dose; it catches a slipped decimal point or micrograms.
  const f = inputFault(given.map((d) => [`the total daily dose of ${d.text.toLowerCase()}`, o[d.arg], null, d.target[1] * 10, 'mg']));
  if (f) return { valid: false, message: f };
  const drugs = given.map((d) => {
    const dose = Number(o[d.arg]); const [lo, hi] = d.target;
    return { drug: d.text, dose, said: d.said, achieved: d.achieved, targetLow: lo, targetHigh: hi, percentOfLow: Math.round((dose / lo) * 1000) / 10, percentOfHigh: Math.round((dose / hi) * 1000) / 10 };
  });
  const notes = drugs.map((r) => {
    const what = r.targetLow === r.targetHigh
      ? `${pct(r.percentOfLow)} of the target, ${mg(r.targetLow)} mg a day (${r.said})`
      : `${pct(r.percentOfLow)} of ${mg(r.targetLow)} mg a day and ${pct(r.percentOfHigh)} of ${mg(r.targetHigh)} mg a day; the table prints the target as a range (${r.said}) and both ends are shown`;
    const above = r.dose > r.targetHigh ? ' This is above the table\'s target dose.' : '';
    return `${r.drug} ${mg(r.dose)} mg a day: ${what}.${above}${r.achieved ? ` Mean dose achieved in the trials: ${r.achieved}.` : ''}`;
  });
  const one = drugs.length === 1 ? drugs[0] : null;
  const label = one ? (one.targetLow === one.targetHigh ? `${pct(one.percentOfLow)} of target` : `${pct(one.percentOfHigh)} to ${pct(one.percentOfLow)} of target`) : `${drugs.length} drugs compared`;
  return {
    valid: true, flag: 'gdmt', abnormal: false, drugs, reviewed: REVIEWED,
    band: one ? `${one.drug}: ${label} dose in the guideline table.` : `${drugs.length} drugs compared with the target doses in the guideline table.`,
    bandLabel: label,
    notes: [...notes, '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure, Table 14.'], note: NOTE,
  };
}

// spec-v1636 tool 21: adjusted patient days, and pharmacy cost or hours per adjusted day.
//
// Source: HUD Handbook 4615.1 REV-1, Appendix 1, "Adjusted Patient Days Calculation", the worksheet
// "Patient Days Adjusted for Outpatient Workload" (hud.gov/sites/documents/46151x1hsgh.pdf), re-read
// October 12, 2026:
//   Line 1 gross inpatient revenues; line 2 gross outpatient revenues; line 3 total gross patient
//   revenues (1 + 2); line 4 inpatient days; line 5 revenue per inpatient day (line 1 / line 4);
//   line 6 adjusted outpatient days (line 2 / line 5); line 7 adjusted patient days (line 4 + line
//   6). "Be careful to exclude non-patient revenues."
// Line 7 equals inpatient days / (inpatient revenue / total patient revenue), the construction two
// state laws use (Virginia 12VAC5-215-10; Florida Statutes 409.911(1)(a)).
//
// HUD publishes the worksheet for one purpose, the acute-care eligibility test for FHA Section 242
// mortgage insurance, and splits each line into eligible and ineligible services. Here its
// arithmetic is applied to the hospital's totals, and the result says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'The federal worksheet\'s arithmetic on the totals entered. Adjusted patient days is a revenue-based estimate of total workload, not a count of patients; ratios built on it compare one hospital with itself over time better than one hospital with another.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');

export function adjustedPatientDays(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the inpatient days', o.inpatientDays, null, 100000000, ''], ['the gross inpatient revenue', o.inpatientRevenue, null, 1e13, ''], ['the gross outpatient revenue', o.outpatientRevenue, 0, 1e13, '']]);
  if (f) return { valid: false, message: f };
  const opt = {};
  for (const [key, label] of [['workedHours', 'the pharmacy worked hours'], ['drugExpense', 'the drug expense']]) {
    if (blank(o[key])) { opt[key] = null; continue; }
    const of = inputFault([[label, o[key], 0, 1e13, '']]);
    if (of) return { valid: false, message: of };
    opt[key] = Number(o[key]);
  }
  const days = Number(o.inpatientDays); const inRev = Number(o.inpatientRevenue); const outRev = Number(o.outpatientRevenue);
  const perDay = inRev / days;
  const outDays = outRev / perDay;
  const adjusted = days + outDays;
  const share = outRev / (inRev + outRev) * 100;
  const notes = [
    `Line 5, revenue per inpatient day: $${n0(inRev)} ÷ ${n0(days)} = $${n2(perDay)}.`,
    `Line 6, adjusted outpatient days: $${n0(outRev)} ÷ $${n2(perDay)} = ${n1(outDays)}.`,
    `Line 7, adjusted patient days: ${n0(days)} + ${n1(outDays)} = ${n1(adjusted)}.`,
    `Outpatient share of gross patient revenue: ${n1(share)}%. The same answer comes from inpatient days ÷ the inpatient share of revenue: ${n0(days)} ÷ ${n1(100 - share)}%.`,
  ];
  if (opt.workedHours !== null) notes.push(`Pharmacy worked hours per adjusted patient day: ${n0(opt.workedHours)} ÷ ${n1(adjusted)} = ${(opt.workedHours / adjusted).toFixed(3)}.`);
  if (opt.drugExpense !== null) notes.push(`Drug expense per adjusted patient day: $${n0(opt.drugExpense)} ÷ ${n1(adjusted)} = $${n2(opt.drugExpense / adjusted)}.`);
  if (opt.workedHours === null && opt.drugExpense === null) notes.push('Pharmacy worked hours and drug expense were not entered, so no per-day ratio is shown.');
  notes.push('Use gross patient revenues and leave out non-patient revenues, as the worksheet says. HUD publishes it for the Section 242 eligibility test and splits each line into eligible and ineligible services; this applies the same arithmetic to the hospital\'s totals.');
  return {
    valid: true, flag: 'adjusted-days', abnormal: false, revenuePerInpatientDay: Number(perDay.toFixed(2)), adjustedOutpatientDays: Number(outDays.toFixed(1)), adjustedPatientDays: Number(adjusted.toFixed(1)), outpatientSharePercent: Number(share.toFixed(1)),
    hoursPerAdjustedDay: opt.workedHours === null ? null : Number((opt.workedHours / adjusted).toFixed(3)), drugCostPerAdjustedDay: opt.drugExpense === null ? null : Number((opt.drugExpense / adjusted).toFixed(2)),
    band: `${n1(adjusted)} adjusted patient days: ${n0(days)} inpatient days plus ${n1(outDays)} for outpatient workload (${n1(share)}% of gross patient revenue).${opt.drugExpense !== null ? ` Drug expense $${n2(opt.drugExpense / adjusted)} per adjusted day.` : ''}${opt.workedHours !== null ? ` Pharmacy worked hours ${(opt.workedHours / adjusted).toFixed(3)} per adjusted day.` : ''}`,
    bandLabel: `${n1(adjusted)} adjusted patient days`, notes, note: NOTE,
  };
}

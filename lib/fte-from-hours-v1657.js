// spec-v1657 tool 6: full-time equivalents from hours.
//
// Two ways:
//   Period: FTE = hours in the period ÷ (weeks in the period × hours per FTE per week). The hours per
//     week is the reader's own full-time standard; 40 is the common one, offered, not sourced.
//   Cost report: CMS, Hospital Provider Cost Report Data Dictionary, "FTE - Employees on Payroll"
//     (Worksheet S-3 Part I, line 14, column 10), read October 19, 2026: "When quarterly data are used,
//     add the total number of hours worked by all employees on the first week of the first payroll
//     period at the beginning of each quarter, and divide the sum by 160 (4 times 40). When semi-annual
//     data are used, add the total number of paid hours on the first week of the first payroll period
//     of the first and seventh months of the period. Divide this sum by 80 (2 times 40)."
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const METHODS = [
  { value: 'period', text: 'Hours over a period' },
  { value: 'cost-report-quarterly', text: 'Cost report, quarterly sample weeks (÷ 160)' },
  { value: 'cost-report-semiannual', text: 'Cost report, semi-annual sample weeks (÷ 80)' },
];
const r2 = (n) => Math.round(n * 100) / 100;

export function fteFromHours(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = METHODS.find((x) => x.value === o.method);
  if (!m) return { valid: false, message: 'Choose how the FTEs are counted: hours over a period, or the cost report\'s sample weeks.' };
  if (m.value === 'period') {
    const f = inputFault([
      ['the hours in the period', o.hours, 0, 1e9, ''],
      ['the weeks in the period', o.weeks, null, 53, ''],
      ['the hours per FTE per week', o.hoursPerWeek, null, 168, ''],
    ]);
    if (f) return { valid: false, message: f };
    const fte = Number(o.hours) / (Number(o.weeks) * Number(o.hoursPerWeek));
    return {
      valid: true, fte: r2(fte), abnormal: false,
      band: `${r2(fte)} FTEs: ${o.hours} hours ÷ (${o.weeks} weeks × ${o.hoursPerWeek} hours per FTE per week).`,
      bandLabel: `${r2(fte)} FTEs`,
      notes: [`One FTE is ${r2(Number(o.weeks) * Number(o.hoursPerWeek))} hours over this period.`],
      note: 'The hours per week is your full-time standard. Paid hours include leave and give more FTEs than worked hours; say which you counted.',
    };
  }
  const div = m.value === 'cost-report-quarterly' ? 160 : 80;
  const f = inputFault([['the hours in the sample weeks', o.sampleHours, 0, 1e9, '']]);
  if (f) return { valid: false, message: f };
  const fte = Number(o.sampleHours) / div;
  return {
    valid: true, fte: r2(fte), abnormal: false,
    band: `${r2(fte)} FTEs on payroll: ${o.sampleHours} hours ÷ ${div}.`,
    bandLabel: `${r2(fte)} FTEs`,
    notes: [div === 160
      ? 'Quarterly: hours worked by all employees in the first week of the first payroll period of each of the four quarters, summed, divided by 160 (4 × 40).'
      : 'Semi-annual: paid hours in the first week of the first payroll period of the first and seventh months, summed, divided by 80 (2 × 40).'],
    note: 'The method for Worksheet S-3 Part I, column 10, as the CMS cost report data dictionary states it.',
  };
}

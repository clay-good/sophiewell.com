// spec-v1657 tool 3: case-mix adjusted nurse staffing hours, the CMS formula.
//
// Source: CMS Five-Star Technical Users' Guide, September 2026, "Case-Mix Adjustment", read October 19,
// 2026: "Hours Adjusted = (Hours Reported/Hours Case-Mix) * Hours National Average Case-Mix", computed
// separately for total nursing, RN, and weekend total nursing. Case-mix hours for a facility are its
// PDPM nursing CMI ratio times the national mean of reported hours; CMS computes them from the
// facility's daily MDS distribution, so they are an input here, from the downloadable staffing file
// in the Provider Data Catalog. National averages are in the State US Averages table.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const STAFF = [
  { value: 'total', text: 'Total nursing' },
  { value: 'rn', text: 'RN' },
  { value: 'weekend', text: 'Weekend total nursing' },
];
const r3 = (n) => Math.round(n * 1000) / 1000;

export function pbjCaseMixAdjustedHours(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the reported hours per resident day', o.reported, 0, 24, ''],
    ['the case-mix hours per resident day', o.caseMix, null, 24, ''],
    ['the national average case-mix hours', o.national, null, 24, ''],
  ]);
  if (f) return { valid: false, message: f };
  const staff = STAFF.find((s) => s.value === o.staffType);
  const adj = (Number(o.reported) / Number(o.caseMix)) * Number(o.national);
  const ratio = Number(o.reported) / Number(o.caseMix);
  return {
    valid: true, adjusted: r3(adj), abnormal: false,
    band: `Adjusted ${r3(adj)} hours per resident day${staff ? ` (${staff.value === 'rn' ? 'RN' : staff.text.toLowerCase()})` : ''}: ${o.reported} reported ÷ ${o.caseMix} case-mix × ${o.national} national average.`,
    bandLabel: `${r3(adj)} adjusted`,
    notes: [
      `Reported hours are ${Math.round(ratio * 1000) / 10}% of the facility's case-mix hours.`,
      ...(staff ? [] : ['Choose the staff type; the three numbers must be for the same staff type and the same quarter.']),
    ],
    note: 'Case-mix hours are CMS\'s own value for the facility, from its daily PDPM nursing case mix; this tool does not derive them. Use the staffing file and the State US Averages table for the same quarter.',
  };
}

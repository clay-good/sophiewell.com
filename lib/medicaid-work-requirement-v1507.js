// spec-v1507 tool 9: does a Medicaid expansion enrollee meet the community engagement (work)
// requirement for a month, or is the person excepted?
//
// Read in the eCFR on 2026-09-26 (42 CFR, as added by the June 2026 interim final rule):
//   435.551: the requirement applies to adults "at least 19 and under 65", not pregnant, without
//     Medicare Part A or B, in the adult group or a comparable demonstration.
//   435.552(a): a month is met by 80 hours of work, community service or a work program; enrollment in
//     an educational program "at least half-time"; any combination of those "for a total of not less
//     than 80 hours" (but half-time school hours are not combined); monthly income of at least the
//     federal minimum wage (29 U.S.C. 206(a)(1)(C)) "multiplied by 80 hours"; or, for a seasonal worker,
//     that income averaged over the preceding 6 months.
//   435.553: a month is deemed met for someone under 19, with Medicare, in a mandatory coverage group, a
//     specified excluded individual, or an inmate of a public institution in the 3 months before.
//   435.554(c): specified excluded individuals -- former foster youth, American Indians and Alaska
//     Natives, parents and caregivers of a child 13 or under or of a disabled individual, veterans rated
//     100% disabled, the medically frail, people meeting TANF work requirements, members of a SNAP
//     household who are subject to its work requirement, people in drug or alcohol treatment, inmates,
//     and people who are pregnant or postpartum.
// The federal minimum wage is $7.25 an hour (29 U.S.C. 206(a)(1)(C)), so the income test is $580.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const POSTURE = 'This is the rule\'s arithmetic, not an eligibility decision. The state\'s Medicaid agency decides, and states may set start dates and look-back months.';
export const FEDERAL_MIN_WAGE = 7.25;
export const EXCEPTIONS = [
  { value: 'none', text: 'None of these apply' },
  { value: 'foster', text: 'Former foster care youth' },
  { value: 'indian', text: 'American Indian or Alaska Native' },
  { value: 'caregiver', text: 'Parent or caregiver of a child 13 or under, or of a disabled person' },
  { value: 'veteran', text: 'Veteran rated 100% disabled by the VA' },
  { value: 'frail', text: 'Medically frail or with special medical needs' },
  { value: 'tanf', text: 'Meeting TANF work requirements' },
  { value: 'snap', text: 'In a SNAP household and subject to its work requirement' },
  { value: 'treatment', text: 'In a drug or alcohol treatment program' },
  { value: 'pregnant', text: 'Pregnant or postpartum' },
  { value: 'institution', text: 'In jail or prison, or released within the past 3 months' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const money = (x) => `$${x.toFixed(2)}`;
const blank = (v) => String(v ?? '').trim() === '';

export function medicaidWorkRequirement(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ex = EXCEPTIONS.some((e) => e.value === o.exception) ? o.exception : null;
  if (!ex) return { valid: false, message: 'Choose whether any of the exceptions applies (or "None of these apply").' };
  const base = { note: POSTURE };
  if (ex !== 'none') {
    const t = EXCEPTIONS.find((e) => e.value === ex).text;
    return { ...base, valid: true, status: 'excepted', band: `Excepted: ${t.toLowerCase()} (42 CFR 435.553, 435.554). The work requirement does not apply for this month.`, bandLabel: 'Excepted', notes: ['An exception still needs to be shown to the state, in the way the state asks.'] };
  }
  const af = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (af) return { valid: false, message: af };
  const age = Number(o.age);
  const medicare = o.medicare === 'yes' || o.medicare === 'no' ? o.medicare : null;
  if (!medicare) return { valid: false, message: 'Choose whether the person has Medicare Part A or Part B.' };
  if (age < 19 || age >= 65 || medicare === 'yes') {
    return { ...base, valid: true, status: 'excepted', band: `Excepted: the requirement applies only to adults 19 to 64 without Medicare (42 CFR 435.551, 435.553).`, bandLabel: 'Excepted', notes: [] };
  }
  const nums = [['work', o.workHours], ['community service', o.serviceHours], ['work program', o.programHours], ['school (less than half-time)', o.schoolHours]];
  const spec = nums.filter(([, v]) => !blank(v)).map(([k, v]) => [`the hours of ${k}`, v, 0, 744, 'hours']);
  if (!blank(o.income)) spec.push(['the monthly income', o.income, 0, 1e7, 'dollars']);
  const f = inputFault(spec);
  if (f) return { valid: false, message: f };
  const halfTime = o.halfTime === 'yes';
  const seasonal = o.seasonal === 'yes';
  if (!halfTime && nums.every(([, v]) => blank(v)) && blank(o.income) && !(seasonal && !blank(o.sixMonthIncome))) {
    return { valid: false, message: 'Enter the month\'s hours of work, community service, work program or school, or the month\'s income.' };
  }
  const notes = [];
  const entered = nums.filter(([, v]) => !blank(v)).length;
  if (entered < nums.length && entered > 0) notes.push('Hours not entered count as none; an hour not entered can only raise the total.');
  const threshold = FEDERAL_MIN_WAGE * 80;
  const hours = nums.reduce((s, [, v]) => s + (blank(v) ? 0 : Number(v)), 0);
  const inc = blank(o.income) ? null : Number(o.income);
  let met = null;
  if (halfTime) met = 'enrolled in school at least half-time';
  else if (hours >= 80) met = `${hours} hours of work, community service, work program and school combined (80 needed)`;
  else if (inc !== null && inc >= threshold) met = `income of ${money(inc)}, at least the federal minimum wage × 80 hours (${money(threshold)})`;
  else if (seasonal && !blank(o.sixMonthIncome)) {
    const sf = inputFault([['the average monthly income over the past 6 months', o.sixMonthIncome, 0, 1e7, 'dollars']]);
    if (sf) return { valid: false, message: sf };
    if (Number(o.sixMonthIncome) >= threshold) met = `a seasonal worker's 6-month average income of ${money(Number(o.sixMonthIncome))}, at least ${money(threshold)}`;
  }
  if (met) return { ...base, valid: true, status: 'meets', band: `Meets the requirement for the month: ${met} (42 CFR 435.552(a)).`, bandLabel: 'Meets', notes };
  const shortH = Math.max(0, 80 - hours);
  const shortI = inc === null ? null : Math.max(0, threshold - inc);
  notes.push(`Short by ${shortH} hour${shortH === 1 ? '' : 's'}${shortI !== null ? `, or by ${money(shortI)} of income` : ''}.`);
  if (inc === null) notes.push(`Income was not entered; ${money(threshold)} in the month would also meet the requirement.`);
  return { ...base, valid: true, status: 'does not meet', band: `Does not meet the requirement for the month: ${hours} hours of the 80 needed${inc !== null ? `, and income of ${money(inc)} below ${money(threshold)}` : ''} (42 CFR 435.552(a)).`, bandLabel: 'Does not meet', notes };
}

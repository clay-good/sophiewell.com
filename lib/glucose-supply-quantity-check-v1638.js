// spec-v1638 tool 16: Medicare home glucose test strip and lancet quantities against the DME MACs'
// coverage determination.
//
// Sources, re-read October 12, 2026 in CMS's Medicare Coverage Database export dated October 5, 2026:
//   LCD L33822, "Glucose Monitors" (version 70, revision effective October 1, 2024), Home Blood
//     Glucose Monitors: the two basic criteria; "Usual Utilization: For a beneficiary who is not
//     currently being treated with insulin administrations, up to 100 test strips and up to 100
//     lancets every 3 months are covered ... currently being treated with insulin administrations,
//     up to 300 test strips and up to 300 lancets every 3 months"; High Utilization criteria (a) to
//     (c); "If neither basic coverage criterion (1) or (2) is met, all testing supplies will be
//     denied as not reasonable and necessary. If quantities of test strips or lancets that exceed
//     the utilization guidelines are provided and criteria (a)-(c) are not met, the amount in excess
//     will be denied as not reasonable and necessary." "More than one spring powered device (code
//     A4258) per 6 months is not reasonable and necessary." "Regardless of utilization, a supplier
//     must not dispense more than a three (3) month quantity of BGM testing supplies at a time."
//   Policy Article A52464, "Glucose Monitor - Policy Article" (version 65, effective February 18,
//     2025): "For glucose test strips (code A4253), 1 unit of service = 50 strips. For lancets (code
//     A4259), 1 unit of service = 100 lancets." "Use modifier KX if the beneficiary is insulin
//     treated; or, Use modifier KS if the beneficiary is non-insulin treated." For non-adjunctive
//     CGMs "the supply allowance (A4239) also includes a home BGM and related supplies ... Supplies
//     or accessories billed separately will be denied as unbundling."
//
// Home blood glucose monitor supplies only. The tool reports what the determination states for the
// quantities and dates entered; it is not a coverage decision.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, addMonthsUtc } from './deadline.js';
import { inputFault } from './num.js';

export const INSULIN = [{ value: 'insulintreated', text: 'Currently treated with insulin' }, { value: 'noninsulintreated', text: 'Not currently treated with insulin' }];
export const CGM = [{ value: 'no-nonadjunctive-cgm', text: 'No' }, { value: 'nonadjunctive-cgm-supplied', text: 'Yes' }];
export const BASIC = [{ value: 'both-basic-criteria', text: 'Both are met' }, { value: 'not-both-basic-criteria', text: 'One or both are not met' }];
const EDITION = 'LCD L33822 (version 70, revision effective October 1, 2024) and Policy Article A52464 (version 65, effective February 18, 2025), read in the Medicare Coverage Database export of October 5, 2026.';
const POSTURE = 'This is what the coverage determination states for these entries. It is not a coverage decision; the DME MAC decides the claim.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function optDate(v, what) { if (blank(v)) return { d: null }; try { return { d: parseIsoStrict(String(v).trim()) }; } catch { return { message: `Enter ${what} as a date, or leave it blank.` }; } }

export function glucoseSupplyQuantityCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cgm = CGM.find((x) => x.value === String(o.cgm ?? '').trim());
  if (!cgm) return { valid: false, message: 'Choose whether the beneficiary has a non-adjunctive continuous glucose monitor: its supply allowance changes the answer.' };
  if (cgm.value === 'nonadjunctive-cgm-supplied') {
    const notes = ['Policy Article A52464: for non-adjunctive CGMs the supply allowance (code A4239) "also includes a home BGM and related supplies (test strips, lancets, lancing device, calibration solution, and batteries), if necessary. Supplies or accessories billed separately will be denied as unbundling."', 'No strip or lancet quantity is checked.', EDITION, POSTURE];
    return { valid: true, flag: 'inside-the-cgm-supply-allowance', abnormal: true, band: 'With a non-adjunctive CGM, strips and lancets are part of its supply allowance; a separate claim is denied as unbundling.', bandLabel: 'Part of the CGM supply allowance', notes, note: notes.join(' ') };
  }
  const ins = INSULIN.find((x) => x.value === String(o.insulin ?? '').trim());
  if (!ins) return { valid: false, message: 'Choose whether the beneficiary is currently treated with insulin: usual utilization is 300 strips and lancets every 3 months with insulin and 100 without.' };
  const basic = BASIC.find((x) => x.value === String(o.basicCriteria ?? '').trim());
  if (!basic) return { valid: false, message: 'Choose whether both basic coverage criteria are met: the beneficiary has diabetes, and the treating practitioner has concluded that the beneficiary or caregiver is trained on the device.' };
  let strips; let lancets; const notes = [];
  if (!blank(o.testsPerDay) && blank(o.strips) && blank(o.lancets)) {
    const f = inputFault([['the tests per day', o.testsPerDay, null, 50, '']]);
    if (f) return { valid: false, message: f };
    strips = Math.ceil(Number(o.testsPerDay) * 90 - 1e-9); lancets = strips;
    notes.push(`${Number(o.testsPerDay)} tests a day x 90 days = ${strips} strips and ${lancets} lancets for 3 months.`);
  } else {
    const f = inputFault([['the test strips ordered for 3 months', o.strips, 0, 10000, ''], ['the lancets ordered for 3 months', o.lancets, 0, 10000, '']]);
    if (f) return { valid: false, message: f.replace(/^Enter /, 'Enter the tests per day, or ') };
    strips = Number(o.strips); lancets = Number(o.lancets);
  }
  const fd = inputFault([['the spring-powered lancing devices in the last 6 months', blank(o.lancingDevices) ? 0 : o.lancingDevices, 0, 100, '']]);
  if (fd) return { valid: false, message: fd };
  const order = optDate(o.orderDate, 'the order date'); if (order.message) return { valid: false, message: order.message };
  const visit = optDate(o.visitDate, 'the visit date'); if (visit.message) return { valid: false, message: visit.message };
  const adher = optDate(o.adherenceVerified, 'the date adherence was last verified'); if (adher.message) return { valid: false, message: adher.message };
  const disp = optDate(o.dispenseDate, 'the dispensing date'); if (disp.message) return { valid: false, message: disp.message };
  const usual = ins.value === 'insulintreated' ? 300 : 100;
  const mod = ins.value === 'insulintreated' ? 'KX' : 'KS';
  const base = { valid: true, strips, lancets, usualLimit: usual, stripUnits: Math.ceil(strips / 50 - 1e-9), lancetUnits: Math.ceil(lancets / 100 - 1e-9), modifier: mod };
  const tail = () => {
    if (!blank(o.lancingDevices)) notes.push(Number(o.lancingDevices) > 1 ? `${Number(o.lancingDevices)} spring-powered lancing devices in 6 months: the LCD says more than one (code A4258) per 6 months is not reasonable and necessary.` : 'Spring-powered lancing devices: not more than one in 6 months.');
    for (const [k, q, what] of [['dispenseStrips', strips, 'strips'], ['dispenseLancets', lancets, 'lancets']]) {
      if (blank(o[k])) continue;
      const n = Number(o[k]);
      if (Number.isFinite(n) && n > q) notes.push(`${n} ${what} to dispense now is more than the 3-month quantity ordered (${q}): the LCD says a supplier must not dispense more than a 3-month quantity of BGM testing supplies at a time.`);
    }
    notes.push(`Billing units (Policy Article): 1 unit of test strips (A4253) is 50 strips, so ${strips} strips is ${base.stripUnits} unit${base.stripUnits === 1 ? '' : 's'}; 1 unit of lancets (A4259) is 100 lancets, so ${lancets} lancets is ${base.lancetUnits} unit${base.lancetUnits === 1 ? '' : 's'}. Modifier: ${mod} (${mod === 'KX' ? 'insulin treated' : 'non-insulin treated'}); the article says KX must not be used for a beneficiary treated only with oral agents.`);
    notes.push('The article also expects the record to show the beneficiary is testing at a frequency that corroborates the quantity (a narrative statement or a copy of the log). That is a record requirement, not computed here.');
    notes.push(EDITION); notes.push(POSTURE);
  };
  if (basic.value === 'not-both-basic-criteria') {
    notes.push('LCD: the beneficiary must meet both basic criteria. "If the basic coverage criteria (1)-(2) are not met, the item(s) will be denied as not reasonable and necessary", and "If neither basic coverage criterion (1) or (2) is met, all testing supplies will be denied as not reasonable and necessary."');
    tail();
    return { ...base, flag: 'basic-criteria-not-met', abnormal: true, band: 'The basic coverage criteria are not both met: the LCD says the supplies are denied as not reasonable and necessary.', bandLabel: 'Basic criteria not met', notes, note: notes.join(' ') };
  }
  const overS = Math.max(0, strips - usual); const overL = Math.max(0, lancets - usual);
  notes.push(`Usual utilization, ${ins.value === 'insulintreated' ? 'treated with insulin' : 'not treated with insulin'}: up to ${usual} test strips and up to ${usual} lancets every 3 months. Ordered: ${strips} strips and ${lancets} lancets.`);
  if (!overS && !overL) {
    tail();
    return { ...base, excessStrips: 0, excessLancets: 0, flag: 'within-usual-utilization', abnormal: false, band: `Within usual utilization: ${strips} strips and ${lancets} lancets against ${usual} and ${usual} every 3 months.`, bandLabel: 'Within usual utilization', notes, note: notes.join(' ') };
  }
  notes.push(`Above usual utilization by ${overS} strips and ${overL} lancets. The LCD covers the higher quantity only if criteria (a) to (c) are met; otherwise "the amount in excess will be denied as not reasonable and necessary."`);
  notes.push('(a) The basic coverage criteria are met: entered as met.');
  let b = 'not-entered'; let c = 'not-entered';
  if (visit.d && order.d) {
    const ok = visit.d.getTime() <= order.d.getTime() && addMonthsUtc(visit.d, 6).getTime() >= order.d.getTime();
    b = ok ? 'met' : 'not-met';
    notes.push(`(b) A visit within the 6 months before the order: the visit on ${say(visit.d)} ${ok ? 'is' : 'is not'} within the 6 months before the order on ${say(order.d)}${visit.d.getTime() <= order.d.getTime() ? `; 6 months after the visit is ${say(addMonthsUtc(visit.d, 6))}` : ' (it is after the order)'}.`);
  } else notes.push('(b) A visit within the 6 months before the order, in person or by Medicare-approved telehealth, to evaluate diabetes control and the need for the quantity: enter the visit date and the order date to check it.');
  if (adher.d && disp.d) {
    const ok = adher.d.getTime() <= disp.d.getTime() && addMonthsUtc(adher.d, 6).getTime() >= disp.d.getTime();
    c = ok ? 'met' : 'not-met';
    notes.push(`(c) Adherence verified every 6 months for continued dispensing: verified ${say(adher.d)}, which lapses ${say(addMonthsUtc(adher.d, 6))}; on the dispensing date, ${say(disp.d)}, it ${ok ? 'stands' : 'has lapsed'}.`);
  } else notes.push('(c) Adherence to the high-utilization regimen verified by the treating practitioner every 6 months, for continued dispensing: enter the date it was last verified and the dispensing date to check it.');
  tail();
  const met = b === 'met' && c === 'met'; const unmet = b === 'not-met' || c === 'not-met';
  return { ...base, excessStrips: overS, excessLancets: overL, criterionB: b, criterionC: c, flag: met ? 'above-usual-criteria-met' : unmet ? 'above-usual-criteria-not-met' : 'above-usual-criteria-not-shown', abnormal: !met,
    band: met ? `Above usual utilization by ${overS} strips and ${overL} lancets; criteria (a) to (c) are met on the dates entered.` : unmet ? `Above usual utilization, and a criterion is not met: the excess (${overS} strips, ${overL} lancets) is what the LCD says is denied.` : `Above usual utilization by ${overS} strips and ${overL} lancets; criteria (b) and (c) are not both shown.`,
    bandLabel: met ? 'Above usual; criteria met' : unmet ? 'Above usual; a criterion is not met' : 'Above usual; criteria not shown', notes, note: notes.join(' ') };
}

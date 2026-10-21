// spec-v1511 tools 1 and 2: days supply, and the earliest refill date.
//
// Days supply is arithmetic on the label and the prescription: the usable quantity divided by the daily
// use, rounded down, and capped by any in-use discard limit the label states (a pen discarded 28 days
// after opening lasts at most 28 days, however much is left). Pen priming is counted per injection. No
// federal source gives a drops-per-mL figure, so the reader enters the manufacturer's or plan's figure.
//
// The earliest refill date is the fill date plus the plan's threshold share of the days supply, rounded
// up. CMS, "Early Refill Edits on Topical Ophthalmic Products" (June 2, 2010), recommends allowing eye
// drop refills at 70% of the expected days of use: "for a prescribed medication with an expected
// duration of 30 days of use, refills would be permitted at 21 days". It is a recommendation, not a rule.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is arithmetic on the label and the prescription, not a coverage decision. The plan\'s rules control.';
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const FORMS = [
  { value: 'tablet', text: 'Tablets or capsules' },
  { value: 'liquid', text: 'Oral liquid' },
  { value: 'insulin', text: 'Insulin pen or vial' },
  { value: 'inhaler', text: 'Inhaler' },
  { value: 'drops', text: 'Eye drops' },
];
const FIELDS = {
  tablet: [['quantity', 'the quantity dispensed', 100000, 'units'], ['perDose', 'the units per dose', 1000, ''], ['dosesPerDay', 'the doses per day', 48, '']],
  liquid: [['volume', 'the volume dispensed', 100000, 'mL'], ['doseMl', 'the dose volume', 1000, 'mL'], ['dosesPerDay', 'the doses per day', 48, '']],
  insulin: [['unitsPerMl', 'the insulin concentration', 1000, 'units/mL'], ['mlPerPen', 'the mL per pen or vial', 100, 'mL'], ['pens', 'the pens or vials dispensed', 1000, ''], ['unitsPerDay', 'the units injected per day', 10000, 'units'], ['injectionsPerDay', 'the injections per day', 48, '']],
  inhaler: [['actuations', 'the actuations per canister', 10000, ''], ['canisters', 'the canisters dispensed', 100, ''], ['puffsPerDose', 'the puffs per dose', 50, ''], ['dosesPerDay', 'the doses per day', 48, '']],
  drops: [['volume', 'the volume dispensed', 1000, 'mL'], ['dropsPerMl', 'the drops per mL (the manufacturer\'s or plan\'s figure)', 100, ''], ['dropsPerEye', 'the drops per eye per dose', 20, ''], ['eyes', 'the number of eyes treated', 2, ''], ['dosesPerDay', 'the doses per day', 48, '']],
};

const COUNTER_FIELDS = [['counterLeft', 'the doses left on the counter', 10000, '', 0], ['puffsPerDose', 'the puffs per dose', 50, ''], ['dosesPerDay', 'the doses per day', 48, '']];

export function daysSupply(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const form = FIELDS[o.form] ? o.form : null;
  if (!form) return { valid: false, message: 'Choose the dosage form.' };
  // spec-v1639 backfill 1: an inhaler's dose counter reading replaces the canister arithmetic.
  const counter = form === 'inhaler' && String(o.counterLeft ?? '').trim() !== '';
  const spec = counter ? COUNTER_FIELDS : FIELDS[form];
  const fault = inputFault(spec.map(([k, label, hi, unit, lo = null]) => [label, o[k], lo, hi, unit]));
  if (fault) return { valid: false, message: fault };
  const n = Object.fromEntries(spec.map(([k]) => [k, Number(o[k])]));
  const notes = [];
  let total;
  let daily;
  let what;
  if (form === 'tablet') { total = n.quantity; daily = n.perDose * n.dosesPerDay; what = `${total} units ÷ (${n.perDose} × ${n.dosesPerDay} a day)`; }
  else if (form === 'liquid') { total = n.volume; daily = n.doseMl * n.dosesPerDay; what = `${total} mL ÷ (${n.doseMl} mL × ${n.dosesPerDay} a day)`; }
  else if (counter) {
    total = n.counterLeft; daily = n.puffsPerDose * n.dosesPerDay;
    what = `${total} doses left on the counter ÷ (${n.puffsPerDose} puffs × ${n.dosesPerDay} a day)`;
    notes.push('Counted from the dose counter: priming already used shows on the counter, so none is subtracted, and the actuations and canisters dispensed are not used.');
  }
  else if (form === 'inhaler') {
    // spec-v1639 backfill 1: priming puffs the label says to waste, per canister.
    let prime = 0;
    if (String(o.primingPuffs ?? '').trim()) {
      const pf = inputFault([['the priming puffs per canister', o.primingPuffs, 0, 100, '']]);
      if (pf) return { valid: false, message: pf };
      prime = Number(o.primingPuffs);
      if (prime >= n.actuations) return { valid: false, message: 'Enter priming puffs fewer than the actuations per canister.' };
    } else notes.push('Priming puffs were not entered, so none are counted; enter the label\'s figure if it says to waste them.');
    total = (n.actuations - prime) * n.canisters; daily = n.puffsPerDose * n.dosesPerDay;
    what = `${total} actuations${prime ? ` after ${prime} priming puff${prime === 1 ? '' : 's'} a canister` : ''} ÷ (${n.puffsPerDose} puffs × ${n.dosesPerDay} a day)`;
  }
  else if (form === 'drops') { total = n.volume * n.dropsPerMl; daily = n.dropsPerEye * n.eyes * n.dosesPerDay; what = `${n.volume} mL × ${n.dropsPerMl} drops/mL ÷ (${n.dropsPerEye} × ${n.eyes} eye${n.eyes === 1 ? '' : 's'} × ${n.dosesPerDay} a day)`; notes.push('No federal source sets a drops-per-mL figure; the result is only as good as the figure entered.'); }
  else {
    let prime = 0;
    if (String(o.primingUnits ?? '').trim()) {
      const pf = inputFault([['the priming units per injection', o.primingUnits, 0, 20, 'units']]);
      if (pf) return { valid: false, message: pf };
      prime = Number(o.primingUnits);
    } else notes.push('Priming units per injection were not entered, so no priming is counted; many pens prime 2 units each injection.');
    total = n.unitsPerMl * n.mlPerPen * n.pens;
    daily = n.unitsPerDay + prime * n.injectionsPerDay;
    what = `${total} units ÷ (${n.unitsPerDay} units + ${prime} priming × ${n.injectionsPerDay} injection${n.injectionsPerDay === 1 ? '' : 's'} a day)`;
  }
  const byQty = Math.floor(total / daily + 1e-9);
  let days = byQty;
  let binding = 'the quantity';
  if (String(o.discardDays ?? '').trim()) {
    const df = inputFault([['the in-use discard limit', o.discardDays, null, 3650, 'days']]);
    if (df) return { valid: false, message: df };
    const lim = Number(o.discardDays);
    if (!Number.isInteger(lim)) return { valid: false, message: 'Enter the in-use discard limit as a whole number of days.' };
    const units = form === 'insulin' ? n.pens : form === 'inhaler' && !counter ? n.canisters : 1;
    const cap = lim * units;
    if (counter) notes.push(`The ${lim}-day in-use discard limit runs from the day the canister was opened, which the counter does not show, so it is not applied here.`);
    else if (cap < days) { days = cap; binding = `the ${lim}-day in-use discard limit${units > 1 ? `, ${units} containers used one after another` : ''}`; }
  }
  // spec-v1639 backfill 2: an as-needed sig entered at its maximum is not a scheduled supply.
  const prn = o.maxPerDay === 'yes';
  if (prn) notes.push('The daily use entered is the maximum the sig allows, so this is the days supply at the maximum. An as-needed supply used less often lasts longer.');
  const result = {
    valid: true,
    daysSupply: days,
    band: `${days}-day supply${prn ? ' at the maximum the sig allows' : ''}: ${what} = ${byQty} days${binding === 'the quantity' ? '' : `, capped at ${days} by ${binding}`}.`,
    bandLabel: prn ? `${days} days at the maximum` : `${days} days`,
    notes,
    note: POSTURE,
  };
  // spec-v1639 backfill 1: the run-out date, and whether a trip is covered.
  const has = (v) => String(v ?? '').trim() !== '';
  const day = (v) => { try { return parseIsoStrict(String(v).trim()); } catch { return null; } };
  if (has(o.startDate)) {
    const start = day(o.startDate);
    if (counter && start) notes.push('With a counter reading, the start date is read as the day of the reading.');
    if (!start) return { valid: false, message: 'Enter the start date as a date, or leave it blank.' };
    if (days < 1) { notes.push('The quantity does not cover one day at this use, so no run-out date is shown.'); return result; }
    const lastDay = addCalendarDaysUtc(start, days - 1);
    result.lastCoveredDate = fmtUtc(lastDay);
    notes.push(`Started ${longDate(start)}: the last day covered is ${longDate(lastDay)}, and the supply has run out on ${longDate(addCalendarDaysUtc(start, days))}.`);
    if (has(o.departDate) || has(o.returnDate)) {
      const depart = day(o.departDate); const back = day(o.returnDate);
      if (!depart || !back) return { valid: false, message: 'Enter both the departure date and the return date, or leave both blank.' };
      if (back.getTime() < depart.getTime()) return { valid: false, message: 'Enter a return date on or after the departure date.' };
      const short = Math.round((back.getTime() - lastDay.getTime()) / 86400000);
      if (short <= 0) notes.push(`Trip ${longDate(depart)} to ${longDate(back)}: the supply on hand covers it.`);
      else {
        result.daysShort = short;
        const need = daily * short;
        const amount = form === 'tablet' ? `${Math.ceil(need - 1e-9)} units` : form === 'liquid' ? `${Math.round(need * 100) / 100} mL` : form === 'insulin' ? `${Math.round(need * 100) / 100} units of insulin, priming included` : form === 'inhaler' ? `${Math.ceil(need - 1e-9)} actuations` : `${Math.ceil(need - 1e-9)} drops (${Math.round((need / n.dropsPerMl) * 100) / 100} mL at the entered drops per mL)`;
        notes.push(`Trip ${longDate(depart)} to ${longDate(back)}: the supply runs ${short} day${short === 1 ? '' : 's'} short of the return date. At this use, ${short} more day${short === 1 ? '' : 's'} is ${amount}. Whether a plan allows a vacation supply is the plan's rule.`);
      }
    }
  } else if (has(o.departDate) || has(o.returnDate)) return { valid: false, message: 'Enter the start date of the supply to check a trip against it.' };
  return result;
}

export function refillEligibleDate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let fill;
  try { fill = parseIsoStrict(String(o.fillDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date of the last fill (YYYY-MM-DD).' }; }
  const f = inputFault([['the days supply of the last fill', o.daysSupply, null, 366, 'days']]);
  if (f) return { valid: false, message: f };
  const notes = [];
  let pct;
  if (String(o.threshold ?? '').trim()) {
    const tf = inputFault([['the plan\'s refill threshold', o.threshold, 1, 100, 'percent']]);
    if (tf) return { valid: false, message: tf };
    pct = Number(o.threshold);
  } else if (o.eyeDrops === 'yes') {
    pct = 70;
    notes.push('No plan threshold was entered, so the CMS 2010 recommendation for eye drops (70%) is used; it is a recommendation to plans, not a rule.');
  } else return { valid: false, message: 'Enter the plan\'s refill threshold as a percent (for example 75 or 80), or choose eye drops to use the CMS recommendation.' };
  const ds = Number(o.daysSupply);
  if (!Number.isInteger(ds)) return { valid: false, message: 'Enter the days supply as a whole number of days.' };
  const after = Math.ceil(ds * pct / 100 - 1e-9);
  const date = addCalendarDaysUtc(fill, after);
  notes.push('Some plans also carry forward days banked by earlier early refills; this counts the last fill only.');
  return {
    valid: true,
    earliest: fmtUtc(date),
    band: `Earliest refill ${longDate(date)}: ${pct}% of a ${ds}-day supply is ${after} day${after === 1 ? '' : 's'} after the fill on ${longDate(fill)}.`,
    bandLabel: `Refill from ${fmtUtc(date)}`,
    notes,
    note: POSTURE,
  };
}

// spec-v1633 tool 6: buprenorphine product switch for opioid use disorder, by each label's table.
//
// Three label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Zubsolv (Orexo, DailyMed version 27), section 2.9: "One ZUBSOLV 5.7 mg/1.4 mg sublingual tablet
//     provides equivalent buprenorphine exposure to one Suboxone 8 mg/2 mg sublingual tablet", with
//     the corresponding strengths 2/0.5 to 1.4/0.36, 4/1 to 2.9/0.71, 8/2 to 5.7/1.4, 12/3 to
//     8.6/2.1 and 16/4 to 11.4/2.9.
//   Brixadi (Braeburn, version 6), section 2.3, Table 1 (daily sublingual buprenorphine to weekly or
//     monthly Brixadi: "<= 6 mg" 8 mg weekly and no monthly dose; "8-10 mg" 16 or 64; "12-16 mg" 24
//     or 96; "18-24 mg" 32 or 128) and Table 2 (weekly to monthly: 16 and 64, 24 and 96, 32 and 128);
//     "BRIXADI (weekly) should be administered in 7-day intervals. BRIXADI (monthly) should be
//     administered in 28-day intervals."
//   Sublocade (Indivior, version 43), section 2.3: "Patients who have been on 8 mg to 24 mg daily of
//     transmucosal buprenorphine may be transitioned directly to the recommended starting dose of
//     300 mg"; "The recommended dose for the second injection is 300 mg ... as early as 1 week and up
//     to 1 month after the initial injection"; controlled long term on "8 mg to 18 mg daily ... may
//     receive 100 mg ... as their second dose"; maintenance "100 mg monthly", "at least 26 days
//     between injections".
//
// A dose the table does not list returns "not in the label's table" with the rows either side.
// Missed doses and injection windows are a different tool.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseDate } from './pa/date.js';

const ZUBSOLV = { brand: 'Zubsolv', setId: '5f5cfcfe-d52b-49e6-8fe4-550477332dd2' };
const BRIXADI = { brand: 'Brixadi', setId: '5d8a8fd0-8619-422a-a664-d1d2e8970f48' };
const SUBLOCADE = { brand: 'Sublocade', setId: '6189fb21-9432-45f8-8481-0bfaf3ccde95' };
export const LABELS = { zubsolv: ZUBSOLV, brixadi: BRIXADI, sublocade: SUBLOCADE };
export const SWITCHES = [
  { value: 'suboxone-to-zubsolv', text: 'Suboxone tablets (or generic) to Zubsolv', label: ZUBSOLV, ask: 'the daily buprenorphine dose as Suboxone tablets' },
  { value: 'zubsolv-to-suboxone', text: 'Zubsolv to Suboxone tablets (or generic)', label: ZUBSOLV, ask: 'the daily buprenorphine dose as Zubsolv' },
  { value: 'sublingual-to-brixadi', text: 'Sublingual buprenorphine to Brixadi', label: BRIXADI, ask: 'the daily dose of sublingual buprenorphine' },
  { value: 'brixadi-weekly-to-monthly', text: 'Brixadi weekly to Brixadi monthly', label: BRIXADI, ask: 'the current weekly Brixadi dose' },
  { value: 'brixadi-monthly-to-weekly', text: 'Brixadi monthly to Brixadi weekly', label: BRIXADI, ask: 'the current monthly Brixadi dose' },
  { value: 'transmucosal-to-sublocade', text: 'Transmucosal buprenorphine to Sublocade', label: SUBLOCADE, ask: 'the daily dose of transmucosal buprenorphine' },
];
// Suboxone tablet strength (buprenorphine/naloxone mg) and the corresponding Zubsolv strength.
export const ZUBSOLV_ROWS = [[2, 0.5, 1.4, 0.36], [4, 1, 2.9, 0.71], [8, 2, 5.7, 1.4], [12, 3, 8.6, 2.1], [16, 4, 11.4, 2.9]];
// Brixadi Table 1: daily sublingual buprenorphine [from, to] -> weekly mg, monthly mg (null: none).
export const BRIXADI_ROWS = [[null, 6, 8, null], [8, 10, 16, 64], [12, 16, 24, 96], [18, 24, 32, 128]];
const WEEKLY_MONTHLY = [[16, 64], [24, 96], [32, 128]];
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. Missed doses and injection windows are not covered here.';
const iso = (d) => d.toISOString().slice(0, 10);
const plusDays = (d, n) => new Date(d.getTime() + n * 86400000);
function plusMonth(d) {
  const y = d.getUTCFullYear(); const m = d.getUTCMonth() + 1; const day = d.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, last)));
}
const neighbors = (list, v) => [[...list].reverse().find((x) => x < v), list.find((x) => x > v)].filter((x) => x !== undefined);

export function buprenorphineOudProductSwitch(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const sw = SWITCHES.find((s) => s.value === String(o.switch ?? '').trim());
  if (!sw) return { valid: false, message: 'Choose the switch: which product the patient is on and which one is being started.' };
  const f = inputFault([[sw.ask, o.dose, null, 200, 'mg']]);
  if (f) return { valid: false, message: f };
  let first = null;
  if (!(o.firstInjection === undefined || o.firstInjection === null || String(o.firstInjection).trim() === '')) {
    first = parseDate(o.firstInjection);
    if (!first) return { valid: false, message: 'Enter the date of the first injection as YYYY-MM-DD, or leave it blank.' };
  }
  const L = sw.label; const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's table is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  const dose = Number(o.dose);
  const base = { valid: true, switch: sw.value, dose, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const notInTable = (band, extra = []) => ({ ...base, flag: 'not-in-table', abnormal: true, band, bandLabel: 'Not in the label\'s table', notes: [...extra, ...tail] });

  if (sw.value === 'suboxone-to-zubsolv' || sw.value === 'zubsolv-to-suboxone') {
    const toZ = sw.value === 'suboxone-to-zubsolv';
    const row = ZUBSOLV_ROWS.find((r) => r[toZ ? 0 : 2] === dose);
    const monitor = 'The label says dosage adjustments may be necessary, and to monitor for over-medication as well as withdrawal or other signs of under-dosing.';
    if (!row) {
      const list = ZUBSOLV_ROWS.map((r) => r[toZ ? 0 : 2]); const near = neighbors(list, dose);
      return notInTable(`${dose} mg is not in the Zubsolv label's table of corresponding strengths. Its ${toZ ? 'Suboxone' : 'Zubsolv'} rows are ${list.join(', ')} mg of buprenorphine${near.length ? `; the nearest are ${near.join(' and ')} mg` : ''}.`, [monitor]);
    }
    const [sb, sn, zb, zn] = row;
    return { ...base, flag: 'dose', abnormal: false, buprenorphineMg: toZ ? zb : sb, naloxoneMg: toZ ? zn : sn,
      band: toZ ? `The Zubsolv label's corresponding strength for Suboxone ${sb} mg/${sn} mg is Zubsolv ${zb} mg/${zn} mg.` : `The Zubsolv label's corresponding strength for Zubsolv ${zb} mg/${zn} mg is Suboxone ${sb} mg/${sn} mg (sublingual tablets, including generic equivalents).`,
      bandLabel: toZ ? `Zubsolv ${zb} mg/${zn} mg` : `Suboxone ${sb} mg/${sn} mg`,
      notes: ['The strengths differ because Zubsolv is more bioavailable: one Zubsolv 5.7 mg/1.4 mg tablet gives the buprenorphine exposure of one Suboxone 8 mg/2 mg tablet.', monitor, ...tail] };
  }

  if (sw.value === 'sublingual-to-brixadi') {
    const row = BRIXADI_ROWS.find(([lo, hi]) => (lo === null || dose >= lo) && dose <= hi);
    const sched = 'Brixadi weekly is given at 7-day intervals and Brixadi monthly at 28-day intervals.';
    if (!row) {
      const text = dose > 24 ? `${dose} mg a day is above the last row of the Brixadi label's table (18 to 24 mg).` : `${dose} mg a day falls between rows of the Brixadi label's table (6 mg or less, 8 to 10, 12 to 16, 18 to 24 mg).`;
      return notInTable(`${text} The label gives no Brixadi dose for it.`, [sched]);
    }
    const [lo, hi, weekly, monthly] = row;
    const notes = [sched, 'Table 1 states sublingual doses as Subutex or Suboxone doses; one Suboxone 8 mg/2 mg tablet equals one Zubsolv 5.7 mg/1.4 mg tablet in buprenorphine exposure.', 'An additional 8 mg weekly injection may be given during a dosing interval, up to 32 mg a week or 128 mg a month.'];
    if (first) notes.unshift(`With a first injection on ${iso(first)}: the next weekly dose is due ${iso(plusDays(first, 7))}${monthly === null ? '' : `, or the next monthly dose ${iso(plusDays(first, 28))}`}.`);
    return { ...base, flag: 'dose', abnormal: false, weeklyMg: weekly, monthlyMg: monthly,
      band: monthly === null ? `The Brixadi label's row for ${hi} mg a day or less of sublingual buprenorphine: Brixadi weekly 8 mg. The table gives no monthly dose for this row.` : `The Brixadi label's row for ${lo} to ${hi} mg a day of sublingual buprenorphine: Brixadi weekly ${weekly} mg, or Brixadi monthly ${monthly} mg.`,
      bandLabel: monthly === null ? '8 mg weekly' : `${weekly} mg weekly or ${monthly} mg monthly`, notes: [...notes, ...tail] };
  }

  if (sw.value === 'brixadi-weekly-to-monthly' || sw.value === 'brixadi-monthly-to-weekly') {
    const toMonthly = sw.value === 'brixadi-weekly-to-monthly';
    const row = WEEKLY_MONTHLY.find((r) => r[toMonthly ? 0 : 1] === dose);
    if (!row) {
      const list = WEEKLY_MONTHLY.map((r) => r[toMonthly ? 0 : 1]);
      const why = toMonthly && dose === 8 ? ' The label gives no monthly dose for 8 mg weekly.' : '';
      return notInTable(`${dose} mg ${toMonthly ? 'weekly' : 'monthly'} is not in the Brixadi label's transition table (${list.join(', ')} mg).${why}`);
    }
    const target = row[toMonthly ? 1 : 0];
    return { ...base, flag: 'dose', abnormal: false, [toMonthly ? 'monthlyMg' : 'weeklyMg']: target, band: `The Brixadi label's transition table: ${row[0]} mg weekly corresponds to ${row[1]} mg monthly, so ${dose} mg ${toMonthly ? 'weekly' : 'monthly'} goes to ${target} mg ${toMonthly ? 'monthly' : 'weekly'}.`, bandLabel: `${target} mg ${toMonthly ? 'monthly' : 'weekly'}`, notes: ['Weekly doses are given at 7-day intervals and monthly doses at 28-day intervals; the label leaves the transition to clinical judgment.', ...tail] };
  }

  // transmucosal -> Sublocade
  if (dose < 8 || dose > 24) {
    return notInTable(`The Sublocade label's direct transition covers patients on 8 mg to 24 mg a day of transmucosal buprenorphine; ${dose} mg a day is outside it, and the label gives no figure for it.`);
  }
  const notes = ['Maintenance: 100 mg monthly after the first two injections, with at least 26 days between injections. The label says 300 mg monthly may be considered when 100 mg is tolerated without a satisfactory response.'];
  if (dose <= 18) notes.unshift('For patients established on long-term treatment and controlled on 8 mg to 18 mg a day, the label says 100 mg may be given as the second dose if symptoms remain controlled after the first 300 mg.');
  if (first) notes.unshift(`With a first injection on ${iso(first)}: the second may be given from ${iso(plusDays(first, 7))} (1 week) to ${iso(plusMonth(first))} (1 month).`);
  return { ...base, flag: 'dose', abnormal: false, firstMg: 300, secondMg: 300, maintenanceMg: 100, band: `The Sublocade label, for ${dose} mg a day of transmucosal buprenorphine: a first injection of 300 mg, a second of 300 mg as early as 1 week and up to 1 month later, then 100 mg monthly.`, bandLabel: '300 mg, 300 mg, then 100 mg monthly', notes: [...notes, ...tail] };
}

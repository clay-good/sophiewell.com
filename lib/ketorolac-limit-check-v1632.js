// spec-v1632 tool 16: ketorolac dose and duration limits, read from the injection and tablet labels.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Ketorolac tromethamine injection (Hospira, DailyMed version 36), Dosage and Administration and
//     Contraindications: single dose IM, "Patients <65 years of age: One dose of 60 mg"; ">=65 years
//     of age, renally impaired and/or less than 50 kg (110 lbs) of body weight: One dose of 30 mg".
//     Single dose IV: 30 mg; 15 mg for the same group. Multiple dose (IV or IM): "30 mg ... every 6
//     hours. The maximum daily dose ... should not exceed 120 mg"; for the same group, "15 mg ...
//     every 6 hours ... should not exceed 60 mg". "ketorolac tromethamine therapy is not to exceed 5
//     days." "contraindicated in patients with advanced renal impairment".
//   Ketorolac tromethamine tablets (Teva, version 19): "only indicated as continuation therapy to IV
//     or IM dosing"; "Patients age 17 to 64: 20 mg PO once followed by 10 mg q4 to 6 hours prn not >
//     40 mg/day"; "age >= 65, renally impaired, and/or weight < 50 kg (110 lbs): 10 mg PO once
//     followed by 10 mg q4 to 6 hours prn not > 40 mg/day"; "the combined duration of use of IV or IM
//     dosing ... and ... tablets is not to exceed 5 days".
//
// Neither label defines "renally impaired" with a number, so it is a question the reader answers.
// Adults only (17 and older). The tool reports the label's dose for the group, its daily ceiling, and
// what is left of the ceiling and of the 5 days; it recommends nothing.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = { injection: { brand: 'ketorolac injection', setId: '8accbb78-fc64-45d5-69b0-35c23a1d2a2e' }, tablets: { brand: 'ketorolac tablets', setId: '688f5dec-a6db-43c6-a1f8-5df99d08d395' } };
export const ROUTES = [
  { value: 'im-single', text: 'Intramuscular, single dose' },
  { value: 'iv-single', text: 'Intravenous, single dose' },
  { value: 'parenteral-multiple', text: 'Intravenous or intramuscular, multiple doses' },
  { value: 'oral', text: 'Tablets, continuing after IV or IM dosing' },
];
export const RENAL = [
  { value: 'no', text: 'Not renally impaired' },
  { value: 'impaired', text: 'Renally impaired' },
  { value: 'advanced', text: 'Advanced renal impairment' },
];
// [usual, reduced group] for each route; `max` is the daily ceiling in mg.
export const DOSES = {
  'im-single': { usual: 'one dose of 60 mg', reduced: 'one dose of 30 mg' },
  'iv-single': { usual: 'one dose of 30 mg', reduced: 'one dose of 15 mg' },
  'parenteral-multiple': { usual: '30 mg every 6 hours', reduced: '15 mg every 6 hours', max: [120, 60] },
  oral: { usual: '20 mg once, then 10 mg every 4 to 6 hours as needed', reduced: '10 mg once, then 10 mg every 4 to 6 hours as needed', max: [40, 40] },
};
export const MAX_DAYS = 5;
const NOTE = 'This reports the labels\' dose for the patient group, the daily ceiling and the 5-day limit against what was entered. It is not a recommendation, it covers adults only, and it does not check the labels\' other contraindications and warnings.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function ketorolacLimitCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const route = ROUTES.find((r) => r.value === String(o.route ?? '').trim());
  if (!route) return { valid: false, message: 'Choose the route and regimen: the label gives a different dose for each.' };
  const renal = String(o.renal ?? '').trim();
  if (!RENAL.some((r) => r.value === renal)) return { valid: false, message: 'Say whether the patient is renally impaired. The labels give no number for it; advanced renal impairment is a contraindication.' };
  const f = inputFault([['the age', o.age, 17, 120, 'years'], ['the weight', o.weight, 20, 400, 'kg'], ['the days of ketorolac so far', o.daysSoFar, 0, 30, 'days']]);
  if (f) return { valid: false, message: `${f} The labels dose adults by age and weight and limit ketorolac by any route to 5 days in all.` };
  const dose = DOSES[route.value];
  if (dose.max && blank(o.mg24h)) return { valid: false, message: 'Enter the total ketorolac given in the last 24 hours, in mg (0 if none): the label sets a daily ceiling for this regimen.' };
  if (!blank(o.mg24h)) {
    const mf = inputFault([['the ketorolac given in the last 24 hours', o.mg24h, 0, 1000, 'mg']]);
    if (mf) return { valid: false, message: mf };
  }
  const L = LABELS[route.value === 'oral' ? 'tablets' : 'injection'];
  const row = labelRow(L.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: `The ${L.brand} label's limits are withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label limits are withheld: ${row.why}.`, 'Read the limits from the label in hand.'], note: NOTE };
  }
  const age = Number(o.age); const kg = Number(o.weight); const days = Number(o.daysSoFar);
  const tail = [`Label: ${row.edition}.`];
  if (renal === 'advanced') {
    return { valid: true, flag: 'contraindicated', abnormal: true, band: 'The ketorolac labels list advanced renal impairment as a contraindication.', bandLabel: 'Contraindicated', notes: ['The injection label also contraindicates ketorolac in patients at risk for renal failure due to volume depletion.', ...tail], note: NOTE };
  }
  const why = [age >= 65 ? `age ${age} is 65 or over` : null, renal === 'impaired' ? 'renally impaired' : null, kg < 50 ? `weight ${kg} kg is under 50 kg` : null].filter(Boolean);
  const reduced = why.length > 0;
  const text = reduced ? dose.reduced : dose.usual;
  const notes = [reduced ? `The label's lower-dose group applies: ${why.join('; ')}.` : `None of the label's lower-dose criteria is met (age 65 or over, renally impaired, under 50 kg).`];
  const out = { valid: true, route: route.value, reducedGroup: reduced, labelDose: text, daysRemaining: Math.max(0, MAX_DAYS - days) };
  let flag = 'dose'; let band = `The ${L.brand} label gives ${text}`;
  if (dose.max) {
    const max = dose.max[reduced ? 1 : 0]; const given = Number(o.mg24h); const left = max - given;
    Object.assign(out, { dailyMax: max, mgRemaining: Math.max(0, left) });
    band += `, not to exceed ${max} mg/day.`;
    if (left <= 0) { flag = 'limit-reached'; notes.push(`Given in the last 24 hours: ${given} mg, which is at or above the label's ${max} mg/day ceiling.`); }
    else notes.push(`Given in the last 24 hours: ${given} mg of the label's ${max} mg/day; ${left} mg remain under the ceiling.`);
  } else band += '. This regimen is for single administration only.';
  if (days >= MAX_DAYS) { flag = 'limit-reached'; notes.push(`Ketorolac has been given for ${days} days; the labels say the combined duration by any route is not to exceed 5 days.`); }
  else notes.push(`Ketorolac for ${days} day${days === 1 ? '' : 's'} so far; the labels' combined limit by any route is 5 days, so ${MAX_DAYS - days} remain.`);
  if (route.value === 'oral') notes.push('The tablet label says tablets are only for continuation after IV or IM dosing, are not an initial dose, and that the 4 to 6 hour interval should not be shortened.');
  if (route.value !== 'oral') notes.push('The injection label says not to increase the dose or frequency for breakthrough pain.');
  return {
    ...out, flag, abnormal: flag !== 'dose',
    band: flag === 'limit-reached' ? `${band} A limit on the label is already reached with what was entered.` : band,
    bandLabel: flag === 'limit-reached' ? 'Limit reached' : text.split(',')[0],
    notes: [...notes, ...tail], note: NOTE,
  };
}

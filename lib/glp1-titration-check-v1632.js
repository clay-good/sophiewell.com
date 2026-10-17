// spec-v1632 tool 9: GLP-1 dose escalation, the earliest date the label gives for the next step.
//
// Eight label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Ozempic injection (Novo Nordisk, DailyMed version 20), 2.2: 0.25 mg weekly for 4 weeks, then
//     0.5 mg; "after at least 4 weeks" 1 mg, then 2 mg; "maximum recommended dosage is 2 mg". Type 2
//     diabetes with chronic kidney disease: "the maintenance dosage, 1 mg once weekly, after at least
//     4 weeks on the 0.5 mg dosage".
//   Wegovy (version 19), 2.2 and 2.3. Injection, Table 1: weeks 1-4 0.25 mg; 5-8 0.5 mg; 9-12 1 mg;
//     13-16 1.7 mg; week 17 on, maintenance by indication (cardiovascular: 2.4 mg recommended or
//     1.7 mg; weight reduction, adults: 1.7 or 2.4 mg, and after at least 4 weeks tolerating 2.4 mg
//     "a maximum dosage of 7.2 mg"; weight reduction, 12 and older: 2.4 or 1.7 mg; MASH: 2.4 mg, may
//     be decreased to 1.7 mg). Tablets, Table 2: days 1-30 1.5 mg; 31-60 4 mg; 61-90 9 mg; 91 on 25 mg.
//   Rybelsus and Ozempic tablets (one label, version 14), 2.2: Rybelsus 3 mg days 1-30, 7 mg days
//     31-60, then 7 or 14 mg; Ozempic tablets 1.5 mg, 4 mg, then 4 or 9 mg. "not substitutable on a
//     mg-to-mg basis".
//   Mounjaro (Lilly, version 40), 2.1: 2.5 mg weekly; "2.5 mg increments after at least 4 weeks on the
//     current dose"; maximum 15 mg in adults, 10 mg in pediatric patients.
//   Zepbound (version 40), 2.1 and 2.2: 2.5 mg for 4 weeks, then 5 mg; 2.5 mg increments after at
//     least 4 weeks; maintenance 5, 10 or 15 mg (weight), 10 or 15 mg (sleep apnea); maximum 15 mg.
//   Victoza (version 31), 2.1, adults: 0.6 mg daily for one week; 1.2 mg; 1.8 mg (maximum) "after at
//     least one week" on 1.2 mg.
//   Saxenda (version 22), Table 1: weeks 1 to 5, 0.6, 1.2, 1.8, 2.4 and 3 mg daily; weight change is
//     evaluated at 16 weeks.
//   Trulicity (version 62), 2.1 and 2.2: 0.75 mg; after 4 weeks 1.5 mg; 1.5 mg increments after at
//     least 4 weeks; maximum 4.5 mg (pediatric: 1.5 mg).
//
// The tool reports what the label's schedule permits and when. A dose the label does not list for the
// product is reported as not on the label, not as wrong. Missed doses are a different tool.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseDate, diffDays, todayUtc } from './pa/date.js';

const OZEMPIC = 'adec4fd2-6858-4c99-91d4-531f5f2a2d79'; const WEGOVY = 'ee06186f-2aa3-4990-a760-757579d8f77b';
const ORAL = '27f15fac-7d98-4114-a2ec-92494a91da98'; const MOUNJARO = 'd2d7da5d-ad07-4228-955f-cf7e355c8cc0';
const ZEPBOUND = '487cd7e7-434c-4925-99fa-aa80b1cc776b'; const VICTOZA = '5a9ef4ea-c76a-4d34-a604-27c5b505f5a4';
const SAXENDA = '3946d389-0926-4f77-a708-0acb8153b143'; const TRULICITY = '463050bd-2b1c-40f5-b3c3-0a04bb433309';
const WK = 28; const MO = 30; const D7 = 7;
const DELAY = ' If a step is not tolerated, the label says to consider delaying escalation for 4 weeks.';
const WEGOVY_STEPS = [[0.25, WK], [0.5, WK], [1, WK], [1.7, WK]];
const tirz = (max) => [2.5, 5, 7.5, 10, 12.5, 15].filter((d) => d <= max).map((d) => [d, WK]);

// steps: [dose in mg, days the label keeps the patient on it before the next step]. The last step has
// no next one. `end` is the label's sentence about the top of the schedule.
export const PRODUCTS = [
  { value: 'ozempic', text: 'Ozempic injection: glycemic control', brand: 'Ozempic', setId: OZEMPIC, every: 'weekly', steps: [[0.25, WK], [0.5, WK], [1, WK], [2, WK]], end: 'The maximum recommended dosage is 2 mg once weekly; maintenance is 0.5, 1 or 2 mg by glycemic control.' },
  { value: 'ozempic-ckd', text: 'Ozempic injection: type 2 diabetes with chronic kidney disease', brand: 'Ozempic', setId: OZEMPIC, every: 'weekly', steps: [[0.25, WK], [0.5, WK], [1, WK]], end: 'For type 2 diabetes with chronic kidney disease the label gives a maintenance dosage of 1 mg once weekly.' },
  { value: 'wegovy-cv', text: 'Wegovy injection: cardiovascular risk reduction', brand: 'Wegovy', setId: WEGOVY, every: 'weekly', steps: [...WEGOVY_STEPS, [2.4, WK]], end: 'Maintenance is 2.4 mg (recommended) or 1.7 mg once weekly.' + DELAY },
  { value: 'wegovy-weight-adult', text: 'Wegovy injection: weight reduction, adults', brand: 'Wegovy', setId: WEGOVY, every: 'weekly', steps: [...WEGOVY_STEPS, [2.4, WK], [7.2, WK]], end: 'Maintenance is 1.7 mg or 2.4 mg (recommended); after at least 4 weeks tolerating 2.4 mg, when more weight reduction is indicated, the dosage may be increased to a maximum of 7.2 mg once weekly.' + DELAY },
  { value: 'wegovy-weight-pediatric', text: 'Wegovy injection: weight reduction, 12 years and older', brand: 'Wegovy', setId: WEGOVY, every: 'weekly', steps: [...WEGOVY_STEPS, [2.4, WK]], end: 'Maintenance is 2.4 mg (recommended) or 1.7 mg once weekly.' + DELAY },
  { value: 'wegovy-mash', text: 'Wegovy injection: MASH', brand: 'Wegovy', setId: WEGOVY, every: 'weekly', steps: [...WEGOVY_STEPS, [2.4, WK]], end: 'Maintenance is 2.4 mg once weekly; if it is not tolerated the dosage can be decreased to 1.7 mg, with re-escalation considered.' + DELAY },
  { value: 'wegovy-tablets', text: 'Wegovy tablets', brand: 'Wegovy', setId: WEGOVY, every: 'daily', steps: [[1.5, MO], [4, MO], [9, MO], [25, MO]], end: 'The recommended maintenance dosage of Wegovy tablets is 25 mg once daily.' },
  { value: 'rybelsus', text: 'Rybelsus tablets', brand: 'Rybelsus', setId: ORAL, every: 'daily', steps: [[3, MO], [7, MO], [14, MO]], end: 'From day 61 the label keeps 7 mg, or increases to 14 mg if more glycemic control is needed. Rybelsus and Ozempic tablets are not substitutable milligram for milligram.' },
  { value: 'ozempic-tablets', text: 'Ozempic tablets', brand: 'Ozempic tablets', setId: ORAL, every: 'daily', steps: [[1.5, MO], [4, MO], [9, MO]], end: 'From day 61 the label keeps 4 mg, or increases to 9 mg if more glycemic control is needed. Rybelsus and Ozempic tablets are not substitutable milligram for milligram.' },
  { value: 'mounjaro', text: 'Mounjaro: adults', brand: 'Mounjaro', setId: MOUNJARO, every: 'weekly', steps: tirz(15), end: 'The maximum dosage is 15 mg once weekly in adults.' },
  { value: 'mounjaro-pediatric', text: 'Mounjaro: pediatric patients', brand: 'Mounjaro', setId: MOUNJARO, every: 'weekly', steps: tirz(10), end: 'The maximum dosage is 10 mg once weekly in pediatric patients.' },
  { value: 'zepbound-weight', text: 'Zepbound: weight reduction', brand: 'Zepbound', setId: ZEPBOUND, every: 'weekly', steps: tirz(15), end: 'Maintenance is 5, 10 or 15 mg once weekly; the maximum is 15 mg. The 2.5 mg dosage is for initiation only.' },
  { value: 'zepbound-osa', text: 'Zepbound: obstructive sleep apnea', brand: 'Zepbound', setId: ZEPBOUND, every: 'weekly', steps: tirz(15), end: 'Maintenance is 10 or 15 mg once weekly; the maximum is 15 mg. The 2.5 mg dosage is for initiation only.' },
  { value: 'victoza', text: 'Victoza: adults', brand: 'Victoza', setId: VICTOZA, every: 'daily', steps: [[0.6, D7], [1.2, D7], [1.8, D7]], end: 'The maximum recommended dosage is 1.8 mg once daily; 0.6 mg is for initiation and is not effective for glycemic control in adults.' },
  { value: 'saxenda', text: 'Saxenda', brand: 'Saxenda', setId: SAXENDA, every: 'daily', steps: [[0.6, D7], [1.2, D7], [1.8, D7], [2.4, D7], [3, D7]], end: 'The recommended dosage is 3 mg daily; lower dosages are for titration only. The label evaluates the change in body weight 16 weeks after starting.' },
  { value: 'trulicity', text: 'Trulicity: adults', brand: 'Trulicity', setId: TRULICITY, every: 'weekly', steps: [[0.75, WK], [1.5, WK], [3, WK], [4.5, WK]], end: 'The maximum recommended dosage is 4.5 mg once weekly.' },
  { value: 'trulicity-pediatric', text: 'Trulicity: pediatric patients', brand: 'Trulicity', setId: TRULICITY, every: 'weekly', steps: [[0.75, WK], [1.5, WK]], end: 'The maximum recommended dosage is 1.5 mg once weekly in pediatric patients.' },
];
const NOTE = 'This reports what the label\'s escalation schedule gives for the dose and dates entered. It is not a recommendation: every label says to consider tolerability, and several steps are "may be increased", not "must". For a missed dose, the label\'s own rule is in Missed Dose: What the Label Says.';
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, days) => new Date(d.getTime() + days * 86400000);

export function glp1TitrationCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const product = PRODUCTS.find((p) => p.value === String(o.product ?? '').trim());
  if (!product) return { valid: false, message: 'Choose the product and indication. Each label has its own schedule.' };
  const f = inputFault([['the current dose', o.currentDose, null, 100, 'mg']]);
  if (f) return { valid: false, message: f };
  const start = parseDate(o.startDate);
  if (!start) return { valid: false, message: 'Enter the date the current dose began, as YYYY-MM-DD.' };
  const asOfGiven = !(o.asOf === undefined || o.asOf === null || String(o.asOf).trim() === '');
  const asOf = asOfGiven ? parseDate(o.asOf) : todayUtc(now);
  if (!asOf) return { valid: false, message: 'Enter today\'s date as YYYY-MM-DD, or leave it blank to use today.' };
  const days = diffDays(asOf, start);
  if (days < 0) return { valid: false, message: `The current dose began on ${iso(start)}, which is after ${iso(asOf)}. Check the two dates.` };
  if (days > 3660) return { valid: false, message: 'The current dose began more than 10 years before the date checked. Check the start date.' };
  const row = labelRow(product.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, product: product.value, band: `The ${product.brand} label's schedule is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${product.brand} label schedule is withheld: ${row.why}.`, 'Read the schedule from the label in hand.'], note: NOTE };
  }
  const dose = Number(o.currentDose);
  const unit = product.every === 'weekly' ? 'once weekly' : 'once daily';
  const tail = [product.end, `Dates: the current dose began ${iso(start)}; checked as of ${iso(asOf)}${asOfGiven ? '' : ' (today)'}.`, `Label: ${row.edition}.`];
  const i = product.steps.findIndex(([d]) => d === dose);
  if (i < 0) {
    const top = product.steps[product.steps.length - 1][0];
    const above = dose > top;
    // The same label may list the dose for another product or indication (Rybelsus 4 mg is an Ozempic tablets step).
    const elsewhere = PRODUCTS.filter((p) => p.setId === product.setId && p !== product && p.steps.some(([d]) => d === dose)).map((p) => p.text);
    const notes = ['A dose the label does not list is reported as that; the tool does not call it wrong.'];
    if (elsewhere.length) notes.push(`The same label lists ${dose} mg for: ${elsewhere.join('; ')}.`);
    return {
      valid: true, product: product.value, onLabel: false, labelUrl: row.url, flag: above ? 'above-label-maximum' : 'not-on-label', abnormal: true, daysAtDose: days,
      band: above
        ? `${dose} mg is above ${top} mg, the highest dose the ${product.brand} label lists for this product and indication. Its steps: ${product.steps.map(([d]) => d).join(', ')} mg ${unit}.`
        : `${dose} mg is not a step the ${product.brand} label lists for this product and indication. Its steps: ${product.steps.map(([d]) => d).join(', ')} mg ${unit}.`,
      bandLabel: above ? 'Above the label maximum' : 'Not a label step', notes: [...notes, ...tail], note: NOTE,
    };
  }
  const atDose = product.every === 'weekly' ? `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} (${days} days)` : `${days} day${days === 1 ? '' : 's'}`;
  const out = { valid: true, product: product.value, onLabel: true, daysAtDose: days, labelUrl: row.url };
  if (i === product.steps.length - 1) {
    return { ...out, flag: 'top-of-schedule', nextDose: null, abnormal: false, band: `${dose} mg ${unit} is the last step of the ${product.brand} label's schedule for this indication; ${atDose} at this dose.`, bandLabel: 'Last step', notes: tail, note: NOTE };
  }
  const [, hold] = product.steps[i]; const next = product.steps[i + 1][0];
  const earliest = plus(start, hold); const due = days >= hold;
  const span = product.every === 'weekly' ? `${hold / 7} weeks` : hold === D7 ? 'one week' : `${hold} days`;
  return {
    ...out, flag: due ? 'next-step-permitted' : 'not-yet', nextDose: next, earliestDate: iso(earliest), daysUntil: Math.max(0, hold - days), abnormal: false,
    band: due
      ? `The ${product.brand} label permits ${next} mg ${unit} from ${iso(earliest)}: ${atDose} at ${dose} mg, and the label's step is after ${span}.`
      : `The ${product.brand} label permits ${next} mg ${unit} from ${iso(earliest)}, ${hold - days} day${hold - days === 1 ? '' : 's'} from the date checked: ${atDose} at ${dose} mg so far, and the label's step is after ${span}.`,
    bandLabel: due ? `${next} mg permitted` : `${next} mg from ${iso(earliest)}`,
    notes: tail, note: NOTE,
  };
}

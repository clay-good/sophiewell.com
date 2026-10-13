// spec-v1639 tool 5: a missed dose of a long-acting injectable antipsychotic, by the label's table.
//
// Sources: section 2 of each label on DailyMed, re-read October 12, 2026.
//   Aristada (aripiprazole lauroxil; set id 17a8d11b-73b0-4833-a0b4-cf1ef85edefb, version 32), 2.2
//     "Missed Doses", Table 3 (column order confirmed in the label's table markup), and 2.3 "Early
//     Dosing": "an ARISTADA injection should not be given earlier than 14 days after the previous
//     injection."
//   Abilify Maintena (ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6, version 27), 2.3: second or third dose,
//     "more than 4 weeks and less than 5 weeks ... administer the injection as soon as possible";
//     "more than 5 weeks ... restart treatment with either 1-day initiation or 14-day initiation";
//     fourth or subsequent doses, the same with 6 weeks.
//   Abilify Asimtufii (da4c07fd-1130-4341-bb44-63acfa4162be, version 6), 2.3: "more than 8 weeks and
//     less than 14 weeks ... as soon as possible. The once every 2 month schedule should be
//     resumed"; "more than 14 weeks ... restart treatment".
//   Uzedy (734eb776-4be0-4808-834b-0d8b0f9e021e, version 8), 2.4, and Perseris
//     (a4f21b1a-5691-4b14-a56d-651962d06f39, version 18), section 2: "administer the next ...
//     injection as soon as possible." No band table.
//   Risperdal Consta (bb34ee82-d2c2-43b8-ba21-2825c0954691, version 38) and Rykindo
//     (58534c96-96f5-4c2e-a061-92d4506aee91, version 10), 2.5: "There are no data to specifically
//     address reinitiation of treatment." No missed-dose rule is stated.
//
//   Invega Sustenna (1af14e42-951d-414d-8564-5d5fce138554, version 41), 2.3, Tables 2 and 3; Erzofri
//     (492bf9dd-868e-421a-92db-8cca8973aac1, version 7), 2.2, Table 2; Invega Trinza
//     (c39e65d7-fa44-4e4c-8b12-a654d3ed0eae, version 25), 2.3, Table 2; Invega Hafyera
//     (6cd61892-d2cb-434d-83ed-5c1b2c4e7a0b, version 8), 2.3, Tables 3 and 4. Each row's wording is
//     in PALI below.
//
// MONTHS. The paliperidone labels count some bands in months and do not define a month. This tool
// counts calendar months from the date of the last injection, takes "3 1/2 months" as 3 calendar
// months and 15 days, and within 3 days of any month-counted boundary shows both neighboring rows
// and says the label does not define the edge (spec-v1639, Edges). The reading is the spec's; it has
// not been confirmed by the owner.
//
// Weeks are 7 days. Several labels leave a boundary undefined ("more than 4 weeks and less than 5"
// and "more than 5": exactly 5 weeks is in neither); at such a boundary both rows are shown. The
// tool reports the label's row. It does not choose a regimen.
//
// Pure: no DOM, no network. Dates are entered. `now` is read only to check the label edition.

import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';
import { labelRow } from './label-row.js';

const ARISTADA = '17a8d11b-73b0-4833-a0b4-cf1ef85edefb'; const MAINTENA = 'ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6'; const ASIMTUFII = 'da4c07fd-1130-4341-bb44-63acfa4162be';
const A_NONE = 'No supplementation required.';
const A_SUPP = 'Supplement with a single dose of Aristada Initio, or with 7 days of oral aripiprazole.';
const A_REINIT = 'Re-initiate with a single dose of Aristada Initio and a single dose of oral aripiprazole 30 mg, or supplement with 21 days of oral aripiprazole.';
const aristada = (mg, w1, w2) => ({ value: `aristada-last-dose-${mg}`, text: `Aristada, last dose ${mg === 1064 ? '1,064' : mg} mg`, brand: 'Aristada', setId: ARISTADA, kind: 'aristada', w1, w2, sec: '2.2, Table 3' });
// Paliperidone palmitate. edges: [weeks | null, months | null, extra days, the edge day belongs to
// the row below it]; rows: one more than edges, each [flag, what the label says].
const SUS = '1af14e42-951d-414d-8564-5d5fce138554'; const ERZ = '492bf9dd-868e-421a-92db-8cca8973aac1'; const TRI = 'c39e65d7-fa44-4e4c-8b12-a654d3ed0eae'; const HAF = '6cd61892-d2cb-434d-83ed-5c1b2c4e7a0b';
const MAINT_EDGES = [[4, null, 0, false], [6, null, 0, true], [null, 6, 0, true]];
const maint = (two, restart) => [
  ['not-past-the-first-band', 'Less than 4 weeks since the last injection: the label\'s table starts at 4 weeks. The label allows a monthly injection up to 7 days before or after the monthly time point.'],
  ['as-soon-as-possible', '4 to 6 weeks: resume regular monthly dosing as soon as possible at the previously stabilized dose, followed by injections at monthly intervals.'],
  ['two-injections-one-week-apart', `More than 6 weeks to 6 months: ${two} Administer a deltoid injection as soon as possible and a second deltoid injection 1 week later at the same dose; then resume the previously stabilized dose 1 month after the second injection.`],
  ['restart', `More than 6 months: ${restart}`],
];
const pali = (value, text, brand, setId, sec, edges, rows, since = 'last injection') => ({ value, text, brand, setId, kind: 'bands', sec, edges, rows, since });
const SUS_RESTART = 'restart with the recommended initiation: a 234 mg deltoid injection on Day 1 and a 156 mg deltoid injection 1 week later; then resume the previously stabilized dose 1 month after the second injection.';
const ERZ_RESTART = 'restart with the recommended initiation: a 351 mg deltoid injection on Day 1; then resume the previously stabilized dose 1 month after the initial injection.';
const SAME = 'resume the same dose the patient was previously stabilized on.'; const TWO156 = 'the patient was stabilized on 234 mg, so the first 2 injections should each be 156 mg.';
const TRINZA = (mg, pp1m) => pali(`trinza-last-${mg}`, `Invega Trinza, last dose ${mg} mg`, 'Invega Trinza', TRI, '2.3', [[null, 3, 15, true], [null, 4, 0, false], [null, 9, 0, true]], [
  ['not-past-the-first-band', '3 1/2 months or less since the last injection: the label\'s missed-dose rows start at more than 3 1/2 months. The label allows the injection up to 2 weeks before or after the 3-month time point.'],
  ['as-soon-as-possible', `More than 3 1/2 months, up to but less than 4 months: the previously administered Invega Trinza dose (${mg} mg) as soon as possible, then continue with the 3-month injections.`],
  ['re-initiate-with-monthly-product', `4 months up to and including 9 months: do NOT administer the next dose of Invega Trinza. Table 2: Invega Sustenna ${pp1m} mg on Day 1 and ${pp1m} mg on Day 8 (deltoid), then Invega Trinza ${mg} mg 1 month after Day 8.`],
  ['restart', 'More than 9 months: re-initiate with the 1-month paliperidone palmitate injection as its prescribing information describes; Invega Trinza can be resumed after at least 4 months of adequate treatment with it.'],
]);
const HAFYERA = (mg, text, once) => pali(`hafyera-last-${mg}`, `Invega Hafyera, last dose ${text} mg`, 'Invega Hafyera', HAF, '2.3', [[null, 6, 21, true], [null, 8, 0, false], [null, 11, 0, true]], [
  ['not-past-the-first-band', '6 months and 3 weeks or less since the last dose: inside the label\'s dosing window (up to 2 weeks before or 3 weeks after the scheduled 6-month dose).'],
  ['re-initiate-with-monthly-product', `More than 6 months and 3 weeks, but less than 8 months: do not administer the next dose of Invega Hafyera. Table 3: the once-a-month paliperidone palmitate product ${once} mg on Day 1 (deltoid), then Invega Hafyera ${text} mg 1 month after Day 1.`],
  ['re-initiate-with-monthly-product', `8 months up to and including 11 months: do not administer the next dose of Invega Hafyera. Table 4: the once-a-month product 156 mg on Day 1 and 156 mg on Day 8 (deltoid), then Invega Hafyera ${text} mg 1 month after Day 8.`],
  ['restart', 'More than 11 months: re-initiate with a once-a-month paliperidone palmitate product as its prescribing information describes; Invega Hafyera can be resumed after at least 4 months of adequate treatment with it.'],
]);
const PALI = [
  pali('sustenna-second-initiation', 'Invega Sustenna, second initiation dose missed (date of the FIRST injection)', 'Invega Sustenna', SUS, '2.3, Table 2', [[1, null, 4, true], [4, null, 0, false], [7, null, 0, true]], [
    ['not-past-the-first-band', 'Within one week plus 4 days of the first injection: inside the label\'s window for the second initiation dose (4 days before or after the one-week time point).'],
    ['as-soon-as-possible', 'Less than 4 weeks since the first injection: the second initiation dose of 156 mg in the deltoid as soon as possible; a third injection of 117 mg 5 weeks after the first injection (regardless of the timing of the second); thereafter regular monthly dosing.'],
    ['two-injections-one-week-apart', '4 to 7 weeks since the first injection: two injections of 156 mg, a deltoid injection as soon as possible and a second deltoid injection 1 week later; thereafter regular monthly dosing.'],
    ['restart', 'More than 7 weeks since the first injection: restart with the recommended initiation, a 234 mg deltoid injection on Day 1 and a 156 mg deltoid injection 1 week later; thereafter regular monthly dosing.'],
  ], 'first injection'),
  pali('sustenna-maintenance-39-to-156', 'Invega Sustenna, maintenance dose missed (stabilized on 39 to 156 mg)', 'Invega Sustenna', SUS, '2.3, Table 3', MAINT_EDGES, maint(SAME, SUS_RESTART)),
  pali('sustenna-maintenance-234', 'Invega Sustenna, maintenance dose missed (stabilized on 234 mg)', 'Invega Sustenna', SUS, '2.3, Table 3', MAINT_EDGES, maint(TWO156, SUS_RESTART)),
  pali('erzofri-stabilized-39-to-156', 'Erzofri, dose missed (stabilized on 39 to 156 mg)', 'Erzofri', ERZ, '2.2, Table 2', MAINT_EDGES, maint(SAME, ERZ_RESTART)),
  pali('erzofri-stabilized-234', 'Erzofri, dose missed (stabilized on 234 mg)', 'Erzofri', ERZ, '2.2, Table 2', MAINT_EDGES, maint(TWO156, ERZ_RESTART)),
  TRINZA(273, 78), TRINZA(410, 117), TRINZA(546, 156), TRINZA(819, 156),
  HAFYERA(1092, '1,092', 156), HAFYERA(1560, '1,560', 234),
];
export const PRODUCTS = [
  ...PALI,
  aristada(441, 6, 7), aristada(662, 8, 12), aristada(882, 8, 12), aristada(1064, 10, 12),
  { value: 'maintena-second-or-third-dose', text: 'Abilify Maintena, second or third dose missed', brand: 'Abilify Maintena', setId: MAINTENA, kind: 'open-band', from: 4, to: 5, sec: '2.3', restart: 'Restart treatment with either 1-day initiation or 14-day initiation with Abilify Maintena.', quote: '"If the second or third doses are missed: If more than 4 weeks and less than 5 weeks have elapsed since the last injection, administer the injection as soon as possible. If more than 5 weeks have elapsed since the last injection, restart treatment with either 1-day initiation or 14-day initiation with ABILIFY MAINTENA".' },
  { value: 'maintena-fourth-or-later-dose', text: 'Abilify Maintena, fourth or later dose missed', brand: 'Abilify Maintena', setId: MAINTENA, kind: 'open-band', from: 4, to: 6, sec: '2.3', restart: 'Restart treatment with either 1-day initiation or 14-day initiation with Abilify Maintena.', quote: '"If the fourth or subsequent doses are missed: If more than 4 weeks and less than 6 weeks have elapsed since the last injection, administer the injection as soon as possible. If more than 6 weeks have elapsed since the last injection, restart treatment with either 1-day initiation or 14-day initiation with ABILIFY MAINTENA".' },
  { value: 'asimtufii-two-month', text: 'Abilify Asimtufii (every 2 months)', brand: 'Abilify Asimtufii', setId: ASIMTUFII, kind: 'open-band', from: 8, to: 14, sec: '2.3', restart: 'Restart treatment with either 1-day initiation or 14-day initiation with Abilify Asimtufii.', quote: '"If more than 8 weeks and less than 14 weeks have elapsed since the last injection, administer the next dose of ABILIFY ASIMTUFII as soon as possible. The once every 2 month schedule should be resumed. If more than 14 weeks have elapsed since the last injection, restart treatment with either 1-day initiation or 14-day initiation with ABILIFY ASIMTUFII".' },
  { value: 'uzedy-risperidone-sc', text: 'Uzedy (risperidone subcutaneous)', brand: 'Uzedy', setId: '734eb776-4be0-4808-834b-0d8b0f9e021e', kind: 'sentence', sec: '2.4', quote: '"When a dose of UZEDY is missed, administer the next UZEDY injection as soon as possible. Do not administer more frequently than recommended."' },
  { value: 'perseris-risperidone-sc', text: 'Perseris (risperidone subcutaneous)', brand: 'Perseris', setId: 'a4f21b1a-5691-4b14-a56d-651962d06f39', kind: 'sentence', sec: '2.1', quote: '"When a dose of PERSERIS is missed, administer the next PERSERIS injection as soon as possible." The label also says neither a loading dose nor any supplemental oral risperidone is recommended.' },
  { value: 'risperdal-consta-im', text: 'Risperdal Consta (risperidone every 2 weeks)', brand: 'Risperdal Consta', setId: 'bb34ee82-d2c2-43b8-ba21-2825c0954691', kind: 'no-rule', sec: '2.5', quote: '"There are no data to specifically address reinitiation of treatment. When restarting patients who have had an interval off treatment with RISPERDAL CONSTA, supplementation with oral RISPERDAL (or another antipsychotic medication) should be administered."' },
  { value: 'rykindo-risperidone-im', text: 'Rykindo (risperidone every 2 weeks)', brand: 'Rykindo', setId: '58534c96-96f5-4c2e-a061-92d4506aee91', kind: 'no-rule', sec: '2.5', quote: '"There are no data to specifically address reinitiation of treatment. When restarting patients who have had an interval off treatment with RYKINDO, the previously established dosage should be reinitiated if there has been no change in the patient\'s general medical condition. Supplementation with oral risperidone is also required."' },
];
const POSTURE = 'This is the label\'s row for these dates. It is not advice for a particular patient, and it does not choose a regimen.';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function laiAntipsychoticMissedDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product and the row that fits (last dose, stabilized dose, or which dose was missed).' };
  const last = date(o.lastInjection);
  if (!last) return { valid: false, message: 'Enter the date of the last injection.' };
  const today = date(o.today);
  if (!today) return { valid: false, message: 'Enter today\'s date.' };
  const days = Math.round((today.getTime() - last.getTime()) / 86400000);
  if (days < 0) return { valid: false, message: 'Enter a date for today that is not before the last injection.' };
  if (days > 1100) return { valid: false, message: 'Enter dates no more than three years apart.' };
  const lr = labelRow(p.setId, now, table);
  const base = { valid: true, product: p.value, labelUrl: lr.url };
  if (!lr.answers) {
    const w = [`The ${p.brand} label's missed-dose rule is withheld: ${lr.why}.`, 'Read section 2 of the label in hand.', POSTURE];
    return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's rule is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: w, note: w.join(' ') };
  }
  const at = (weeks) => addCalendarDaysUtc(last, weeks * 7);
  const notes = [`${days} day${days === 1 ? '' : 's'} (${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} and ${days % 7} day${days % 7 === 1 ? '' : 's'}) since the last injection on ${say(last)}.`];
  let band; let flag; let abnormal = true;
  if (p.kind === 'bands') {
    notes[0] = notes[0].replace('the last injection', `the ${p.since}`);
    const edgeAt = ([w, mo, extra]) => addCalendarDaysUtc(mo === null ? last : addMonthsUtc(last, mo), (w === null ? 0 : w * 7) + extra);
    const at = p.edges.map(edgeAt);
    let k = 0;
    p.edges.forEach((e, i) => { const t = at[i].getTime(); if (e[3] ? today.getTime() > t : today.getTime() >= t) k = i + 1; });
    const near = p.edges.findIndex((e, i) => e[1] !== null && Math.abs(today.getTime() - at[i].getTime()) <= 3 * 86400000);
    if (near >= 0) {
      flag = 'label-leaves-this-open';
      band = `Within 3 days of a boundary the label counts in months (${say(at[near])}): both rows are shown.`;
      notes.push(`Row on one side: ${p.rows[near][1]}`); notes.push(`Row on the other side: ${p.rows[near + 1][1]}`);
      notes.push('The label counts this boundary in months and does not define a month, so the tool does not pick a side.');
    } else {
      flag = p.rows[k][0]; abnormal = k > 0;
      band = `The label's row: ${p.rows[k][1].split(': ')[0]}.`;
      notes.push(p.rows[k][1]);
      if (k < at.length) notes.push(`The row changes ${p.edges[k][3] ? 'after' : 'on'} ${say(at[k])}.`);
    }
    notes.push('Months are counted as calendar months from that date ("3 1/2 months" as 3 months and 15 days); weeks are 7 days. The labels do not define a month.');
    notes.push(`${p.brand} label, section ${p.sec}.`);
  } else if (p.kind === 'aristada') {
    const d1 = p.w1 * 7; const d2 = p.w2 * 7;
    const row = days <= d1 ? A_NONE : days <= d2 ? A_SUPP : A_REINIT;
    flag = days <= d1 ? 'no-supplementation' : days <= d2 ? 'supplement' : 're-initiate';
    abnormal = days > d1;
    band = `The label's row: ${row}`;
    notes.push(`Table 3, last dose ${p.text.split('last dose ')[1]}: ${p.w1} weeks or less, no supplementation required; more than ${p.w1} and up to ${p.w2} weeks, a single dose of Aristada Initio or 7 days of oral aripiprazole; more than ${p.w2} weeks, re-initiation with Aristada Initio and a single 30 mg oral dose, or 21 days of oral aripiprazole.`);
    notes.push(days <= d1 ? `The row changes after ${say(at(p.w1))} (${p.w1} weeks).` : days <= d2 ? `The row changes after ${say(at(p.w2))} (${p.w2} weeks).` : `The last row began after ${say(at(p.w2))}.`);
    notes.push('The label: "When a dose of ARISTADA is missed, administer the next injection of ARISTADA as soon as possible." The oral supplement is the same oral aripiprazole dose the patient took when Aristada was begun (table footnote).');
    notes.push(days < 14 ? `Early dosing: the label says an injection "should not be given earlier than 14 days after the previous injection", which is ${say(addCalendarDaysUtc(last, 14))}.` : 'Early dosing: 14 days since the previous injection have passed.');
  } else if (p.kind === 'open-band') {
    const lo = p.from * 7; const hi = p.to * 7;
    if (days <= lo) {
      flag = 'not-past-the-first-band'; abnormal = false;
      band = `${p.from} weeks or less since the last injection: the label's missed-dose rows start at "more than ${p.from} weeks".`;
      notes.push(`The first row begins after ${say(at(p.from))}.`);
    } else if (days < hi) {
      flag = 'as-soon-as-possible';
      band = `The label's row: administer the injection as soon as possible (more than ${p.from} and less than ${p.to} weeks).`;
      notes.push(`The row changes at ${say(at(p.to))} (${p.to} weeks).`);
    } else if (days === hi) {
      flag = 'label-leaves-this-open';
      band = `Exactly ${p.to} weeks: the label says "less than ${p.to} weeks" (as soon as possible) and "more than ${p.to} weeks" (restart), and names neither for exactly ${p.to}.`;
      notes.push(`Both rows are shown; the label does not define the edge. As soon as possible: administer the injection. Restart: ${p.restart}`);
    } else {
      flag = 'restart';
      band = `The label's row: ${p.restart.replace(/\.$/, '')} (more than ${p.to} weeks).`;
      notes.push(`That row began after ${say(at(p.to))}.`);
    }
    notes.push(`${p.brand} label, section ${p.sec}: ${p.quote}`);
  } else if (p.kind === 'sentence') {
    flag = 'as-soon-as-possible';
    band = 'The label states one sentence and no band table: the next injection as soon as possible.';
    notes.push(`${p.brand} label, section ${p.sec}: ${p.quote}`);
    notes.push('The label gives no time bands, so the days since the last injection do not change what it says.');
  } else {
    flag = 'label-states-no-rule';
    band = 'The label states no missed-dose rule.';
    notes.push(`${p.brand} label, section ${p.sec}: ${p.quote}`);
  }
  notes.push(`Label: ${lr.edition}.`);
  notes.push(POSTURE);
  return { ...base, daysSinceLast: days, flag, abnormal, band, bandLabel: p.text, notes, note: notes.join(' ') };
}

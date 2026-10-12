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
// NOT BUILT: the paliperidone palmitate products (Invega Sustenna, Erzofri, Invega Trinza, Invega
// Hafyera). Their bands are counted in months, the labels do not define a month, and the spec holds
// that reading for the owner.
//
// Weeks are 7 days. Several labels leave a boundary undefined ("more than 4 weeks and less than 5"
// and "more than 5": exactly 5 weeks is in neither); at such a boundary both rows are shown. The
// tool reports the label's row. It does not choose a regimen.
//
// Pure: no DOM, no network. Dates are entered. `now` is read only to check the label edition.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { labelRow } from './label-row.js';

const ARISTADA = '17a8d11b-73b0-4833-a0b4-cf1ef85edefb'; const MAINTENA = 'ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6'; const ASIMTUFII = 'da4c07fd-1130-4341-bb44-63acfa4162be';
const A_NONE = 'No supplementation required.';
const A_SUPP = 'Supplement with a single dose of Aristada Initio, or with 7 days of oral aripiprazole.';
const A_REINIT = 'Re-initiate with a single dose of Aristada Initio and a single dose of oral aripiprazole 30 mg, or supplement with 21 days of oral aripiprazole.';
const aristada = (mg, w1, w2) => ({ value: `aristada-last-dose-${mg}`, text: `Aristada, last dose ${mg === 1064 ? '1,064' : mg} mg`, brand: 'Aristada', setId: ARISTADA, kind: 'aristada', w1, w2, sec: '2.2, Table 3' });
export const PRODUCTS = [
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
  if (!p) return { valid: false, message: 'Choose the product. The paliperidone palmitate injections are not covered yet.' };
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
  if (p.kind === 'aristada') {
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
  notes.push('Not covered here: the paliperidone palmitate injections (Invega Sustenna, Erzofri, Invega Trinza, Invega Hafyera), whose bands are counted in months.');
  notes.push(`Label: ${lr.edition}.`);
  notes.push(POSTURE);
  return { ...base, daysSinceLast: days, flag, abnormal, band, bandLabel: p.text, notes, note: notes.join(' ') };
}

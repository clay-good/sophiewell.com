// spec-v1689 (closes spec-v1655 tool 5): WHO hand hygiene compliance from observed opportunities.
//
// Source: WHO, "Hand Hygiene Technical Reference Manual: to be used by health-care workers, trainers
// and observers of hand hygiene practices", 2009 (ISBN 9789241598606), read November 7, 2026 from WHO
// IRIS (iris.who.int/handle/10665/44196):
//
//   Section III.7, "Reporting hand hygiene compliance": "Compliance with hand hygiene is the ratio of
//   the number of performed actions to the number of opportunities and is expressed by the following
//   formula: Compliance (%) = Performed actions / Opportunities X 100".
//
//   The same section's five reporting rules, which decide what may be counted:
//     a) "at least one indication for hand hygiene must be observed to define an opportunity";
//     b) "each opportunity requires one hand hygiene action";
//     c) "one action may apply to more than one indication";
//     d) "a documented action may be either positive or negative provided it corresponds to an
//        opportunity";
//     e) "observation of a positive action does not always imply the existence of an opportunity."
//
//   Definition of terms: a hand hygiene opportunity is the "[m]oment during health-care activities when
//   hand hygiene is necessary to interrupt germ transmission by hands. It constitutes the denominator
//   for calculating hand hygiene compliance". An indication is the "[r]eason for a hand hygiene action".
//
//   Section III.6 / Figure 8: in one observation the observer "identified nine indications", "counted
//   six opportunities", and "observed four positive (performed) hand hygiene actions of which three are
//   linked to opportunities". So the numerator is 3, not 4, and compliance is 50%.
//
//   Section III.8: "Compliance describes an exact equivalence between the number of actions and the
//   number of opportunities. Non-compliance is when the number of opportunities exceeds the number of
//   actions performed."
//
//   Section III.8's principles: "gather data on 200 opportunities per observation per unit (either
//   ward, department or professional category, etc) per observation period".
//
// WHY MORE ACTIONS THAN OPPORTUNITIES IS REFUSED, NOT DIVIDED. Rule (e) says a performed action need
// not sit on an opportunity, and rule (d) admits an action only when it does correspond to one. By the
// manual's own worked example, the four actions seen are not the numerator; the three on opportunities
// are. A count of actions above the count of opportunities therefore means actions without an
// opportunity were included, and dividing them would state a compliance above 100% that the manual's
// definition excludes. The tool says which figure to re-read instead of printing a number.
//
// NO TARGET RATE. The manual sets none, so neither does this: the result reads the percentage and its
// denominator and stops. The 200-opportunity principle is reported as a precision caveat on the
// denominator, never as a pass mark.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// The five moments, in the manual's own order and words ("My five moments for hand hygiene",
// section I.5.1). The tool reports per moment because that is the shape the manual's own observation
// form records; a moment left blank is simply not counted.
export const MOMENTS = [
  { key: 'before-patient', n: 1, label: 'Before touching a patient' },
  { key: 'before-aseptic', n: 2, label: 'Before a clean / aseptic procedure' },
  { key: 'after-fluid', n: 3, label: 'After body fluid exposure risk' },
  { key: 'after-patient', n: 4, label: 'After touching a patient' },
  { key: 'after-surroundings', n: 5, label: 'After touching patient surroundings' },
];

const MIN_OPPORTUNITIES = 200;

const NOTE = 'Compliance is the performed actions over the opportunities that required them, as the WHO Hand Hygiene Technical Reference Manual (2009) section III.7 states it. An opportunity is a moment when hand hygiene was necessary; several indications arising together are one opportunity needing one action. The manual sets no target rate, so none is shown.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function pct(actions, opportunities) {
  return Math.round((actions / opportunities) * 1000) / 10;
}

// One moment's pair. Returns { skipped } when both are blank, { message } on a fault.
function readPair(label, actions, opportunities) {
  if (blank(actions) && blank(opportunities)) return { skipped: true };
  const f = inputFault([
    [`the performed actions for ${label}`, actions, 0, 1000000, ''],
    [`the opportunities for ${label}`, opportunities, 0, 1000000, ''],
  ]);
  if (f) return { message: f };
  const a = Number(String(actions).trim());
  const o = Number(String(opportunities).trim());
  if (!Number.isInteger(a) || !Number.isInteger(o)) {
    return { message: `The actions and opportunities for ${label} are counts, so enter whole numbers.` };
  }
  if (o === 0) {
    return { message: `No opportunity was observed for ${label}, so it has no compliance figure. Leave both of its fields blank, or enter the opportunities that were observed.` };
  }
  // Rule (d) and (e): only an action that corresponds to an opportunity is counted.
  if (a > o) {
    return {
      message: `More actions than opportunities were entered for ${label} (${a} actions, ${o} opportunities). `
        + 'The manual counts a performed action only where it corresponds to an opportunity, and a positive '
        + 'action does not always sit on one, so the extra actions do not belong in the numerator. Re-read '
        + 'the two counts: in the manual\'s own example, four positive actions were seen and three were '
        + 'linked to opportunities, giving 3 of 6.',
    };
  }
  return { actions: a, opportunities: o };
}

export function handHygieneCompliance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rows = [];
  for (const m of MOMENTS) {
    const r = readPair(`moment ${m.n}, ${m.label.toLowerCase()}`, o[`${m.key}Actions`], o[`${m.key}Opportunities`]);
    if (r.message) return { valid: false, message: r.message };
    if (r.skipped) continue;
    rows.push({ ...m, actions: r.actions, opportunities: r.opportunities, compliance: pct(r.actions, r.opportunities) });
  }

  if (!rows.length) {
    return {
      valid: false,
      message: 'Enter the performed actions and the opportunities for at least one of the five moments. '
        + 'A moment that was not observed is left blank rather than entered as zero.',
    };
  }

  const actions = rows.reduce((n, r) => n + r.actions, 0);
  const opportunities = rows.reduce((n, r) => n + r.opportunities, 0);
  const overall = pct(actions, opportunities);

  const notes = [];
  // Rule (e): "observation of a positive action does not always imply the existence of an
  // opportunity." Two counts cannot show whether an action without an opportunity was included --
  // in the manual's own example four positive actions were seen and three belonged in the
  // numerator -- so the output states the rule rather than letting 4 of 6 pass for compliance.
  notes.push('Count a performed action only where it answered an opportunity. A positive action does not always sit on one: in the manual\'s own observation four positive actions were seen and three were linked to opportunities, giving 3 of 6 and not 4 of 6.');
  for (const r of rows) {
    notes.push(`Moment ${r.n}, ${r.label.toLowerCase()}: ${r.compliance}% (${r.actions} of ${r.opportunities} opportunities).`);
  }
  if (rows.length < MOMENTS.length) {
    const seen = rows.map((r) => r.n).join(', ');
    notes.push(`Only moment${rows.length === 1 ? '' : 's'} ${seen} ${rows.length === 1 ? 'was' : 'were'} observed, so this figure covers ${rows.length} of the five moments and not hand hygiene overall.`);
  }
  if (opportunities < MIN_OPPORTUNITIES) {
    notes.push(`The manual's observation principles ask for data on ${MIN_OPPORTUNITIES} opportunities per observation per unit per period; ${opportunities} were entered, so this percentage is less precise than one gathered to that principle. It is not a failing figure, only a smaller denominator.`);
  }

  return {
    valid: true,
    compliance: overall,
    actions,
    opportunities,
    moments: rows.map((r) => ({ moment: r.n, label: r.label, actions: r.actions, opportunities: r.opportunities, compliance: r.compliance })),
    abnormal: false,
    band: `Hand hygiene compliance ${overall}%: ${actions} performed action${actions === 1 ? '' : 's'} over ${opportunities} opportunit${opportunities === 1 ? 'y' : 'ies'}.`,
    bandLabel: `${overall}%`,
    notes,
    note: NOTE,
  };
}

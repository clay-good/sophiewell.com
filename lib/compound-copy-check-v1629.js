// spec-v1629 tool 24: "essentially a copy" check for a compounded drug (section 503A).
//
// FDA, Compounded Drug Products That Are Essentially Copies of a Commercially Available Drug Product
// Under Section 503A of the Federal Food, Drug, and Cosmetic Act (guidance for industry, January
// 2018, docket FDA-2016-D-1309), re-read on October 11, 2026. It is listed as final on FDA's site.
//   Commercially available: "a marketed drug product", not one that "has been discontinued and is no
//     longer marketed" or that "appears on the FDA drug shortage list" ("currently in shortage"
//     status, not "resolved").
//   Essentially a copy if the compounded drug has the same active ingredient(s), "the same, similar,
//     or an easily substitutable dosage strength", and the commercial product "can be used by the
//     same route of administration as prescribed", unless a prescriber determines that a change
//     "produces, for that patient, a significant difference" (section 503A(b)(2)).
//   Similar strength: "within 10% of the dosage strength of the commercially available drug product".
//   Easily substitutable: reachable "by administration of fractional or multiple doses"; the
//     guidance's example is a compounded 50 mg tablet against a commercial 25 mg tablet.
//   Regularly or in inordinate amounts: FDA does not intend to take action "if the compounder fills
//     four or fewer prescriptions for the relevant compounded drug product in a calendar month"; a
//     prescription that documents the prescriber's determination "would not be counted towards the
//     four".
//
// The percent difference is taken on the commercial strength. The guidance does not say whether a
// difference of exactly 10% is "within 10%"; the tool counts it as within and says that is its own
// reading. "Easily substitutable" is flagged only for a whole multiple of the commercial strength
// (the guidance's example); for anything else it gives no number, and the tool says so.
//
// This is a nonbinding enforcement policy, not the statute's test, and the result says so. Section
// 503B has different copy rules and is out of scope. The page is under the weekly page watch.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const GUIDANCE = {
  edition: 'January 2018', route: 'B', readOn: '2026-10-11',
  source: { label: 'FDA, Compounded Drug Products That Are Essentially Copies of a Commercially Available Drug Product Under Section 503A (January 2018)', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/compounded-drug-products-are-essentially-copies-commercially-available-drug-product-under-section' },
};
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const AVAILABILITY = [
  { value: 'marketed', text: 'Marketed, and not in shortage' },
  { value: 'shortage', text: 'On FDA\'s drug shortage list as "currently in shortage"' },
  { value: 'discontinued', text: 'Discontinued and no longer marketed' },
];
export const MONTHLY_LIMIT = 4;
export const SIMILAR_PERCENT = 10;
const NOTE = 'FDA\'s January 2018 guidance is a nonbinding enforcement policy, not the statute\'s test or a state board\'s. Check FDA\'s shortage list on the day you compound. Section 503B has different rules. The tool applies the guidance to your answers; it does not say whether to compound.';

const sig = (x) => Number(Number(x).toPrecision(6));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 6 });
const yn = (v) => { const s = String(v ?? '').trim(); return s === 'yes' ? true : s === 'no' ? false : null; };

export function compoundCopyCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sameApi = yn(o.sameApi);
  if (sameApi === null) return { valid: false, message: 'Answer whether the compounded drug has the same active ingredient as a commercial product.' };
  const avail = String(o.availability ?? '').trim();
  if (!AVAILABILITY.some((a) => a.value === avail)) return { valid: false, message: 'Choose the commercial product\'s status: marketed, in shortage on FDA\'s list, or discontinued.' };
  const f = inputFault([['the compounded strength', o.compoundedStrength, null, 1e9, ''], ['the commercial strength', o.commercialStrength, null, 1e9, '']]);
  if (f) return { valid: false, message: `${f} Use the same unit for both.` };
  const sameRoute = yn(o.sameRoute);
  if (sameRoute === null) return { valid: false, message: 'Answer whether the commercial product can be used by the route prescribed.' };
  const determination = yn(o.determination);
  if (determination === null) return { valid: false, message: 'Answer whether the prescription documents the prescriber\'s determination of a significant difference for this patient.' };
  const cf = inputFault([['the prescriptions for this compounded product already filled this calendar month without such a determination', o.priorCount, 0, 100000, '']]);
  if (cf) return { valid: false, message: cf };
  if (!Number.isInteger(Number(o.priorCount))) return { valid: false, message: 'The number of prescriptions already filled this month must be a whole number.' };

  const c = Number(o.compoundedStrength); const m = Number(o.commercialStrength);
  const pct = (Math.abs(c - m) / m) * 100;
  const same = c === m;
  const similar = !same && sig(pct) <= SIMILAR_PERCENT;
  const multiple = c / m;
  const substitutable = !same && !similar && c > m && Math.abs(multiple - Math.round(multiple)) < 1e-9;
  const strengthMet = same || similar || substitutable;
  const available = avail === 'marketed';
  const copy = sameApi && strengthMet && sameRoute && available && !determination;

  const notes = [];
  notes.push(sameApi ? 'Active ingredient: the same as the commercial product.' : 'Active ingredient: not the same as the commercial product, so the guidance\'s test is not met.');
  let strengthLine;
  if (same) strengthLine = `Strength: the same (${show(c)}).`;
  else if (similar) strengthLine = `Strength: similar. |${show(c)} − ${show(m)}| ÷ ${show(m)} × 100 = ${show(pct)}%, within 10% of the commercial strength.${sig(pct) === SIMILAR_PERCENT ? ' The guidance does not say whether exactly 10% is "within 10%"; counting it as within is this tool\'s reading.' : ''}`;
  else if (substitutable) strengthLine = `Strength: easily substitutable. ${show(c)} is ${show(multiple)} times the commercial ${show(m)}, reachable by multiple doses (the guidance's example is 50 mg against 25 mg). The difference is ${show(pct)}%.`;
  else strengthLine = `Strength: not the same and not within 10% (the difference is ${show(pct)}% of the commercial strength). It is not a whole multiple of the commercial strength either; for other fractional or multiple doses the guidance gives no number.`;
  notes.push(strengthLine);
  notes.push(sameRoute ? 'Route: the commercial product can be used by the route prescribed.' : 'Route: the commercial product cannot be used by the route prescribed, so the guidance does not treat the compounded drug as essentially a copy on these answers.');
  notes.push(available
    ? 'Commercially available: yes, it is marketed and not in shortage.'
    : `Commercially available: no. The guidance does not consider a product commercially available when it ${avail === 'shortage' ? 'appears on FDA\'s drug shortage list as "currently in shortage"' : 'has been discontinued and is no longer marketed'}.`);
  notes.push(determination
    ? 'Prescriber\'s determination: documented. A compounded drug is not essentially a copy when the prescriber determines that a change produces a significant difference for the patient (section 503A(b)(2)).'
    : 'Prescriber\'s determination: not documented on this prescription.');
  const prior = Number(o.priorCount);
  const counted = prior + (copy ? 1 : 0);
  const over = counted > MONTHLY_LIMIT;
  if (copy) notes.push(`Count this calendar month: ${prior} already filled without a determination, plus this one, is ${counted}. FDA does not intend to take action at four or fewer in a calendar month; ${over ? `${counted} is more than four` : `${counted} is within four`}.`);
  else notes.push(`Count this calendar month: this prescription is not counted toward the four${determination ? ' (a prescription that documents the determination is not counted)' : ''}; ${prior} already filled without a determination.`);

  let band;
  if (copy) band = over ? `Essentially a copy under the guidance, and prescription ${counted} of the month: more than the four FDA's policy leaves alone.` : `Essentially a copy under the guidance; prescription ${counted} of the month, within the four FDA's policy leaves alone.`;
  else band = `Not essentially a copy under the guidance on these answers: ${!sameApi ? 'the active ingredient differs' : !strengthMet ? 'the strength is not the same, similar or easily substitutable' : !sameRoute ? 'the commercial product cannot be used by the route prescribed' : !available ? 'the commercial product is not commercially available' : 'the prescriber\'s determination is documented'}.`;
  return {
    valid: true, essentiallyACopy: copy, percentDifference: sig(pct), strength: same ? 'same' : similar ? 'similar' : substitutable ? 'easily substitutable' : 'different',
    commerciallyAvailable: available, countedThisMonth: counted, overMonthlyLimit: copy && over, abnormal: copy && over,
    band, bandLabel: copy ? (over ? 'A copy; over four this month' : 'A copy; within four this month') : 'Not a copy on these answers',
    notes, note: NOTE,
  };
}
